
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
}

export const ClientQRCode = ({ clientId, clientName }: ClientQRCodeProps) => {
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
        setHasAccess(['supervisor', 'manager'].includes(profile.role));
      }
    };

    checkUserRole();
  }, [session]);

  const generateQRAccess = async () => {
    if (!session || !hasAccess) return;
    
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('qr_access')
        .insert([{ client_id: clientId }])
        .select('access_token')
        .single();

      if (error) {
        throw error;
      }

      setAccessToken(data.access_token);

      if (canvasRef.current && data.access_token) {
        const url = `${window.location.origin}/public/client/${data.access_token}`;
        setQrUrl(url);
        await QRCode.toCanvas(
          canvasRef.current,
          url,
          {
            width: 256,
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
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le QR code",
        variant: "destructive",
      });
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

  const handleRegenerateQR = () => {
    generateQRAccess();
  };

  if (!session) {
    return null;
  }

  // Si l'utilisateur n'est pas un superviseur ou manager, ne pas afficher le composant
  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-2 rounded-lg shadow-inner relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !accessToken ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 gap-2">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Accès restreint aux superviseurs et managers
              </p>
            </div>
          ) : null}
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Code QR unique du client
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleCopyLink}
              disabled={!accessToken || isLoading}
            >
              <Copy className="h-4 w-4" />
              Copier le lien
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRegenerateQR}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Régénérer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
