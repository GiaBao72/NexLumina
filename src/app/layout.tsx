import type { Metadata } from "next";
import Providers from "@/components/Providers";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "NexLumina — Học Online Chất Lượng Cao",
    template: "%s | NexLumina",
  },
  description:
    "Nền tảng học trực tuyến với hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu.",
  keywords: ["khóa học online", "học trực tuyến", "e-learning", "NexLumina"],
  authors: [{ name: "NexLumina" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://nexlumina.com",
    siteName: "NexLumina",
    title: "NexLumina — Học Online Chất Lượng Cao",
    description: "Nền tảng học trực tuyến với hàng trăm khóa học chất lượng cao.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexLumina",
    description: "Học Online Chất Lượng Cao",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
