import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LAST_SEEN_KEY = 'activity_last_seen';

export const useActivityCount = () => {
    const { user } = useAuth();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const getLastSeen = (): string => {
        const stored = localStorage.getItem(LAST_SEEN_KEY);
        // Default to 24 hours ago if never seen
        return stored || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    };

    const markAsSeen = useCallback(() => {
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
        setCount(0);
    }, []);

    const fetchCount = useCallback(async () => {
        if (!user) {
            setCount(0);
            setLoading(false);
            return;
        }

        try {
            const lastSeen = getLastSeen();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = supabase as any;

            // Query all tables for records created/updated after lastSeen
            const [
                generalRes,
                officeRes,
                maritalRes,
                childrenRes,
                educationRes,
                domesticRes,
                foreignTrainingRes,
                foreignTravelRes,
                foreignPostingRes,
                lienRes,
            ] = await Promise.all([
                s.from('general_information').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('office_information').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('marital_information').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('children_information').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('educational_qualifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('domestic_trainings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('foreign_trainings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('foreign_travels').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('foreign_postings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
                s.from('lien_deputations').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('updated_at', lastSeen),
            ]);

            const total =
                (generalRes.count || 0) +
                (officeRes.count || 0) +
                (maritalRes.count || 0) +
                (childrenRes.count || 0) +
                (educationRes.count || 0) +
                (domesticRes.count || 0) +
                (foreignTrainingRes.count || 0) +
                (foreignTravelRes.count || 0) +
                (foreignPostingRes.count || 0) +
                (lienRes.count || 0);

            setCount(total);
        } catch (error) {
            console.error('Error fetching activity count:', error);
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCount();
    }, [fetchCount]);

    return { count, loading, markAsSeen, refetch: fetchCount };
};

export default useActivityCount;
