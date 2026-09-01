import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'DevLog — Developer Worklog',
  description: 'Personal developer worklog to track projects, branches, tasks, and daily work logs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: 'var(--background)', color: 'var(--on-surface)' }}>
        <QueryProvider>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content Area - offset by sidebar on lg */}
          <div className="lg:pl-[240px] min-h-screen flex flex-col">
            {/* Fixed Top Header */}
            <TopHeader />

            {/* Page Content - pt-16 for header + pb-16 for mobile bottom nav */}
            <main className="flex-1 pt-16 pb-20 lg:pb-8 px-4 lg:px-6 animate-fade-in">
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
