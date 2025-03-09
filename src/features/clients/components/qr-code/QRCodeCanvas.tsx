
import { forwardRef } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRCodeCanvasProps {
  isLoading: boolean;
  accessToken: string | null;
}

export const QRCodeCanvas = forwardRef<HTMLCanvasElement, QRCodeCanvasProps>(
  ({ isLoading, accessToken }, ref) => {
    return (
      <div className="bg-white p-2 rounded-lg shadow-inner relative w-full max-w-[180px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg z-10">
            <RefreshCw className="h-5 w-5 animate-spin text-violet-500" />
          </div>
        ) : !accessToken ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg z-10">
            <Shield className="h-6 w-6 text-violet-300 mb-1" />
            <p className="text-xs text-violet-500 text-center font-medium">
              Chargement du QR code...
            </p>
          </div>
        ) : null}
        <div className="p-1 rounded-lg bg-gradient-to-br from-violet-100 to-purple-50 flex justify-center">
          <canvas ref={ref} className="rounded-lg" />
        </div>
      </div>
    );
  }
);

QRCodeCanvas.displayName = 'QRCodeCanvas';
