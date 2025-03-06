
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface QRCodeToggleButtonProps {
  onClick: () => void;
}

export const QRCodeToggleButton = ({ onClick }: QRCodeToggleButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 gap-2"
    >
      <QrCode className="h-4 w-4" />
      Afficher le QR Code du client
    </Button>
  );
};
