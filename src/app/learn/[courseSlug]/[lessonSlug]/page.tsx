"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlayCircle, CheckCircle2, ChevronDown, ChevronLeft,
  Menu, X, BookOpen, MessageSquare, FileText,
  Lock, ThumbsUp, Share2, Download,
  ChevronRight, GraduationCap, Clock, Check,
} from "lucide-react";
import BunnyPlayer from "@/components/BunnyPlayer";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type LessonData = {
  id: string;
  slug: string;
  title: string;
  duration: number;
  isFree: boolean;
  type: string;
  bunnyVideoId?: string | null;
  content?: string | null;
};
type SectionData = { id: string; title: string; lessons: LessonData[] };
type CourseData  = { id: string; title: string; slug: string; sections: SectionData[] };

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function fmtDuration(mins: number) {
  if (!mins) return "";
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}`;
  return `${m} phút`;
}

type QAItem = { id: string; user: string; avatar: string; time: string; question: string; answer: string | null; answerBy: string | null };
const mockQA: QAItem[] = [
  { id: "q1", user: "Minh Tuấn", avatar: "MT", time: "2 giờ trước", question: "Tại sao cần dùng useEffect ở đây mà không dùng useMemo?", answer: "useEffect cho side effects, useMemo cho tính toán.", answerBy: "Giảng viên" },
];
const mockNotes = [
  { id: "n1", time: "02:15", text: "Ghi chú của bạn hiển thị ở đây" },
];

type SideTab = "curriculum" | "notes" | "qa";

/* ─── Lesson Sidebar ─────────────────────────────────────────────────────────── */
function LessonSidebar({
  courseSlug, sections, currentLessonId, completedLessons, onComplete, progress,
}: {
  courseSlug: string;
  sections: SectionData[];
  currentLessonId: string;
  completedLessons: string[];
  onComplete: (id: string) => void;
  progress: number;
}) {
  const [openSections, setOpenSections] = useState<string[]>(
    sections.filter((s) => s.lessons.some((l) => l.id === currentLessonId)).map((s) => s.id)
  );
  const [sideTab, setSideTab] = useState<SideTab>("curriculum");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(mockNotes);
  const [newQuestion, setNewQuestion] = useState("");
  const [qaList, setQaList] = useState(mockQA);

  const toggleSection = (id: string) =>
    setOpenSections((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  return (
    <aside className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-900">
        <p className="text-xs text-gray-400 mb-1">Tiến độ khóa học</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
            <div className="h-1.5 rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-300 font-medium flex-shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-900">
        {([
          { id: "curriculum", icon: BookOpen, label: "Nội dung" },
          { id: "notes",      icon: FileText,    label: "Ghi chú" },
          { id: "qa",         icon: MessageSquare, label: "Hỏi đáp" },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSideTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              sideTab === id ? "border-teal-400 text-teal-400" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {sideTab === "curriculum" && (
          <div className="divide-y divide-gray-100">
            {sections.map((section) => {
              const sectionCompleted = section.lessons.filter((l) => completedLessons.includes(l.id)).length;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform flex-shrink-0 ${openSections.includes(section.id) ? "rotate-180" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{section.title}</p>
                      <p className="text-[11px] text-gray-400">{sectionCompleted}/{section.lessons.length} hoàn thành</p>
                    </div>
                  </button>

                  {openSections.includes(section.id) && (
                    <ul>
                      {section.lessons.map((lesson) => {
                        const isActive    = lesson.id === currentLessonId;
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/learn/${courseSlug}/${lesson.slug}`}
                              className={`flex items-start gap-2.5 px-4 py-3 hover:bg-teal-50/50 transition-colors ${isActive ? "bg-teal-50 border-r-2 border-teal-500" : ""}`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                                ) : lesson.type === "quiz" ? (
                                  <div className={`h-4 w-4 rounded-sm border-2 flex items-center justify-center ${isActive ? "border-teal-500" : "border-gray-300"}`}>
                                    <FileText className="h-2.5 w-2.5 text-gray-400" />
                                  </div>
                                ) : (
                                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isActive ? "border-teal-500 bg-teal-50" : "border-gray-300"}`}>
                                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug ${isActive ? "font-semibold text-teal-700" : "text-gray-700"} truncate`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {lesson.type === "quiz" ? (
                                    <FileText className="h-2.5 w-2.5 text-gray-400" />
                                  ) : (
                                    <PlayCircle className="h-2.5 w-2.5 text-gray-400" />
                                  )}
                                  {lesson.duration > 0 && (
                                    <span className="text-[11px] text-gray-400">{fmtDuration(lesson.duration)}</span>
                                  )}
                                  {!lesson.isFree && (
                                    <Lock className="h-2.5 w-2.5 text-gray-400 ml-0.5" />
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {sideTab === "notes" && (
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ghi chú tại vị trí hiện tại..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-teal-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newNote.trim()) {
                    setNotes((p) => [{ id: Date.now().toString(), time: "00:00", text: newNote.trim() }, ...p]);
                    setNewNote("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newNote.trim()) {
                    setNotes((p) => [{ id: Date.now().toString(), time: "00:00", text: newNote.trim() }, ...p]);
                    setNewNote("");
                  }
                }}
                className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Lưu
              </button>
            </div>
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Chưa có ghi chú nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <span className="text-[11px] font-mono text-teal-600 font-semibold">{note.time}</span>
                    <p className="text-xs text-gray-700 mt-1">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sideTab === "qa" && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Đặt câu hỏi về bài học này..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-teal-400 resize-none"
              />
              <button
                onClick={() => {
                  if (newQuestion.trim()) {
                    setQaList((p) => [
                      { id: Date.now().toString(), user: "Bạn", avatar: "BN", time: "Vừa xong", question: newQuestion.trim(), answer: null, answerBy: null },
                      ...p,
                    ]);
                    setNewQuestion("");
                  }
                }}
                className="w-full rounded-lg bg-teal-600 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Gửi câu hỏi
              </button>
            </div>
            <div className="space-y-4">
              {qaList.map((qa) => (
                <div key={qa.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-[10px] font-bold flex-shrink-0">
                      {qa.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">{qa.user}</span>
                        <span className="text-[10px] text-gray-400">{qa.time}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-0.5">{qa.question}</p>
                    </div>
                  </div>
                  {qa.answer ? (
                    <div className="ml-8 rounded-lg bg-teal-50 border border-teal-100 p-2.5">
                      <span className="text-[10px] font-bold text-teal-700 uppercase">{qa.answerBy}</span>
                      <p className="text-xs text-gray-700 mt-1">{qa.answer}</p>
                    </div>
                  ) : (
                    <div className="ml-8">
                      <span className="text-[11px] text-gray-400 italic">Chưa có câu trả lời</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function LearnPage({ params: paramsPromise }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();

  const [course, setCourse]   = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.courseSlug}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setCourse(d.course); })
      .finally(() => setLoading(false));
  }, [params.courseSlug]);

  const sections   = course?.sections ?? [];
  const allLessons = sections.flatMap((s) => s.lessons);
  const currentLesson = allLessons.find((l) => l.slug === params.lessonSlug) ?? allLessons[0];
  const currentIndex  = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : -1;
  const prevLesson    = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson    = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [liked, setLiked]                       = useState(false);
  const [shareToast, setShareToast]             = useState(false);

  const handleShareLesson = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  const markComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson.id)) {
      setCompletedLessons((p) => [...p, currentLesson.id]);
    }
  };

  const totalCompleted    = completedLessons.length;
  const progress          = allLessons.length > 0 ? Math.round((totalCompleted / allLessons.length) * 100) : 0;
  const isCurrentCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;
  const currentSection     = sections.find((s) => s.lessons.some((l) => l.id === currentLesson?.id));

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm mt-3">Đang tải bài học...</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (!course || !currentLesson) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 items-center justify-center gap-4">
        <p className="text-gray-300 text-lg">Không tìm thấy bài học</p>
        <Link href="/courses" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          Xem khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* ── Top Nav ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0 z-20">
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>

        <div className="h-4 w-px bg-gray-700 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{course.title}</p>
          <p className="text-gray-400 text-xs truncate hidden sm:block">{currentLesson.title}</p>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div className="h-1.5 w-24 rounded-full bg-gray-700 overflow-hidden">
            <div className="h-1.5 rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400">{progress}% hoàn thành</span>
        </div>

        <button
          onClick={markComplete}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex-shrink-0 ${
            isCurrentCompleted
              ? "bg-teal-600/20 text-teal-400 border border-teal-600/40"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isCurrentCompleted ? "Đã hoàn thành" : "Đánh dấu xong"}</span>
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          title="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Player area ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-gray-950 transition-all duration-200">
          {/* Video player */}
          <div className="flex-shrink-0">
            <BunnyPlayer
              lessonSlug={currentLesson.slug}
              lessonTitle={currentLesson.title}
              isFree={currentLesson.isFree}
            />
          </div>

          {/* ── Lesson content below player ── */}
          <div className="px-6 py-6 max-w-3xl mx-auto w-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <span>{currentSection?.title}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-300">{currentLesson.title}</span>
            </div>

            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-xl font-bold leading-tight">{currentLesson.title}</h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  {currentLesson.duration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{fmtDuration(currentLesson.duration)}
                    </span>
                  )}
                  {currentLesson.type === "quiz" && <span className="text-orange-400">Quiz</span>}
                  {isCurrentCompleted && (
                    <span className="flex items-center gap-1 text-teal-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${liked ? "text-teal-400 bg-teal-900/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-teal-400" : ""}`} />
                  Thích
                </button>
                <button onClick={handleShareLesson} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Lesson description / content */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 mb-6">
              <h3 className="text-white text-sm font-semibold mb-2">Mô tả bài học</h3>
              {currentLesson.content ? (
                <div className="text-gray-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed">
                  Trong bài này bạn sẽ học về <strong className="text-gray-200">{currentLesson.title}</strong>.
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-800">
              {prevLesson ? (
                <Link
                  href={`/learn/${course.slug}/${prevLesson.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:border-teal-600 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{prevLesson.title}</span>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/learn/${course.slug}/${nextLesson.slug}`}
                  onClick={markComplete}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors ml-auto"
                >
                  <span className="truncate max-w-[140px]">{nextLesson.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              ) : (
                <Link
                  href="/profile?tab=certs"
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white ml-auto hover:bg-orange-600 transition-colors"
                >
                  <GraduationCap className="h-4 w-4" />
                  Nhận chứng chỉ
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0 h-full overflow-hidden">
            <LessonSidebar
              courseSlug={course.slug}
              sections={sections}
              currentLessonId={currentLesson.id}
              completedLessons={completedLessons}
              onComplete={markComplete}
              progress={progress}
            />
          </div>
        )}
      </div>

      {shareToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          Đã sao chép đường dẫn!
        </div>
      )}
    </div>
  );
}
