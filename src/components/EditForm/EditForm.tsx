import { useMemo, useState } from 'react';
import { CloseIcon, PlusIcon } from '../Icons';

interface SentenceType {
  id: number;
  english: string;
  arabic: string;
  category: string;
}

interface EditFormProps {
  sentence: SentenceType;
  categories: string[];
  onSave: (sentence: SentenceType) => void;
  onCancel: () => void;
}

export function EditForm({ sentence, categories, onSave, onCancel }: EditFormProps) {
  const [formData, setFormData] = useState(sentence);
  const defaultCategory = useMemo(
    () => categories[0] ?? sentence.category,
    [categories, sentence.category]
  );
  const [newCategory, setNewCategory] = useState('');

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 md:px-5">
        <div>
          <div className="hero-badge mb-2 bg-slate-900 text-white">Edit mode</div>
          <h3 className="m-0 text-lg font-bold text-slate-900">تعديل الجملة</h3>
        </div>
        <button
          className="btn btn-gray"
          onClick={onCancel}
        >
          <CloseIcon className="h-4 w-4" />
          إغلاق
        </button>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">English sentence</label>
          <input
            type="text"
            className="app-input text-left"
            dir="ltr"
            value={formData.english}
            onChange={(e) => setFormData({ ...formData, english: e.target.value })}
            placeholder="الجملة بالإنجليزية"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">الترجمة بالعربية</label>
          <input
            type="text"
            className="app-input text-right"
            dir="rtl"
            value={formData.arabic}
            onChange={(e) => setFormData({ ...formData, arabic: e.target.value })}
            placeholder="الترجمة بالعربية"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">التصنيف</label>
          <select
            className="app-input"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">فئة جديدة</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="app-input"
              placeholder="أو اكتب فئة جديدة (اختياري)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = newCategory.trim();
                  if (!trimmed) return;
                  setFormData((prev) => ({ ...prev, category: trimmed }));
                  setNewCategory('');
                }
              }}
            />
            <button
              type="button"
              className="btn btn-blue sm:min-w-32"
              onClick={() => {
                const trimmed = newCategory.trim();
                if (!trimmed) {
                  setFormData((prev) => ({ ...prev, category: prev.category || defaultCategory }));
                  return;
                }
                setFormData((prev) => ({ ...prev, category: trimmed }));
                setNewCategory('');
              }}
              disabled={!newCategory.trim()}
            >
              <PlusIcon className="h-4 w-4" />
              إضافة فئة
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button
            className="btn btn-green sm:min-w-32"
            onClick={() => onSave(formData)}
          >
            حفظ التعديلات
          </button>
          <button
            className="btn btn-gray sm:min-w-32"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
