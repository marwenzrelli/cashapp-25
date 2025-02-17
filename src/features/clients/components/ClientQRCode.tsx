
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
}

export const ClientQRCode = ({ clientId, clientName }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [qrUrl, setQrUrl] = useState<string>('');

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
      } catch (error) {
        console.error("Erreur lors de la génération du QR code:", error);
      }
    };

    generateQRAccess();
  }, [clientId, clientName]);

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

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-2 rounded-lg shadow-inner">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Code QR unique du client
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4" />
            Copier le lien
          </Button>
        </div>
      </div>
    </Card>
  );
};
