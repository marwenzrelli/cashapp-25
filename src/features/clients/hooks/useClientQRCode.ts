
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export const useClientQRCode = (clientId: number, clientName: string, size: number = 256) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });

    const {
      data: { subscription },
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

  const generateQRAccess = async () => {
    if (!session || !hasAccess) return;
    
    try {
      setIsLoading(true);

      // Create the access token first, then insert it with the client_id
      const newToken = crypto.randomUUID();
      
      // Insert with the correct structure - providing access_token
      const { data, error } = await supabase
        .from('qr_access')
        .insert({
          client_id: clientId,
          expires_at: null, // Set to null for permanent access
          access_token: newToken // Provide the access_token
        })
        .select('access_token')
        .single();

      if (error) {
        throw error;
      }

      setAccessToken(data.access_token);
      
      if (data.access_token) {
        const url = `${window.location.origin}/public/client/${data.access_token}`;
        setQrUrl(url);
        return { url, token: data.access_token };
      }
      
      return null;
    } catch (error: any) {
      console.error("Erreur lors de la génération du QR code:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le QR code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien du QR code a été copié dans le presse-papier.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      toast({
        title: "Erreur",
        description: "Le lien n'est pas encore disponible.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateQR = () => {
    generateQRAccess();
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
    if (!showQRCode && !accessToken) {
      generateQRAccess();
    }
  };

  useEffect(() => {
    if (session && hasAccess && showQRCode) {
      generateQRAccess();
    }
  }, [clientId, clientName, session, hasAccess, showQRCode]);

  return {
    accessToken,
    qrUrl,
    isLoading,
    showQRCode,
    hasAccess,
    session,
    handleCopyLink,
    handleOpenLink,
    handleRegenerateQR,
    toggleQRCode,
    generateQRAccess
  };
};
