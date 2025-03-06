
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw, Shield, QrCode, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  const [showQrCode, setShowQrCode] = useState(false);

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
              dark: '#8B5CF6', // Vivid purple for the QR code
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
    if (session && hasAccess && showQrCode) {
      generateQRAccess();
    }
  }, [clientId, clientName, session, hasAccess, showQrCode]);

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

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  if (!showQrCode) {
    return (
      <Card className="p-4 bg-gradient-to-br from-violet-100 to-purple-50 shadow-lg border-purple-200 hover:shadow-xl transition-all">
        <Button 
          onClick={() => setShowQrCode(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 transition-all"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              <span>Afficher le QR code</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-violet-100 to-purple-50 shadow-lg border-purple-200 hover:shadow-xl transition-all">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-inner relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : !accessToken ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <Shield className="h-8 w-8 text-violet-300 mb-2" />
              <p className="text-sm text-violet-500 text-center font-medium">
                Chargement du QR code...
              </p>
            </div>
          ) : null}
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm text-center text-violet-700 font-medium">
            Code QR pour {clientName}
          </p>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2"
              onClick={handleCopyLink}
              disabled={!accessToken || isLoading}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copier</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2"
              onClick={handleOpenLink}
              disabled={!accessToken || isLoading}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="text-xs">Ouvrir</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2",
                isLoading && "animate-pulse"
              )}
              onClick={handleRegenerateQR}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-violet-500 hover:text-violet-700 hover:bg-violet-100"
            onClick={() => setShowQrCode(false)}
          >
            Masquer le code QR
          </Button>
        </div>
      </div>
    </Card>
  );
};
