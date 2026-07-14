interface FilterBarProps {
  categories: string[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ categories, currentFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="surface mb-6 p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold text-slate-900">التصنيفات</h2>
          <p className="mt-1 mb-0 text-sm text-slate-500">انتقل بين الفئات بسهولة وحدد سياق المراجعة.</p>
        </div>
      </div>
      <div className="flex gap-2.5 flex-wrap justify-start overflow-x-auto pb-1">
      {['all', ...categories].map((cat) => (
        <button
          key={cat}
          className={`pill md:text-base ${currentFilter === cat ? 'pill-active' : 'pill-inactive'}`}
          onClick={() => onFilterChange(cat)}
        >
          {cat === 'all' ? 'الكل' : cat}
        </button>
      ))}
      </div>
    </div>
  );
}
