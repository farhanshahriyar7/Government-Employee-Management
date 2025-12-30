import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Centralized navigation hook for consistent navigation behavior across all pages.
 * Handles logout with proper signOut, dashboard routing, and dynamic page navigation.
 */
export const useAppNavigation = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { toast } = useToast();

    /**
     * Navigate to a section of the app
     * @param section - The section to navigate to (e.g., 'dashboard', 'logout', 'settings')
     * @param language - Current language for toast messages ('bn' or 'en')
     */
    const handleNavigate = async (section: string, language: 'bn' | 'en' = 'en') => {
        if (section === 'logout') {
            try {
                await signOut();
                toast({
                    title: language === 'bn' ? 'লগ আউট' : 'Logout',
                    description: language === 'bn'
                        ? 'আপনি সফলভাবে লগআউট হয়েছেন'
                        : 'You have been successfully logged out.',
                });
                navigate('/login');
            } catch (err) {
                console.error('Logout error:', err);
                toast({
                    title: language === 'bn' ? 'ত্রুটি' : 'Error',
                    description: language === 'bn' ? 'লগআউট বিফল' : 'Failed to logout',
                    variant: 'destructive',
                });
            }
            return;
        }

        if (section === 'dashboard') {
            navigate('/');
            return;
        }

        // Dynamic navigation for all other sections
        navigate(`/${section}`);
    };

    return { handleNavigate };
};

export default useAppNavigation;
