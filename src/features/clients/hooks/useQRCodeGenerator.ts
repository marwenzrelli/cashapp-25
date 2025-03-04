
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
        const { data: newToken, error } = await supabase
          .from('qr_access')
          .insert([{ 
            client_id: clientId,
            expires_at: null
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
            width: 256, // Default size, will be overridden by props
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

  return {
    accessToken,
    qrUrl,
    isLoading,
    generateQRAccess,
    setQrUrl
  };
};
