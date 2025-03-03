
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Cette page n'existe pas
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          L'URL <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.pathname}</span> n'a pas été trouvée.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/dashboard">
              Aller au tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              Retourner à la page de connexion
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
