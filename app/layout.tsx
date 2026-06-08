import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArmorShield CRM",
  description: "Client management for ArmorShield Roofing & Construction",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-slate-800 text-white px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">🛡️ ArmorShield CRM</a>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
