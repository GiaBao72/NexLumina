"use client";

import { useEffect, useState } from "react";
import type { HomeStats } from "@/types";

const FALLBACK: HomeStats = {
  totalCourses: 500,
  totalStudents: 12000,
  satisfactionRate: 98,
  totalInstructors: 50,
};

export default function StatsSection() {
  const [stats, setStats] = useState<HomeStats>(FALLBACK);

  useEffect(() => {
    fetch("/api/home/stats")
      .then((r) => r.json())
      .then((d: HomeStats) => {
        if (d && typeof d.totalCourses === "number") setStats(d);
      })
      .catch(() => {}); // giữ fallback nếu lỗi
  }, []);

  const items = [
    { value: `${stats.totalCourses}+`, label: "Khóa học", emoji: "📚" },
    {
      value: stats.totalStudents >= 1000
        ? `${(stats.totalStudents / 1000).toFixed(0)}.000+`
        : `${stats.totalStudents}+`,
      label: "Học viên",
      emoji: "🎓",
    },
    { value: `${stats.satisfactionRate}%`, label: "Hài lòng", emoji: "⭐" },
    {
      value: `${stats.totalInstructors ?? 50}+`,
      label: "Giảng viên",
      emoji: "👨‍🏫",
    },
  ];

  return (
    <section className="bg-teal-600 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="font-heading text-3xl font-bold text-white">
                {s.value}
              </div>
              <div className="text-teal-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
