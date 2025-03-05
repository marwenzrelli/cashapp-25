
import { Card } from '@/components/ui/card';
import { useClientQRCode } from '../hooks/useClientQRCode';
import { QRCodeDisplay } from './qr-code/QRCodeDisplay';
import { QRCodeActions } from './qr-code/QRCodeActions';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({ clientId, clientName, size = 256 }: ClientQRCodeProps) => {
  const {
    accessToken,
    qrUrl,
    isLoading,
    hasAccess,
    session,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink
  } = useClientQRCode(clientId, clientName);

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
          qrUrl={qrUrl} 
          isLoading={isLoading} 
          size={size} 
        />
        <QRCodeActions 
          accessToken={accessToken}
          isLoading={isLoading}
          onCopyLink={handleCopyLink}
          onOpenLink={handleOpenLink}
          onRegenerateQR={generateQRAccess}
        />
      </div>
    </Card>
  );
};
