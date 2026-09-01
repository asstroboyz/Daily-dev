'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/workLogService';
import { today, formatDate } from '@/lib/utils';

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState<string>(today());
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedPlain, setCopiedPlain] = useState(false);

  const { data: report, isLoading, isError, refetch } = useQuery({
    queryKey: ['daily-report', selectedDate],
    queryFn: () => reportService.getDaily(selectedDate),
    enabled: !!selectedDate,
  });

  const generateFormattedReport = (): string => {
    if (!report || !report.projects || report.projects.length === 0) {
      return `Daily Report (${formatDate(selectedDate)}):\n- No work logs recorded.`;
    }

    let text = `📅 Daily Report — ${formatDate(selectedDate)}\n\n`;
    report.projects.forEach((proj) => {
      text += `📁 [${proj.project_name}]\n`;
      proj.tasks?.forEach((task) => {
        text += `  • Task: ${task.task_title}\n`;
        if (task.branch_name) {
          text += `    Branch: ${task.branch_name}\n`;
        }
        text += `    Pengerjaan:\n`;
        task.work_logs?.forEach((log) => {
          text += `    - ${log.title}\n`;
        });
        text += `    Status: ${task.task_status}\n\n`;
      });
    });
    return text.trim();
  };

  const generatePlainTextReport = (): string => {
    if (!report || !report.projects || report.projects.length === 0) {
      return `Laporan Harian (${selectedDate}): Tidak ada pengerjaan.`;
    }

    let text = `Laporan Harian (${selectedDate}):\n\n`;
    report.projects.forEach((proj) => {
      text += `${proj.project_name}:\n`;
      proj.tasks?.forEach((task) => {
        text += `- ${task.task_title}`;
        if (task.branch_name) {
          text += ` (${task.branch_name})`;
        }
        text += `\n`;
        task.work_logs?.forEach((log) => {
          text += `  * ${log.title}\n`;
        });
      });
      text += `\n`;
    });
    return text.trim();
  };

  const handleCopyReport = async () => {
    await navigator.clipboard.writeText(generateFormattedReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyPlain = async () => {
    await navigator.clipboard.writeText(generatePlainTextReport());
    setCopiedPlain(true);
    setTimeout(() => setCopiedPlain(false), 2000);
  };

  // Count active branches today safely
  const totalBranches = report?.projects?.reduce((acc, p) => acc + (p.tasks?.filter(t => !!t.branch_name).length || 0), 0) || 0;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 rounded-xl bg-surface-container shadow-sm">
        <div className="space-y-1">
          <h1 className="text-headline-lg font-bold text-on-surface">Daily Report</h1>
          <p className="text-body-md text-on-surface-variant">Generate today&apos;s development work summary.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-container-high text-on-surface font-body-md py-2.5 px-4 rounded-lg outline-none cursor-pointer hover:bg-surface-container-highest transition-colors border-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyPlain}
              className="bg-surface-container-highest text-on-surface hover:bg-surface-bright transition-colors font-body-md px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{copiedPlain ? 'check' : 'content_copy'}</span>
              <span>{copiedPlain ? 'Copied!' : 'Plain Text'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="bg-primary text-on-primary hover:brightness-110 transition-all font-semibold text-body-md px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{copiedReport ? 'check' : 'summarize'}</span>
              <span>{copiedReport ? 'Report Copied!' : 'Copy Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-surface-container shadow-sm rounded-xl p-12 text-center text-on-surface-variant space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Generating daily report...</p>
        </div>
      ) : isError ? (
        <div className="bg-surface-container shadow-sm rounded-xl p-12 text-center text-error space-y-2">
          <p className="font-semibold">Failed to load daily report</p>
          <button onClick={() => refetch()} className="text-xs text-primary underline cursor-pointer">Retry</button>
        </div>
      ) : !report || !report.projects || report.projects.length === 0 ? (
        <div className="bg-surface-container shadow-sm rounded-xl p-12 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-outline">event_busy</span>
          <p className="font-semibold text-on-surface">No Work Logs Recorded</p>
          <p className="text-body-sm text-on-surface-variant">There are no activities logged on {formatDate(selectedDate)}.</p>
        </div>
      ) : (
        <div className="bg-surface-container shadow-sm rounded-xl p-8 space-y-10">
          {report.projects.map((proj, pIdx) => {
            const isAlt = pIdx % 2 === 1;
            const accentBg = isAlt ? 'from-tertiary' : 'from-primary';
            const iconName = isAlt ? 'health_and_safety' : 'warehouse';
            const iconColor = isAlt ? 'text-tertiary' : 'text-primary';
            const badgeBg = isAlt ? 'bg-tertiary-container/20 text-tertiary' : 'bg-secondary-container/20 text-secondary';

            const totalLogs = proj.tasks?.reduce((acc, t) => acc + (t.work_logs?.length || 0), 0) || 0;

            return (
              <div key={proj.project_id} className="space-y-6 relative">
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accentBg} to-transparent rounded-full opacity-60`} />

                <div className="pl-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${iconColor} text-[28px]`}>{iconName}</span>
                    <h2 className="text-headline-lg font-semibold text-on-surface">{proj.project_name}</h2>
                  </div>
                  <span className={`px-3 py-1 ${badgeBg} rounded-full text-label-caps uppercase tracking-wider`}>
                    {totalLogs} Entries
                  </span>
                </div>

                <div className="pl-6 space-y-6">
                  {proj.tasks?.map((task) => (
                    <div key={task.task_id} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">task_alt</span>
                            <h3 className="font-semibold text-body-md text-on-surface">{task.task_title}</h3>
                          </div>
                          {task.branch_name && (
                            <div className="flex items-center gap-2 pl-6">
                              <span className="material-symbols-outlined text-outline text-[16px]">commit</span>
                              <span className="font-mono text-code-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {task.branch_name}
                              </span>
                            </div>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg text-body-sm shadow-sm">
                          <span className={`w-2 h-2 rounded-full ${task.task_status === 'testing' ? 'bg-secondary' : 'bg-tertiary animate-pulse'}`} />
                          {task.task_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="pl-6">
                        <ul className="space-y-2 font-body-md text-on-surface-variant list-none relative">
                          {task.work_logs?.map((log) => (
                            <li
                              key={log.id}
                              className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-outline before:rounded-full"
                            >
                              {log.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-center pt-4">
            <div className="text-center font-body-sm text-outline flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Generated from {totalBranches} active branch{totalBranches !== 1 ? 'es' : ''} today
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
