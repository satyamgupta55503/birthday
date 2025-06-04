import type { Metadata } from "next"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL("https://archi-birthday-2080.vercel.app"), // ✅ Required for resolving relative URLs
  title: "Archi's 18th Birthday Celebration | 2080 Future Theme",
  description: "Join us in celebrating Archi Gupta's 18th birthday with an immersive futuristic experience from 2080.",
  keywords: ["birthday", "celebration", "Archi Gupta", "18th birthday", "futuristic", "2080"],
  openGraph: {
    title: "Archi's 18th Birthday Celebration | 2080 Future Theme",
    description:
      "Join us in celebrating Archi Gupta's 18th birthday with an immersive futuristic experience from 2080.",
    url: "https://archi-birthday-2080.vercel.app",
    siteName: "Archi's Birthday",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Archi's 18th Birthday Celebration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Archi's 18th Birthday Celebration | 2080 Future Theme",
    description:
      "Join us in celebrating Archi Gupta's 18th birthday with an immersive futuristic experience from 2080.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
