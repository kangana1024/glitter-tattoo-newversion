import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import "@/styles/globals.css";

const kanit = Kanit({
  variable: "--font-heading",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glitter Tattoo | สติ๊กเกอร์แทททู",
  description: "Glitter Tattoo - Professional glitter tattoo services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} ${sarabun.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
