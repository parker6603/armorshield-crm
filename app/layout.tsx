import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e293b',
}

export const metadata: Metadata = {
  title: "ArmorShield CRM",
  description: "Client management for ArmorShield Roofing & Construction",
  appleWebApp: {
    capable: true,
    title: "ArmorShield CRM",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {/* Top nav */}
        <nav className="bg-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between no-print sticky top-0 z-40 shadow-sm">
          <a href="/" className="text-lg font-bold tracking-tight">🛡️ ArmorShield CRM</a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
            <a href="/jobs" className="text-slate-300 hover:text-white transition-colors">All Jobs</a>
            <a href="/analytics" className="text-slate-300 hover:text-white transition-colors">Analytics</a>
            <a href="/clients/new" className="bg-white text-slate-800 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              + New Client
            </a>
          </div>
        </nav>

        {/* Page content — extra bottom padding on mobile for the bottom nav */}
        <main className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden no-print z-50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex">
            <a href="/" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-slate-600 hover:text-slate-900 active:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </a>
            <a href="/clients/new" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-slate-600 hover:text-slate-900 active:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </a>
            <a href="/jobs" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-slate-600 hover:text-slate-900 active:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Jobs</span>
            </a>
            <a href="/analytics" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-slate-600 hover:text-slate-900 active:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Analytics</span>
            </a>
          </div>
        </nav>
      </body>
    </html>
  );
}
