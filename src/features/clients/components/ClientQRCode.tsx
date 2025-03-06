
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
  customUrl?: string | null;
}

export const ClientQRCode = ({ clientId, clientName, size = 200, customUrl = null }: ClientQRCodeProps) => {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (customUrl) {
      // Use provided custom URL directly
      generateQRCode(customUrl);
    } else {
      // Generate or fetch token for client
      generateQRCodeWithToken();
    }
  }, [clientId, customUrl]);

  const generateQRCodeWithToken = async () => {
    try {
      // Check if token already exists
      const { data: existingTokens, error: fetchError } = await supabase
        .from('qr_access')
        .select('access_token')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1);

      let accessToken;
      
      if (fetchError || !existingTokens || existingTokens.length === 0) {
        // Generate new token if none exists
        accessToken = crypto.randomUUID();
        
        const { error } = await supabase
          .from('qr_access')
          .insert([
            { access_token: accessToken, client_id: clientId }
          ]);
        
        if (error) {
          console.error("Error creating token:", error);
          return;
        }
      } else {
        // Use existing token
        accessToken = existingTokens[0].access_token;
      }

      setToken(accessToken);
      
      // Generate QR code with app URL + token
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/client/public/${accessToken}`;
      generateQRCode(publicUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  if (!qrDataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="animate-pulse bg-muted rounded-md"
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrDataUrl} 
        alt={`QR Code pour ${clientName}`} 
        width={size} 
        height={size} 
        className="rounded-md"
      />
      <p className="text-xs text-muted-foreground mt-2">
        {customUrl ? "Lien d'accès public" : "QR Code d'accès"}
      </p>
    </div>
  );
};
