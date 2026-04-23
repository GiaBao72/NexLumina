import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/lessons/attachments?lessonId=xxx
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "Thiếu lessonId" }, { status: 400 });

  const attachments = await prisma.lessonAttachment.findMany({
    where: { lessonId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ attachments });
}

// POST /api/admin/lessons/attachments
// body: { lessonId, name, url, type, size? }
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { lessonId, name, url, type, size } = await req.json();
    if (!lessonId || !name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Thiếu lessonId, name hoặc url" }, { status: 400 });
    }
    const attachment = await prisma.lessonAttachment.create({
      data: {
        lessonId,
        name: name.trim(),
        url: url.trim(),
        type: type ?? "link",
        size: size ? Number(size) : null,
      },
    });
    return NextResponse.json({ attachment });
  } catch (err) {
    console.error("[attachments] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/admin/lessons/attachments
// body: { id }
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    await prisma.lessonAttachment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[attachments] DELETE", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
