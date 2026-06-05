import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPlatform = 'ios' | 'android' | 'desktop';

interface UseInstallPrompt {
  canInstall: boolean;
  isInstalled: boolean;
  platform: InstallPlatform;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  // iPadOS 13+ reports as Mac; detect touch to disambiguate.
  const isIPadOs = ua.includes('macintosh') && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(ua) || isIPadOs) return 'ios';
  if (ua.includes('android')) return 'android';
  return 'desktop';
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayStandalone || iosStandalone;
}

export function useInstallPrompt(): UseInstallPrompt {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectStandalone);
  const [platform] = useState<InstallPlatform>(detectPlatform);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable' as const;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null && !isInstalled,
    isInstalled,
    platform,
    promptInstall,
  };
}
