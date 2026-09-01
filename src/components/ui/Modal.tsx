'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md', id }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!isOpen) return null;

  const modalMarkup = (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(6, 14, 32, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      id={id}
    >
      <div
        className={cn(
          'relative w-full rounded-2xl animate-fade-in shadow-2xl overflow-hidden',
          sizeClasses[size]
        )}
        style={{
          background: 'var(--surface-container)',
          border: '1px solid var(--outline-variant)',
          color: 'var(--on-surface)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
          <h2 style={{ fontFamily: 'Geist', fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-container-highest)] cursor-pointer"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  if (isClient && typeof document !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }

  return null;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Delete', loading }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && (
        <p className="text-sm mb-5" style={{ color: 'var(--on-surface-variant)' }}>{description}</p>
      )}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer"
          style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', border: '1px solid var(--error)' }}
        >
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
