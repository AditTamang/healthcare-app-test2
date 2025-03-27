import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/session-provider"
import { MainNav } from "@/components/main-nav"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MedConnect - Healthcare Appointment System",
  description: "Book appointments with doctors online",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <div className="flex min-h-screen flex-col">
              <MainNav />
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} MedConnect. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'