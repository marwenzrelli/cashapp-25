
import { useState, RefObject, useEffect } from 'react';
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
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const cleanupExistingTokens = async () => {
    try {
      console.log("Cleaning up existing tokens for client:", clientId);
      const { error: cleanupError } = await supabase
        .from('qr_access')
        .update({ expires_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .is('expires_at', null);
        
      if (cleanupError) {
        console.error("Error cleaning up existing tokens:", cleanupError);
      } else {
        console.log("Successfully expired old tokens");
      }
    } catch (cleanupErr) {
      console.error("Error during token cleanup:", cleanupErr);
      // Continue execution even if cleanup fails
    }
  };

  const createNewToken = async () => {
    console.log("Creating new token for client:", clientId);
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
    
    console.log("New token created successfully");
    return newToken.access_token;
  };

  const generateQRCode = async (url: string) => {
    if (!canvasRef.current) {
      throw new Error("Canvas reference is not available");
    }
    
    try {
      console.log("Generating QR code for URL:", url);
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
      console.log("QR code generated successfully");
    } catch (qrError) {
      console.error("Error generating QR code canvas:", qrError);
      toast({
        title: "Erreur QR",
        description: "Impossible de générer l'image du QR code",
        variant: "destructive",
      });
      throw qrError;
    }
  };

  const generateQRAccess = async () => {
    if (!session || !hasAccess) {
      console.log("No session or no access, cannot generate QR");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Step 1: Clean up existing tokens
      await cleanupExistingTokens();
      
      // Step 2: Create a new token
      const token = await createNewToken();
      setAccessToken(token);
      
      // Step 3: Generate QR code with the URL
      const url = `${window.location.origin}/public/client/${token}`;
      setQrUrl(url);
      
      // Step 4: Generate the actual QR code
      await generateQRCode(url);
    } catch (error: any) {
      console.error("Erreur complète lors de la génération du QR code:", error);
      setError(error);
      setAccessToken(null);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le QR code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to auto-retry on error (but only once)
  useEffect(() => {
    if (error && canvasRef.current && session && hasAccess) {
      const timer = setTimeout(() => {
        console.log("Auto-retrying QR code generation after error");
        generateQRAccess();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [error, canvasRef.current, session, hasAccess]);

  return {
    accessToken,
    qrUrl,
    isLoading,
    error,
    generateQRAccess,
    setQrUrl
  };
};
