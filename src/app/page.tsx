'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  MousePointer2,
} from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { SLIDES_INITIAL, buildAIContext, type SlideData, type TableTask } from '@/lib/programme-data'
import { generateSlideHtml } from '@/lib/generate-slide-html'
import ReactMarkdown from 'react-markdown'
import FormattingToolbar from '@/components/formatting-toolbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Lock, EyeOff, AlertCircle } from 'lucide-react'

const SLIDE_W = 1280
const SLIDE_H = 720

const EDITABLE_SELECTORS = 'h1, h2, h3, h4, h5, h6, p, span, td, li, div[data-editable]'

// ─── Thumbnail sidebar ────────────────────────────────────────────
function SlideThumbnails() {
  const { slides, currentSlideIndex, setCurrentSlide } = useEditorStore()
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
        Slides
      </div>
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="flex flex-col gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentSlideIndex
                  ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="aspect-[16/9] bg-zinc-800 flex items-center justify-center overflow-hidden">
                <iframe
                  srcDoc={generateSlideHtml(slide)}
                  title={slide.label}
                  className="pointer-events-none"
                  style={{
                    width: SLIDE_W,
                    height: SLIDE_H,
                    transform: `scale(${160 / SLIDE_W * 1.15})`,
                    transformOrigin: 'top left',
                    border: 'none',
                  }}
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                <span className="text-[10px] text-white/90 font-medium">{idx + 1}. {slide.label}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Editable Slide Canvas ─────────────────────────────────────────
function SlideCanvas() {
  const { slides, currentSlideIndex, nextSlide, prevSlide, editMode } = useEditorStore()
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [selectedFontSize, setSelectedFontSize] = useState(16)
  const [hasSelection, setHasSelection] = useState(false)
  const editInjectedRef = useRef(false)

  const slide = slides[currentSlideIndex]
  const currentSlideData = JSON.stringify(slide)
  const slideKey = currentSlideIndex * 1000 + currentSlideData.length

  const recalcScale = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setScale(Math.min((rect.width - 32) / SLIDE_W, (rect.height - 32) / SLIDE_H, 1))
  }, [])

  useEffect(() => {
    recalcScale()
    const obs = new ResizeObserver(recalcScale)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [recalcScale])

  const clearSelection = useCallback((doc: Document) => {
    doc.querySelectorAll('[data-slide-edit]').forEach(el => {
      el.removeAttribute('contenteditable')
      el.removeAttribute('data-slide-edit')
      el.style.outline = ''
    })
    setHasSelection(false)
  }, [])

  const handleElementClick = useCallback((e: Event) => {
    e.stopPropagation()
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    const target = e.currentTarget as HTMLElement

    // Clear previous
    clearSelection(doc)

    // Select this one
    target.setAttribute('contenteditable', 'true')
    target.setAttribute('data-slide-edit', 'true')
    target.style.outline = '2px solid #E8912D'
    target.style.outlineOffset = '2px'
    target.focus()

    // Try to place cursor at end
    const sel = (iframeRef.current?.contentWindow as Window | undefined)?.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      range.selectNodeContents(target)
      range.collapse(false)
    }

    // Detect font size
    const computed = window.getComputedStyle(target)
    const px = parseInt(computed.fontSize)
    if (px) setSelectedFontSize(px)
    setHasSelection(true)
  }, [clearSelection])

  const handleElementInput = useCallback(() => {
    setHasSelection(true)
  }, [])

  // Inject editing scripts when edit mode changes or slide changes
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentDocument) return
    const doc = iframe.contentDocument

    // Clear any previous edit state
    doc.querySelectorAll('[data-slide-edit]').forEach(el => {
      el.removeAttribute('contenteditable')
      el.removeAttribute('data-slide-edit')
      el.style.outline = ''
      el.style.cursor = ''
      el.style.minWidth = ''
    })

    if (!editMode) {
      editInjectedRef.current = false
      return
    }

    // Make text elements clickable/editable
    const elements = doc.querySelectorAll(EDITABLE_SELECTORS)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.cursor = 'text'
      htmlEl.addEventListener('click', handleElementClick)
      htmlEl.addEventListener('input', handleElementInput)
    })

    // Add click handler to slide background for deselection
    const slideEl = doc.querySelector('.slide') || doc.body
    slideEl.addEventListener('click', (e: Event) => {
      if ((e.target as HTMLElement).closest(EDITABLE_SELECTORS)) return
      clearSelection(doc)
    })

    editInjectedRef.current = true
  }, [editMode, slideKey, handleElementClick, handleElementInput, clearSelection])

  // ─── Formatting commands ────────────────────────────────
  const getIframeDoc = () => iframeRef.current?.contentDocument
  const getIframeWin = () => iframeRef.current?.contentWindow as Window | null

  const applyFormat = useCallback((command: string, value?: string) => {
    const win = getIframeWin()
    win?.document.execCommand(command, false, value)
    win?.focus()
  }, [])

  const setFontSize = useCallback((size: number) => {
    const doc = getIframeDoc()
    const win = getIframeWin()
    if (!doc || !win) return
    setSelectedFontSize(size)

    const selected = doc.querySelector('[data-slide-edit]') as HTMLElement | null
    if (selected) {
      selected.style.fontSize = `${size}px`
      return
    }

    // If text is selected within an editable element, wrap in span
    const sel = win.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      const span = doc.createElement('span')
      span.style.fontSize = `${size}px`
      range.surroundContents(span)
    }
  }, [])

  const setTextColor = useCallback((color: string) => {
    const doc = getIframeDoc()
    if (!doc) return
    const selected = doc.querySelector('[data-slide-edit]') as HTMLElement | null
    if (selected) {
      selected.style.color = color
      return
    }
    applyFormat('foreColor', color)
  }, [applyFormat])

  const setAlignment = useCallback((align: string) => {
    const doc = getIframeDoc()
    if (!doc) return
    const selected = doc.querySelector('[data-slide-edit]') as HTMLElement | null
    if (selected) {
      selected.style.textAlign = align
      selected.style.marginLeft = align === 'center' ? 'auto' : ''
      selected.style.marginRight = align === 'center' ? 'auto' : ''
    }
  }, [])

  const addTextBox = useCallback(() => {
    const doc = getIframeDoc()
    if (!doc) return
    const slide = doc.querySelector('.slide') || doc.body
    const box = doc.createElement('div')
    box.setAttribute('contenteditable', 'true')
    box.setAttribute('data-slide-edit', 'true')
    box.style.cssText = 'position:absolute;top:280px;left:340px;min-width:300px;min-height:50px;padding:12px 16px;font-size:18px;color:#1A1A2E;font-family:Inter,sans-serif;outline:2px dashed #E8912D;cursor:text;background:rgba(255,255,255,0.9);border-radius:4px;z-index:10;line-height:1.5;'
    box.textContent = 'Type here...'
    slide.appendChild(box)

    // Listen for events
    box.addEventListener('click', (e) => {
      e.stopPropagation()
      const s = box as HTMLElement
      s.style.outline = '2px solid #E8912D'
      s.style.outlineOffset = '2px'
      setSelectedFontSize(18)
      setHasSelection(true)
    })

    // Select all text so user can start typing
    const win = getIframeWin()
    if (win) {
      box.focus()
      const sel = win.getSelection()
      if (sel) {
        const range = doc.createRange()
        range.selectNodeContents(box)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    setHasSelection(true)
  }, [])

  const deleteSelected = useCallback(() => {
    const doc = getIframeDoc()
    if (!doc) return
    const selected = doc.querySelector('[data-slide-edit]') as HTMLElement | null
    if (selected && selected.textContent !== 'Type here...') {
      selected.remove()
      setHasSelection(false)
    }
  }, [])

  // Keyboard nav (non-input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nextSlide, prevSlide])

  return (
    <div className="flex flex-col h-full">
      {/* Formatting toolbar (only in edit mode) */}
      {editMode && (
        <FormattingToolbar
          fontSize={selectedFontSize}
          onFontSizeChange={setFontSize}
          onBold={() => applyFormat('bold')}
          onItalic={() => applyFormat('italic')}
          onUnderline={() => applyFormat('underline')}
          onAlignLeft={() => setAlignment('left')}
          onAlignCenter={() => setAlignment('center')}
          onAlignRight={() => setAlignment('right')}
          onTextColor={setTextColor}
          onAddTextBox={addTextBox}
          onDeleteSelected={deleteSelected}
          hasSelection={hasSelection}
        />
      )}

      {/* Slide number */}
      <div className="flex items-center justify-between px-4 py-1.5 shrink-0">
        <span className="text-xs text-zinc-500 font-mono">
          Slide {currentSlideIndex + 1} of {slides.length}
        </span>
        <div className="flex items-center gap-2">
          {editMode && (
            <span className="text-[10px] text-amber-400/70 flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" /> Click any text to edit
            </span>
          )}
          <span className="text-xs text-zinc-600">{slide.label}</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div
          className="relative shadow-2xl shadow-black/60 rounded-lg overflow-hidden"
          style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}
        >
          <iframe
            key={slideKey}
            ref={iframeRef}
            srcDoc={generateSlideHtml(slide)}
            title={`Slide ${currentSlideIndex + 1}`}
            className={`border rounded-lg transition-colors ${editMode ? 'border-amber-500/50' : 'border-zinc-700/50'}`}
            style={{
              width: SLIDE_W,
              height: SLIDE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            onLoad={() => {
              // Re-trigger injection after load
              editInjectedRef.current = false
            }}
          />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="h-1 bg-zinc-800 rounded-full mb-3">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <div className="flex gap-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => useEditorStore.getState().setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlideIndex ? 'bg-amber-500 w-6' : 'bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Panel (side panel form) ───────────────────────────────────
function EditPanel() {
  const { slides, currentSlideIndex, updateCoverField, updateBentoPhase, updateTableTask, addTableRow, removeTableRow, updateTableNote, updateCompletionSummary } = useEditorStore()
  const slide = slides[currentSlideIndex]

  if (slide.type === 'cover' && slide.cover) {
    return (
      <ScrollArea className="h-full px-4 py-3">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300">Cover Slide</h3>
          <Field label="Main Title" value={slide.cover.title} onChange={(v) => updateCoverField('title', v)} />
          <Field label="Subtitle" value={slide.cover.subtitle} onChange={(v) => updateCoverField('subtitle', v)} />
          <Field label="Body Text" value={slide.cover.body} onChange={(v) => updateCoverField('body', v)} />
          <Field label="Footer" value={slide.cover.footer} onChange={(v) => updateCoverField('footer', v)} />
        </div>
      </ScrollArea>
    )
  }

  if (slide.type === 'bento' && slide.bento) {
    return (
      <ScrollArea className="h-full px-4 py-3">
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-zinc-300">Work Breakdown Phases</h3>
          {slide.bento.phases.map((phase, pIdx) => (
            <div key={pIdx} className="space-y-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                phase.color === 'orange' ? 'bg-amber-500/20 text-amber-400' :
                phase.color === 'teal' ? 'bg-emerald-500/20 text-emerald-400' :
                phase.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {phase.number} · {phase.date}
              </span>
              <Field label="Phase Title" value={phase.title} onChange={(v) => updateBentoPhase(pIdx, 'title', v)} />
              {phase.items.map((item, iIdx) => (
                <div key={iIdx} className="flex gap-1.5">
                  <Textarea value={item} onChange={(e) => { const n = [...phase.items]; n[iIdx] = e.target.value; updateBentoPhase(pIdx, 'items', n) }} className="bg-zinc-900 border-zinc-700 text-sm text-zinc-200 resize-none h-8 min-h-8" placeholder="Task..." />
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => updateBentoPhase(pIdx, 'items', phase.items.filter((_, i) => i !== iIdx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-amber-400 text-xs h-7" onClick={() => updateBentoPhase(pIdx, 'items', [...phase.items, ''])}><Plus className="w-3 h-3 mr-1" /> Add item</Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (slide.type === 'table' && slide.tableData) {
    return (
      <ScrollArea className="h-full px-4 py-3">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300">{slide.tableData.phaseLabel} — {slide.tableData.phaseDate}</h3>
          <div className="rounded-lg border border-zinc-700/50 overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-zinc-800">
                <th className="text-left px-3 py-2 text-zinc-400 font-medium">Task Name</th>
                <th className="text-left px-2 py-2 text-zinc-400 font-medium w-20">Duration</th>
                <th className="text-left px-2 py-2 text-zinc-400 font-medium w-24">Start</th>
                <th className="text-left px-2 py-2 text-zinc-400 font-medium w-24">Finish</th>
                <th className="w-8"></th>
              </tr></thead>
              <tbody>
                {slide.tableData.tasks.map((task, tIdx) => (
                  <tr key={tIdx} className="border-t border-zinc-700/50">
                    <td className="px-3 py-1.5"><Input value={task.taskName} onChange={(e) => updateTableTask(tIdx, 'taskName', e.target.value)} className="bg-transparent border-transparent hover:border-zinc-600 focus:border-amber-500/50 h-7 text-xs text-zinc-200 px-0" /></td>
                    <td className="px-2 py-1.5"><Input value={task.duration} onChange={(e) => updateTableTask(tIdx, 'duration', e.target.value)} className="bg-transparent border-transparent hover:border-zinc-600 focus:border-amber-500/50 h-7 text-xs text-zinc-300 px-0 font-mono text-center" /></td>
                    <td className="px-2 py-1.5"><Input value={task.start} onChange={(e) => updateTableTask(tIdx, 'start', e.target.value)} className="bg-transparent border-transparent hover:border-zinc-600 focus:border-amber-500/50 h-7 text-xs text-zinc-300 px-0 font-mono text-center" /></td>
                    <td className="px-2 py-1.5"><Input value={task.finish} onChange={(e) => updateTableTask(tIdx, 'finish', e.target.value)} className="bg-transparent border-transparent hover:border-zinc-600 focus:border-amber-500/50 h-7 text-xs text-zinc-300 px-0 font-mono text-center" /></td>
                    <td className="px-1 py-1.5"><Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-400 hover:bg-red-500/10" onClick={() => removeTableRow(tIdx)}><Trash2 className="w-3 h-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" className="text-xs border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50" onClick={addTableRow}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Task Row</Button>
          <div><label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Note</label><Textarea value={slide.tableData.note || ''} onChange={(e) => updateTableNote(e.target.value)} className="bg-zinc-900 border-zinc-700 text-xs text-zinc-300 mt-1 resize-none min-h-16" placeholder="Add a note..." /></div>
          {slide.completionSummary && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
              <label className="text-[11px] text-amber-400 uppercase tracking-wider font-medium">Completion Summary</label>
              <Field label="Target Date" value={slide.completionSummary.targetDate} onChange={(v) => updateCompletionSummary('targetDate', v)} />
              <div><label className="text-[11px] text-zinc-500 mb-1 block">Description</label><Textarea value={slide.completionSummary.text} onChange={(e) => updateCompletionSummary('text', e.target.value)} className="bg-zinc-900 border-zinc-700 text-xs text-zinc-300 resize-none min-h-16" /></div>
            </div>
          )}
        </div>
      </ScrollArea>
    )
  }

  return <div className="p-4 text-sm text-zinc-500">No editable content for this slide.</div>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-zinc-900 border-zinc-700 text-sm text-zinc-200 focus:border-amber-500/50" />
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────
interface ChatMessage { role: 'user' | 'assistant'; content: string }

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { slides } = useEditorStore()

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const context = buildAIContext(slides)
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }], context }) })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch { setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }]) }
    finally { setLoading(false) }
  }

  const suggestions = ['What is the total project duration?', 'Which tasks run concurrently in Phase 3?', 'What happens on 17/07/26?', 'What is shared with EFL?', 'Summarise Phase 1 tasks', 'When does the project finish?']

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-zinc-200">Programme AI Assistant</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3"><MessageSquare className="w-6 h-6 text-amber-500" /></div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">Ask about the programme</h3>
            <p className="text-xs text-zinc-500 mb-4 max-w-[240px]">I can answer questions about tasks, timelines, dependencies, and more.</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestions.map((s) => (<button key={s} onClick={() => setInput(s)} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-zinc-700/50 transition-colors">{s}</button>))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-amber-500/20 text-amber-100' : 'bg-zinc-800 text-zinc-300'}`}>
              {msg.role === 'assistant' ? <div className="prose prose-invert prose-xs max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start"><div className="bg-zinc-800 rounded-xl px-4 py-3"><div className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>
        )}
      </div>
      <div className="px-3 pb-3 pt-2 border-t border-zinc-800">
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the programme..." className="bg-zinc-900 border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 h-9" disabled={loading} />
          <Button type="submit" size="icon" disabled={!input.trim() || loading} className="shrink-0 h-9 w-9 bg-amber-500 hover:bg-amber-600 text-black"><Send className="w-4 h-4" /></Button>
        </form>
      </div>
    </div>
  )
}

// ─── Password Dialog ───────────────────────────────────────────
function PasswordDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess()
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700 text-zinc-100 p-0 overflow-hidden">
        <div className="relative">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="p-6 pt-5">
            <DialogHeader className="text-left space-y-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-zinc-100">
                    Enter Password to Edit
                  </DialogTitle>
                  <DialogDescription className="text-sm text-zinc-400 mt-0.5">
                    Editing is restricted. Enter the password to unlock editing capabilities.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter password"
                  className="bg-zinc-800/80 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 h-11 pr-10 text-sm focus:border-amber-500/60 focus:ring-amber-500/20"
                  disabled={loading}
                  autoComplete="off"
                />
                <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!password.trim() || loading}
                  className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-black font-medium text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Unlock Editing'
                  )}
                </Button>
              </div>
            </form>

            <p className="text-[11px] text-zinc-600 mt-4 text-center">
              Authorized personnel only. Contact admin for access.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Home() {
  const { editMode, toggleEditMode, chatOpen, toggleChat, editPanelTab, setEditPanelTab, isAuthenticated, setAuthenticated } = useEditorStore()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const requestEdit = useCallback(() => {
    if (isAuthenticated) {
      if (!editMode) toggleEditMode()
    } else {
      setShowPasswordDialog(true)
    }
  }, [isAuthenticated, editMode, toggleEditMode])

  const handlePasswordSuccess = useCallback(() => {
    setAuthenticated(true)
    setShowPasswordDialog(false)
    if (!editMode) toggleEditMode()
  }, [setAuthenticated, editMode, toggleEditMode])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'e' || e.key === 'E') requestEdit()
      // Ctrl+L to re-lock editing mode (exit edit + reset auth)
      if (e.key === 'l' && (e.ctrlKey || e.metaKey) && editMode) {
        e.preventDefault()
        setAuthenticated(false)
        toggleEditMode()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [requestEdit, editMode, toggleEditMode, setAuthenticated])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col bg-zinc-900 overflow-hidden">
        {/* ── Top Toolbar ── */}
        <header className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center"><span className="text-[11px] font-black text-black tracking-tight">SW</span></div>
              <div>
                <h1 className="text-sm font-bold text-zinc-200 leading-tight">PBS HQ Construction</h1>
                <p className="text-[10px] text-zinc-500 leading-tight">Sigatoka Electrical Works — Buildings A&B</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={editMode ? 'default' : 'outline'} size="sm" onClick={editMode ? toggleEditMode : requestEdit} className={`h-8 text-xs gap-1.5 ${editMode ? 'bg-amber-500 hover:bg-amber-600 text-black border-amber-500' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
                  {editMode ? <Edit3 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {editMode ? 'Editing' : 'View'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{editMode ? 'Exit Edit Mode (E / Ctrl+L)' : 'Enter Edit Mode (E) — Password Required'}</TooltipContent>
            </Tooltip>
            {editMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => useEditorStore.setState({ slides: SLIDES_INITIAL })}><RotateCcw className="w-3.5 h-3.5" /> Reset</Button>
                </TooltipTrigger>
                <TooltipContent>Reset all changes</TooltipContent>
              </Tooltip>
            )}
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleChat} className={`h-8 text-xs gap-1.5 ${chatOpen ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                  {chatOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">AI Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle AI Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="/PBS_HQ_Construction_Programme.pptx" download>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">PPTX</span></Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>Download PPTX</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* ── Main Content ── */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={14} minSize={10} maxSize={20}>
              <div className="h-full bg-zinc-950/50 border-r border-zinc-800"><SlideThumbnails /></div>
            </ResizablePanel>
            <ResizableHandle className="bg-zinc-800 hover:bg-amber-500/50 w-px transition-colors" />
            <ResizablePanel defaultSize={chatOpen ? 52 : 72} minSize={30}>
              <div className="h-full bg-zinc-900"><SlideCanvas /></div>
            </ResizablePanel>
            {chatOpen && (
              <>
                <ResizableHandle className="bg-zinc-800 hover:bg-amber-500/50 w-px transition-colors" />
                <ResizablePanel defaultSize={34} minSize={24} maxSize={50}>
                  <div className="h-full bg-zinc-950/80 border-l border-zinc-800 flex flex-col">
                    {editMode ? (
                      <Tabs value={editPanelTab} onValueChange={(v) => setEditPanelTab(v as 'edit' | 'chat')} className="flex flex-col h-full">
                        <TabsList className="mx-3 mt-2 mb-0 bg-zinc-900 h-9 p-0.5">
                          <TabsTrigger value="edit" className="text-xs h-7 gap-1.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"><Edit3 className="w-3 h-3" /> Edit</TabsTrigger>
                          <TabsTrigger value="chat" className="text-xs h-7 gap-1.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"><MessageSquare className="w-3 h-3" /> AI Chat</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="flex-1 min-h-0 mt-0"><EditPanel /></TabsContent>
                        <TabsContent value="chat" className="flex-1 min-h-0 mt-0"><ChatPanel /></TabsContent>
                      </Tabs>
                    ) : (
                      <ChatPanel />
                    )}
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Password Dialog */}
      <PasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={handlePasswordSuccess}
      />
    </TooltipProvider>
  )
}