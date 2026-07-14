import { SearchIcon } from '../Icons';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="surface mb-6 p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold text-slate-900">البحث السريع</h2>
          <p className="mt-1 mb-0 text-sm text-slate-500">ابحث بالعربية أو الإنجليزية بدون تشكيل وبشكل أسرع.</p>
        </div>
        <div className="hidden rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
          Live Search
        </div>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          type="text"
          className="app-input pr-12 text-right"
          placeholder="ابحث في الجمل، التصنيفات، أو الكلمات المفتاحية..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
