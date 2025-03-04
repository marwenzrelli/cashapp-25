
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showErrorToast, showSuccessToast } from './utils/errorUtils';

export const useClientQRCode = (clientId: number, clientName: string, size: number) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

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

  const generateQRAccess = async (canvasElement: HTMLCanvasElement | null) => {
    if (!session || !hasAccess) return;
    
    try {
      setIsLoading(true);

      const { data: existingTokens, error: fetchError } = await supabase
        .from('qr_access')
        .select('access_token')
        .eq('client_id', clientId)
        .is('expires_at', null)
        .maybeSingle();

      let token;
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (existingTokens) {
        token = existingTokens.access_token;
      } else {
        // Création d'un nouveau token permanent (sans date d'expiration)
        const { data: newToken, error } = await supabase
          .from('qr_access')
          .insert([{ 
            client_id: clientId,
            expires_at: null  // Le token n'expire jamais
          }])
          .select('access_token')
          .single();

        if (error) {
          throw error;
        }
        
        token = newToken.access_token;
      }

      setAccessToken(token);

      if (canvasElement && token) {
        const url = `${window.location.origin}/public/client/${token}`;
        setQrUrl(url);
        await QRCode.toCanvas(
          canvasElement,
          url,
          {
            width: size,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }
        );
      }
    } catch (error: any) {
      console.error("Erreur lors de la génération du QR code:", error);
      showErrorToast("Erreur", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      showSuccessToast("Lien copié !", "Le lien du QR code a été copié dans le presse-papier.");
    } catch (error) {
      showErrorToast("Erreur", "Impossible de copier le lien.");
    }
  };

  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      showErrorToast("Erreur", "Le lien n'est pas encore disponible.");
    }
  };

  return {
    accessToken,
    isLoading,
    session,
    hasAccess,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink,
    qrUrl
  };
};
