import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}
export const ClientQRCode = ({
  clientId,
  clientName,
  size = 200
}: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(false);
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
  const generateQRAccess = async () => {
    if (!session || !hasAccess) return;
    try {
      setIsLoading(true);
      console.log("Starting QR code generation for client ID:", clientId);
      const {
        data: existingTokens,
        error: fetchError
      } = await supabase.from('qr_access').select('access_token').eq('client_id', clientId).limit(1);
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
        
        // Generate a short 10-character token
        const generateShortToken = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let token = '';
          for (let i = 0; i < 10; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return token;
        };
        
        const newToken = generateShortToken();
        const {
          data,
          error
        } = await supabase.from('qr_access').insert({
          client_id: clientId,
          expires_at: null,
          access_token: newToken
        }).select('access_token').single();
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
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success("Le lien du QR code a été copié dans le presse-papier.", {
        duration: 3000
      });
    } catch (error) {
      toast.error("Impossible de copier le lien.");
    }
  };
  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      toast.error("Le lien n'est pas encore disponible.");
    }
  };
  const handleRegenerateQR = async () => {
    if (!session || !hasAccess) return;
    
    try {
      setIsLoading(true);
      
      // Delete existing tokens for this client
      const { error: deleteError } = await supabase
        .from('qr_access')
        .delete()
        .eq('client_id', clientId);
      
      if (deleteError) {
        console.error("Error deleting old tokens:", deleteError);
        toast.error("Erreur lors de la suppression de l'ancien token");
        setIsLoading(false);
        return;
      }
      
      // Reset state
      setAccessToken(null);
      setQrUrl('');
      
      // Generate new short token
      await generateQRAccess();
      
      toast.success("Nouveau code court généré!", { duration: 3000 });
    } catch (error) {
      console.error("Error regenerating QR:", error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsLoading(false);
    }
  };
  if (!session) {
    return null;
  }
  if (!hasAccess && !roleCheckError) {
    return null;
  }
  return <div className="flex flex-col space-y-4">
      {/* QR Code Frame */}
      <Card className="p-4 bg-gradient-to-br from-violet-100 to-purple-50 shadow-lg border-purple-200 hover:shadow-xl transition-all w-full mx-px px-[62px]">
        <div className="bg-white p-3 rounded-2xl shadow-inner relative w-full max-w-[200px] mx-auto">
          {isLoading ? <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div> : !accessToken ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <div className="h-8 w-8 text-violet-300 mb-2 rounded border-2 border-violet-300" />
              <p className="text-sm text-violet-500 text-center font-medium">
                Chargement du QR code...
              </p>
            </div> : null}
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex justify-center">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center mt-2 space-y-2">
          <p className="text-sm text-center text-violet-700 font-medium">
            Code QR pour {clientName}
          </p>
          {accessToken && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-violet-500/70">Code d'accès:</p>
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-violet-200">
                <code className="text-lg font-mono font-bold text-violet-700 tracking-wider">
                  {accessToken}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-violet-100"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(accessToken);
                      toast.success("Code copié!", { duration: 2000 });
                    } catch {
                      toast.error("Impossible de copier");
                    }
                  }}
                >
                  <span className="text-xs">📋</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Action Buttons Outside QR Code Frame */}
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all" onClick={handleCopyLink} disabled={!accessToken || isLoading}>
          <span className="text-xs">Copier</span>
        </Button>
        
        <Button variant="outline" size="sm" className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all" onClick={handleOpenLink} disabled={!accessToken || isLoading}>
          <span className="text-xs">Ouvrir</span>
        </Button>
        
        <Button variant="outline" size="sm" className={cn("flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all", isLoading && "animate-pulse")} onClick={handleRegenerateQR} disabled={isLoading}>
          <span className="text-xs">Refresh</span>
        </Button>
      </div>
    </div>;
};