'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Plus,
  Trash2,
  Palette,
  Minus,
} from 'lucide-react'

interface FormattingToolbarProps {
  fontSize: number
  onFontSizeChange: (size: number) => void
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onAlignLeft: () => void
  onAlignRight: () => void
  onAlignCenter: () => void
  onTextColor: (color: string) => void
  onAddTextBox: () => void
  onDeleteSelected: () => void
  hasSelection: boolean
}

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 42, 44, 56, 72]
const TEXT_COLORS = [
  '#1A1A2E', '#4A4A5A', '#FFFFFF', '#E8912D', '#1B2A4A',
  '#2E7D6F', '#C0392B', '#2563EB', '#7C3AED', '#059669',
]

export default function FormattingToolbar({
  fontSize,
  onFontSizeChange,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignRight,
  onAlignCenter,
  onTextColor,
  onAddTextBox,
  onDeleteSelected,
  hasSelection,
}: FormattingToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 shrink-0 overflow-x-auto">
        {/* Font Size */}
        <div className="flex items-center gap-1 mr-1">
          <Type className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <div className="flex items-center">
            <button
              onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
              className="w-6 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded text-sm font-bold"
            >
              −
            </button>
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="h-7 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-1.5 w-14 text-center focus:border-amber-500/50 focus:outline-none appearance-none cursor-pointer"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => onFontSizeChange(Math.min(120, fontSize + 2))}
              className="w-6 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded text-sm font-bold"
            >
              +
            </button>
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Bold / Italic / Underline */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onBold}>
              <Bold className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold (Ctrl+B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onItalic}>
              <Italic className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic (Ctrl+I)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onUnderline}>
              <Underline className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline (Ctrl+U)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onAlignLeft}>
              <AlignLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onAlignCenter}>
              <AlignCenter className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700" onClick={onAlignRight}>
              <AlignRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700">
                  <Palette className="w-4 h-4" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Text Color</TooltipContent>
          </Tooltip>
          <div className="flex gap-0.5">
            {TEXT_COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => onTextColor(color)}
                className="w-4 h-5 rounded-sm border border-zinc-600 hover:scale-125 transition-transform"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Add Text Box */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50"
              onClick={onAddTextBox}
            >
              <Plus className="w-3 h-3" /> Text Box
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a new text box to the slide</TooltipContent>
        </Tooltip>

        {/* Delete */}
        {hasSelection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                onClick={onDeleteSelected}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete selected element</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}