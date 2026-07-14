import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { sentences, CATEGORIES } from './data/sentences'
import { Header, StatsBar, SearchBox, FilterBar, AddSentenceForm, SentenceCard, CategoryAccordion } from './components'
import { readJsonStorage, writeJsonStorage } from './utils/storage'
import { normalizeSearchText } from './utils/text'
import { DownloadIcon, SelectAllIcon, UploadIcon, RestoreIcon, TrashIcon } from './components/Icons'

interface SentenceType {
  id: number
  english: string
  arabic: string
  category: string
}

interface DeletedSentenceRecord {
  sentence: SentenceType
  note: string
  learned: boolean
  wasCustom: boolean
  hadEdit: boolean
  deletedAt: number
}

interface AppSnapshot {
  version: 1
  learnedSentences: number[]
  notes: Record<number, string>
  editedSentences: Record<number, SentenceType>
  customSentences: SentenceType[]
  customCategories: string[]
  deletedRecords: DeletedSentenceRecord[]
}

type TrashPeriodFilter = 'all' | '7d' | '30d' | '90d'

const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

const isSentenceType = (value: SentenceType | undefined): value is SentenceType => Boolean(value)
const isDefined = <T,>(value: T | undefined): value is T => value !== undefined

const sortSentencesById = (items: SentenceType[]) => [...items].sort((left, right) => left.id - right.id)

const purgeExpiredTrash = (records: DeletedSentenceRecord[], now = Date.now()) =>
  records.filter((record) => now - record.deletedAt < TRASH_RETENTION_MS)

const getTrashPeriodMs = (filter: TrashPeriodFilter) => {
  if (filter === '7d') return 7 * 24 * 60 * 60 * 1000
  if (filter === '30d') return 30 * 24 * 60 * 60 * 1000
  if (filter === '90d') return 90 * 24 * 60 * 60 * 1000
  return null
}

const buildSnapshot = (
  learnedSentences: number[],
  notes: Record<number, string>,
  editedSentences: Record<number, SentenceType>,
  customSentences: SentenceType[],
  customCategories: string[],
  deletedRecords: DeletedSentenceRecord[],
): AppSnapshot => ({
  version: 1,
  learnedSentences,
  notes,
  editedSentences,
  customSentences,
  customCategories,
  deletedRecords,
})

const isAppSnapshot = (value: unknown): value is AppSnapshot => {
  if (typeof value !== 'object' || value === null) return false

  const snapshot = value as Partial<AppSnapshot>
  return snapshot.version === 1
    && Array.isArray(snapshot.learnedSentences)
    && typeof snapshot.notes === 'object'
    && snapshot.notes !== null
    && typeof snapshot.editedSentences === 'object'
    && snapshot.editedSentences !== null
    && Array.isArray(snapshot.customSentences)
    && Array.isArray(snapshot.customCategories)
    && Array.isArray(snapshot.deletedRecords)
}

function App() {
  const location = useLocation()
  const importInputRef = useRef<HTMLInputElement>(null)
  const [allSentences, setAllSentences] = useState<SentenceType[]>(sentences)
  const [learnedSentences, setLearnedSentences] = useState<number[]>([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [noteOpenId, setNoteOpenId] = useState<number | null>(null)
  const [editedSentences, setEditedSentences] = useState<Record<number, SentenceType>>({})
  const [deletedRecords, setDeletedRecords] = useState<DeletedSentenceRecord[]>([])
  const [customSentences, setCustomSentences] = useState<SentenceType[]>([])
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [selectedSentenceIds, setSelectedSentenceIds] = useState<number[]>([])
  const [selectedTrashIds, setSelectedTrashIds] = useState<number[]>([])
  const [bulkCategory, setBulkCategory] = useState('')
  const [recentDeletedRecords, setRecentDeletedRecords] = useState<DeletedSentenceRecord[]>([])
  const [selectedRecentDeletedIds, setSelectedRecentDeletedIds] = useState<number[]>([])
  const [trashCategoryFilter, setTrashCategoryFilter] = useState('all')
  const [trashPeriodFilter, setTrashPeriodFilter] = useState<TrashPeriodFilter>('all')
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  // Load from localStorage on mount
  useEffect(() => {
    const savedLearned = readJsonStorage<number[]>('learnedSentences', [])
    const savedNotes = readJsonStorage<Record<number, string>>('sentenceNotes', {})
    const savedEdited = readJsonStorage<Record<number, SentenceType>>('editedSentences', {})
    const custom = readJsonStorage<SentenceType[]>('customSentences', [])
    const customCatsFromStorage = readJsonStorage<string[]>('customCategories', [])
    const savedDeletedRecords = readJsonStorage<DeletedSentenceRecord[]>('deletedSentenceRecords', [])
    const legacyDeletedIds = readJsonStorage<number[]>('deletedSentenceIds', [])

    setLearnedSentences(savedLearned)
    setNotes(savedNotes)
    setCustomSentences(custom)

    // Start from base + custom, then apply edits, then apply deletions
    let combined: SentenceType[] = [...sentences, ...custom]

    setEditedSentences(savedEdited)
    combined = combined.map((s) => savedEdited[s.id] || s)

    const cleanedDeletedRecords = purgeExpiredTrash(savedDeletedRecords)
    const deletedIdsFromRecords = cleanedDeletedRecords.map((record) => record.sentence.id)

    const legacyDeletedRecords: DeletedSentenceRecord[] = legacyDeletedIds
      .map((id) => {
        const sentence = combined.find((item) => item.id === id)
        if (!isSentenceType(sentence)) return undefined

        return {
          sentence,
          note: savedNotes[id] || '',
          learned: savedLearned.includes(id),
          wasCustom: custom.some((item) => item.id === id),
          hadEdit: Boolean(savedEdited[id]),
          deletedAt: Date.now(),
        }
      })
      .filter(isDefined)

    const allDeletedRecords = cleanedDeletedRecords.length > 0
      ? cleanedDeletedRecords
      : legacyDeletedRecords

    if (deletedIdsFromRecords.length > 0) {
      combined = combined.filter((sentence) => !deletedIdsFromRecords.includes(sentence.id))
    }

    if (legacyDeletedRecords.length > 0 && cleanedDeletedRecords.length === 0) {
      combined = combined.filter((sentence) => !legacyDeletedRecords.some((record) => record.sentence.id === sentence.id))
    }

    setAllSentences(combined)
    setDeletedRecords(allDeletedRecords)

    // Hydrate custom categories (storage + any categories found in custom/edited)
    const categorySet = new Set<string>(customCatsFromStorage)
    for (const s of custom) {
      if (!CATEGORIES.includes(s.category)) categorySet.add(s.category)
    }
    for (const s of Object.values(savedEdited)) {
      if (!CATEGORIES.includes(s.category)) categorySet.add(s.category)
    }
    setCustomCategories(Array.from(categorySet))
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDeletedRecords((current) => purgeExpiredTrash(current))
    }, 60 * 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    writeJsonStorage('learnedSentences', learnedSentences)
  }, [learnedSentences])

  useEffect(() => {
    writeJsonStorage('sentenceNotes', notes)
  }, [notes])

  useEffect(() => {
    writeJsonStorage('editedSentences', editedSentences)
  }, [editedSentences])

  useEffect(() => {
    writeJsonStorage('customSentences', customSentences)
  }, [customSentences])

  useEffect(() => {
    writeJsonStorage('customCategories', customCategories)
  }, [customCategories])

  useEffect(() => {
    const cleaned = purgeExpiredTrash(deletedRecords)
    if (cleaned.length !== deletedRecords.length) {
      setDeletedRecords(cleaned)
      return
    }

    writeJsonStorage('deletedSentenceRecords', deletedRecords)
    writeJsonStorage('deletedSentenceIds', deletedRecords.map((record) => record.sentence.id))
  }, [deletedRecords])

  useEffect(() => {
    if (currentFilter !== 'all') {
      setOpenCategories((prev) => ({
        ...prev,
        [currentFilter]: true,
      }))
    }
  }, [currentFilter])

  const categoriesAll = Array.from(new Set([...CATEGORIES, ...customCategories]))
  const deletedIds = deletedRecords.map((record) => record.sentence.id)
  const selectedTrashRecords = deletedRecords.filter((record) => selectedTrashIds.includes(record.sentence.id))
  const trashCategoryOptions = Array.from(new Set(['all', ...deletedRecords.map((record) => record.sentence.category)]))
  const trashPeriodMs = getTrashPeriodMs(trashPeriodFilter)
  const filteredTrashRecords = deletedRecords.filter((record) => {
    const matchesCategory = trashCategoryFilter === 'all' || record.sentence.category === trashCategoryFilter
    const matchesPeriod = trashPeriodMs === null || Date.now() - record.deletedAt <= trashPeriodMs
    return matchesCategory && matchesPeriod
  })

  const ensureCategory = (category: string) => {
    const trimmed = category.trim()
    if (!trimmed) return
    if (CATEGORIES.includes(trimmed)) return
    setCustomCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
  }

  const getNextSentenceId = () => {
    const ids = new Set<number>()
    for (const s of sentences) ids.add(s.id)
    for (const s of allSentences) ids.add(s.id)
    for (const s of customSentences) ids.add(s.id)
    for (const id of deletedIds) ids.add(id)
    for (const id of Object.keys(editedSentences)) ids.add(Number(id))

    let maxId = 0
    for (const id of ids) {
      if (id > maxId) maxId = id
    }
    return maxId + 1
  }

  const addSentence = (data: { english: string; arabic: string; category: string }) => {
    ensureCategory(data.category)
    const newSentence: SentenceType = {
      id: getNextSentenceId(),
      english: data.english,
      arabic: data.arabic,
      category: data.category,
    }

    setCustomSentences((prev) => [...prev, newSentence])
    setAllSentences((prev) => [...prev, newSentence])
  }

  const addCategory = (category: string) => {
    ensureCategory(category)
  }

  const exportData = () => {
    const snapshot = buildSnapshot(
      learnedSentences,
      notes,
      editedSentences,
      customSentences,
      customCategories,
      deletedRecords,
    )
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `learn-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      if (!isAppSnapshot(parsed)) {
        window.alert('ملف الاستيراد غير صالح.')
        return
      }

      const cleanedTrash = purgeExpiredTrash(parsed.deletedRecords)

      setLearnedSentences(parsed.learnedSentences)
      setNotes(parsed.notes)
      setEditedSentences(parsed.editedSentences)
      setCustomSentences(parsed.customSentences)
      setCustomCategories(parsed.customCategories)
      setDeletedRecords(cleanedTrash)
      setSelectedSentenceIds([])
      setSelectedTrashIds([])
      setSelectedRecentDeletedIds([])
      setBulkCategory('')
      setEditingId(null)
      setNoteOpenId(null)

      const combinedBase = [...sentences, ...parsed.customSentences]
        .map((sentence) => parsed.editedSentences[sentence.id] || sentence)
        .filter((sentence) => !cleanedTrash.some((record) => record.sentence.id === sentence.id))

      setAllSentences(sortSentencesById(combinedBase))

      writeJsonStorage('learnedSentences', parsed.learnedSentences)
      writeJsonStorage('sentenceNotes', parsed.notes)
      writeJsonStorage('editedSentences', parsed.editedSentences)
      writeJsonStorage('customSentences', parsed.customSentences)
      writeJsonStorage('customCategories', parsed.customCategories)
      writeJsonStorage('deletedSentenceRecords', cleanedTrash)
      writeJsonStorage('deletedSentenceIds', cleanedTrash.map((record) => record.sentence.id))

      window.alert('تم استيراد البيانات بنجاح.')
    } catch {
      window.alert('حدث خطأ أثناء قراءة ملف الاستيراد.')
    }
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await importData(file)
  }

  const updateSentenceCategory = (id: number, category: string) => {
    ensureCategory(category)

    setAllSentences((prev) =>
      prev.map((sentence) => (sentence.id === id ? { ...sentence, category } : sentence))
    )

    setCustomSentences((prev) =>
      prev.map((sentence) => (sentence.id === id ? { ...sentence, category } : sentence))
    )

    setEditedSentences((prev) => {
      const next = { ...prev }
      if (next[id]) {
        next[id] = { ...next[id], category }
      }
      return next
    })
  }

  const updateManySentenceCategories = (ids: number[], category: string) => {
    if (ids.length === 0) return
    ids.forEach((id) => updateSentenceCategory(id, category))
    setSelectedSentenceIds([])
    setCurrentFilter(category)
  }

  const addTrashRecord = (sentence: SentenceType) => ({
    sentence,
    note: notes[sentence.id] || '',
    learned: learnedSentences.includes(sentence.id),
    wasCustom: customSentences.some((item) => item.id === sentence.id),
    hadEdit: Boolean(editedSentences[sentence.id]),
    deletedAt: Date.now(),
  })

  const removeSentenceFromActiveState = (id: number) => {
    setEditingId((current) => (current === id ? null : current))
    setNoteOpenId((current) => (current === id ? null : current))
    setSelectedSentenceIds((current) => current.filter((item) => item !== id))

    setAllSentences((prev) => prev.filter((item) => item.id !== id))
    setCustomSentences((prev) => prev.filter((item) => item.id !== id))
    setLearnedSentences((prev) => prev.filter((item) => item !== id))
    setNotes((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const pruneRecentDeletedRecords = (ids: number[]) => {
    if (ids.length === 0) return
    const selectedIds = new Set(ids)
    setRecentDeletedRecords((prev) => prev.filter((record) => !selectedIds.has(record.sentence.id)))
    setSelectedRecentDeletedIds((prev) => prev.filter((id) => !selectedIds.has(id)))
  }

  const restoreTrashRecords = (records: DeletedSentenceRecord[]) => {
    records.forEach((record) => {
      const { sentence, note, learned, wasCustom, hadEdit } = record

      setAllSentences((prev) => {
        if (prev.some((item) => item.id === sentence.id)) return prev
        return sortSentencesById([...prev, sentence])
      })
      setCustomSentences((prev) => {
        const hasSentence = prev.some((item) => item.id === sentence.id)
        if (wasCustom && !hasSentence) return sortSentencesById([...prev, sentence])
        if (!wasCustom) return prev.filter((item) => item.id !== sentence.id)
        return prev
      })
      setLearnedSentences((prev) => {
        if (learned && !prev.includes(sentence.id)) return [...prev, sentence.id]
        if (!learned) return prev.filter((item) => item !== sentence.id)
        return prev
      })
      setNotes((prev) => {
        const next = { ...prev }
        if (note.trim()) next[sentence.id] = note
        else delete next[sentence.id]
        return next
      })
      setEditedSentences((prev) => {
        const next = { ...prev }
        if (hadEdit) next[sentence.id] = sentence
        else delete next[sentence.id]
        return next
      })
    })

    const selectedIds = new Set(records.map((record) => record.sentence.id))
    setDeletedRecords((prev) => prev.filter((record) => !selectedIds.has(record.sentence.id)))
    setSelectedTrashIds((prev) => prev.filter((id) => !selectedIds.has(id)))
    pruneRecentDeletedRecords(Array.from(selectedIds))
  }

  const removeTrashRecords = (ids: number[]) => {
    const selectedIds = new Set(ids)
    setDeletedRecords((prev) => prev.filter((record) => !selectedIds.has(record.sentence.id)))
    setSelectedTrashIds((prev) => prev.filter((id) => !selectedIds.has(id)))
    pruneRecentDeletedRecords(ids)
  }

  const baseFiltered = allSentences.filter(s => {
    if (deletedIds.includes(s.id)) return false
    const matchesFilter = currentFilter === 'all' || s.category === currentFilter
    const normalizedSearch = normalizeSearchText(searchTerm)
    const matchesSearch = searchTerm === '' || 
      normalizeSearchText(s.english).includes(normalizedSearch) ||
      normalizeSearchText(s.arabic).includes(normalizedSearch)
    return matchesFilter && matchesSearch
  })

  const totalCount = allSentences.length
  const learnedCount = allSentences.filter(s => learnedSentences.includes(s.id)).length

  const homeSentences = baseFiltered.filter(s => !learnedSentences.includes(s.id))
  const learnedOnlySentences = baseFiltered.filter(s => learnedSentences.includes(s.id))
  const notesOnlySentences = baseFiltered.filter(s => (notes[s.id] || '').trim() !== '')
  const activeRouteSentences =
    location.pathname === '/learned'
      ? learnedOnlySentences
      : location.pathname === '/notes'
        ? notesOnlySentences
        : homeSentences

  const toggleLearned = (id: number) => {
    setLearnedSentences(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const speakSentence = (text: string, speed = 0.9) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = speed
      window.speechSynthesis.speak(utterance)
    }
  }

  const startEdit = (id: number) => {
    setNoteOpenId(null)
    setEditingId(id)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = (editedSentence: SentenceType) => {
    ensureCategory(editedSentence.category)
    setAllSentences(prev => 
      prev.map(s => s.id === editedSentence.id ? editedSentence : s)
    )

    setCustomSentences((prev) =>
      prev.map((s) => (s.id === editedSentence.id ? editedSentence : s))
    )
    
    setEditedSentences(prev => ({
      ...prev,
      [editedSentence.id]: editedSentence
    }))
    
    setEditingId(null)
  }

  const openNote = (id: number) => {
    setEditingId(null)
    setNoteOpenId(id)
  }

  const cancelNote = () => {
    setNoteOpenId(null)
  }

  const saveNote = (id: number, noteText: string) => {
    const trimmed = noteText.trim()
    setNotes(prev => {
      const next = { ...prev }
      if (!trimmed) {
        delete next[id]
      } else {
        next[id] = trimmed
      }
      return next
    })
  }

  const deleteSentence = (id: number) => {
    const sentence = allSentences.find((item) => item.id === id)
    if (!sentence) return

    if (window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) {
      const record = addTrashRecord(sentence)
      setRecentDeletedRecords((prev) => [...prev, record])
      setDeletedRecords((prev) => purgeExpiredTrash([...prev, record]))
      removeSentenceFromActiveState(id)
    }
  }

  const deleteSelectedSentences = () => {
    if (selectedSentenceIds.length === 0) return
    if (!window.confirm(`هل تريد حذف ${selectedSentenceIds.length} جملة؟`)) return

    const records = selectedSentenceIds
      .map((id) => allSentences.find((sentence) => sentence.id === id))
      .filter(isSentenceType)
      .map(addTrashRecord)

    setRecentDeletedRecords((prev) => [...prev, ...records])
    setDeletedRecords((prev) => purgeExpiredTrash([...prev, ...records]))
    selectedSentenceIds.forEach((id) => removeSentenceFromActiveState(id))
    setSelectedSentenceIds([])
  }

  const restoreLastDeleted = () => {
    const lastRecord = recentDeletedRecords[recentDeletedRecords.length - 1]
    if (!lastRecord) return
    restoreTrashRecords([lastRecord])
  }

  const restoreSelectedRecentDeleted = () => {
    if (selectedRecentDeletedIds.length === 0) return
    const selectedRecords = recentDeletedRecords.filter((record) =>
      selectedRecentDeletedIds.includes(record.sentence.id)
    )
    restoreTrashRecords(selectedRecords)
    setSelectedRecentDeletedIds([])
  }

  const toggleSelectedRecentDeleted = (id: number) => {
    setSelectedRecentDeletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectAllRecentDeleted = () => {
    setSelectedRecentDeletedIds(recentDeletedRecords.map((record) => record.sentence.id))
  }

  const clearSelectedRecentDeleted = () => setSelectedRecentDeletedIds([])

  const restoreSelectedTrash = () => {
    if (selectedTrashRecords.length === 0) return
    restoreTrashRecords(selectedTrashRecords)
  }

  const permanentlyDeleteSelectedTrash = () => {
    if (selectedTrashRecords.length === 0) return
    if (!window.confirm(`هل تريد الحذف النهائي لـ ${selectedTrashRecords.length} جملة؟`)) return

    removeTrashRecords(selectedTrashRecords.map((record) => record.sentence.id))
  }

  const selectAllVisibleSentences = () => {
    setSelectedSentenceIds(activeRouteSentences.map((sentence) => sentence.id))
  }

  const clearSelectedSentences = () => setSelectedSentenceIds([])

  const toggleSelectedSentence = (id: number) => {
    setSelectedSentenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectedTrash = (id: number) => {
    setSelectedTrashIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const isCategoryOpen = (category: string) => openCategories[category] ?? currentFilter !== 'all'

  const toggleCategoryOpen = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? currentFilter !== 'all'),
    }))
  }

  const getVisibleCategories = (items: SentenceType[]) => {
    const allowedCategories = currentFilter === 'all' ? categoriesAll : categoriesAll.filter((category) => category === currentFilter)

    return allowedCategories
      .map((category) => ({
        category,
        items: items.filter((sentence) => sentence.category === category),
      }))
      .filter((section) => section.items.length > 0)
  }

  const renderSentenceCard = (sentence: SentenceType) => (
    <SentenceCard
      key={sentence.id}
      sentence={sentence}
      isLearned={learnedSentences.includes(sentence.id)}
      note={notes[sentence.id] || ''}
      categories={categoriesAll}
      onToggleLearned={() => toggleLearned(sentence.id)}
      onEdit={() => startEdit(sentence.id)}
      onDelete={() => deleteSentence(sentence.id)}
      onSaveEdit={saveEdit}
      onCancelEdit={cancelEdit}
      isNoteOpen={noteOpenId === sentence.id}
      onOpenNote={() => openNote(sentence.id)}
      onCancelNote={cancelNote}
      onSaveNote={(t) => saveNote(sentence.id, t)}
      onSpeak={(speed) => speakSentence(sentence.english, speed)}
      isEditing={editingId === sentence.id}
      isSelected={selectedSentenceIds.includes(sentence.id)}
      onToggleSelect={() => toggleSelectedSentence(sentence.id)}
    />
  )

  const renderGroupedSentenceSections = (items: SentenceType[], emptyMessage: string) => {
    const sections = getVisibleCategories(items)

    if (sections.length === 0) {
      return <div className="empty-state">{emptyMessage}</div>
    }

    return (
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <CategoryAccordion
            key={section.category}
            title={section.category}
            count={section.items.length}
            isOpen={isCategoryOpen(section.category)}
            onToggle={() => toggleCategoryOpen(section.category)}
          >
            <div className="grid gap-3">{section.items.map(renderSentenceCard)}</div>
          </CategoryAccordion>
        ))}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-shell-bg" />
      <div className="app-shell-content space-y-6">
        <Header />
        <StatsBar totalCount={totalCount} learnedCount={learnedCount} trashCount={deletedRecords.length} />
        <SearchBox value={searchTerm} onChange={setSearchTerm} />
        <FilterBar 
          categories={categoriesAll} 
          currentFilter={currentFilter} 
          onFilterChange={setCurrentFilter} 
        />

        <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800 m-0">النسخ الاحتياطي</h2>
          <p className="text-sm text-gray-600 mt-1 mb-0">
            تصدير بياناتك أو استيراد نسخة محفوظة من كل الجمل والملاحظات والسلة.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button className="btn btn-blue w-full justify-center sm:w-auto" onClick={exportData}>
            <DownloadIcon className="h-4 w-4" />
            تصدير JSON
          </button>
          <button className="btn btn-green w-full justify-center sm:w-auto" onClick={handleImportClick}>
            <UploadIcon className="h-4 w-4" />
            استيراد JSON
          </button>
        </div>
        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
        </div>

        {selectedSentenceIds.length > 0 && location.pathname !== '/trash' && (
          <div className="surface flex flex-col gap-3 p-4 md:p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-gray-700">
              المحدد حاليًا: <span className="font-semibold">{selectedSentenceIds.length}</span>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={selectAllVisibleSentences}>
                تحديد الكل
              </button>
              <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={clearSelectedSentences}>
                إلغاء التحديد
              </button>
              <button className="btn btn-red w-full justify-center sm:w-auto" onClick={deleteSelectedSentences}>
                حذف المحدد
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="app-input rounded-lg border-gray-300 focus:border-blue-400"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              placeholder="اكتب اسم التصنيف الجديد أو الموجود"
            />
            <button
              className="btn btn-blue w-full justify-center sm:w-auto"
              onClick={() => {
                if (!bulkCategory.trim()) return
                updateManySentenceCategories(selectedSentenceIds, bulkCategory.trim())
                setBulkCategory('')
              }}
              disabled={!bulkCategory.trim()}
            >
              تطبيق التصنيف على المحدد
            </button>
          </div>
          </div>
        )}

        {recentDeletedRecords.length > 0 && (
          <div className="surface overflow-hidden border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-card">
          <div className="flex flex-col gap-3 border-b border-orange-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                محذوفات حديثة
              </div>
              <h3 className="mt-2 mb-1 text-xl font-bold text-gray-900">استرجاع سريع للعناصر المحذوفة</h3>
              <p className="m-0 text-sm text-gray-600">
                عندك {recentDeletedRecords.length} عنصرًا حديثًا. حدّد أي عناصر تريد استرجاعها مباشرة.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={selectAllRecentDeleted}>
                <SelectAllIcon className="h-4 w-4" />
                تحديد الكل
              </button>
              <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={clearSelectedRecentDeleted}>
                إلغاء التحديد
              </button>
              <button
                className="btn btn-green w-full justify-center sm:w-auto"
                onClick={restoreSelectedRecentDeleted}
                disabled={selectedRecentDeletedIds.length === 0}
              >
                <RestoreIcon className="h-4 w-4" />
                استرجاع المحدد
              </button>
              <button className="btn btn-orange w-full justify-center sm:w-auto" onClick={restoreLastDeleted}>
                <RestoreIcon className="h-4 w-4" />
                استرجاع آخر حذف
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-3">
              {recentDeletedRecords.slice(-8).reverse().map((record) => (
                <div
                  key={record.sentence.id}
                  className={`rounded-2xl border p-3 transition-all ${
                    selectedRecentDeletedIds.includes(record.sentence.id)
                      ? 'border-orange-400 bg-orange-100/70 shadow-card'
                      : 'border-orange-200 bg-white/90 hover:border-orange-300'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRecentDeletedIds.includes(record.sentence.id)}
                        onChange={() => toggleSelectedRecentDeleted(record.sentence.id)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>#{record.sentence.id}</span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{record.sentence.category}</span>
                          <span>{new Date(record.deletedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 text-base font-semibold text-gray-900 text-left" dir="ltr">
                          {record.sentence.english}
                        </div>
                        <div className="mt-1 text-sm text-gray-700 text-right" dir="rtl">
                          {record.sentence.arabic}
                        </div>
                      </div>
                    </label>

                    <div className="flex gap-2 flex-wrap">
                      <button className="btn btn-green" onClick={() => restoreTrashRecords([record])}>
                        <RestoreIcon className="h-4 w-4" />
                        استرجاع
                      </button>
                      <button className="btn btn-gray" onClick={() => pruneRecentDeletedRecords([record.sentence.id])}>
                        إخفاء
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        <Routes>
        <Route
          path="/"
          element={
            <>
              <AddSentenceForm categories={categoriesAll} onAddCategory={addCategory} onAdd={addSentence} />
              {renderGroupedSentenceSections(homeSentences, 'لا توجد جمل مطابقة لهذا التصنيف أو البحث.')}
            </>
          }
        />

        <Route
          path="/learned"
          element={
            renderGroupedSentenceSections(learnedOnlySentences, 'لا توجد محفوظات مطابقة لهذا التصنيف أو البحث.')
          }
        />

        <Route
          path="/notes"
          element={
            renderGroupedSentenceSections(notesOnlySentences, 'لا توجد ملاحظات مطابقة لهذا التصنيف أو البحث.')
          }
        />

        <Route
          path="/trash"
          element={
            <div className="flex flex-col gap-4">
                <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 m-0">سلة المحذوفات</h2>
                  <p className="text-sm text-gray-600 mt-1 mb-0">
                    العناصر هنا تُحذف نهائيًا تلقائيًا بعد 30 يوم.
                  </p>
                </div>
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <select
                    className="app-input rounded-lg border-gray-300 focus:border-blue-400 w-full sm:min-w-40"
                    value={trashCategoryFilter}
                    onChange={(e) => setTrashCategoryFilter(e.target.value)}
                  >
                    {trashCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'كل التصنيفات' : category}
                      </option>
                    ))}
                  </select>
                  <select
                    className="app-input rounded-lg border-gray-300 focus:border-blue-400 w-full sm:min-w-40"
                    value={trashPeriodFilter}
                    onChange={(e) => setTrashPeriodFilter(e.target.value as TrashPeriodFilter)}
                  >
                    <option value="all">كل الفترات</option>
                    <option value="7d">آخر 7 أيام</option>
                    <option value="30d">آخر 30 يوم</option>
                    <option value="90d">آخر 90 يوم</option>
                  </select>
                  <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={() => setSelectedTrashIds(filteredTrashRecords.map((record) => record.sentence.id))}>
                    <SelectAllIcon className="h-4 w-4" />
                    تحديد الكل
                  </button>
                  <button className="btn btn-gray w-full justify-center sm:w-auto" onClick={() => setSelectedTrashIds([])}>
                    إلغاء التحديد
                  </button>
                  <button className="btn btn-green w-full justify-center sm:w-auto" onClick={restoreSelectedTrash} disabled={selectedTrashIds.length === 0}>
                    <RestoreIcon className="h-4 w-4" />
                    استرجاع المحدد
                  </button>
                  <button className="btn btn-red w-full justify-center sm:w-auto" onClick={permanentlyDeleteSelectedTrash} disabled={selectedTrashIds.length === 0}>
                    <TrashIcon className="h-4 w-4" />
                    حذف نهائي للمحدد
                  </button>
                </div>
              </div>

              {filteredTrashRecords.length === 0 ? (
                <div className="empty-state">لا توجد عناصر في سلة المحذوفات.</div>
              ) : (
                <div className="flex flex-col gap-3.75">
                  {filteredTrashRecords.map((record) => (
                    <div key={record.sentence.id} className="surface p-4 md:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTrashIds.includes(record.sentence.id)}
                            onChange={() => toggleSelectedTrash(record.sentence.id)}
                            className="mt-1 h-4 w-4"
                          />
                          <div>
                            <div className="text-sm text-gray-500">#{record.sentence.id} · {record.sentence.category}</div>
                            <div className="text-lg text-gray-800 font-semibold text-left" dir="ltr">{record.sentence.english}</div>
                            <div className="text-base text-gray-700 text-right mt-1" dir="rtl">{record.sentence.arabic}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              بتاريخ: {new Date(record.deletedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </label>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="btn btn-green"
                            onClick={() => restoreTrashRecords([record])}
                          >
                            <RestoreIcon className="h-4 w-4" />
                            استرجاع
                          </button>
                          <button
                            className="btn btn-red"
                            onClick={() => {
                              if (!window.confirm('هل تريد الحذف النهائي لهذه الجملة؟')) return
                              removeTrashRecords([record.sentence.id])
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                            حذف نهائي
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
        </Routes>
      </div>
    </div>
  )
}

export default App
