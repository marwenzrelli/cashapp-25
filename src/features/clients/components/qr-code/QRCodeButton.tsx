
import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QRCodeButtonProps {
  onClick: () => void;
  inline?: boolean;
  active?: boolean;
}

export const QRCodeButton = ({ onClick, inline = false, active = false }: QRCodeButtonProps) => {
  if (inline) {
    return (
      <Button 
        onClick={onClick} 
        size="sm" 
        className={`flex items-center justify-center gap-2 ${active ? 'bg-purple-700 hover:bg-purple-800' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
      >
        {active ? (
          <>
            <X className="h-4 w-4" />
            Fermer QR
          </>
        ) : (
          <>
            <QrCode className="h-4 w-4" />
            QR Code
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-violet-100 to-purple-50 shadow-lg border-purple-200 hover:shadow-xl transition-all rounded-lg w-full">
      <Button 
        onClick={onClick} 
        className="w-[180px] mx-auto bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 transition-all shadow-md"
        size="sm"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="text-sm">Afficher QR</span>
          </div>
          <ArrowRight className="h-3 w-3" />
        </div>
      </Button>
    </Card>
  );
};
