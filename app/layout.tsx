import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Nav } from "@/components/layout/Nav"
import { Footer } from "@/components/layout/Footer"
import { AuthModal } from "@/components/layout/AuthModal"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IdeasUp — validate your ideas before you build",
  description:
    "Share your startup idea or side project and get real votes and feedback from builders and buyers — before you spend weeks building something nobody wants.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <AuthModal />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
