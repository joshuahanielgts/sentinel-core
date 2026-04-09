import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getChatModel, CHAT_SYSTEM_PROMPT, RED_TEAM_SYSTEM_PROMPT } from '@/lib/gemini'
import { errorResponse } from '@/lib/errors'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { z } from 'zod'

const MessageSchema = z.object({
  session_id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  red_team: z.boolean().optional().default(false),
})

export const POST = withAuth(async (req, user) => {
  try {
    const rl = checkRateLimit(user.id, 'chat', { maxTokens: 20, refillRate: 1, refillIntervalMs: 3_000 })
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { session_id, content, red_team } = parsed.data

    const { data: session } = await supabaseAdmin
      .from('chat_sessions')
      .select('*, contracts:contract_id (name, summary, key_obligations, red_flags)')
      .eq('id', session_id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', session.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await supabaseAdmin
      .from('chat_messages')
      .insert({ session_id, role: 'user', content, workspace_id: session.workspace_id })

    const { data: clauses } = await supabaseAdmin
      .from('contract_clauses')
      .select('raw_text, category, risk_level, rationale')
      .eq('contract_id', session.contract_id)
      .order('position', { ascending: true })

    const { data: history } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(50)

    const contractInfo = session.contracts as unknown as {
      name: string
      summary: string | null
      key_obligations: string[] | null
      red_flags: string[] | null
    }

    const contractContext = [
      `Contract: ${contractInfo.name}`,
      contractInfo.summary ? `Summary: ${contractInfo.summary}` : '',
      contractInfo.key_obligations
        ? `Key Obligations: ${(contractInfo.key_obligations).join('; ')}`
        : '',
      contractInfo.red_flags
        ? `Red Flags: ${(contractInfo.red_flags).join('; ')}`
        : '',
      '',
      'Clauses:',
      ...(clauses || []).map(
        (c) => `[${c.category} - ${c.risk_level}] ${c.raw_text}\nRationale: ${c.rationale}`
      ),
    ]
      .filter(Boolean)
      .join('\n')

    const basePrompt = red_team ? RED_TEAM_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT
    const systemPrompt = `${basePrompt}\n\n--- CONTRACT CONTEXT ---\n${contractContext}`

    const chatHistory = (history || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }))

    const model = getChatModel()
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt,
    })

    const result = await chat.sendMessageStream(content)

    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }

          await supabaseAdmin
            .from('chat_messages')
            .insert({ session_id, role: 'assistant', content: fullResponse, workspace_id: session.workspace_id })

          await supabaseAdmin
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', session_id)

          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
