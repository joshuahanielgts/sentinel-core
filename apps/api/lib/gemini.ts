import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { env } from './env'
import type { GeminiAnalysisResponse } from '@/types/api'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const ANALYSIS_MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'] as const
export const DEFAULT_CHAT_MODEL_ID = 'gemini-2.5-flash'

const ANALYSIS_SYSTEM_PROMPT = `
You are a senior contract attorney AI. Your job is to analyze legal contracts and return a structured risk assessment.

You MUST respond with valid JSON only. No markdown, no explanation, no preamble.

Return exactly this structure:
{
  "summary": "2-3 sentence plain-English summary of the contract",
  "overall_risk_level": "low" | "medium" | "high" | "critical",
  "risk_score": <integer 0-100>,
  "key_obligations": ["obligation 1", "obligation 2"],
  "red_flags": ["red flag 1", "red flag 2"],
  "clauses": [
    {
      "raw_text": "exact text of the clause",
      "category": "category name",
      "risk_level": "low" | "medium" | "high" | "critical",
      "rationale": "1-2 sentence explanation of why this is risky or safe",
      "position": <integer, order in document starting at 1>
    }
  ]
}

Risk scoring:
- 0-25: Low risk. Standard commercial terms.
- 26-50: Medium risk. Some unfavorable terms but negotiable.
- 51-75: High risk. Material clauses that significantly favor the other party.
- 76-100: Critical risk. Clauses that could expose the signing party to severe liability.
`.trim()

export const RED_TEAM_PROMPT = `
You are opposing counsel. Find weaknesses, loopholes, and exploitable clauses.
Be adversarial and precise. Cite exact clause language. Keep your response under 150 words.
Use bullet points for multiple issues.
`.trim()

export const NORMAL_CHAT_PROMPT = `
You are a senior contract attorney AI. Answer questions about this contract accurately.
Keep responses SHORT — 3 to 5 sentences maximum, or a brief bullet list if listing items.
Cite the specific clause name only (not full text). No preamble, no filler.
`.trim()

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
  modelUsed: string
}

export interface AnalysisResult extends GeminiAnalysisResponse {
  _meta: TokenUsage
}

type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function analyzeContract(
  fileBuffer: Uint8Array,
  mimeType: SupportedMimeType
): Promise<AnalysisResult> {
  const parts: Part[] = []

  if (mimeType.includes('wordprocessingml')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) })
    if (!result.value.trim()) throw new Error('DOCX file appears to be empty')
    parts.push({ text: result.value })
  } else {
    parts.push({
      inlineData: {
        data: Buffer.from(fileBuffer).toString('base64'),
        mimeType,
      },
    })
  }

  parts.push({ text: 'Analyze this contract.' })

  let lastError: unknown
  let result:
    | Awaited<ReturnType<ReturnType<typeof genAI.getGenerativeModel>['generateContent']>>
    | undefined
  let durationMs = 0
  let modelUsed: (typeof ANALYSIS_MODEL_CANDIDATES)[number] = ANALYSIS_MODEL_CANDIDATES[0]

  for (let i = 0; i < ANALYSIS_MODEL_CANDIDATES.length; i++) {
    const modelId = ANALYSIS_MODEL_CANDIDATES[i]
    const startTime = Date.now()

    // Brief pause before each fallback attempt to avoid cascading rate-limit hits
    if (i > 0) await new Promise((r) => setTimeout(r, 2000))

    try {
      const model = genAI.getGenerativeModel({ model: modelId })
      result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      })
      durationMs = Date.now() - startTime
      modelUsed = modelId
      break
    } catch (error) {
      lastError = error
      console.error(`[Gemini] Model ${modelId} failed:`, error instanceof Error ? error.message : error)
      const msg = error instanceof Error ? error.message.toLowerCase() : ''
      // 404 = model retired/not found → try next model
      // 429 / quota = rate limit → try next model
      // anything else (auth, parse, network) → stop immediately
      const isRetryable =
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('429') ||
        msg.includes('quota') ||
        msg.includes('rate limit') ||
        msg.includes('rate_limit') ||
        msg.includes('exhausted') ||
        msg.includes('resource_exhausted')
      if (!isRetryable) {
        console.error(`[Gemini] Non-retryable error, stopping fallback chain.`)
        break
      }
    }
  }

  if (!result) {
    if (lastError instanceof Error) {
      throw lastError
    }

    throw new Error('Gemini analysis failed for all configured models')
  }

  const raw = result.response.text()
  const usage = result.response.usageMetadata

  let parsed: GeminiAnalysisResponse
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  return {
    ...parsed,
    _meta: {
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
      totalTokens: usage?.totalTokenCount ?? 0,
      durationMs,
      modelUsed,
    },
  }
}

export const CHAT_MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'] as const

export function getChatModel(modelId: string = DEFAULT_CHAT_MODEL_ID) {
  return genAI.getGenerativeModel({ model: modelId })
}

