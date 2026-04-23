"use client";
import { useState, useEffect, useRef } from "react";
import * as tus from "tus-js-client";
import {
  BookOpen, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  Upload, X, Check, Video, Save, Loader2, AlertCircle, Film,
  ArrowUp, Image as ImageIcon, CheckSquare, Square,
} from "lucide-react";

interface Lesson {
  id: string; title: string; slug: string; description: string | null;
  bunnyVideoId: string | null; thumbnail: string | null;
  duration: number; order: number; isFree: boolean; sectionId: string;
}
interface Section { id: string; title: string; order: number; courseId: string; lessons: Lesson[] }
interface Course { id: string; title: string; slug: string }

function fmtDuration(mins: number) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
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
    content: (lesson as any).content ?? "",
    isFree: lesson.isFree,
    thumbnail: lesson.thumbnail ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attName, setAttName] = useState("");
  const [attUrl, setAttUrl] = useState("");
  const [attType, setAttType] = useState<"link" | "file">("link");
  const [attAdding, setAttAdding] = useState(false);
  const [attUploading, setAttUploading] = useState(false);
  const [attUploadErr, setAttUploadErr] = useState("");
  const [attFolderUploading, setAttFolderUploading] = useState(false);
  const [attFolderProgress, setAttFolderProgress] = useState("");
  const attFileRef = useRef<HTMLInputElement>(null);
  const attFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/lessons/attachments?lessonId=${lesson.id}`)
      .then(r => r.json())
      .then(d => { if (d.attachments) setAttachments(d.attachments); })
      .catch(() => {});
  }, [lesson.id]);

  // Video upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [videoId, setVideoId] = useState(lesson.bunnyVideoId ?? "");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Thumbnail upload states
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState(lesson.thumbnail ?? "");
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbErr, setThumbErr] = useState("");
  const thumbRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true); setSaveErr(""); setSaveOk(false);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateLesson", lessonId: lesson.id,
          title: form.title, slug: form.slug,
          description: form.description, content: form.content, isFree: form.isFree,
          thumbnail: form.thumbnail || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveOk(true);
        onSaved({ ...lesson, ...form, thumbnail: form.thumbnail || null });
        setTimeout(() => setSaveOk(false), 2000);
      } else setSaveErr(data.error ?? "Lưu thất bại");
    } catch { setSaveErr("Lỗi kết nối"); }
    finally { setSaving(false); }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const handleThumbUpload = async () => {
    if (!thumbFile) return;
    setThumbUploading(true); setThumbErr("");
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setForm(f => ({ ...f, thumbnail: dataUrl }));
        setThumbUploading(false);
      };
      reader.onerror = () => { setThumbErr("Không đọc được file"); setThumbUploading(false); };
      reader.readAsDataURL(thumbFile);
    } catch { setThumbErr("Lỗi xử lý file"); setThumbUploading(false); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setUploadErr(""); setUploadDone(false); setUploadPct(0);
    try {
      const res = await fetch("/api/admin/bunny/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, title: form.title }),
      });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data.error ?? "Không tạo được video"); setUploading(false); return; }
      const { videoId: vid, signature, expiration, libraryId, tusEndpoint } = data;
      setVideoId(vid);

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
      <div className="flex-1 bg-black/40" onClick={onClose} />
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

          {/* Content (Markdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung bài học <span className="text-xs text-gray-400 font-normal">(hỗ trợ Markdown)</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={10}
              placeholder={"# Tiêu đề\n\nNội dung bài học...\n\n```js\nconsole.log('Hello')\n```"}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📎 Tài liệu đính kèm
            </p>

            {attachments.length > 0 && (
              <ul className="space-y-2 mb-3">
                {attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                    <span className="text-base">{a.type === "link" ? "🔗" : "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{a.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{a.url}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/admin/lessons/attachments", {
                          method: "DELETE", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: a.id }),
                        });
                        setAttachments(prev => prev.filter(x => x.id !== a.id));
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <select value={attType} onChange={e => setAttType(e.target.value as "link" | "file")}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="link">🔗 Link</option>
                  <option value="file">📄 File URL</option>
                </select>
                <input value={attName} onChange={e => setAttName(e.target.value)}
                  placeholder="Tên tài liệu"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-2">
                <input value={attUrl} onChange={e => setAttUrl(e.target.value)}
                  placeholder="URL (https://...)"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <button
                  disabled={attAdding || !attName.trim() || !attUrl.trim()}
                  onClick={async () => {
                    setAttAdding(true);
                    try {
                      const res = await fetch("/api/admin/lessons/attachments", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lessonId: lesson.id, name: attName, url: attUrl, type: attType }),
                      });
                      const d = await res.json();
                      if (res.ok) { setAttachments(prev => [...prev, d.attachment]); setAttName(""); setAttUrl(""); }
                    } catch { }
                    finally { setAttAdding(false); }
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {attAdding ? "..." : "+ Thêm"}
                </button>
              </div>

              {/* Upload file lên Bunny Storage */}
              <div className="pt-1 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 mb-1.5">Hoặc upload file lên Bunny Storage:</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <input ref={attFileRef} type="file" className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setAttUploading(true); setAttUploadErr("");
                      try {
                        const fd = new FormData();
                        fd.append("file", f);
                        fd.append("folder", `lessons/${lesson.id}`);
                        const res = await fetch("/api/admin/lessons/attachments/upload", { method: "POST", body: fd });
                        const text = await res.text();
                        let d: any = {};
                        try { d = JSON.parse(text); } catch { setAttUploadErr("Server lỗi: " + text.slice(0, 100)); return; }
                        if (!res.ok) { setAttUploadErr(d.error ?? "Upload thất bại"); return; }
                        setAttUrl(d.url);
                        setAttName(prev => prev || d.name);
                        setAttType("file");
                      } catch (e) { setAttUploadErr("Lỗi: " + String(e)); }
                      finally { setAttUploading(false); if (attFileRef.current) attFileRef.current.value = ""; }
                    }}
                  />
                  <button disabled={attUploading || attFolderUploading} onClick={() => attFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    {attUploading ? (<svg className="animate-spin h-3 w-3 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>) : "☁️"}
                    {attUploading ? "Đang upload..." : "Chọn file & upload"}
                  </button>

                  <input ref={attFolderRef} type="file"
                    // @ts-ignore
                    webkitdirectory=""
                    multiple className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setAttFolderUploading(true); setAttUploadErr(""); setAttFolderProgress("");
                      let done = 0;
                      const newAtts: any[] = [];
                      for (const f of files) {
                        setAttFolderProgress(`${done}/${files.length} files`);
                        try {
                          const fd = new FormData();
                          fd.append("file", f);
                          fd.append("folder", `lessons/${lesson.id}`);
                          const res = await fetch("/api/admin/lessons/attachments/upload", { method: "POST", body: fd });
                          const text = await res.text();
                          let d: any = {};
                          try { d = JSON.parse(text); } catch { continue; }
                          if (!res.ok) continue;
                          const attRes = await fetch("/api/admin/lessons/attachments", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ lessonId: lesson.id, name: d.name, url: d.url, type: "file", size: f.size }),
                          });
                          const attData = await attRes.json();
                          if (attRes.ok && attData.attachment) newAtts.push(attData.attachment);
                        } catch { }
                        done++;
                      }
                      setAttachments(prev => [...prev, ...newAtts]);
                      setAttFolderProgress(`✓ ${newAtts.length}/${files.length} files`);
                      setAttFolderUploading(false);
                      if (attFolderRef.current) attFolderRef.current.value = "";
                    }}
                  />
                  <button disabled={attUploading || attFolderUploading} onClick={() => attFolderRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 text-xs text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition-colors">
                    {attFolderUploading ? (<svg className="animate-spin h-3 w-3 text-teal-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>) : "📂"}
                    {attFolderUploading ? attFolderProgress || "Đang upload..." : "Chọn folder"}
                  </button>
                  <span className="text-[10px] text-gray-400">tối đa 50MB/file</span>
                </div>
                {attFolderProgress && !attFolderUploading && (
                  <p className="text-[10px] text-teal-600 mt-1">{attFolderProgress}</p>
                )}
                {attUploadErr && <p className="text-[10px] text-red-500 mt-1">{attUploadErr}</p>}
              </div>
            </div>
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

          {/* Thumbnail */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-teal-600" /> Thumbnail
            </p>
            {thumbPreview && (
              <img src={thumbPreview} alt="thumb" className="w-full aspect-video object-cover rounded-xl mb-3" />
            )}
            <div className="flex gap-2 items-center">
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
              <button onClick={() => thumbRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">Chọn ảnh</button>
              {thumbFile && !thumbUploading && (
                <button onClick={handleThumbUpload}
                  className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700">Upload</button>
              )}
              {thumbUploading && <span className="text-xs text-gray-400">Đang xử lý...</span>}
            </div>
            {thumbErr && <p className="text-xs text-red-500 mt-1">{thumbErr}</p>}
          </div>

          {/* Video section */}
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
  const [search, setSearch] = useState("");

  // ── Bulk select ────────────────────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkIsFree, setBulkIsFree] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allLessonIds = sections.flatMap(s => s.lessons.map(l => l.id));
  const allSelected = allLessonIds.length > 0 && allLessonIds.every(id => selectedIds.has(id));

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(allLessonIds));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpdateLessons", lessonIds: Array.from(selectedIds), isFree: bulkIsFree }),
      });
      setSections(prev => prev.map(sec => ({
        ...sec,
        lessons: sec.lessons.map(l => selectedIds.has(l.id) ? { ...l, isFree: bulkIsFree } : l),
      })));
      setBulkModal(false);
      exitSelectMode();
    } catch { }
    finally { setBulkSaving(false); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} bài học đã chọn? Không thể hoàn tác.`)) return;
    setBulkDeleting(true);
    try {
      await fetch("/api/admin/lessons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkDeleteLessons", lessonIds: Array.from(selectedIds) }),
      });
      setSections(prev => prev.map(sec => ({ ...sec, lessons: sec.lessons.filter(l => !selectedIds.has(l.id)) })));
      exitSelectMode();
    } catch { }
    finally { setBulkDeleting(false); }
  };

  const [addingSectionTitle, setAddingSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [addingLessonSectionId, setAddingLessonSectionId] = useState<string | null>(null);
  const [addingLessonTitle, setAddingLessonTitle] = useState("");

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetch("/api/admin/courses")
      .then(r => r.ok ? r.json() : { courses: [] })
      .then(d => setCourses(d.courses ?? []));
  }, []);

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
      <div className="mb-6 flex items-center gap-3">
        {selectedCourse && (
          <button onClick={() => setSelectedCourse("")}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
          </button>
        )}
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-600" />
            {selectedCourse
              ? (courses.find(c => c.id === selectedCourse)?.title ?? "Quản lý bài học")
              : "Bài học & Video"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedCourse
              ? "Thêm chương, bài học, upload video và ảnh thumbnail"
              : "Chọn khóa học để quản lý bài học"}
          </p>
        </div>
      </div>

      {/* COURSE LIST VIEW */}
      {!selectedCourse && (
        <div>
          <div className="relative mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm khóa học..."
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
          </div>
          <div className="grid gap-3">
            {filteredCourses.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">Không tìm thấy khóa học nào</p>
            )}
            {filteredCourses.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.id)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 hover:border-teal-300 hover:shadow-md px-5 py-4 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.slug}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LESSONS VIEW */}
      {selectedCourse && (
        <div>
          {/* Bulk toolbar */}
          {selectMode ? (
            <div className="mb-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
              <button onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-sm text-teal-700 font-medium hover:text-teal-900">
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
              <span className="text-sm text-teal-600 font-semibold flex-1">
                {selectedIds.size > 0 ? `Đã chọn ${selectedIds.size} bài` : "Chưa chọn bài nào"}
              </span>
              {selectedIds.size > 0 && (<>
                <button
                  onClick={() => { setBulkIsFree(false); setBulkModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Sửa hàng loạt
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors">
                  {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {bulkDeleting ? "Đang xóa..." : "Xóa hàng loạt"}
                </button>
              </>)}
              <button onClick={exitSelectMode} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            sections.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <CheckSquare className="h-3.5 w-3.5" /> Chọn nhiều
                </button>
              </div>
            )
          )}
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-7 w-7 text-teal-500 animate-spin" />
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {sections.map((section, si) => (
                <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

                  {expanded[section.id] && (
                    <div className="divide-y divide-gray-50">
                      {section.lessons.map((lesson, li) => (
                        <div key={lesson.id}
                          onClick={() => selectMode ? setSelectedIds(prev => { const n = new Set(prev); n.has(lesson.id) ? n.delete(lesson.id) : n.add(lesson.id); return n; }) : setEditLesson(lesson)}
                          className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors group ${selectMode && selectedIds.has(lesson.id) ? "bg-teal-50" : ""}`}>
                          {selectMode ? (
                            <div onClick={e => toggleSelect(lesson.id, e)} className="flex-shrink-0">
                              {selectedIds.has(lesson.id)
                                ? <CheckSquare className="h-4 w-4 text-teal-600" />
                                : <Square className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 w-5 text-right">{li + 1}</span>
                          )}
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
        </div>
      )}

      {editLesson && (
        <LessonPanel
          lesson={editLesson}
          onClose={() => setEditLesson(null)}
          onSaved={handleLessonSaved}
          onDeleted={handleLessonDeleted}
        />
      )}

      {/* Bulk Edit Modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBulkModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="font-heading font-bold text-gray-900 text-lg mb-1">Sửa hàng loạt</h2>
            <p className="text-sm text-gray-500 mb-5">Áp dụng cho <strong>{selectedIds.size}</strong> bài học đã chọn</p>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quyền xem bài học</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBulkIsFree(true)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${bulkIsFree ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className="text-2xl">🆓</span>
                    <span className="text-sm font-semibold text-gray-800">Miễn phí</span>
                    <span className="text-xs text-gray-500 text-center">Ai cũng xem được</span>
                    {bulkIsFree && <Check className="h-4 w-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => setBulkIsFree(false)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${!bulkIsFree ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className="text-2xl">🔒</span>
                    <span className="text-sm font-semibold text-gray-800">Trả phí</span>
                    <span className="text-xs text-gray-500 text-center">Phải mua khóa học</span>
                    {!bulkIsFree && <Check className="h-4 w-4 text-orange-500" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setBulkModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Huỷ
              </button>
              <button onClick={handleBulkUpdate} disabled={bulkSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
                {bulkSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Đang lưu...</> : <><Save className="h-4 w-4" />Áp dụng</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
