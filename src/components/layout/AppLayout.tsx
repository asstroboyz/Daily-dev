'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import DashboardPage from '@/app/dashboard/page';
import TasksPage from '@/app/tasks/page';
import BranchesPage from '@/app/branches/page';
import ProjectsPage from '@/app/projects/page';
import DailyReportPage from '@/app/reports/daily/page';
import SettingsPage from '@/app/settings/page';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Handle URL sync if user uses query string ?tab=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    // Update browser URL without triggering Next.js RSC router fetch
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  // If there are children (for subpages like /projects/1), render subpage with Sidebar
  if (children) {
    return (
      <>
        <Sidebar />
        <div className="lg:pl-[240px] min-h-screen flex flex-col">
          <TopHeader />
          <main className="flex-1 pt-16 pb-20 lg:pb-8 px-4 lg:px-6 animate-fade-in">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />
      <div className="lg:pl-[240px] min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 pt-16 pb-20 lg:pb-8 px-4 lg:px-6 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'tasks' && <TasksPage />}
            {activeTab === 'branches' && <BranchesPage />}
            {activeTab === 'projects' && <ProjectsPage />}
            {activeTab === 'reports' && <DailyReportPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </>
  );
}
