'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FolderOpen, Upload, CheckCircle, XCircle, AlertCircle,
  Film, FileText, ChevronDown, ChevronRight,
  Loader2, ArrowLeft, RefreshCw, Clock,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course { id: string; title: string }

interface FileEntry {
  file: File
  relativePath: string
  sectionName: string
  fileName: string
  lessonTitle: string
  ext: string
  type: 'video' | 'doc' | 'other'
}

type UploadStatus = 'pending' | 'preparing' | 'uploading' | 'done' | 'error'

interface UploadItem extends FileEntry {
  status: UploadStatus
  progress: number   // 0–100
  error?: string
  lessonId?: string
  videoId?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VIDEO_EXT = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
const DOC_EXT   = ['.pdf', '.docx', '.doc', '.xlsx', '.zip', '.pptx']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cleanPrefix(s: string) {
  return s.replace(/^\d+[-_.\s]+/, '').trim() || s
}

function getFileType(name: string): 'video' | 'doc' | 'other' {
  const ext = '.' + name.split('.').pop()!.toLowerCase()
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (DOC_EXT.includes(ext))   return 'doc'
  return 'other'
}

function fmtSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

function fmtSpeed(bytesPerSec: number) {
  if (bytesPerSec >= 1024 * 1024) return (bytesPerSec / 1024 / 1024).toFixed(1) + ' MB/s'
  return (bytesPerSec / 1024).toFixed(0) + ' KB/s'
}

function parseEntries(files: FileList): FileEntry[] {
  return Array.from(files)
    .map(file => {
      const path = (file as any).webkitRelativePath || file.name
      const parts = path.split('/')
      let sectionName: string, fileName: string
      if (parts.length >= 3) {
        sectionName = parts[parts.length - 2]
        fileName    = parts[parts.length - 1]
      } else if (parts.length === 2) {
        sectionName = parts[0]
        fileName    = parts[1]
      } else {
        sectionName = 'Chưa phân loại'
        fileName    = parts[0]
      }
      const ext = '.' + fileName.split('.').pop()!.toLowerCase()
      const type = getFileType(fileName)
      const lessonTitle = cleanPrefix(fileName.replace(/\.[^.]+$/, ''))
      return {
        file, relativePath: path,
        sectionName: cleanPrefix(sectionName),
        fileName, lessonTitle, ext, type,
      }
    })
    .filter(e => e.type === 'video' || e.type === 'doc')
}

// Upload 1 file qua proxy server với progress thật
function uploadFile(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return
      onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload  = () => xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`))
    xhr.onerror = () => reject(new Error('Network error'))

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(file)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const [courses, setCourses]     = useState<Course[]>([])
  const [courseId, setCourseId]   = useState('')
  const [entries, setEntries]     = useState<FileEntry[]>([])
  const [items, setItems]         = useState<UploadItem[]>([])
  const [openSecs, setOpenSecs]   = useState<string[]>([])
  const [phase, setPhase]         = useState<'idle' | 'preview' | 'uploading' | 'done'>('idle')
  const [globalError, setGlobalError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        const list: Course[] = (data.courses ?? data ?? []).map((c: any) => ({ id: c.id, title: c.title }))
        setCourses(list)
        if (list.length === 1) setCourseId(list[0].id)
      })
  }, [])

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const parsed = parseEntries(e.target.files)
    setEntries(parsed)
    setPhase('preview')
    setGlobalError('')
    setOpenSecs([...new Set(parsed.map(p => p.sectionName))])
  }

  // Group theo section để hiển thị
  const sections = entries.reduce<Record<string, FileEntry[]>>((acc, e) => {
    ;(acc[e.sectionName] ??= []).push(e)
    return acc
  }, {})

  const totalVideos = entries.filter(e => e.type === 'video').length
  const totalDocs   = entries.filter(e => e.type === 'doc').length
  const totalSize   = entries.reduce((s, e) => s + e.file.size, 0)

  // Bước 1: Gọi /prepare → nhận uploadUrl + accessKey từng video
  // Bước 2: Upload song song (max 3 concurrent)
  async function handleUpload() {
    if (!courseId) { setGlobalError('Chọn khóa học trước'); return }
    if (!entries.length) return

    setPhase('uploading')
    setGlobalError('')

    // Init items state
    const initItems: UploadItem[] = entries.map(e => ({
      ...e, status: 'pending', progress: 0,
    }))
    setItems(initItems)

    // Gọi prepare API
    const prepRes = await fetch('/api/admin/bulk-upload/prepare', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        courseId,
        files: entries
          .filter(e => e.type === 'video')
          .map(e => ({ path: e.relativePath, name: e.fileName, size: e.file.size })),
      }),
    })

    const prepText = await prepRes.text()
    let prepData: any
    try { prepData = JSON.parse(prepText) } catch { setGlobalError(prepText.slice(0, 200)); return }
    if (!prepRes.ok) { setGlobalError(prepData.error ?? 'Prepare thất bại'); return }

    // Map path → upload info
    const uploadMap = new Map<string, { uploadUrl: string; accessKey: string; lessonId: string; videoId: string }>()
    for (const r of prepData.results ?? []) {
      if (!r.error) uploadMap.set(r.path, r)
    }

    // Update items với preparing → pending
    setItems(prev => prev.map(it => {
      if (it.type !== 'video') return { ...it, status: 'done' }
      const info = uploadMap.get(it.relativePath)
      if (!info) return { ...it, status: 'error', error: 'Prepare failed' }
      return { ...it, lessonId: info.lessonId, videoId: info.videoId, status: 'pending' }
    }))

    // Upload song song tối đa 3 file
    const videoEntries = entries.filter(e => e.type === 'video')
    const CONCURRENCY = 3
    let idx = 0

    async function runNext(): Promise<void> {
      if (idx >= videoEntries.length) return
      const current = videoEntries[idx++]
      const info = uploadMap.get(current.relativePath)

      if (!info) {
        setItems(prev => prev.map(it =>
          it.relativePath === current.relativePath
            ? { ...it, status: 'error', error: 'Không có upload info' }
            : it
        ))
        return runNext()
      }

      setItems(prev => prev.map(it =>
        it.relativePath === current.relativePath ? { ...it, status: 'uploading' } : it
      ))

      try {
        await uploadFile(
          current.file,
          info.uploadUrl,
          (pct) => {
            setItems(prev => prev.map(it =>
              it.relativePath === current.relativePath ? { ...it, progress: pct } : it
            ))
          }
        )
        setItems(prev => prev.map(it =>
          it.relativePath === current.relativePath ? { ...it, status: 'done', progress: 100 } : it
        ))
      } catch (err: any) {
        setItems(prev => prev.map(it =>
          it.relativePath === current.relativePath
            ? { ...it, status: 'error', error: err.message }
            : it
        ))
      }

      return runNext()
    }

    // Chạy CONCURRENCY luồng song song
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, videoEntries.length) }, runNext))
    setPhase('done')
  }

  function reset() {
    setEntries([])
    setItems([])
    setPhase('idle')
    setGlobalError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // Stats khi đang/xong upload
  const doneCount  = items.filter(it => it.status === 'done').length
  const errorCount = items.filter(it => it.status === 'error').length
  const uploadingItem = items.find(it => it.status === 'uploading')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/courses" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-lg font-bold">Bulk Upload</h1>
        </div>

        {/* Step 1 – Chọn khóa học */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-300">1. Chọn khóa học</p>
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            disabled={phase === 'uploading'}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Step 2 – Chọn folder */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-300">2. Chọn folder khóa học</p>
          <div
            onClick={() => phase !== 'uploading' && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${phase === 'uploading' ? 'border-gray-800 opacity-50 cursor-not-allowed' : 'border-gray-700 cursor-pointer hover:border-teal-500 hover:bg-teal-500/5'}`}
          >
            <FolderOpen size={36} className="mx-auto text-gray-600 mb-3" />
            {phase === 'idle'
              ? <p className="text-gray-400 text-sm">Bấm để chọn folder</p>
              : <p className="text-gray-400 text-sm">{entries.length} file đã chọn — {fmtSize(totalSize)}</p>
            }
            <p className="text-gray-600 text-xs mt-1">Cấu trúc: <span className="text-gray-500">TenKhoa / 01-Chuong / 01-Bai.mp4</span></p>
          </div>
          <input
            ref={inputRef}
            type="file"
            // @ts-ignore
            webkitdirectory=""
            multiple
            className="hidden"
            onChange={handleFolderSelect}
          />
        </div>

        {/* Step 3 – Preview */}
        {(phase === 'preview') && entries.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-gray-200">3. Xem trước</span>
                <span className="text-gray-500">{Object.keys(sections).length} section</span>
                <span className="text-blue-400 flex items-center gap-1"><Film size={13}/> {totalVideos} video</span>
                {totalDocs > 0 && <span className="text-amber-400 flex items-center gap-1"><FileText size={13}/> {totalDocs} file</span>}
                <span className="text-gray-600">{fmtSize(totalSize)}</span>
              </div>
              <button onClick={reset} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                <RefreshCw size={12}/> Chọn lại
              </button>
            </div>

            {/* Section list */}
            <div className="divide-y divide-gray-800">
              {Object.entries(sections).map(([sec, files]) => {
                const isOpen = openSecs.includes(sec)
                return (
                  <div key={sec}>
                    <button
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-800/40 transition-colors"
                      onClick={() => setOpenSecs(p => p.includes(sec) ? p.filter(x => x !== sec) : [...p, sec])}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
                        {isOpen ? <ChevronDown size={14} className="text-gray-500"/> : <ChevronRight size={14} className="text-gray-500"/>}
                        {sec}
                      </span>
                      <span className="text-xs text-gray-500">{files.filter(f => f.type === 'video').length} video</span>
                    </button>
                    {isOpen && (
                      <ul className="divide-y divide-gray-800/50">
                        {files.map((f, i) => (
                          <li key={i} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                            {f.type === 'video'
                              ? <Film size={13} className="text-blue-400 flex-shrink-0"/>
                              : <FileText size={13} className="text-amber-400 flex-shrink-0"/>}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-200 truncate">{f.lessonTitle}</p>
                              <p className="text-xs text-gray-600 truncate">{f.fileName}</p>
                            </div>
                            <span className="text-xs text-gray-600 flex-shrink-0">{fmtSize(f.file.size)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="px-5 py-4 border-t border-gray-800">
              {globalError && (
                <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
                  <AlertCircle size={13}/> {globalError}
                </p>
              )}
              <button
                onClick={handleUpload}
                disabled={!courseId}
                className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload size={16}/> Bắt đầu Upload ({totalVideos} video)
              </button>
            </div>
          </div>
        )}

        {/* Step 4 – Uploading / Done */}
        {(phase === 'uploading' || phase === 'done') && items.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Summary */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-sm">
                {phase === 'uploading'
                  ? <><Loader2 size={14} className="animate-spin text-teal-400"/><span className="text-gray-300">Đang upload...</span></>
                  : <><CheckCircle size={14} className="text-emerald-400"/><span className="text-gray-300 font-semibold">Hoàn tất</span></>
                }
                <span className="text-emerald-400">{doneCount} xong</span>
                {errorCount > 0 && <span className="text-red-400">{errorCount} lỗi</span>}
                <span className="text-gray-600">{doneCount}/{items.filter(it => it.type === 'video').length}</span>
              </div>
              {phase === 'done' && (
                <div className="flex gap-3">
                  <button onClick={reset} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                    <RefreshCw size={12}/> Upload thêm
                  </button>
                  <Link href="/admin/lessons" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                    Xem bài học →
                  </Link>
                </div>
              )}
            </div>

            {/* File list với progress */}
            <ul className="divide-y divide-gray-800/50 max-h-[60vh] overflow-y-auto">
              {items.map((it, i) => (
                <li key={i} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {/* Icon status */}
                    {it.status === 'done'     && <CheckCircle size={14} className="text-emerald-400 flex-shrink-0"/>}
                    {it.status === 'error'    && <XCircle size={14} className="text-red-400 flex-shrink-0"/>}
                    {it.status === 'uploading'&& <Loader2 size={14} className="animate-spin text-teal-400 flex-shrink-0"/>}
                    {it.status === 'pending'  && <Clock size={14} className="text-gray-600 flex-shrink-0"/>}
                    {it.type !== 'video'      && <CheckCircle size={14} className="text-gray-600 flex-shrink-0"/>}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm text-gray-200 truncate">{it.lessonTitle}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{fmtSize(it.file.size)}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1.5">{it.sectionName}</p>

                      {/* Progress bar */}
                      {it.type === 'video' && it.status !== 'pending' && (
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-200 ${
                              it.status === 'error' ? 'bg-red-500' :
                              it.status === 'done'  ? 'bg-emerald-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${it.progress}%` }}
                          />
                        </div>
                      )}
                      {it.status === 'uploading' && (
                        <p className="text-xs text-teal-400 mt-1">{it.progress}%</p>
                      )}
                      {it.status === 'error' && (
                        <p className="text-xs text-red-400 mt-1">{it.error}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {globalError && phase !== 'preview' && (
          <p className="text-red-400 text-sm flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={14}/> {globalError}
          </p>
        )}

      </div>
    </div>
  )
}
