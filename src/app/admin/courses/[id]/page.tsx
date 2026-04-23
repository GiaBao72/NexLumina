'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Users, BarChart2, Edit, Star,
  Globe, Tag, DollarSign, Layers, Clock, Award,
  TrendingUp, Eye, CheckCircle, AlertCircle, Archive,
  Play, Lock, Sparkles, RefreshCw,
} from 'lucide-react'

interface Lesson {
  id: string; title: string; duration: number; order: number; isFree: boolean
}
interface Section {
  id: string; title: string; order: number; lessons: Lesson[]
}
interface Enrollment {
  id: string; createdAt: string; user: { name: string; email: string; image: string | null }
}
interface Course {
  id: string; title: string; slug: string; description: string; thumbnail: string | null
  price: number; salePrice: number | null; level: string; status: string
  featured: boolean; language: string; totalDuration: number; totalLessons: number
  fakeRating: number; fakeReviews: number; fakeStudents: number
  category: { name: string } | null
  _count: { enrollments: number; reviews: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; dot: string }> = {
  PUBLISHED: { label: 'Đang bán',  color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: <CheckCircle size={12}/>, dot: 'bg-emerald-400' },
  DRAFT:     { label: 'Nháp',      color: 'bg-amber-500/10  text-amber-400  border border-amber-500/20',  icon: <AlertCircle size={12}/>, dot: 'bg-amber-400' },
  ARCHIVED:  { label: 'Lưu trữ',  color: 'bg-gray-500/10   text-gray-400   border border-gray-500/20',   icon: <Archive size={12}/>,     dot: 'bg-gray-400' },
}
const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', ALL_LEVELS: 'All Levels'
}
const LANG_LABEL: Record<string, string> = { vi: '🇻🇳 Tiếng Việt', en: '🇺🇸 English' }

function fmt(n: number) { return n.toLocaleString('vi-VN') + '₫' }
function fmtDur(min: number) {
  const h = Math.floor(min / 60), m = min % 60
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`
  if (h > 0) return `${h} giờ`
  return `${m} phút`
}
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700'} />
      ))}
    </div>
  )
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'curriculum' | 'students' | 'analytics'>('overview')
  const [openSecs, setOpenSecs] = useState<string[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ updated: number; totalDuration: number } | null>(null)

  async function handleSyncDuration() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/admin/courses/${id}/sync-duration`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi server')
      setSyncResult(data)
      // Reload để cập nhật totalDuration hiển thị
      const refreshed = await fetch(`/api/admin/courses/${id}`).then(r => r.json())
      if (refreshed.course) setCourse(refreshed.course)
      if (refreshed.sections) setSections(refreshed.sections)
    } catch (e: any) {
      alert('Sync thất bại: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetch(`/api/admin/courses/${id}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course)
        setSections(data.sections ?? [])
        setEnrollments(data.recentEnrollments ?? [])
        setTotalRevenue(data.totalRevenue ?? 0)
        setLoading(false)
        // Mở section đầu tiên mặc định
        if (data.sections?.length) setOpenSecs([data.sections[0].id])
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
        <span className="text-sm text-gray-500">Đang tải...</span>
      </div>
    </div>
  )
  if (!course) return (
    <div className="flex items-center justify-center h-72">
      <div className="text-center">
        <AlertCircle size={40} className="text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">Không tìm thấy khóa học.</p>
      </div>
    </div>
  )

  const st = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.DRAFT
  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const freeLessons  = sections.flatMap(s => s.lessons).filter(l => l.isFree).length
  const discount     = course.salePrice && course.price > 0
    ? Math.round((1 - course.salePrice / course.price) * 100) : 0

  const STATS = [
    {
      label: 'Học viên thực tế', value: course._count.enrollments.toLocaleString(),
      sub: `+${enrollments.length} gần đây`, icon: <Users size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    {
      label: 'Tổng bài học', value: totalLessons,
      sub: `${freeLessons} miễn phí`, icon: <BookOpen size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
    },
    {
      label: 'Doanh thu', value: fmt(totalRevenue),
      sub: `~${fmt(course._count.enrollments > 0 ? Math.round(totalRevenue / course._count.enrollments) : 0)}/học viên`,
      icon: <BarChart2 size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10',
    },
    {
      label: 'Đánh giá hiển thị', value: course.fakeRating.toFixed(1),
      sub: `${course.fakeReviews.toLocaleString()} reviews`, icon: <Star size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10',
    },
  ]

  const TABS = [
    { id: 'overview',   label: 'Overview',  icon: <Eye size={14}/> },
    { id: 'curriculum', label: 'Curriculum', icon: <Layers size={14}/> },
    { id: 'students',   label: 'Students',   icon: <Users size={14}/> },
    { id: 'analytics',  label: 'Analytics',  icon: <TrendingUp size={14}/> },
  ] as const

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Breadcrumb & actions ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Link href="/admin/courses" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Khóa học
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-200 truncate max-w-xs">{course.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-700 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
            >
              <Eye size={14} /> Xem trang
            </Link>
            <button
              onClick={() => router.push(`/admin/courses?edit=${course.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
            >
              <Edit size={14} /> Chỉnh sửa
            </button>
          </div>
        </div>

        {/* ── Hero: thumbnail + info ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Thumbnail */}
            <div className="md:w-64 lg:w-80 flex-shrink-0">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnail} alt={course.title}
                  className="w-full h-48 md:h-full object-cover" />
              ) : (
                <div className="w-full h-48 md:h-full bg-gray-800 flex items-center justify-center">
                  <BookOpen size={48} className="text-gray-700" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  {course.featured && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Sparkles size={10} /> Featured
                    </span>
                  )}
                  {course.category && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
                      <Tag size={10} /> {course.category.name}
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-bold text-white leading-snug mb-1">{course.title}</h1>
                <p className="text-sm text-gray-400 line-clamp-2">{course.description || 'Chưa có mô tả.'}</p>

                {/* Rating row */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-amber-400 font-semibold text-sm">{course.fakeRating.toFixed(1)}</span>
                  <StarDisplay value={course.fakeRating} />
                  <span className="text-xs text-gray-500">({course.fakeReviews.toLocaleString()} reviews)</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{course.fakeStudents.toLocaleString()} học viên</span>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><Globe size={12}/>{LANG_LABEL[course.language] ?? course.language}</span>
                <span className="flex items-center gap-1.5"><Award size={12}/>{LEVEL_LABEL[course.level] ?? course.level}</span>
                {course.totalDuration > 0 && (
                  <span className="flex items-center gap-1.5"><Clock size={12}/>{fmtDur(course.totalDuration)}</span>
                )}
                <span className="flex items-center gap-1.5"><BookOpen size={12}/>{totalLessons} bài học</span>
              </div>

              {/* Price row */}
              <div className="flex items-center gap-3">
                {course.salePrice != null ? (
                  <>
                    <span className="text-2xl font-bold text-white">{fmt(course.salePrice)}</span>
                    <span className="text-sm text-gray-500 line-through">{fmt(course.price)}</span>
                    {discount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                        -{discount}%
                      </span>
                    )}
                  </>
                ) : course.price === 0 ? (
                  <span className="text-2xl font-bold text-emerald-400">Miễn phí</span>
                ) : (
                  <span className="text-2xl font-bold text-white">{fmt(course.price)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                <span className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-800">
          <nav className="flex gap-1 -mb-px">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  tab === t.id
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Description */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Mô tả khóa học</h3>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {course.description || <span className="italic text-gray-600">Chưa có mô tả.</span>}
                </p>
              </div>

              {/* Slug */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">URL & SEO</h3>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                  <Globe size={13} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-400 font-mono truncate">/courses/<span className="text-teal-400">{course.slug}</span></span>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Thông tin chi tiết</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Danh mục',  value: course.category?.name ?? '—',        icon: <Tag size={13} className="text-gray-500"/> },
                    { label: 'Trình độ',  value: LEVEL_LABEL[course.level] ?? course.level, icon: <Award size={13} className="text-gray-500"/> },
                    { label: 'Ngôn ngữ', value: LANG_LABEL[course.language] ?? course.language, icon: <Globe size={13} className="text-gray-500"/> },
                    { label: 'Giá gốc',  value: fmt(course.price),                    icon: <DollarSign size={13} className="text-gray-500"/> },
                    { label: 'Giá sale', value: course.salePrice ? fmt(course.salePrice) : '—', icon: <DollarSign size={13} className="text-gray-500"/> },
                    { label: 'Nổi bật',  value: course.featured ? '✓ Có' : '—',      icon: <Sparkles size={13} className="text-gray-500"/> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-gray-500">{icon}{label}</span>
                      <span className="text-gray-200 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social proof */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-1.5"><Star size={13} className="text-amber-400"/>Social Proof</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex items-center gap-1.5">
                      <StarDisplay value={course.fakeRating} />
                      <span className="text-amber-400 font-semibold">{course.fakeRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Reviews</span>
                    <span className="text-gray-200 font-medium">{course.fakeReviews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Học viên hiển thị</span>
                    <span className="text-gray-200 font-medium">{course.fakeStudents.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Curriculum tab ── */}
        {tab === 'curriculum' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2 flex-wrap gap-2">
              <span>{sections.length} chương · {totalLessons} bài học · {freeLessons} miễn phí</span>
              <div className="flex items-center gap-2">
                {syncResult && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    ✓ Đã sync {syncResult.updated} video
                  </span>
                )}
                <button
                  onClick={handleSyncDuration}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Đang sync...' : 'Sync duration'}
                </button>
                <Link href="/admin/lessons" className="text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  <Edit size={13}/> Quản lý bài học
                </Link>
              </div>
            </div>
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers size={40} className="text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">Chưa có chương nào</p>
                <p className="text-sm text-gray-600 mt-1">Vào Quản lý bài học để thêm nội dung</p>
              </div>
            )}
            {[...sections].sort((a,b) => a.order - b.order).map(sec => {
              const isOpen = openSecs.includes(sec.id)
              const secDur = sec.lessons.reduce((s, l) => s + l.duration, 0)
              return (
                <div key={sec.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <button
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    onClick={() => setOpenSecs(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-600 w-6">S{sec.order}</span>
                      <span className="font-medium text-gray-200 text-sm text-left">{sec.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                      <span>{sec.lessons.length} bài</span>
                      {secDur > 0 && <span>{secDur}p</span>}
                      <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>
                  {isOpen && sec.lessons.length > 0 && (
                    <ul className="divide-y divide-gray-800/80">
                      {[...sec.lessons].sort((a,b) => a.order - b.order).map(l => (
                        <li key={l.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {l.isFree
                              ? <Play size={12} className="text-teal-400 flex-shrink-0"/>
                              : <Lock size={12} className="text-gray-600 flex-shrink-0"/>}
                            <span className="text-gray-300 truncate">{l.title}</span>
                            {l.isFree && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex-shrink-0">Free</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{l.duration}m</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Students tab ── */}
        {tab === 'students' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Học viên gần đây</h3>
              <span className="text-xs text-gray-500">{course._count.enrollments} tổng</span>
            </div>
            {enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-gray-700 mb-3"/>
                <p className="text-gray-400 font-medium">Chưa có học viên</p>
                <p className="text-sm text-gray-600 mt-1">Học viên sẽ hiện ở đây sau khi đăng ký</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Học viên', 'Email', 'Ngày đăng ký'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {e.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.user.image} alt="" className="w-7 h-7 rounded-full object-cover"/>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              {e.user.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <span className="text-gray-200 font-medium">{e.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{e.user.email}</td>
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(e.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Analytics tab ── */}
        {tab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Revenue breakdown */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
                <BarChart2 size={14} className="text-purple-400"/> Doanh thu
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Tổng doanh thu', value: fmt(totalRevenue), color: 'text-purple-400' },
                  { label: 'Số đơn hàng', value: course._count.enrollments.toLocaleString(), color: 'text-blue-400' },
                  { label: 'Giá trị trung bình', value: course._count.enrollments > 0 ? fmt(Math.round(totalRevenue / course._count.enrollments)) : '—', color: 'text-emerald-400' },
                  { label: 'Giá hiện tại', value: course.salePrice ? fmt(course.salePrice) : fmt(course.price), color: 'text-white' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content stats */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-400"/> Nội dung
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Số chương', value: sections.length, color: 'text-white' },
                  { label: 'Tổng bài học', value: totalLessons, color: 'text-white' },
                  { label: 'Bài miễn phí', value: freeLessons, color: 'text-teal-400' },
                  { label: 'Thời lượng', value: course.totalDuration > 0 ? fmtDur(course.totalDuration) : '—', color: 'text-white' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
