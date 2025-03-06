
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw, Shield, QrCode, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  const [showQRCode, setShowQRCode] = useState(false);

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

      if (canvasRef.current && data.access_token) {
        const url = `${window.location.origin}/public/client/${data.access_token}`;
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
    if (session && hasAccess && showQRCode) {
      generateQRAccess();
    }
  }, [clientId, clientName, session, hasAccess, showQRCode]);

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

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200 shadow-lg hover:shadow-xl transition-all">
      <div className="flex flex-col items-center gap-3">
        {!showQRCode ? (
          <Button 
            onClick={toggleQRCode} 
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 gap-2"
          >
            <QrCode className="h-4 w-4" />
            Afficher le QR Code du client
          </Button>
        ) : (
          <>
            <div className="bg-white p-3 rounded-lg shadow-inner relative">
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
              <canvas ref={canvasRef} className="rounded-lg" width={size} height={size} />
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="text-sm text-center text-muted-foreground">
                Code QR permanent du client
              </p>
              <div className="flex gap-2 flex-wrap justify-center w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-xs flex-1"
                  onClick={handleCopyLink}
                  disabled={!accessToken || isLoading}
                >
                  <Copy className="h-3 w-3" />
                  Copier le lien
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-xs flex-1"
                  onClick={handleOpenLink}
                  disabled={!accessToken || isLoading}
                >
                  <ExternalLink className="h-3 w-3" />
                  Ouvrir le lien
                </Button>
              </div>
              <div className="flex gap-2 w-full mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs flex-1"
                  onClick={handleRegenerateQR}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Régénérer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs flex-1"
                  onClick={toggleQRCode}
                >
                  <ScanLine className="h-3 w-3" />
                  Cacher le QR
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
