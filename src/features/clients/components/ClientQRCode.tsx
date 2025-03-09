
import { useState } from 'react';
import { QRCodeButton } from './qr-code/QRCodeButton';
import { QRCodeDisplay } from './qr-code/QRCodeDisplay';
import { useQRCodeAccess } from '../hooks/useQRCodeAccess';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
}

export const ClientQRCode = ({
  clientId,
  clientName,
  size = 256
}: ClientQRCodeProps) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const { session, hasAccess, roleCheckError } = useQRCodeAccess();

  if (!session) {
    return null;
  }

  if (!hasAccess && !roleCheckError) {
    return null;
  }

  if (!showQrCode) {
    return <QRCodeButton onClick={() => setShowQrCode(true)} />;
  }

  return <QRCodeDisplay 
    clientId={clientId} 
    clientName={clientName} 
    size={size} 
    onHide={() => setShowQrCode(false)} 
  />;
};
