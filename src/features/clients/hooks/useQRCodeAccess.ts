
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useQRCodeAccess = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });
    
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session) return;
      
      try {
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          setRoleCheckError(true);
          setHasAccess(true);
          return;
        }
        
        if (profile) {
          setUserRole(profile.role);
          setHasAccess(['supervisor', 'manager', 'cashier', 'agent'].includes(profile.role));
        }
      } catch (err) {
        console.error("Error checking role:", err);
        setRoleCheckError(true);
        setHasAccess(true);
      }
    };
    
    checkUserRole();
  }, [session]);

  return {
    session,
    userRole,
    hasAccess,
    roleCheckError
  };
};
