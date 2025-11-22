
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "Game Creator Platform - Build 2D Platformer Games",
  description: "Create stunning 2D platformer games with our intuitive visual editor. Build, customize, and share your games today.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Game Creator Platform - Build 2D Platformer Games",
    description: "Create stunning 2D platformer games with our intuitive visual editor",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthWrapper>
          {children}
          <Toaster />
        </AuthWrapper>
      </body>
    </html>
  );
}
