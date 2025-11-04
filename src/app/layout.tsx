import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

export const metadata: Metadata = {
  title: "SuperNext App",
  description: "SuperNext - Structured Next.js + Supabase Template",
  manifest: "/manifest.json",
  themeColor: "#1e293b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className="antialiased font-sans">
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            {children}
          </CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
