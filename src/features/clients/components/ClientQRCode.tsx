
import { useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useClientQRCode } from '../hooks/useClientQRCode';
import { QRCodeDisplay } from './qrcode/QRCodeDisplay';
import { QRCodeActions } from './qrcode/QRCodeActions';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({ clientId, clientName, size = 256 }: ClientQRCodeProps) => {
  const {
    accessToken,
    isLoading,
    session,
    hasAccess,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink,
    qrUrl
  } = useClientQRCode(clientId, clientName, size);

  const handleGenerateQR = useCallback((canvasElement: HTMLCanvasElement | null) => {
    generateQRAccess(canvasElement);
  }, [generateQRAccess]);

  const handleRegenerateQR = useCallback(() => {
    const canvasElement = document.querySelector('canvas');
    generateQRAccess(canvasElement);
  }, [generateQRAccess]);

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-4 bg-white shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <QRCodeDisplay 
          accessToken={accessToken}
          isLoading={isLoading}
          size={size}
          onGenerateQR={handleGenerateQR}
        />
        <QRCodeActions
          onCopyLink={handleCopyLink}
          onOpenLink={handleOpenLink}
          onRegenerateQR={handleRegenerateQR}
          accessToken={accessToken}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
};
