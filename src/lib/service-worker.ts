"use client";

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New service worker available');
        }
      });
    });

    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
}