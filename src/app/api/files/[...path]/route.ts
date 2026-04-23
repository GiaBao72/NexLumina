import { NextRequest, NextResponse } from "next/server";

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME!;
const STORAGE_KEY  = process.env.BUNNY_STORAGE_API_KEY!;

// GET /api/files/[...path]
// Proxy download file từ Bunny Storage — không cần Pull Zone
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const storagePath = path.join("/");

    const res = await fetch(
      `https://${STORAGE_HOST}/${STORAGE_ZONE}/${storagePath}`,
      { headers: { AccessKey: STORAGE_KEY } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "File không tìm thấy" }, { status: 404 });
    }

    const contentType = res.headers.get("Content-Type") || "application/octet-stream";
    const fileName = path[path.length - 1].replace(/^\d+-/, ""); // bỏ timestamp prefix

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[files] proxy error", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
