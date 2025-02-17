
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
}

export const ClientQRCode = ({ clientId, clientName }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify({
          id: clientId,
          name: clientName,
          timestamp: new Date().toISOString()
        }),
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      );
    }
  }, [clientId, clientName]);

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 backdrop-blur-xl border-none shadow-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl rounded-full" />
          <canvas ref={canvasRef} className="relative z-10 rounded-2xl shadow-inner" />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Code QR unique du client
        </p>
      </div>
    </Card>
  );
};
