
import { DollarSign, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConnectionStatus } from "./types";

interface LoginCardProps {
  children: React.ReactNode;
  connectionStatus: ConnectionStatus;
}

export const LoginCard = ({ children, connectionStatus }: LoginCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] rounded-lg blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">FinanceFlow Pro</h1>
          <p className="text-gray-500">Connectez-vous à votre compte</p>
          
          {connectionStatus === 'connected' && (
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Connecté au serveur</span>
            </div>
          )}
          
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center justify-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Déconnecté du serveur</span>
            </div>
          )}
          
          {connectionStatus === 'checking' && (
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <span className="text-xs animate-pulse">Vérification de la connexion...</span>
            </div>
          )}
        </div>
        {children}
      </Card>
    </div>
  );
};
