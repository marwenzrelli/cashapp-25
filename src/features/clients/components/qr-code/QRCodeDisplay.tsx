
import { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, Shield } from 'lucide-react';

interface QRCodeDisplayProps {
  accessToken: string | null;
  qrUrl: string;
  isLoading: boolean;
  size?: number;
}

export const QRCodeDisplay = ({ accessToken, qrUrl, isLoading, size = 256 }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (canvasRef.current && qrUrl) {
        try {
          await QRCode.toCanvas(
            canvasRef.current,
            qrUrl,
            {
              width: size,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            }
          );
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    if (accessToken && qrUrl) {
      generateQRCode();
    }
  }, [accessToken, qrUrl, size]);

  return (
    <div className="bg-white p-2 rounded-lg shadow-inner relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !accessToken ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Loading QR code...
          </p>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="rounded-lg" width={size} height={size} />
    </div>
  );
};
