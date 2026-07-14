import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from '../Icons';

interface AddSentenceFormProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  onAdd: (data: { english: string; arabic: string; category: string }) => void;
}

export function AddSentenceForm({ categories, onAddCategory, onAdd }: AddSentenceFormProps) {
  const defaultCategory = useMemo(() => categories[0] ?? 'General', [categories]);
  const [english, setEnglish] = useState('');
  const [arabic, setArabic] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [newCategory, setNewCategory] = useState('');
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('addSentenceFormOpen');
      if (saved === null) return true;
      return saved === '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('addSentenceFormOpen', isOpen ? '1' : '0');
    } catch {
      // ignore
    }
  }, [isOpen]);

  const canSubmit = english.trim() !== '' && arabic.trim() !== '' && category.trim() !== '';

  const submit = () => {
    if (!canSubmit) return;

    onAdd({
      english: english.trim(),
      arabic: arabic.trim(),
      category,
    });

    setEnglish('');
    setArabic('');
    setCategory(defaultCategory);
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setCategory(trimmed);
    setNewCategory('');
  };

  return (
    <section className="surface mb-6 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 md:px-6">
        <div>
          <div className="hero-badge mb-2 bg-slate-900 text-white">Create</div>
          <h2 className="m-0 text-xl font-bold text-slate-900">إضافة جملة جديدة</h2>
          <p className="mt-1 mb-0 text-sm text-slate-500">أضف جملة إنجليزية وترجمتها مع تصنيف واضح وسريع.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="btn btn-gray" onClick={() => setIsOpen((v) => !v)}>
            {isOpen ? 'إخفاء' : 'عرض النموذج'}
          </button>
          {isOpen && (
            <button className="btn btn-green" onClick={submit} disabled={!canSubmit}>
              <PlusIcon className="h-4 w-4" />
              إضافة الجملة
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">English sentence</label>
            <input
              className="app-input text-left"
              dir="ltr"
              placeholder="Type the English sentence here..."
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">الترجمة بالعربية</label>
            <input
              className="app-input text-right"
              dir="rtl"
              placeholder="اكتب الترجمة العربية هنا..."
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">التصنيف</label>
            <select
              className="app-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">تصنيف جديد</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="app-input"
                placeholder="إضافة فئة جديدة (اختياري)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCategory();
                }}
              />
              <button className="btn btn-blue sm:min-w-32" onClick={addCategory} disabled={!newCategory.trim()}>
                <PlusIcon className="h-4 w-4" />
                إضافة فئة
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
