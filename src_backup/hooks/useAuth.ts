import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getUserProfile } from '../services/firestore';

export const useAuth = () => {
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const [loading, setLoading] = useState(!profile && !!user);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !profile) {
        setLoading(true);
        try {
          const data = await getUserProfile(user.uid);
          setProfile(data as any);
        } catch (err: any) {
          console.warn('Could not fetch profile:', err.message);
        } finally {
          setLoading(false);
        }
      } else if (!user) {
        setProfile(null);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, profile, setProfile]);

  return { user, profile, loading };
};
