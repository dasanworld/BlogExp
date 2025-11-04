"use client";

import { useEffect, useState, useCallback } from 'react';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
}

export function useAutoUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return false;
    
    setIsChecking(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) return false;

      return new Promise<boolean>((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          const data = event.data as UpdateInfo;
          setUpdateAvailable(data.hasUpdate);
          setIsChecking(false);
          resolve(data.hasUpdate);
        };

        registration.active!.postMessage(
          { type: 'CHECK_VERSION' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      setIsChecking(false);
      return false;
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    
    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error applying update:', error);
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    checkForUpdates();

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [checkForUpdates]);

  return {
    updateAvailable,
    isChecking,
    isUpdating,
    checkForUpdates,
    applyUpdate
  };
}