"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockCourses } from "@/lib/mock-data";
import {
  PlayCircle, CheckCircle2, ChevronDown, ChevronLeft,
  Menu, X, BookOpen, MessageSquare, FileText, Star,
  Lock,
  ThumbsUp, Share2, RotateCcw, Download, AlertCircle,
  ChevronRight, GraduationCap, Clock, Check,
} from "lucide-react";
import BunnyPlayer from "@/components/BunnyPlayer";

/* ─── Mock data ───────────────────────────────────────────────────────────────── */
const mockSections = [
  {
    id: "s1",
    title: "Giới thiệu & Cài đặt môi trường",
    lessons: [
      { id: "l1", slug: "gioi-thieu-khoa-hoc", title: "Giới thiệu khóa học", duration: "05:12", isFree: true, completed: true, type: "video" },
      { id: "l2", slug: "cai-dat-moi-truong", title: "Cài đặt Node.js & VS Code", duration: "08:45", isFree: true, completed: true, type: "video" },
      { id: "l3", slug: "tong-quan-du-an", title: "Tổng quan dự án thực tế", duration: "06:30", isFree: false, completed: false, type: "video" },
    ],
  },
  {
    id: "s2",
    title: "Nền tảng cơ bản",
    lessons: [
      { id: "l4", slug: "khai-niem-cot-loi", title: "Khái niệm cốt lõi", duration: "12:20", isFree: false, completed: false, type: "video" },
      { id: "l5", slug: "thuc-hanh-dau-tien", title: "Thực hành đầu tiên", duration: "18:00", isFree: false, completed: false, type: "video" },
      { id: "l6", slug: "bai-tap-quiz", title: "Bài tập & Quiz", duration: "10:15", isFree: false, completed: false, type: "quiz" },
    ],
  },
  {
    id: "s3",
    title: "Xây dựng dự án thực tế",
    lessons: [
      { id: "l7", slug: "phan-tich-yeu-cau", title: "Phân tích yêu cầu dự án", duration: "15:00", isFree: false, completed: false, type: "video" },
      { id: "l8", slug: "xay-dung-tung-buoc", title: "Xây dựng từng bước", duration: "25:30", isFree: false, completed: false, type: "video" },
      { id: "l9", slug: "deploy-hoan-thien", title: "Deploy & hoàn thiện", duration: "20:00", isFree: false, completed: false, type: "video" },
    ],
  },
  {
    id: "s4",
    title: "Nâng cao & Best Practices",
    lessons: [
      { id: "l10", slug: "performance-optimization", title: "Performance Optimization", duration: "14:40", isFree: false, completed: false, type: "video" },
      { id: "l11", slug: "security-tips", title: "Security Tips thực tế", duration: "12:00", isFree: false, completed: false, type: "video" },
      { id: "l12", slug: "chung-chi-hoan-thanh", title: "Nhận chứng chỉ hoàn thành", duration: "11:30", isFree: false, completed: false, type: "video" },
    ],
  },
];

const allLessons = mockSections.flatMap((s) => s.lessons);

const mockQA = [
  { id: "q1", user: "Minh Tuấn", avatar: "MT", time: "2 giờ trước", question: "Tại sao cần dùng useEffect ở đây mà không dùng useMemo?", answer: "Đây là câu hỏi hay! useEffect dùng cho side effects (gọi API, DOM manipulation...) còn useMemo dùng để tối ưu tính toán. Trong trường hợp này chúng ta cần fetch data nên dùng useEffect.", answerBy: "Giảng viên" },
  { id: "q2", user: "Thu Hà", avatar: "TH", time: "1 ngày trước", question: "Mình bị lỗi 'Cannot read properties of undefined' khi chạy đoạn code trong bài này, cần làm gì?", answer: null, answerBy: null },
];

const mockNotes = [
  { id: "n1", time: "02:15", text: "Cần ghi nhớ cú pháp async/await ở đây" },
  { id: "n2", time: "07:30", text: "Ví dụ quan trọng về dependency array trong useEffect" },
];

type SideTab = "curriculum" | "notes" | "qa";

/* ─── Lesson Sidebar ──────────────────────────────────────────────────────────── */
function LessonSidebar({
  courseSlug,
  currentLessonId,
  completedLessons,
  onComplete,
  progress,
}: {
  courseSlug: string;
  currentLessonId: string;
  completedLessons: string[];
  onComplete: (id: string) => void;
  progress: number;
}) {
  const [openSections, setOpenSections] = useState<string[]>(
    mockSections.filter((s) => s.lessons.some((l) => l.id === currentLessonId)).map((s) => s.id)
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
          { id: "notes", icon: FileText, label: "Ghi chú" },
          { id: "qa", icon: MessageSquare, label: "Hỏi đáp" },
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
            {mockSections.map((section) => {
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
                        const isActive = lesson.id === currentLessonId;
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/learn/${courseSlug}/${lesson.slug}`}
                              className={`flex items-start gap-2.5 px-4 py-3 hover:bg-teal-50/50 transition-colors ${isActive ? "bg-teal-50 border-r-2 border-teal-500" : ""}`}
                            >
                              {/* Status icon */}
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
                              {/* Text */}
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
                                  <span className="text-[11px] text-gray-400">{lesson.duration}</span>
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
                className="w-full rounded-lg bg-teal-600 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors">
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

/* ─── Main Page ───────────────────────────────────────────────────────────────── */
export default function LearnPage({ params: paramsPromise }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const course = mockCourses.find((c) => c.slug === params.courseSlug) ?? mockCourses[0];
  const currentLesson = allLessons.find((l) => l.slug === params.lessonSlug) ?? allLessons[0];
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const [completedLessons, setCompletedLessons] = useState<string[]>(
    allLessons.filter((l) => l.completed).map((l) => l.id)
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShareLesson = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  const handleDownload = () => {
    alert("Tài liệu đang được cập nhật");
  };

  const totalCompleted = completedLessons.length;
  const progress = Math.round((totalCompleted / allLessons.length) * 100);
  const isCurrentCompleted = completedLessons.includes(currentLesson.id);

  const markComplete = () => {
    if (!isCurrentCompleted) {
      setCompletedLessons((p) => [...p, currentLesson.id]);
    }
  };

  // Find section for current lesson
  const currentSection = mockSections.find((s) => s.lessons.some((l) => l.id === currentLesson.id));

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* ── Top Nav ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0 z-20">
        {/* Back */}
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>

        <div className="h-4 w-px bg-gray-700 flex-shrink-0" />

        {/* Course title */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{course.title}</p>
          <p className="text-gray-400 text-xs truncate hidden sm:block">{currentLesson.title}</p>
        </div>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div className="h-1.5 w-24 rounded-full bg-gray-700 overflow-hidden">
            <div className="h-1.5 rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400">{progress}% hoàn thành</span>
        </div>

        {/* Mark complete button */}
        <button
          onClick={markComplete}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex-shrink-0 ${
            isCurrentCompleted
              ? "bg-teal-600/20 text-teal-400 border border-teal-600/40"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          <Check className={`h-3.5 w-3.5 ${isCurrentCompleted ? "" : ""}`} />
          <span className="hidden sm:inline">{isCurrentCompleted ? "Đã hoàn thành" : "Đánh dấu xong"}</span>
        </button>

        {/* Toggle sidebar */}
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
        <div className={`flex flex-col flex-1 min-w-0 overflow-y-auto bg-gray-950 transition-all duration-200`}>
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
            {/* Section breadcrumb */}
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
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{currentLesson.duration}</span>
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

            {/* Lesson description */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 mb-6">
              <h3 className="text-white text-sm font-semibold mb-2">Mô tả bài học</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Trong bài này bạn sẽ học về <strong className="text-gray-200">{currentLesson.title}</strong>. Chúng ta sẽ đi qua các khái niệm cốt lõi, thực hành với code thực tế và cuối bài có bài tập để củng cố kiến thức.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Hands-on", "Thực chiến", "Code mẫu"].map((tag) => (
                  <span key={tag} className="text-[11px] bg-gray-800 text-gray-400 rounded px-2 py-0.5 border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 mb-6">
              <h3 className="text-white text-sm font-semibold mb-3">Tài nguyên bài học</h3>
              <div className="space-y-2">
                {[
                  { name: "Source code bài học.zip", size: "2.4 MB" },
                  { name: "Slide bài giảng.pdf", size: "1.1 MB" },
                ].map((r) => (
                  <button
                    key={r.name}
                    onClick={handleDownload}
                    className="flex items-center gap-3 w-full rounded-lg border border-gray-700 px-3 py-2.5 hover:border-teal-600/50 hover:bg-teal-900/10 transition-colors group"
                  >
                    <Download className="h-4 w-4 text-gray-500 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1 text-left">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.size}</span>
                  </button>
                ))}
              </div>
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
