
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UseQRCodeGenerationProps {
  clientId: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  size?: number;
}

export const useQRCodeGeneration = ({ clientId, canvasRef, size = 200 }: UseQRCodeGenerationProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
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

  const generateQRAccess = async () => {
    if (!session || !hasAccess) return;
    try {
      setIsLoading(true);
      console.log("Starting QR code generation for client ID:", clientId);
      
      const { data: existingTokens, error: fetchError } = await supabase
        .from('qr_access')
        .select('access_token')
        .eq('client_id', clientId)
        .limit(1);
        
      let tokenToUse;
      
      if (fetchError) {
        console.error("Error checking existing tokens:", fetchError);
        toast.error("Impossible de vérifier les tokens existants.");
        setIsLoading(false);
        return;
      }
      
      console.log("Existing tokens found:", existingTokens?.length || 0);
      
      if (existingTokens && existingTokens.length > 0) {
        tokenToUse = existingTokens[0].access_token;
        console.log("Using existing token:", tokenToUse);
        setAccessToken(tokenToUse);
      } else {
        console.log("Creating new access token for client:", clientId);
        const newToken = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('qr_access')
          .insert({
            client_id: clientId,
            expires_at: null,
            access_token: newToken
          })
          .select('access_token')
          .single();
          
        if (error) {
          console.error("Error creating QR access:", error);
          toast.error("Impossible de créer un accès QR.");
          setIsLoading(false);
          return;
        }
        
        tokenToUse = data.access_token;
        console.log("New token created:", tokenToUse);
        setAccessToken(tokenToUse);
      }
      
      if (canvasRef.current && tokenToUse) {
        const url = `${window.location.origin}/public/client/${tokenToUse}`;
        setQrUrl(url);
        console.log("Generated QR code URL:", url);
        
        try {
          await QRCode.toCanvas(canvasRef.current, url, {
            width: size,
            margin: 1,
            color: {
              dark: '#8B5CF6',
              light: '#FFFFFF'
            }
          });
          console.log("QR Code generated successfully");
        } catch (qrError) {
          console.error("Error generating QR canvas:", qrError);
          toast.error("Erreur lors de la génération de l'image QR.");
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la génération du QR code:", error);
      toast.error(error.message || "Impossible de générer le QR code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && hasAccess) {
      generateQRAccess();
    }
  }, [clientId, session, hasAccess]);

  return {
    accessToken,
    qrUrl,
    isLoading,
    session,
    hasAccess,
    roleCheckError,
    generateQRAccess
  };
};
