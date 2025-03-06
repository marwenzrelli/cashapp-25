
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, Shield } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  isLoading: boolean;
  accessToken: string | null;
  size: number;
}

export const QRCodeDisplay = ({ url, isLoading, accessToken, size }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderQRCode = async () => {
      if (canvasRef.current && url) {
        await QRCode.toCanvas(
          canvasRef.current,
          url,
          {
            width: size,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }
        );
      }
    };

    renderQRCode();
  }, [url, size]);

  return (
    <div className="bg-white p-3 rounded-lg shadow-inner relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !accessToken ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 gap-2">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Chargement du QR code...
          </p>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="rounded-lg" width={size} height={size} />
    </div>
  );
};
