
import { useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseQRCodeGenerationProps {
  clientId: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  size: number;
}

export const useQRCodeGeneration = ({ clientId, canvasRef, size }: UseQRCodeGenerationProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateQRAccess = async () => {
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
        const newToken = crypto.randomUUID();
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

  return {
    accessToken,
    qrUrl,
    isLoading,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink
  };
};
