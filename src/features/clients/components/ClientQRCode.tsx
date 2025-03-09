
import { useState, useEffect } from 'react';
import { useQRCodeAccess } from '../hooks/useQRCodeAccess';
import { QRCodeButton } from './qr-code/QRCodeButton';
import { QRCodeDisplay } from './qr-code/QRCodeDisplay';

interface ClientQRCodeProps {
  clientId: number;
  clientName: string;
  size?: number;
  buttonOnly?: boolean;
}

export const ClientQRCode = ({
  clientId,
  clientName,
  size = 256,
  buttonOnly = false
}: ClientQRCodeProps) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const {
    accessToken,
    qrUrl,
    isLoading,
    session,
    hasAccess,
    roleCheckError,
    generateQRAccess,
    handleCopyLink,
    handleOpenLink,
    handleRegenerateQR
  } = useQRCodeAccess(clientId);

  useEffect(() => {
    if (session && hasAccess && showQrCode) {
      generateQRAccess(clientId);
    }
  }, [clientId, session, hasAccess, showQrCode, generateQRAccess]);

  if (!session) {
    return null;
  }

  if (!hasAccess && !roleCheckError) {
    return null;
  }

  if (!showQrCode) {
    return <QRCodeButton onClick={() => setShowQrCode(true)} inline={buttonOnly} />;
  }

  if (buttonOnly) {
    // If in button-only mode and QR code is shown, reset to button view
    // This creates toggle behavior for the QR button when inline with other buttons
    return <QRCodeButton onClick={() => setShowQrCode(false)} active={true} inline={true} />;
  }

  return (
    <QRCodeDisplay
      isLoading={isLoading}
      accessToken={accessToken}
      qrUrl={qrUrl}
      clientName={clientName}
      size={size}
      onHide={() => setShowQrCode(false)}
      onCopyLink={handleCopyLink}
      onOpenLink={handleOpenLink}
      onRegenerate={handleRegenerateQR}
    />
  );
};
