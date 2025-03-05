
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useClientQRCode = (clientId: number, clientName: string) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        navigate('/login');
      }
      return session;
    };

    const authStateListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });

    checkSession();
    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        setHasAccess(['supervisor', 'manager', 'cashier'].includes(profile.role));
      }
    };

    checkUserRole();
  }, [session]);

  const generateQRAccess = useCallback(async () => {
    if (!session || !hasAccess || !clientId) return null;
    
    try {
      setIsLoading(true);

      // First check if a token already exists for this client
      const { data: existingToken, error: fetchError } = await supabase
        .from('qr_access')
        .select('access_token')
        .eq('client_id', clientId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let token;

      // If a token already exists, use it
      if (existingToken && existingToken.access_token) {
        token = existingToken.access_token;
        console.log("Existing token found:", token);
      } else {
        // Create a new permanent token
        const { data: newToken, error } = await supabase
          .from('qr_access')
          .insert([{ 
            client_id: clientId,
            // Don't set expires_at so the token is permanent
            expires_at: null
          }])
          .select('access_token')
          .single();

        if (error) {
          throw error;
        }

        token = newToken.access_token;
        console.log("New token created:", token);
      }

      setAccessToken(token);

      const url = `${window.location.origin}/public/client/${token}`;
      setQrUrl(url);
      return { token, url };
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: error.message || "Could not generate QR code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, hasAccess, session, toast]);

  const handleCopyLink = async () => {
    if (!qrUrl) {
      toast({
        title: "Error",
        description: "QR code link not available yet",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Link copied!",
        description: "QR code link has been copied to clipboard.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Link is not yet available.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session && hasAccess && clientId) {
      generateQRAccess();
    }
  }, [clientId, session, hasAccess, generateQRAccess]);

  return {
    accessToken,
    qrUrl,
    isLoading,
    hasAccess,
    session,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink
  };
};
