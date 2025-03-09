
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useQRCodeGeneration } from '../hooks/useQRCodeGeneration';
import { QRCodeCanvas } from './qr-code/QRCodeCanvas';
import { QRCodeActions } from './qr-code/QRCodeActions';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({
  clientId,
  clientName,
  size = 200
}: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    accessToken,
    qrUrl,
    isLoading,
    session,
    hasAccess,
    roleCheckError,
    generateQRAccess
  } = useQRCodeGeneration({
    clientId,
    canvasRef,
    size
  });

  const handleRegenerateQR = () => {
    generateQRAccess();
  };

  if (!session) {
    return null;
  }

  if (!hasAccess && !roleCheckError) {
    return null;
  }

  return (
    <Card className="p-3 bg-gradient-to-br from-violet-100 to-purple-50 shadow-md border-purple-200 hover:shadow-lg transition-all w-full">
      <div className="flex flex-col items-center gap-3 w-full">
        <QRCodeCanvas 
          ref={canvasRef}
          isLoading={isLoading}
          accessToken={accessToken}
        />
        
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs text-center text-violet-700 font-medium">
            Code QR pour {clientName}
          </p>
          
          <QRCodeActions
            qrUrl={qrUrl}
            accessToken={accessToken}
            isLoading={isLoading}
            onRegenerateQR={handleRegenerateQR}
          />
        </div>
      </div>
    </Card>
  );
};
