import type { SlideData } from './programme-data'

const CSS_VARS = `
:root {
  --bg: #F5F5F0; --bg-dark: #1B2A4A; --primary: #1B2A4A; --primary-light: #2C3E6B;
  --accent: #E8912D; --accent-dark: #C47A22; --teal: #2E7D6F; --teal-light: #3A9A8A;
  --red: #C0392B; --text-dark: #1A1A2E; --text-mid: #4A4A5A; --text-light: #FFFFFF;
  --card-bg: #FFFFFF; --card-border: #E2E2E0; --row-alt: #F0F0EB; --header-bg: #1B2A4A;
  --font-heading: 'Inter', sans-serif; --font-body: 'Inter', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
`

const BASE_STYLE = `
${CSS_VARS}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; padding: 0; overflow: hidden; }
.slide { width: 1280px; height: 720px; overflow: hidden; position: relative; background: var(--bg); padding: 64px; }
.slide-dark { background: var(--bg-dark); color: var(--text-light); }
.footer-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: var(--accent); }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead th { background: var(--header-bg); color: var(--text-light); font-family: var(--font-heading); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; }
.data-table thead th:first-child { border-radius: 6px 0 0 0; }
.data-table thead th:last-child { border-radius: 0 6px 0 0; }
.data-table tbody td { padding: 11px 16px; border-bottom: 1px solid var(--card-border); font-size: 13px; color: var(--text-dark); }
.data-table tbody tr:nth-child(even) { background: var(--row-alt); }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:last-child td:first-child { border-radius: 0 0 0 6px; }
.data-table tbody tr:last-child td:last-child { border-radius: 0 0 6px 0; }
.mono { font-family: var(--font-mono); font-size: 11px; }
.card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 24px; }
.phase-badge { display: inline-flex; align-items: center; padding: 4px 14px; border-radius: 4px; font-family: var(--font-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.5px; }
.phase-badge.orange { background: #FDF2E6; color: #C47A22; border: 1px solid #F0D9B5; }
.phase-badge.teal { background: #E8F5F1; color: #2E7D6F; border: 1px solid #B8DED5; }
.phase-badge.blue { background: #E8EDF5; color: #1B2A4A; border: 1px solid #C5CDE0; }
.phase-badge.red { background: #FDECEB; color: #C0392B; border: 1px solid #F0C4C0; }
`

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function tableRows(tasks: { taskName: string; duration: string; start: string; finish: string }[]) {
  return tasks.map(t => `<tr>
    <td>${esc(t.taskName)}</td>
    <td class="mono">${esc(t.duration)}</td>
    <td class="mono">${esc(t.start)}</td>
    <td class="mono">${esc(t.finish)}</td>
  </tr>`).join('')
}

function tableSlideHtml(slide: SlideData) {
  const td = slide.tableData!
  const colorMap: Record<string, string> = { orange: 'var(--accent)', teal: 'var(--teal)', blue: 'var(--primary)', red: 'var(--red)' }
  const accent = colorMap[td.accentColor] || 'var(--accent)'
  const noteColor = td.accentColor === 'teal' ? '#E8F5F1' : td.accentColor === 'blue' ? '#E8EDF5' : '#FDF2E6'

  let noteHtml = ''
  if (td.note) {
    noteHtml = `<div style="background:${noteColor}; border-left:4px solid ${accent}; border-radius:0 6px 6px 0; padding:14px 20px; display:flex; align-items:flex-start; gap:10px; margin-top:16px;">
      <span class="material-icons" style="font-size:18px; color:${accent}; margin-top:1px;">info</span>
      <p style="font-size:12px; color:var(--text-mid); font-style:italic; line-height:1.6;">${esc(td.note)}</p>
    </div>`
  }

  let summaryHtml = ''
  if (slide.completionSummary) {
    summaryHtml = `<div style="background:#FFFBF5; border:1px solid #F0DCC8; border-left:4px solid var(--accent); border-radius:0 8px 8px 0; padding:28px 32px; margin-top:20px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <div style="width:40px;height:40px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span class="material-icons" style="font-size:22px;color:#FFF;">flag</span>
        </div>
        <span style="font-family:var(--font-heading);font-weight:600;font-size:16px;color:var(--primary);">Project Completion Target: ${esc(slide.completionSummary.targetDate)}</span>
      </div>
      <p style="font-size:14px;color:var(--text-mid);line-height:1.75;max-width:980px;">${esc(slide.completionSummary.text)}</p>
    </div>`
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>${BASE_STYLE} .note-card { background: ${noteColor}; border-left: 4px solid ${accent}; border-radius: 6px; padding: 16px 20px; }</style></head>
<body>
<div class="slide" style="display:flex;flex-direction:column;">
  <div style="margin-bottom:8px;">
    <span style="font-family:var(--font-mono);color:${accent};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${esc(td.phaseLabel)}  ·  ${esc(td.phaseDate)}</span>
  </div>
  <h1 style="font-family:var(--font-heading);font-weight:700;font-size:28px;color:var(--primary);margin-bottom:8px;">${esc(slide.label.replace(/^.*?—\s*/, ''))}</h1>
  <div style="width:48px;height:4px;background:${accent};border-radius:2px;margin-bottom:20px;"></div>

  <div class="card" style="padding:0;overflow:hidden;">
    <table class="data-table">
      <thead><tr>
        <th style="width:46%;">Task Name</th><th style="width:14%;">Duration</th><th style="width:20%;">Start</th><th style="width:20%;">Finish</th>
      </tr></thead>
      <tbody>${tableRows(td.tasks)}</tbody>
    </table>
  </div>

  ${noteHtml}
  ${summaryHtml}
  <div class="footer-bar"></div>
</div>
</body></html>`
}

function coverHtml(slide: SlideData) {
  const c = slide.cover!
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${CSS_VARS}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { margin:0; overflow:hidden; }
.slide { width:1280px; height:720px; overflow:hidden; position:relative; background:#1B2A4A; display:flex; align-items:center; justify-content:center; }
.slide-bg { position:absolute; inset:0; background-image:url('https://sfile.chatglm.cn/images-ppt/0c840751ed69.jpeg'); background-size:cover; background-position:center; opacity:0.18; }
.slide-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(27,42,74,0.82) 0%, rgba(27,42,74,0.92) 50%, rgba(27,42,74,0.97) 100%); }
.footer-bar { position:absolute; bottom:0; left:0; right:0; height:4px; background:#E8912D; }
</style></head>
<body>
<div class="slide">
  <div class="slide-bg"></div>
  <div class="slide-overlay"></div>
  <div style="position:absolute;top:60px;left:72px;width:48px;height:4px;background:#E8912D;border-radius:2px;"></div>
  <div style="position:relative;z-index:2;text-align:center;display:flex;flex-direction:column;align-items:center;">
    <h1 style="font-family:'Inter',sans-serif;font-weight:800;font-size:44px;color:#FFFFFF;letter-spacing:4px;text-transform:uppercase;line-height:1.15;">${esc(c.title)}</h1>
    <p style="font-family:'Inter',sans-serif;font-weight:400;font-size:28px;color:#FFFFFF;margin-top:12px;letter-spacing:0.5px;">${esc(c.subtitle)}</p>
    <div style="width:120px;height:1px;background:rgba(255,255,255,0.25);margin-top:24px;"></div>
    <p style="font-family:'Inter',sans-serif;font-weight:300;font-size:18px;color:rgba(255,255,255,0.75);margin-top:20px;letter-spacing:0.3px;">${esc(c.body)}</p>
  </div>
  <div style="position:absolute;bottom:36px;left:0;right:0;text-align:center;z-index:2;">
    <p style="font-family:'DM Mono',monospace;font-weight:400;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:1px;">${esc(c.footer)}</p>
  </div>
  <div class="footer-bar"></div>
</div>
</body></html>`
}

function bentoHtml(slide: SlideData) {
  const phases = slide.bento!.phases
  const cardBullets = (items: string[], color: string) => items.map(item => `
    <div style="display:flex;align-items:flex-start;gap:6px;margin-top:6px;">
      <span style="width:4px;height:4px;min-width:4px;border-radius:50%;background:${color};margin-top:7px;"></span>
      <span style="font-family:'Inter',sans-serif;font-size:13px;color:#4A4A5A;line-height:1.4;">${esc(item)}</span>
    </div>`).join('')

  const cards = phases.map(p => {
    const dotColor = p.color === 'orange' ? '#E8912D' : p.color === 'teal' ? '#2E7D6F' : p.color === 'blue' ? '#1B2A4A' : '#C0392B'
    return `<div class="card">
      <span class="phase-badge ${p.color}">${esc(p.number)}  ·  ${esc(p.date)}</span>
      <div style="font-family:'Inter',sans-serif;font-weight:700;font-size:16px;color:#1B2A4A;margin-top:10px;line-height:1.35;">${esc(p.title)}</div>
      ${cardBullets(p.items, dotColor)}
    </div>`
  }).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${BASE_STYLE}
.grid-container { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:24px; margin-top:24px; height:478px; }
</style></head>
<body>
<div class="slide" style="padding:60px 72px 72px 72px;">
  <div style="font-family:'DM Mono',monospace;font-size:11px;color:#E8912D;letter-spacing:2px;text-transform:uppercase;">ELECTRICAL SCOPE</div>
  <h1 style="font-family:'Inter',sans-serif;font-weight:700;font-size:28px;color:#1B2A4A;margin-top:6px;line-height:1.25;">Sigatoka Electrical Work Breakdown</h1>
  <div style="width:48px;height:4px;background:#E8912D;border-radius:2px;margin-top:8px;"></div>
  <div class="grid-container">${cards}</div>
  <div class="footer-bar"></div>
</div>
</body></html>`
}

export function generateSlideHtml(slide: SlideData): string {
  if (slide.type === 'cover') return coverHtml(slide)
  if (slide.type === 'bento') return bentoHtml(slide)
  if (slide.type === 'table') return tableSlideHtml(slide)
  return '<html><body style="background:#F5F5F0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;">No content</body></html>'
}