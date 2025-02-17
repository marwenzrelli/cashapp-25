
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
}

export const ClientQRCode = ({ clientId, clientName }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const generateQRAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('qr_access')
          .insert([{ client_id: clientId }])
          .select('access_token')
          .single();

        if (error) throw error;
        setAccessToken(data.access_token);

        if (canvasRef.current && data.access_token) {
          const url = `${window.location.origin}/public/client/${data.access_token}`;
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
      } catch (error) {
        console.error("Erreur lors de la génération du QR code:", error);
      }
    };

    generateQRAccess();
  }, [clientId, clientName]);

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-2 rounded-lg shadow-inner">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Code QR unique du client
        </p>
      </div>
    </Card>
  );
};
