'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Label({ htmlFor, required, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium mb-1.5', className)}
      style={{ color: 'var(--on-surface-variant)', fontFamily: 'Geist' }}>
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

const inputClass = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed outline-none'
);

const inputStyle: React.CSSProperties = {
  background: 'var(--surface-container-high)',
  border: '1px solid var(--outline-variant)',
  color: 'var(--on-surface)',
  fontFamily: 'Geist',
};

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      className={cn(inputClass, props.className)}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, ...props.style }}
      className={cn(inputClass, 'cursor-pointer', props.className)}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      style={{ ...inputStyle, ...props.style }}
      className={cn(inputClass, 'resize-y min-h-[80px]', props.className)}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
    />
  );
}

interface FormGroupProps {
  className?: string;
  children: React.ReactNode;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 mt-1">{message}</p>;
}
