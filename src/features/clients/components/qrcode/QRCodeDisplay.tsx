
import { useRef, useEffect } from 'react';
import { RefreshCw, Shield } from 'lucide-react';

interface QRCodeDisplayProps {
  accessToken: string | null;
  isLoading: boolean;
  size: number;
  onGenerateQR: (canvasElement: HTMLCanvasElement | null) => void;
}

export const QRCodeDisplay = ({ accessToken, isLoading, size, onGenerateQR }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onGenerateQR(canvasRef.current);
  }, [onGenerateQR]);

  return (
    <div className="bg-white p-2 rounded-lg shadow-inner relative">
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
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
};
