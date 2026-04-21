"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface BunnyPlayerProps {
  lessonSlug: string;   // để fetch token
  lessonTitle: string;
  isFree: boolean;      // nếu free không cần token
  videoId?: string;     // fallback embed không token (cho lesson free)
}

export default function BunnyPlayer({
  lessonSlug,
  lessonTitle,
  isFree,
  videoId,
}: BunnyPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  useEffect(() => {
    // Nếu free + có videoId: dùng direct embed không cần token
    if (isFree && videoId) {
      setEmbedUrl(`https://iframe.mediadelivery.net/embed/${videoId}`);
      setLoading(false);
      return;
    }

    // Fetch signed token từ API
    const controller = new AbortController();

    async function fetchToken() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/lessons/${lessonSlug}/token`, {
          signal: controller.signal,
        });

        if (res.status === 403) {
          setError({ code: 403, message: "Bạn chưa đăng ký khóa học này" });
          return;
        }

        if (res.status === 404) {
          setError({ code: 404, message: "Video đang được cập nhật" });
          return;
        }

        if (!res.ok) {
          setError({ code: res.status, message: "Không thể tải video" });
          return;
        }

        const data = await res.json();

        if (!data.embedUrl && !data.url) {
          setError({ code: 404, message: "Video đang được cập nhật" });
          return;
        }

        setEmbedUrl(data.embedUrl ?? data.url);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError({ code: 0, message: "Không thể tải video" });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
    return () => controller.abort();
  }, [lessonSlug, isFree, videoId]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div
        className="relative w-full bg-gray-900 overflow-hidden"
        style={{ paddingTop: "56.25%" }}
        aria-label="Đang tải video..."
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
          <div className="relative flex flex-col items-center gap-3 z-10">
            <div className="h-16 w-16 rounded-full bg-gray-700 animate-pulse" />
            <div className="h-3 w-40 rounded-full bg-gray-700 animate-pulse" />
            <div className="h-2 w-24 rounded-full bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error 403: chưa đăng ký ── */
  if (error?.code === 403) {
    return (
      <div
        className="relative w-full bg-gray-950 flex items-center justify-center"
        style={{ paddingTop: "56.25%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center gap-5 p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Lock className="h-9 w-9 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">
              Nội dung có giới hạn
            </h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Bạn chưa đăng ký khóa học này. Hãy mua khóa học để xem toàn bộ nội dung.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-lg"
          >
            <PlayCircle className="h-4 w-4" />
            Mua khóa học
          </Link>
        </div>
      </div>
    );
  }

  /* ── Error 404 / no video ── */
  if (error) {
    return (
      <div
        className="relative w-full bg-gray-900"
        style={{ paddingTop: "56.25%" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-gray-200 font-semibold text-base mb-1">
              Video đang được cập nhật
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {lessonTitle} sẽ sớm có mặt. Vui lòng quay lại sau.
            </p>
          </div>
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Video player ── */
  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        src={embedUrl!}
        title={lessonTitle}
        style={{
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
