import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME!;
const STORAGE_KEY  = process.env.BUNNY_STORAGE_API_KEY!;
const CDN_BASE     = process.env.BUNNY_STORAGE_CDN!;

// POST /api/admin/lessons/attachments/upload
// multipart/form-data: { file: File, folder?: string }
export async function POST(req: NextRequest) {
  try {
    // Auth check
    let session: any = null;
    try { session = await auth(); } catch { /* ignore */ }
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "attachments";

    if (!file) return NextResponse.json({ error: "Thiếu file" }, { status: 400 });

    if (file.size > 50 * 1024 * 1024)
      return NextResponse.json({ error: "File tối đa 50MB" }, { status: 413 });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const storagePath = `${folder}/${fileName}`;

    const buffer = await file.arrayBuffer();
    const uploadRes = await fetch(
      `https://${STORAGE_HOST}/${STORAGE_ZONE}/${storagePath}`,
      {
        method: "PUT",
        headers: {
          AccessKey: STORAGE_KEY,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const msg = await uploadRes.text();
      console.error("[bunny-storage] upload failed", uploadRes.status, msg);
      return NextResponse.json({ error: `Upload thất bại: ${uploadRes.status}` }, { status: 502 });
    }

    const cdnUrl = `/api/files/${storagePath}`;

    return NextResponse.json({
      url: cdnUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    console.error("[bunny-storage] upload error", err);
    return NextResponse.json({ error: "Lỗi server: " + String(err) }, { status: 500 });
  }
}
