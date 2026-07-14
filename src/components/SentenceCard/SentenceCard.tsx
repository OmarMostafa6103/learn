import { useEffect, useState } from 'react';
import { EditForm } from '../EditForm';
import { CloseIcon, EditIcon, NoteIcon, SpeakerIcon, TrashIcon, CheckIcon } from '../Icons';

interface SentenceType {
  id: number;
  english: string;
  arabic: string;
  category: string;
}

interface SentenceCardProps {
  sentence: SentenceType;
  isLearned: boolean;
  note: string;
  categories: string[];
  onToggleLearned: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (sentence: SentenceType) => void;
  onCancelEdit: () => void;
  isNoteOpen: boolean;
  onOpenNote: () => void;
  onCancelNote: () => void;
  onSaveNote: (noteText: string) => void;
  onSpeak: (speed: number) => void;
  isEditing: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function SentenceCard({
  sentence,
  isLearned,
  note,
  categories,
  onToggleLearned,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  isNoteOpen,
  onOpenNote,
  onCancelNote,
  onSaveNote,
  onSpeak,
  isEditing,
  isSelected = false,
  onToggleSelect,
}: SentenceCardProps) {
  const [draftNote, setDraftNote] = useState(note);

  useEffect(() => {
    if (isNoteOpen) setDraftNote(note);
  }, [isNoteOpen, note]);

  return (
    <div
      className={`sentence-card ${isLearned ? 'sentence-card-learned' : 'sentence-card-normal'}`}
    >
      {isEditing ? (
        <EditForm
          sentence={sentence}
          categories={categories}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <div className="flex justify-between items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onToggleSelect}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  aria-label={`تحديد الجملة ${sentence.id}`}
                />
              )}
              <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {sentence.category}
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">#{sentence.id}</span>
          </div>

          <div
            className="text-xl md:text-2xl font-semibold text-slate-900 my-4 leading-relaxed text-left"
            dir="ltr"
          >
            {sentence.english}
          </div>

          <div
            className="text-lg md:text-xl text-slate-700 my-4 leading-relaxed text-right"
            dir="rtl"
          >
            {sentence.arabic}
          </div>

          {note.trim() !== '' && !isNoteOpen && (
            <div
              className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-right text-sm text-slate-600"
              dir="rtl"
            >
              <span className="font-bold">ملاحظة:</span> {note}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn btn-blue" onClick={() => onSpeak(0.9)}>
              <SpeakerIcon className="h-4 w-4" />
              نطق طبيعي
            </button>
            <button className="btn btn-orange" onClick={() => onSpeak(0.5)}>
              <SpeakerIcon className="h-4 w-4" />
              نطق بطيء
            </button>
            <button className={`btn ${isLearned ? 'btn-green' : 'btn-gray'}`} onClick={onToggleLearned}>
              <CheckIcon className="h-4 w-4" />
              {isLearned ? 'محفوظة' : 'غير محفوظة'}
            </button>
            <button className="btn btn-gray" title={note.trim() ? note : 'أضف ملاحظة'} onClick={onOpenNote}>
              <NoteIcon className="h-4 w-4" />
              ملاحظة
            </button>
            <button className="btn btn-blue" onClick={onEdit}>
              <EditIcon className="h-4 w-4" />
              تعديل
            </button>
            <button className="btn btn-red" onClick={onDelete}>
              <TrashIcon className="h-4 w-4" />
              حذف
            </button>
          </div>

          {isNoteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
              <button
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancelNote}
                aria-label="إغلاق"
              />

              <div className="relative w-full max-w-xl surface p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-2.5">
                  <h3 className="m-0 text-lg font-bold text-slate-900" dir="rtl">
                    ملاحظة الجملة
                  </h3>
                  <button className="btn btn-gray" onClick={onCancelNote}>
                    <CloseIcon className="h-4 w-4" />
                    إغلاق
                  </button>
                </div>

                <textarea
                  className="app-input text-right"
                  dir="rtl"
                  rows={4}
                  placeholder="اكتب ملاحظتك هنا..."
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                />

                <div className="mt-4 flex gap-2.5 flex-wrap">
                  <button className="btn btn-green" onClick={() => {
                    onSaveNote(draftNote);
                    onCancelNote();
                  }}>
                    حفظ
                  </button>
                  <button className="btn btn-gray" onClick={onCancelNote}>
                    إلغاء
                  </button>
                  <button className="btn btn-red" onClick={() => {
                    onSaveNote('');
                    onCancelNote();
                  }}>
                    <TrashIcon className="h-4 w-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
