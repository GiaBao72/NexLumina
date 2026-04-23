import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Tăng limit body size cho video upload
export const maxDuration = 300; // 5 phút

async function requireAdmin() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") return null;
    return session;
  } catch { return null; }
}

/**
 * PUT /api/admin/bulk-upload/video/[videoId]
 * Proxy upload video lên Bunny — giữ accessKey phía server, không lộ ra client.
 * Client gửi raw video bytes, server relay thẳng lên Bunny PUT.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await params;
  const libraryId   = process.env.BUNNY_LIBRARY_ID!;
  const apiKey      = process.env.BUNNY_API_KEY!;

  if (!libraryId || !apiKey)
    return NextResponse.json({ error: "Thiếu cấu hình Bunny" }, { status: 500 });

  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method:  "PUT",
        headers: {
          AccessKey:      apiKey,
          "Content-Type": req.headers.get("Content-Type") || "application/octet-stream",
        },
        // @ts-ignore — duplex required for streaming body in Node 18+
        duplex: "half",
        body: req.body,
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `Bunny error ${res.status}: ${txt}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[video-proxy]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
