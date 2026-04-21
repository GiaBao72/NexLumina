import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/webhooks/bunny
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.BUNNY_WEBHOOK_SECRET ?? "";

    // Verify signature (skip nếu chưa cấu hình — dev mode)
    if (webhookSecret) {
      const sig      = req.headers.get("x-bunnystream-signature") ?? "";
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody, "utf8")
        .digest("hex");

      // Đảm bảo 2 buffer cùng độ dài để timingSafeEqual không throw
      const expectedBuf = Buffer.from(expected, "hex");
      const sigBuf      = Buffer.from(sig,      "hex");

      if (
        expectedBuf.length !== sigBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, sigBuf)
      ) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Parse payload
    let payload: {
      VideoGuid?: string;
      Status?:    number;
      Video?:     { length?: number };
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { VideoGuid, Status, Video } = payload;

    if (!VideoGuid) {
      return NextResponse.json({});
    }

    // Status 3 = Finished, 4 = Resolution Finished (playable)
    if (Status === 3 || Status === 4) {
      const lesson = await prisma.lesson.findFirst({
        where: { bunnyVideoId: VideoGuid },
      });

      if (lesson) {
        const updateData: { duration?: number } = {};
        if (Video?.length != null && Video.length > 0) {
          updateData.duration = Video.length;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.lesson.update({
            where: { id: lesson.id },
            data:  updateData,
          });
        }

        console.info(
          `[bunny/webhook] Video ${VideoGuid} status=${Status}, lesson=${lesson.id}`,
          updateData
        );
      }
    } else if (Status === 5) {
      console.warn(`[bunny/webhook] Video ${VideoGuid} encoding FAILED (status=5)`);
    }

    return NextResponse.json({});
  } catch (err) {
    console.error("[bunny/webhook] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
