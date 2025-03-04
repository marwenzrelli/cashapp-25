
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeActionsProps {
  qrUrl: string;
  accessToken: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const QRCodeActions = ({ qrUrl, accessToken, isLoading, onRegenerate }: QRCodeActionsProps) => {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien du QR code a été copié dans le presse-papier.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    } else {
      toast({
        title: "Erreur",
        description: "Le lien n'est pas encore disponible.",
        variant: "destructive",
      });
    }
  };

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
          onClick={handleCopyLink}
          disabled={!accessToken || isLoading}
        >
          <Copy className="h-3 w-3" />
          Copier le lien
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={handleOpenLink}
          disabled={!accessToken || isLoading}
        >
          <ExternalLink className="h-3 w-3" />
          Ouvrir le lien
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Régénérer
        </Button>
      </div>
    </div>
  );
};
