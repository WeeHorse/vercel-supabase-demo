import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vercel Supabase Demo",
  description: "Vercel + Supabase + secure CI/CD demo with auth and todo CRUD"
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
