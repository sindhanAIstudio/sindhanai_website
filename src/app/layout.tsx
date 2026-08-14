import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "SindhanAI — Applied AI and Technology Lab | KGISL SOI",
  description: "Industry Experts, Faculty, and Students from KGISL AI and Generative AI labs delivering production-grade AI solutions, software engineering, and industry training.",
  keywords: ["SindhanAI", "KGISL", "School of Innovation", "AI Lab", "Generative AI", "Data Science", "Training", "Coimbatore"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${plusJakartaSans.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col justify-between`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
