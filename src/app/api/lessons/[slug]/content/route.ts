import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint: trả content + attachments của một lesson (theo ID)
// Không yêu cầu auth — học viên đã mua khoá / bài miễn phí
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        attachments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, url: true, type: true, size: true },
        },
      },
    });
    if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      content: lesson.content ?? null,
      attachments: lesson.attachments,
    });
  } catch (err) {
    console.error("[lesson/content] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
