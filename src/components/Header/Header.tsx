import { NavLink } from 'react-router-dom';
import { BookIcon, FolderIcon, NoteIcon, TrashIcon } from '../Icons';

export function Header() {
  return (
    <header className="hero-panel sticky top-2 z-30 mb-6 md:top-4">
      <div className="relative p-4 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="hero-badge mb-3 hidden sm:inline-flex">Language Practice Workspace</div>
            <h1 className="hero-title mb-3 md:mb-4">مكتبة الجمل الإنجليزية</h1>
            <p className="hero-subtitle mb-0 text-sm sm:text-base">
              واجهة حديثة لحفظ الجمل، المراجعة، والبحث السريع مع تجربة أكثر هدوءًا وتنظيمًا.
            </p>
          </div>

          <div className="hidden grid-cols-2 gap-3 sm:grid lg:min-w-[30rem] sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
              <div className="text-2xl font-black text-white">01</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Dashboard</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
              <div className="text-2xl font-black text-white">02</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Review</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
              <div className="text-2xl font-black text-white">03</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Notes</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
              <div className="text-2xl font-black text-white">04</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Trash</div>
            </div>
          </div>
        </div>

        <nav className="nav-shell mt-5 sm:mt-6">
          <NavLink to="/" end className={({ isActive }) => `nav-chip w-full sm:w-auto ${isActive ? 'nav-chip-active' : ''}`}>
            <BookIcon className="h-4 w-4" />
            الرئيسية
          </NavLink>
          <NavLink to="/learned" className={({ isActive }) => `nav-chip w-full sm:w-auto ${isActive ? 'nav-chip-active' : ''}`}>
            <FolderIcon className="h-4 w-4" />
            المحفوظات
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `nav-chip w-full sm:w-auto ${isActive ? 'nav-chip-active' : ''}`}>
            <NoteIcon className="h-4 w-4" />
            الملاحظات
          </NavLink>
          <NavLink to="/trash" className={({ isActive }) => `nav-chip w-full sm:w-auto ${isActive ? 'nav-chip-active' : ''}`}>
            <TrashIcon className="h-4 w-4" />
            سلة المحذوفات
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
