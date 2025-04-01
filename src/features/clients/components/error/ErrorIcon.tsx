
import { AlertCircle, Network, WifiOff, Server } from "lucide-react";

interface ErrorIconProps {
  errorType: "client" | "connection" | "server" | "access" | "unknown";
  isOnline: boolean;
}

export const ErrorIcon = ({ errorType, isOnline }: ErrorIconProps) => {
  return (
    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      {errorType === "connection" ? (
        !isOnline ? <WifiOff className="h-8 w-8 text-red-600 dark:text-red-500" /> : 
                    <Network className="h-8 w-8 text-red-600 dark:text-red-500" />
      ) : errorType === "server" ? (
        <Server className="h-8 w-8 text-red-600 dark:text-red-500" />
      ) : (
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
      )}
    </div>
  );
};
