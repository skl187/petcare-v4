import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration: number;
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent;
      const { message, type, duration = 5000 } = ev.detail || {};
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const t: Toast = { id, message, type, duration };
      setToasts((s) => [...s, t]);
      window.setTimeout(
        () => setToasts((s) => s.filter((x) => x.id !== id)),
        duration
      );
    };
    window.addEventListener('app:toast', handler as EventListener);
    return () =>
      window.removeEventListener('app:toast', handler as EventListener);
  }, []);

  if (!toasts.length) return null;

  const node = (
    <div
      style={{ zIndex: 9999 }}
      className='fixed top-4 right-4 flex flex-col gap-3 pointer-events-none'
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role='status'
          aria-live='polite'
          className={`pointer-events-auto max-w-sm w-full rounded-md shadow-lg px-4 py-3 text-white flex items-start gap-3 ${
            t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className='flex-shrink-0 mt-0.5'>
            {t.type === 'success' ? (
              <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
          <div className='text-sm leading-tight'>{t.message}</div>
        </div>
      ))}
    </div>
  );

  return createPortal(node, document.body);
}
