
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw, ScanLine } from 'lucide-react';

interface QRCodeControlsProps {
  isLoading: boolean;
  accessToken: string | null;
  onCopyLink: () => void;
  onOpenLink: () => void;
  onRegenerateQR: () => void;
  onToggleQRCode: () => void;
}

export const QRCodeControls = ({
  isLoading,
  accessToken,
  onCopyLink,
  onOpenLink,
  onRegenerateQR,
  onToggleQRCode
}: QRCodeControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-sm text-center text-muted-foreground">
        Code QR permanent du client
      </p>
      <div className="flex gap-2 flex-wrap justify-center w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs flex-1"
          onClick={onCopyLink}
          disabled={!accessToken || isLoading}
        >
          <Copy className="h-3 w-3" />
          Copier le lien
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs flex-1"
          onClick={onOpenLink}
          disabled={!accessToken || isLoading}
        >
          <ExternalLink className="h-3 w-3" />
          Ouvrir le lien
        </Button>
      </div>
      <div className="flex gap-2 w-full mt-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs flex-1"
          onClick={onRegenerateQR}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Régénérer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs flex-1"
          onClick={onToggleQRCode}
        >
          <ScanLine className="h-3 w-3" />
          Cacher le QR
        </Button>
      </div>
    </div>
  );
};
