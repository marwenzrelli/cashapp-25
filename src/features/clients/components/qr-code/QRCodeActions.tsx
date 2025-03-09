
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QRCodeActionsProps {
  qrUrl: string;
  accessToken: string | null;
  isLoading: boolean;
  onRegenerateQR: () => void;
}

export const QRCodeActions = ({
  qrUrl,
  accessToken,
  isLoading,
  onRegenerateQR
}: QRCodeActionsProps) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success("Le lien du QR code a été copié dans le presse-papier.", {
        duration: 3000
      });
    } catch (error) {
      toast.error("Impossible de copier le lien.");
    }
  };

  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      toast.error("Le lien n'est pas encore disponible.");
    }
  };

  return (
    <div className="flex gap-1 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 h-8 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-1" 
        onClick={handleCopyLink} 
        disabled={!accessToken || isLoading}
      >
        <Copy className="h-3 w-3" />
        <span className="text-xs">Copier</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 h-8 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-1" 
        onClick={handleOpenLink} 
        disabled={!accessToken || isLoading}
      >
        <ExternalLink className="h-3 w-3" />
        <span className="text-xs">Ouvrir</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={cn(
          "flex-1 h-8 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-1", 
          isLoading && "animate-pulse"
        )} 
        onClick={onRegenerateQR} 
        disabled={isLoading}
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="text-xs">Refresh</span>
      </Button>
    </div>
  );
};
