export interface TableTask {
  taskName: string
  duration: string
  start: string
  finish: string
}

export interface SlideData {
  id: number
  file: string
  label: string
  type: 'cover' | 'bento' | 'table'
  cover?: { title: string; subtitle: string; body: string; footer: string }
  bento?: {
    phases: {
      number: string
      date: string
      color: string
      title: string
      items: string[]
    }[]
  }
  tableData?: {
    phaseLabel: string
    phaseDate: string
    accentColor: string
    columns: string[]
    tasks: TableTask[]
    note?: string
  }
  completionSummary?: {
    targetDate: string
    text: string
  }
}

export const SLIDES_INITIAL: SlideData[] = [
  {
    id: 1,
    file: 'slide_01.html',
    label: 'Cover',
    type: 'cover',
    cover: {
      title: 'CONSTRUCTION PROGRAMME',
      subtitle: 'PBS HQ Construction',
      body: 'Sigatoka Electrical Works — Buildings A&B',
      footer: '1 June 2026 | SWBP — Buildings A&B (PBS HQ)',
    },
  },
  {
    id: 2,
    file: 'slide_02.html',
    label: 'Work Breakdown',
    type: 'bento',
    bento: {
      phases: [
        {
          number: 'PHASE 1',
          date: 'JULY 2026',
          color: 'orange',
          title: 'Temporary Power & Site Establishment',
          items: [
            'Temp Transformer Supply, Install & Commission',
            'Temporary Power Board Distribution (P1, P2, P3, P4)',
          ],
        },
        {
          number: 'PHASE 2',
          date: 'JULY 2026',
          color: 'teal',
          title: 'Services Infrastructure',
          items: [
            'Electrical Mains Grid 1 & 13 (Building B)',
            'Road Crossing Mains',
          ],
        },
        {
          number: 'PHASE 3',
          date: 'OCTOBER 2026',
          color: 'blue',
          title: 'Fit Out & First Fix',
          items: [
            'Main Switchboard Installation',
            'Cable Tray & Lighting Conduit Install',
            'Distribution Board Installation (Building B)',
          ],
        },
        {
          number: 'PHASE 4',
          date: 'NOVEMBER 2026',
          color: 'red',
          title: 'Commissioning & Handover',
          items: [
            'Pad Mount Transformer Install & Commission (Shared with EFL)',
            'Switchboard Testing & Commissioning',
          ],
        },
      ],
    },
  },
  {
    id: 3,
    file: 'slide_03.html',
    label: 'Phase 1 — Temp Power',
    type: 'table',
    tableData: {
      phaseLabel: 'PHASE 1',
      phaseDate: 'JULY 2026',
      accentColor: 'orange',
      columns: ['Task Name', 'Duration', 'Start', 'Finish'],
      tasks: [
        { taskName: 'Temp Transformer Install & Commission', duration: '4 days', start: 'Wed 8/07/26', finish: 'Mon 13/07/26' },
        { taskName: 'Temp Power Boards', duration: '6.5 days', start: 'Thu 16/07/26', finish: 'Thu 23/07/26' },
        { taskName: 'Site Office/Stores Power - P3', duration: '2 days', start: 'Thu 16/07/26', finish: 'Fri 17/07/26' },
        { taskName: 'Building A Entry Power Board - P1', duration: '2 days', start: 'Fri 17/07/26', finish: 'Mon 20/07/26' },
        { taskName: 'Mechanics Bay Power Boards - P2', duration: '2 days', start: 'Mon 20/07/26', finish: 'Wed 22/07/26' },
        { taskName: 'Grid 13 Power Board - P4', duration: '2 days', start: 'Tue 21/07/26', finish: 'Thu 23/07/26' },
      ],
      note: 'Temp Power Boards P1–P4 are distributed across the site to support concurrent civil and mechanical works during the establishment phase.',
    },
  },
  {
    id: 4,
    file: 'slide_04.html',
    label: 'Phase 2 — Services',
    type: 'table',
    tableData: {
      phaseLabel: 'PHASE 2',
      phaseDate: 'JULY 2026',
      accentColor: 'teal',
      columns: ['Task Name', 'Duration', 'Start', 'Finish'],
      tasks: [
        { taskName: 'Electrical Mains Grid 1 & 13 - Build B', duration: '0.85 days', start: 'Wed 8/07/26', finish: 'Thu 9/07/26' },
        { taskName: 'Elect Mains Rd Crossing (With SW)', duration: '0.75 days', start: 'Fri 17/07/26', finish: 'Fri 17/07/26' },
      ],
      note: 'These tasks are coordinated early with PBS Civil for trenching and road crossings.',
    },
  },
  {
    id: 5,
    file: 'slide_05.html',
    label: 'Phase 3 — Fit Out',
    type: 'table',
    tableData: {
      phaseLabel: 'PHASE 3',
      phaseDate: 'OCTOBER 2026',
      accentColor: 'blue',
      columns: ['Task Name', 'Duration', 'Start', 'Finish'],
      tasks: [
        { taskName: 'Cable Tray Installation', duration: '5 days', start: 'Mon 12/10/26', finish: 'Sat 17/10/26' },
        { taskName: 'Main Electrical Switchboard Install', duration: '6 days', start: 'Mon 12/10/26', finish: 'Mon 19/10/26' },
        { taskName: 'Lighting Conduit & Hanging Unistrut Install', duration: '5 days', start: 'Sat 17/10/26', finish: 'Fri 23/10/26' },
        { taskName: 'Distribution Board Install (Build B)', duration: '4 days', start: 'Sat 17/10/26', finish: 'Thu 22/10/26' },
      ],
      note: 'Cable tray and switchboard installation run concurrently. Lighting conduit and distribution board installation follow on from cable tray completion.',
    },
  },
  {
    id: 6,
    file: 'slide_06.html',
    label: 'Phase 4 — Commissioning',
    type: 'table',
    tableData: {
      phaseLabel: 'PHASE 4',
      phaseDate: 'NOVEMBER 2026',
      accentColor: 'red',
      columns: ['Task Name', 'Duration', 'Start', 'Finish'],
      tasks: [
        { taskName: 'Transformer Install & Commission (50% shared with EFL)', duration: '3 days', start: 'Sat 14/11/26', finish: 'Wed 18/11/26' },
        { taskName: 'Test & Commission Switchboard', duration: '3 days', start: 'Wed 18/11/26', finish: 'Sat 21/11/26' },
      ],
    },
    completionSummary: {
      targetDate: '21 November 2026',
      text: 'All electrical works for Buildings A&B to be commissioned and handed over to PBS. Pad mount transformer commissioning is shared 50/50 with EFL (Energy Fiji Limited). Switchboard testing covers all distribution boards, main switchboard, and protective device verification.',
    },
  },
]

export function buildAIContext(slides: SlideData[]): string {
  let ctx = `You are an expert construction programme assistant for the PBS HQ Construction Project in Sigatoka, Fiji.\n\n`
  ctx += `PROJECT: PBS HQ Construction — Sigatoka Electrical Works (Buildings A&B)\n`
  ctx += `PROGRAMME DATE: 1 June 2026\n`
  ctx += `CONTRACTOR: SWBP\n`
  ctx += `CLIENT: PBS\n`

  for (const s of slides) {
    ctx += `\n--- ${s.label.toUpperCase()} ---\n`
    if (s.type === 'cover' && s.cover) {
      ctx += `Title: ${s.cover.title}\n`
      ctx += `Subtitle: ${s.cover.subtitle}\n`
      ctx += `Scope: ${s.cover.body}\n`
    } else if (s.type === 'bento' && s.bento) {
      for (const p of s.bento.phases) {
        ctx += `\n${p.number} — ${p.date} — ${p.title}:\n`
        for (const item of p.items) ctx += `  • ${item}\n`
      }
    } else if (s.type === 'table' && s.tableData) {
      ctx += `${s.tableData.phaseLabel} — ${s.tableData.phaseDate}\n`
      ctx += `Tasks:\n`
      for (const t of s.tableData.tasks) {
        ctx += `  • ${t.taskName} | ${t.duration} | ${t.start} → ${t.finish}\n`
      }
      if (s.tableData.note) ctx += `Note: ${s.tableData.note}\n`
      if (s.completionSummary) {
        ctx += `\nCOMPLETION TARGET: ${s.completionSummary.targetDate}\n`
        ctx += `${s.completionSummary.text}\n`
      }
    }
  }

  ctx += `\n\nINSTRUCTIONS:\n`
  ctx += `- Answer questions about the programme timeline, tasks, durations, and dependencies.\n`
  ctx += `- Be precise with dates and task names.\n`
  ctx += `- If asked about something not in the data, say you don't have that information.\n`
  ctx += `- Keep answers concise and professional.\n`
  ctx += `- Use bullet points for lists.\n`
  return ctx
}