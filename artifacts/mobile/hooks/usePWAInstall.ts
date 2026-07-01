import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallState = 'installed' | 'installable' | 'ios' | 'manual' | 'native';

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>('native');

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed');
      return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    if (isIOS) {
      setInstallState('ios');
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setInstallState('installable');
    };

    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => {
      setInstallState((prev) => (prev === 'native' ? 'manual' : prev));
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setInstallState('installed');
      setPromptEvent(null);
    }
    return outcome === 'accepted';
  };

  return {
    installState,
    isInstallable: installState === 'installable',
    isInstalled: installState === 'installed',
    install,
  };
}
