
import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useQRCodeAuth } from '../hooks/useQRCodeAuth';
import { useQRCodeGenerator } from '../hooks/useQRCodeGenerator';
import { QRCodeCanvas } from './qr-code/QRCodeCanvas';
import { QRCodeActions } from './qr-code/QRCodeActions';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({ clientId, clientName, size = 256 }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { session, hasAccess } = useQRCodeAuth();
  
  const { 
    accessToken, 
    qrUrl, 
    isLoading, 
    generateQRAccess 
  } = useQRCodeGenerator({
    clientId,
    canvasRef,
    session,
    hasAccess
  });

  useEffect(() => {
    if (session && hasAccess) {
      generateQRAccess();
    }
  }, [clientId, clientName, session, hasAccess]);

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-4 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <QRCodeCanvas 
          canvasRef={canvasRef}
          isLoading={isLoading}
          accessToken={accessToken}
          size={size}
        />
        <QRCodeActions
          qrUrl={qrUrl}
          accessToken={accessToken}
          isLoading={isLoading}
          onRegenerate={generateQRAccess}
        />
      </div>
    </Card>
  );
};
