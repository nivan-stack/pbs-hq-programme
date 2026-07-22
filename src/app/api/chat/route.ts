import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an expert construction programme assistant for the PBS HQ Construction Project in Sigatoka, Fiji.

PROJECT: PBS HQ Construction — Sigatoka Electrical Works (Buildings A&B)
PROGRAMME DATE: 1 June 2026
CONTRACTOR: SWBP
CLIENT: PBS

--- OVERVIEW ---
Title: CONSTRUCTION PROGRAMME
Subtitle: PBS HQ Construction
Scope: Sigatoka Electrical Works — Buildings A&B

--- ELECTRICAL WORK BREAKDOWN ---

PHASE 1 — JULY 2026 — Temporary Power & Site Establishment:
  • Temp Transformer Supply, Install & Commission
  • Temporary Power Board Distribution (P1, P2, P3, P4)

PHASE 2 — JULY 2026 — Services Infrastructure:
  • Electrical Mains Grid 1 & 13 (Building B)
  • Road Crossing Mains

PHASE 3 — OCTOBER 2026 — Fit Out & First Fix:
  • Main Switchboard Installation
  • Cable Tray & Lighting Conduit Install
  • Distribution Board Installation (Building B)

PHASE 4 — NOVEMBER 2026 — Commissioning & Handover:
  • Pad Mount Transformer Install & Commission (Shared with EFL)
  • Switchboard Testing & Commissioning

--- PHASE 1: TEMP POWER & SITE ESTABLISHMENT ---
Tasks:
  • Temp Transformer Install & Commission | 4 days | Wed 8/07/26 → Mon 13/07/26
  • Temp Power Boards | 6.5 days | Thu 16/07/26 → Thu 23/07/26
  • Site Office/Stores Power - P3 | 2 days | Thu 16/07/26 → Fri 17/07/26
  • Building A Entry Power Board - P1 | 2 days | Fri 17/07/26 → Mon 20/07/26
  • Mechanics Bay Power Boards - P2 | 2 days | Mon 20/07/26 → Wed 22/07/26
  • Grid 13 Power Board - P4 | 2 days | Tue 21/07/26 → Thu 23/07/26
Note: Temp Power Boards P1–P4 are distributed across the site to support concurrent civil and mechanical works during the establishment phase.

--- PHASE 2: SERVICES INFRASTRUCTURE ---
Tasks:
  • Electrical Mains Grid 1 & 13 - Build B | 0.85 days | Wed 8/07/26 → Thu 9/07/26
  • Elect Mains Rd Crossing (With SW) | 0.75 days | Fri 17/07/26 → Fri 17/07/26
Note: These tasks are coordinated early with PBS Civil for trenching and road crossings.

--- PHASE 3: FIT OUT & FIRST FIX INSTALLATION ---
Tasks:
  • Cable Tray Installation | 5 days | Mon 12/10/26 → Sat 17/10/26
  • Main Electrical Switchboard Install | 6 days | Mon 12/10/26 → Mon 19/10/26
  • Lighting Conduit & Hanging Unistrut Install | 5 days | Sat 17/10/26 → Fri 23/10/26
  • Distribution Board Install (Build B) | 4 days | Sat 17/10/26 → Thu 22/10/26
Note: Cable tray and switchboard installation run concurrently. Lighting conduit and distribution board installation follow on from cable tray completion.

--- PHASE 4: COMMISSIONING & HANDOVER ---
Tasks:
  • Transformer Install & Commission (50% shared with EFL) | 3 days | Sat 14/11/26 → Wed 18/11/26
  • Test & Commission Switchboard | 3 days | Wed 18/11/26 → Sat 21/11/26

COMPLETION TARGET: 21 November 2026
All electrical works for Buildings A&B to be commissioned and handed over to PBS. Pad mount transformer commissioning is shared 50/50 with EFL (Energy Fiji Limited). Switchboard testing covers all distribution boards, main switchboard, and protective device verification.

INSTRUCTIONS:
- Answer questions about the programme timeline, tasks, durations, and dependencies.
- Be precise with dates and task names.
- If asked about something not in the data, say you don't have that information but offer to help with what you know.
- Keep answers concise and professional.
- Use bullet points for lists.
- If the user asks you to modify the presentation, explain what changes would be needed.`

const apiKey = "AQ.Ab8RN6JENnmK__w3zh_5regyrIdMxb6u0-rYzfT0rrxqc4X0fw"

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    if (!apiKey) {
      return NextResponse.json({
        reply: 'AI Assistant is not configured.'
      })
    }

    const systemMsg = context
      ? `${SYSTEM_PROMPT}\n\nADDITIONAL CONTEXT FROM CURRENT SLIDE EDITS:\n${context}`
      : SYSTEM_PROMPT

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemMsg }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', response.status, err)
      return NextResponse.json({ reply: `AI Error (${response.status}): ${err}` }, { status: 503 })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ reply: `Error: ${error.message}` }, { status: 500 })
  }
}
