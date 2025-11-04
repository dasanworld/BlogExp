"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/service-worker';
import { UpdateNotification } from './ui/update-notification';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  return (
    <>
      {children}
      <UpdateNotification />
    </>
  );
}