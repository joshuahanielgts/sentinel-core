import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import mammoth from 'mammoth'
import { env } from './env'
import type { GeminiAnalysisResponse } from '@/types/api'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

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

const CHAT_SYSTEM_PROMPT = `
You are a helpful legal assistant AI. You have been given the full text and analysis of a specific contract.
Answer the user's questions about this contract clearly and accurately. If the user asks about something
not covered in the contract, say so. Translate legal jargon into plain English when asked.
Do not make up clauses or terms that are not in the provided contract context.
`.trim()

const RED_TEAM_SYSTEM_PROMPT = `
You are opposing counsel AI. Your job is to stress-test the user's position on this contract.
Challenge every assumption. Find loopholes and ambiguities that the other party could exploit.
Be adversarial, precise, and specific. Use the contract text and analysis to identify where
the user's party is most exposed.

When useful, suggest concrete language changes that reduce the user's risk.
Do not make up clauses or terms that are not in the provided contract context.
`.trim()

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

  const parts: Part[] = []

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value: text } = await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) })
    if (!text.trim()) throw new Error('DOCX file appears to be empty')
    parts.push({ text: `Contract text:\n\n${text}` })
  } else {
    parts.push({
      inlineData: {
        data: Buffer.from(fileBuffer).toString('base64'),
        mimeType,
      },
    })
  }

  parts.push({ text: 'Analyze this contract.' })

  const startTime = Date.now()

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  })

  const durationMs = Date.now() - startTime
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
    },
  }
}

export function getChatModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
}

export { CHAT_SYSTEM_PROMPT, RED_TEAM_SYSTEM_PROMPT }
