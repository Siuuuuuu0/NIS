import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getToken } from '../lib/authStorage';

export function useRequireAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await getToken();
      if (cancelled) return;
      if (!t) {
        router.replace('/login');
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return ready;
}
