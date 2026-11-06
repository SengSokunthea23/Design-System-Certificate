import type { Metadata } from "next";
import { Inter, Noto_Sans_Khmer } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-noto-sans-khmer",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Design System Picker",
    default: "Design System Picker",
  },
  description: "Pick your brand's design rules — colors, fonts, shape and voice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansKhmer.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
