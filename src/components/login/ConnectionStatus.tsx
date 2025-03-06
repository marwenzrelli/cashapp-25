
import { Wifi, WifiOff } from "lucide-react";
import { ConnectionStatus } from "@/hooks/useAuth";

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

export const ConnectionStatusIndicator = ({ status }: ConnectionStatusIndicatorProps) => {
  if (status === 'connected') {
    return (
      <div className="flex items-center justify-center gap-1 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-xs">Connecté au serveur</span>
      </div>
    );
  }
  
  if (status === 'disconnected') {
    return (
      <div className="flex items-center justify-center gap-1 text-red-600">
        <WifiOff className="h-4 w-4" />
        <span className="text-xs">Déconnecté du serveur</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center gap-1 text-amber-600">
      <span className="text-xs animate-pulse">Vérification de la connexion...</span>
    </div>
  );
};
