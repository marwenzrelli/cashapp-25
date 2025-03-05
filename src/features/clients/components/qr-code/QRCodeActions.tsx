
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface QRCodeActionsProps {
  accessToken: string | null;
  isLoading: boolean;
  onCopyLink: () => void;
  onOpenLink: () => void;
  onRegenerateQR: () => void;
}

export const QRCodeActions = ({ 
  accessToken, 
  isLoading, 
  onCopyLink, 
  onOpenLink, 
  onRegenerateQR 
}: QRCodeActionsProps) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-sm text-center text-muted-foreground">
        Client's unique permanent QR code
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={onCopyLink}
          disabled={!accessToken || isLoading}
        >
          <Copy className="h-3 w-3" />
          Copy link
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={onOpenLink}
          disabled={!accessToken || isLoading}
        >
          <ExternalLink className="h-3 w-3" />
          Open link
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={onRegenerateQR}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};
