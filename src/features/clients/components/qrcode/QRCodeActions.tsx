
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface QRCodeActionsProps {
  onCopyLink: () => Promise<void>;
  onOpenLink: () => void;
  onRegenerateQR: () => void;
  accessToken: string | null;
  isLoading: boolean;
}

export const QRCodeActions = ({ 
  onCopyLink, 
  onOpenLink, 
  onRegenerateQR, 
  accessToken, 
  isLoading 
}: QRCodeActionsProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-center text-muted-foreground">
        Code QR unique du client
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
          Copier le lien
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={onOpenLink}
          disabled={!accessToken || isLoading}
        >
          <ExternalLink className="h-3 w-3" />
          Ouvrir le lien
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={onRegenerateQR}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Régénérer
        </Button>
      </div>
    </div>
  );
};
