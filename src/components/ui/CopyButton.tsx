'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
        'bg-[#252a38] text-[#8b91a8] hover:bg-[#6366f1]/20 hover:text-[#6366f1]',
        copied && 'bg-green-500/20 text-green-400',
        className
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export function BranchName({ name, showCopy = true }: { name: string; showCopy?: boolean }) {
  return (
    <div className="flex items-center gap-2 group">
      <code className="branch-name text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded text-sm">
        {name}
      </code>
      {showCopy && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={name} />
        </span>
      )}
    </div>
  );
}
