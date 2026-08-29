import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sindhanai.com"),
  title: {
    default: "SindhanAI — Applied AI & Technology Lab | KGiSL Institute of Technology",
    template: "%s | SindhanAI"
  },
  description: "Industry Experts, SCOPE Faculty Mentors, and Students from KGiSL AI and Generative AI labs delivering production-grade AI solutions, software engineering, and hands-on industry training.",
  keywords: [
    "SindhanAI",
    "SCOPE Faculty",
    "KGiSL Institute of Technology",
    "School of Programming Excellence",
    "AI Lab",
    "Generative AI",
    "Data Science",
    "Software Solutions",
    "Tech Training",
    "Coimbatore"
  ],
  authors: [{ name: "SindhanAI Team" }],
  creator: "SindhanAI — KGiSL Institute of Technology",
  publisher: "SindhanAI",
  icons: {
    icon: [
      { url: "/sindhanai-icon.svg", type: "image/svg+xml" },
      { url: "/sindhanai-logo.png", type: "image/png" }
    ],
    shortcut: "/sindhanai-icon.svg",
    apple: "/sindhanai-icon.svg"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sindhanai.com",
    siteName: "SindhanAI",
    title: "SindhanAI — Applied AI & Technology Lab",
    description: "Production-grade AI solutions, software engineering, and industry training from KGiSL Institute of Technology faculty and industry experts.",
    images: [
      {
        url: "/sindhanai-logo.png",
        width: 1200,
        height: 630,
        alt: "SindhanAI Applied AI and Technology Lab"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SindhanAI — Applied AI & Technology Lab",
    description: "Production-grade AI solutions, software engineering, and industry training.",
    images: ["/sindhanai-logo.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${plusJakartaSans.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col justify-between`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
