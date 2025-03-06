
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { QRCodeDisplay } from './qrcode/QRCodeDisplay';
import { QRCodeControls } from './qrcode/QRCodeControls';
import { QRCodeToggleButton } from './qrcode/QRCodeToggleButton';
import { useClientQRCode } from '../hooks/useClientQRCode';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({ clientId, clientName, size = 256 }: ClientQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    accessToken,
    qrUrl,
    isLoading,
    showQRCode,
    hasAccess,
    session,
    handleCopyLink,
    handleOpenLink,
    handleRegenerateQR,
    toggleQRCode
  } = useClientQRCode(clientId, clientName, size);

  if (!session) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200 shadow-lg hover:shadow-xl transition-all">
      <div className="flex flex-col items-center gap-3">
        {!showQRCode ? (
          <QRCodeToggleButton onClick={toggleQRCode} />
        ) : (
          <>
            <QRCodeDisplay 
              url={qrUrl}
              isLoading={isLoading}
              accessToken={accessToken}
              size={size}
            />
            <QRCodeControls
              isLoading={isLoading}
              accessToken={accessToken}
              onCopyLink={handleCopyLink}
              onOpenLink={handleOpenLink}
              onRegenerateQR={handleRegenerateQR}
              onToggleQRCode={toggleQRCode}
            />
          </>
        )}
      </div>
    </Card>
  );
};
