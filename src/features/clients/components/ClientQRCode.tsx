
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../hooks/utils/errorUtils';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({ clientId, clientName, size = 256 }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();
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

  const generateQRAccess = async () => {
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

      if (canvasRef.current && token) {
        const url = `${window.location.origin}/public/client/${token}`;
        setQrUrl(url);
        await QRCode.toCanvas(
          canvasRef.current,
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

  useEffect(() => {
    if (session && hasAccess) {
      generateQRAccess();
    }
  }, [clientId, clientName, session, hasAccess]);

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

  const handleRegenerateQR = () => {
    generateQRAccess();
  };

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-4 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-white p-2 rounded-lg shadow-inner relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !accessToken ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 gap-2">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Chargement du QR code...
              </p>
            </div>
          ) : null}
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Code QR unique du client
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs"
              onClick={handleCopyLink}
              disabled={!accessToken || isLoading}
            >
              <Copy className="h-3 w-3" />
              Copier le lien
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs"
              onClick={handleOpenLink}
              disabled={!accessToken || isLoading}
            >
              <ExternalLink className="h-3 w-3" />
              Ouvrir le lien
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={handleRegenerateQR}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Régénérer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
