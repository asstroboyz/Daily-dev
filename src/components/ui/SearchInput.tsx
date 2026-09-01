'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className, id }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525870] pointer-events-none"
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-4 py-2.5 rounded-xl',
          'bg-[#13161e] border border-[#252a38] text-[#e8eaf0] placeholder-[#525870]',
          'focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50',
          'transition-all duration-200 text-sm'
        )}
      />
    </div>
  );
}
