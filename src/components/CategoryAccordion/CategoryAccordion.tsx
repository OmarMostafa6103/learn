import type { ReactNode } from 'react'
import { ChevronDownIcon, FolderIcon } from '../Icons'

interface CategoryAccordionProps {
  title: string
  count: number
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

export function CategoryAccordion({ title, count, isOpen, onToggle, children }: CategoryAccordionProps) {
  return (
    <section className={`surface overflow-hidden transition-all ${isOpen ? 'shadow-card' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 text-right md:px-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <FolderIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-base font-bold text-slate-900">{title}</div>
            <div className="text-sm text-slate-500">{count} جملة</div>
          </div>
        </div>

        <span className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon className="h-5 w-5" />
        </span>
      </button>

      {isOpen && <div className="p-4 md:p-5">{children}</div>}
    </section>
  )
}
