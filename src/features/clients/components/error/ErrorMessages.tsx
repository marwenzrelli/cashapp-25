
import { Server, WifiOff, Network } from "lucide-react";

interface ErrorMessageProps {
  errorType: "client" | "connection" | "server" | "access";
  errorMessage: string | null;
}

export const ErrorMessages = ({ errorType, errorMessage }: ErrorMessageProps) => {
  switch (errorType) {
    case "client":
      return (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Veuillez vérifier l'URL ou contacter le support si vous pensez qu'il s'agit d'une erreur.
        </p>
      );
      
    case "server":
      return (
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2 justify-center">
            <Server className="h-4 w-4" />
            Le serveur est temporairement indisponible. Cela peut être dû à une maintenance ou à une charge élevée.
          </p>
        </div>
      );
      
    case "connection":
      return (
        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            La connexion au serveur a été interrompue. Cela peut être dû à un problème de réseau intermédiaire.
          </p>
        </div>
      );
      
    case "access":
      return (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Le lien d'accès utilisé n'est pas valide ou a expiré. Veuillez demander un nouveau lien d'accès.
        </p>
      );
      
    default:
      return (
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {errorMessage || "Impossible d'accéder au profil client. Le lien pourrait être invalide ou expiré."}
        </p>
      );
  }
};
