import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/use-auth";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moody — Your Mind Deserves a Place to Breathe",
  description:
    "AI-powered journaling app for mood tracking, emotional analysis, and personalized mental wellness support. Write freely. Understand yourself. Feel better.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
