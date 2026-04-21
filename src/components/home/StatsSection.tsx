const stats = [
  { value: "500+", label: "Khóa học", emoji: "📚" },
  { value: "12.000+", label: "Học viên", emoji: "🎓" },
  { value: "98%", label: "Hài lòng", emoji: "⭐" },
  { value: "50+", label: "Giảng viên", emoji: "👨‍🏫" },
];

export default function StatsSection() {
  return (
    <section className="bg-teal-600 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="font-heading text-3xl font-bold text-white">{s.value}</div>
              <div className="text-teal-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
