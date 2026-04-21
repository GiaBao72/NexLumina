"use client";
import { useState, useEffect, useRef } from "react";
import * as tus from "tus-js-client";
import {
  BookOpen, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  Upload, X, Check, Video, Eye, EyeOff, Save, Loader2, AlertCircle, Film
} from "lucide-react";

interface Lesson {
  id: string; title: string; slug: string; description: string | null;
  bunnyVideoId: string | null; duration: number; order: number; isFree: boolean; sectionId: string;
}
interface Section { id: string; title: string; order: number; courseId: string; lessons: Lesson[] }
interface Course { id: string; title: string; slug: string }

function fmtDuration(secs: number) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Lesson Editor Panel ──────────────────────────────────────────────────────
function LessonPanel({
  lesson, onClose, onSaved, onDeleted,
}: {
  lesson: Lesson;
  onClose: () => void;
  onSaved: (l: Lesson) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description ?? "",
    isFree: lesson.isFree,
  });
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [videoId, setVideoId] = useState(lesson.bunnyVideoId ?? "");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true); setSaveErr(""); setSaveOk(false);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateLesson", lessonId: lesson.id, ...form }),
      });
      const data = await res.json();
      if (res.ok) { setSaveOk(true); onSaved({ ...lesson, ...form }); setTimeout(() => setSaveOk(false), 2000); }
      else setSaveErr(data.error ?? "Lưu thất bại");
    } catch { setSaveErr("Lỗi kết nối"); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setUploadErr(""); setUploadDone(false); setUploadPct(0);
    try {
      // 1. Tạo video object + lấy TUS signature
      const res = await fetch("/api/admin/bunny/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, title: form.title }),
      });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data.error ?? "Không tạo được video"); setUploading(false); return; }
      const { videoId: vid, signature, expiration, libraryId, tusEndpoint } = data;
      setVideoId(vid);

      // 2. TUS upload
      const upload = new tus.Upload(file, {
        endpoint: tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expiration),
          VideoId: vid,
          LibraryId: String(libraryId),
        },
        metadata: { filetype: file.type, title: file.name },
        onProgress: (uploaded: number, total: number) => setUploadPct(Math.round(uploaded / total * 100)),
        onError: (err: Error) => { setUploadErr(String(err)); setUploading(false); },
        onSuccess: () => { setUploadPct(100); setUploadDone(true); setUploading(false); },
      });
      upload.start();
    } catch (e) { setUploadErr(String(e)); setUploading(false); }
  };

  const handleDeleteVideo = async () => {
    if (!videoId || !confirm("Xóa video này khỏi Bunny?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/bunny/${videoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      setVideoId("");
    } catch { }
    finally { setDeleting(false); }
  };

  const handleDeleteLesson = async () => {
    if (!confirm(`Xóa bài "${lesson.title}"? Không thể hoàn tác.`)) return;
    try {
      if (videoId) await fetch(`/api/admin/bunny/${videoId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      await fetch("/api/admin/lessons", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteLesson", lessonId: lesson.id }),
      });
      onDeleted(lesson.id);
    } catch { }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gray-900">Chỉnh sửa bài học</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div className="flex gap-2">
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={() => setForm(f => ({ ...f, slug: slugify(f.title) }))}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">Auto</button>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          {/* isFree + Duration */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setForm(f => ({ ...f, isFree: !f.isFree }))}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.isFree ? "bg-teal-600" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFree ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Miễn phí xem thử</span>
            </label>
            <span className="text-sm text-gray-500">Thời lượng: <strong>{fmtDuration(lesson.duration)}</strong></span>
          </div>

          {/* ── Video section ── */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Film className="h-4 w-4 text-teal-600" /> Video Bunny.net
            </p>

            {videoId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="h-4 w-4" />Đã có video</span>
                  <span className="font-mono text-xs text-gray-400 truncate">{videoId}</span>
                </div>
                {uploadDone && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                    ✅ Upload xong! Bunny đang xử lý encode (~2-5 phút). Thời lượng sẽ tự cập nhật khi xong.
                  </div>
                )}
                <button onClick={handleDeleteVideo} disabled={deleting}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Đang xóa..." : "Xóa video"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-3">
                <AlertCircle className="h-4 w-4" /> Chưa có video
              </p>
            )}

            {/* Upload area */}
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="video/mp4,video/mov,video/quicktime,video/*"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-3.5 w-3.5" /> Chọn file video
                </button>
                {file && <span className="text-xs text-gray-500 truncate max-w-[160px]">{file.name}</span>}
              </div>

              {file && !uploading && !uploadDone && (
                <button onClick={handleUpload}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                  <Upload className="h-4 w-4" />
                  {videoId ? "Upload video mới (thay thế)" : "Upload lên Bunny"}
                </button>
              )}

              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Đang upload...</span><span>{uploadPct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              )}

              {uploadErr && <p className="text-xs text-red-500">{uploadErr}</p>}
            </div>
          </div>

          {saveErr && <p className="text-sm text-red-500">{saveErr}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Đang lưu...</> :
              saveOk ? <><Check className="h-4 w-4" />Đã lưu!</> :
                <><Save className="h-4 w-4" />Lưu thay đổi</>}
          </button>
          <button onClick={handleDeleteLesson}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);

  // Add section/lesson states
  const [addingSectionTitle, setAddingSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [addingLessonSectionId, setAddingLessonSectionId] = useState<string | null>(null);
  const [addingLessonTitle, setAddingLessonTitle] = useState("");

  // Fetch courses
  useEffect(() => {
    fetch("/api/admin/courses")
      .then(r => r.ok ? r.json() : { courses: [] })
      .then(d => setCourses(d.courses ?? []));
  }, []);

  // Fetch sections when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/admin/lessons?courseId=${selectedCourse}`)
      .then(r => r.ok ? r.json() : { sections: [] })
      .then(d => {
        setSections(d.sections ?? []);
        const exp: Record<string, boolean> = {};
        (d.sections ?? []).forEach((s: Section) => { exp[s.id] = true; });
        setExpanded(exp);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const reload = () => {
    if (!selectedCourse) return;
    fetch(`/api/admin/lessons?courseId=${selectedCourse}`)
      .then(r => r.ok ? r.json() : { sections: [] })
      .then(d => setSections(d.sections ?? []));
  };

  const handleAddSection = async () => {
    if (!addingSectionTitle.trim() || !selectedCourse) return;
    const res = await fetch("/api/admin/lessons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createSection", courseId: selectedCourse, title: addingSectionTitle }),
    });
    if (res.ok) { setAddingSectionTitle(""); setAddingSection(false); reload(); }
  };

  const handleAddLesson = async (sectionId: string) => {
    if (!addingLessonTitle.trim()) return;
    const res = await fetch("/api/admin/lessons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createLesson", sectionId, title: addingLessonTitle }),
    });
    if (res.ok) { setAddingLessonTitle(""); setAddingLessonSectionId(null); reload(); }
  };

  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    if (!confirm(`Xóa chương "${sectionTitle}" và tất cả bài học bên trong?`)) return;
    await fetch("/api/admin/lessons", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteSection", sectionId }),
    });
    reload();
  };

  const handleLessonSaved = (updated: Lesson) => {
    setSections(prev => prev.map(sec => ({
      ...sec,
      lessons: sec.lessons.map(l => l.id === updated.id ? updated : l),
    })));
  };

  const handleLessonDeleted = (lessonId: string) => {
    setSections(prev => prev.map(sec => ({ ...sec, lessons: sec.lessons.filter(l => l.id !== lessonId) })));
    setEditLesson(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" /> Quản lý bài học
        </h1>
        <p className="text-sm text-gray-500 mt-1">Thêm chương, bài học và upload video lên Bunny.net</p>
      </div>

      {/* Course selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn khóa học</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">— Chọn khóa học —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {!selectedCourse && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Chọn một khóa học ở trên để quản lý bài học</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 text-teal-500 animate-spin" />
        </div>
      )}

      {/* Sections list */}
      {!loading && selectedCourse && (
        <div className="space-y-4">
          {sections.map((section, si) => (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <button onClick={() => setExpanded(e => ({ ...e, [section.id]: !e[section.id] }))}
                  className="text-gray-400 hover:text-gray-600">
                  {expanded[section.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <span className="text-xs text-teal-600 font-bold uppercase tracking-wider">Chương {si + 1}</span>
                <span className="font-semibold text-gray-900 text-sm flex-1">{section.title}</span>
                <span className="text-xs text-gray-400">{section.lessons.length} bài</span>
                <button onClick={() => setAddingLessonSectionId(section.id)}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 rounded-lg hover:bg-teal-50">
                  <Plus className="h-3.5 w-3.5" /> Thêm bài
                </button>
                <button onClick={() => handleDeleteSection(section.id, section.title)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Lessons */}
              {expanded[section.id] && (
                <div className="divide-y divide-gray-50">
                  {section.lessons.map((lesson, li) => (
                    <div key={lesson.id}
                      onClick={() => setEditLesson(lesson)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                      <span className="text-xs text-gray-400 w-5 text-right">{li + 1}</span>
                      <Video className={`h-4 w-4 flex-shrink-0 ${lesson.bunnyVideoId ? "text-teal-500" : "text-gray-300"}`} />
                      <span className="flex-1 text-sm text-gray-800 group-hover:text-teal-700">{lesson.title}</span>
                      {lesson.isFree && (
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">Free</span>
                      )}
                      {lesson.bunnyVideoId ? (
                        <span className="text-xs text-gray-400 tabular-nums">{fmtDuration(lesson.duration)}</span>
                      ) : (
                        <span className="text-xs text-orange-400">Chưa có video</span>
                      )}
                      <Pencil className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                    </div>
                  ))}

                  {/* Add lesson inline */}
                  {addingLessonSectionId === section.id ? (
                    <div className="flex items-center gap-2 px-5 py-3 bg-teal-50">
                      <Plus className="h-4 w-4 text-teal-500 flex-shrink-0" />
                      <input autoFocus value={addingLessonTitle} onChange={e => setAddingLessonTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleAddLesson(section.id); if (e.key === "Escape") { setAddingLessonSectionId(null); setAddingLessonTitle(""); } }}
                        placeholder="Tên bài học mới..."
                        className="flex-1 text-sm bg-transparent focus:outline-none placeholder-teal-400" />
                      <button onClick={() => handleAddLesson(section.id)}
                        className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700">Thêm</button>
                      <button onClick={() => { setAddingLessonSectionId(null); setAddingLessonTitle(""); }}
                        className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    section.lessons.length === 0 && (
                      <div className="px-5 py-4 text-center text-sm text-gray-400">
                        Chưa có bài học. <button onClick={() => setAddingLessonSectionId(section.id)} className="text-teal-600 hover:underline">Thêm bài đầu tiên</button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add section */}
          {addingSection ? (
            <div className="bg-white rounded-2xl border-2 border-teal-300 p-4 flex items-center gap-3">
              <input autoFocus value={addingSectionTitle} onChange={e => setAddingSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") { setAddingSection(false); setAddingSectionTitle(""); } }}
                placeholder="Tên chương mới..."
                className="flex-1 text-sm focus:outline-none" />
              <button onClick={handleAddSection}
                className="text-sm bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700">Thêm</button>
              <button onClick={() => { setAddingSection(false); setAddingSectionTitle(""); }}
                className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
          ) : (
            <button onClick={() => setAddingSection(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
              <Plus className="h-4 w-4" /> Thêm chương mới
            </button>
          )}
        </div>
      )}

      {/* Lesson editor panel */}
      {editLesson && (
        <LessonPanel
          lesson={editLesson}
          onClose={() => setEditLesson(null)}
          onSaved={handleLessonSaved}
          onDeleted={handleLessonDeleted}
        />
      )}
    </div>
  );
}
