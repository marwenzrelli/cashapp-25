
import { useState, RefObject } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseQRCodeGeneratorProps {
  clientId: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  session: any;
  hasAccess: boolean;
}

export const useQRCodeGenerator = ({ 
  clientId, 
  canvasRef, 
  session, 
  hasAccess 
}: UseQRCodeGeneratorProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateQRAccess = async () => {
    if (!session || !hasAccess) return;
    
    try {
      setIsLoading(true);

      // Make sure we clean up any existing tokens (but don't throw if this fails)
      try {
        const { error: cleanupError } = await supabase
          .from('qr_access')
          .update({ expires_at: new Date().toISOString() })
          .eq('client_id', clientId)
          .is('expires_at', null);
          
        if (cleanupError) {
          console.error("Error cleaning up existing tokens:", cleanupError);
        }
      } catch (cleanupErr) {
        console.error("Error during token cleanup:", cleanupErr);
        // Continue execution even if cleanup fails
      }

      // Create a new token with error handling
      const { data: newToken, error } = await supabase
        .from('qr_access')
        .insert([{ 
          client_id: clientId,
          expires_at: null
        }])
        .select('access_token')
        .single();

      if (error) {
        console.error("Error creating QR access token:", error);
        throw error;
      }
      
      if (!newToken || !newToken.access_token) {
        throw new Error("No token was generated");
      }
      
      const token = newToken.access_token;
      setAccessToken(token);

      // Generate QR code
      if (canvasRef.current && token) {
        const url = `${window.location.origin}/public/client/${token}`;
        setQrUrl(url);
        
        try {
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
        } catch (qrError) {
          console.error("Error generating QR code canvas:", qrError);
          toast({
            title: "Erreur QR",
            description: "Impossible de générer l'image du QR code",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la génération du QR code:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le QR code",
        variant: "destructive",
      });
      
      // Make sure to reset loading state even on error
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    accessToken,
    qrUrl,
    isLoading,
    generateQRAccess,
    setQrUrl
  };
};
