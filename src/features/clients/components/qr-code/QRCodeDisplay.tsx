
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, RefreshCw, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQRCodeGeneration } from "../../hooks/useQRCodeGeneration";

interface QRCodeDisplayProps {
  isLoading: boolean;
  accessToken: string | null;
  qrUrl: string;
  clientName: string;
  size: number;
  onHide: () => void;
  onCopyLink: () => Promise<void>;
  onOpenLink: () => void;
  onRegenerate: () => void;
}

export const QRCodeDisplay = ({
  isLoading,
  accessToken,
  qrUrl,
  clientName,
  size,
  onHide,
  onCopyLink,
  onOpenLink,
  onRegenerate
}: QRCodeDisplayProps) => {
  const { canvasRef, generateQRCode } = useQRCodeGeneration();

  useEffect(() => {
    if (qrUrl) {
      generateQRCode(qrUrl, size);
    }
  }, [qrUrl, size, generateQRCode]);

  return (
    <Card className="p-4 bg-gradient-to-br from-violet-100 to-purple-50 shadow-lg border-purple-200 hover:shadow-xl transition-all w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="bg-white p-3 rounded-2xl shadow-inner relative w-full max-w-[230px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : !accessToken ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
              <Shield className="h-8 w-8 text-violet-300 mb-2" />
              <p className="text-sm text-violet-500 text-center font-medium">
                Chargement du QR code...
              </p>
            </div>
          ) : null}
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex justify-center">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm text-center text-violet-700 font-medium">
            Code QR pour {clientName}
          </p>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2" 
              onClick={onCopyLink} 
              disabled={!accessToken || isLoading}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copier</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2" 
              onClick={onOpenLink} 
              disabled={!accessToken || isLoading}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="text-xs">Ouvrir</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "flex-1 border-violet-200 hover:bg-violet-100 hover:text-violet-700 transition-all gap-2", 
                isLoading && "animate-pulse"
              )} 
              onClick={onRegenerate} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-violet-500 hover:text-violet-700 hover:bg-violet-100" 
            onClick={onHide}
          >
            Masquer le code QR
          </Button>
        </div>
      </div>
    </Card>
  );
};
