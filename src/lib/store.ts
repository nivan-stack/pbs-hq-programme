import { create } from 'zustand'
import { SLIDES_INITIAL, type SlideData } from './programme-data'

interface EditorState {
  slides: SlideData[]
  currentSlideIndex: number
  editMode: boolean
  chatOpen: boolean
  editPanelTab: 'edit' | 'chat'
  isAuthenticated: boolean

  setCurrentSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
  toggleEditMode: () => void
  toggleChat: () => void
  setEditPanelTab: (tab: 'edit' | 'chat') => void
  setAuthenticated: (val: boolean) => void

  // Edit operations
  updateCoverField: (field: string, value: string) => void
  updateBentoPhase: (phaseIdx: number, field: string, value: string | string[]) => void
  updateTableTask: (taskIdx: number, field: string, value: string) => void
  addTableRow: () => void
  removeTableRow: (taskIdx: number) => void
  updateTableNote: (note: string) => void
  updateCompletionSummary: (field: string, value: string) => void
  updateTableMeta: (field: string, value: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  slides: SLIDES_INITIAL,
  currentSlideIndex: 0,
  editMode: false,
  chatOpen: true,
  editPanelTab: 'chat',
  isAuthenticated: false,

  setCurrentSlide: (index) => set({ currentSlideIndex: index }),
  nextSlide: () => {
    const { currentSlideIndex, slides } = get()
    if (currentSlideIndex < slides.length - 1) set({ currentSlideIndex: currentSlideIndex + 1 })
  },
  prevSlide: () => {
    const { currentSlideIndex } = get()
    if (currentSlideIndex > 0) set({ currentSlideIndex: currentSlideIndex - 1 })
  },
  toggleEditMode: () => set((s) => ({ editMode: !s.editMode, editPanelTab: !s.editMode ? 'edit' : 'chat' })),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setEditPanelTab: (tab) => set({ editPanelTab: tab }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),

  updateCoverField: (field, value) =>
    set((s) => {
      const slides = [...s.slides]
      const slide = { ...slides[0], cover: { ...slides[0].cover! } }
      ;(slide.cover as any)[field] = value
      slides[0] = slide
      return { slides }
    }),

  updateBentoPhase: (phaseIdx, field, value) =>
    set((s) => {
      const slides = [...s.slides]
      const slide = { ...slides[1], bento: { ...slides[1].bento! } }
      const phases = [...slide.bento!.phases]
      phases[phaseIdx] = { ...phases[phaseIdx] }
      ;(phases[phaseIdx] as any)[field] = value
      slide.bento!.phases = phases
      slides[1] = slide
      return { slides }
    }),

  updateTableTask: (taskIdx, field, value) =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table') return s
      const td = { ...slide.tableData! }
      const tasks = [...td.tasks]
      tasks[taskIdx] = { ...tasks[taskIdx], [field]: value }
      td.tasks = tasks
      slide.tableData = td
      slides[idx] = slide
      return { slides }
    }),

  addTableRow: () =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table') return s
      const td = { ...slide.tableData! }
      td.tasks = [...td.tasks, { taskName: '', duration: '', start: '', finish: '' }]
      slide.tableData = td
      slides[idx] = slide
      return { slides }
    }),

  removeTableRow: (taskIdx) =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table') return s
      const td = { ...slide.tableData! }
      td.tasks = td.tasks.filter((_, i) => i !== taskIdx)
      slide.tableData = td
      slides[idx] = slide
      return { slides }
    }),

  updateTableNote: (note) =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table') return s
      slide.tableData = { ...slide.tableData!, note }
      slides[idx] = slide
      return { slides }
    }),

  updateCompletionSummary: (field, value) =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table' || !slide.completionSummary) return s
      slide.completionSummary = { ...slide.completionSummary, [field]: value }
      slides[idx] = slide
      return { slides }
    }),

  updateTableMeta: (field, value) =>
    set((s) => {
      const idx = s.currentSlideIndex
      const slides = [...s.slides]
      const slide = { ...slides[idx] }
      if (slide.type !== 'table') return s
      slide.tableData = { ...slide.tableData!, [field]: value }
      slides[idx] = slide
      return { slides }
    }),
}))