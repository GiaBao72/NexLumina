import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/settings
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await prisma.siteSettings.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    return NextResponse.json({
      siteName:        map["siteName"]        ?? "NexLumina",
      siteDescription: map["siteDescription"] ?? "",
      supportEmail:    map["supportEmail"]    ?? "",
      smtpHost:        map["smtpHost"]        ?? "smtp.gmail.com",
      smtpPort:        map["smtpPort"]        ?? "587",
      smtpUser:        map["smtpUser"]        ?? "",
      // smtpPass không trả về client
      maintenanceMode: map["maintenanceMode"] === "true",   // boolean, không phải string
    });
  } catch (err) {
    console.error("[admin/settings] GET", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/admin/settings — upsert nhiều key
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: Record<string, string> = await req.json();
    const allowedKeys = ["siteName", "siteDescription", "supportEmail", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "maintenanceMode"];

    const updates = Object.entries(body)
      .filter(([k]) => allowedKeys.includes(k))
      .map(([key, value]) =>
        prisma.siteSettings.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        })
      );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/settings] POST", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
