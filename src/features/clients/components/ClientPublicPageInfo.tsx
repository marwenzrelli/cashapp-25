
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  RefreshCcw, 
  QrCode, 
  LinkIcon, 
  InfoIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ClientQRCode } from "./ClientQRCode";

interface ClientPublicPageInfoProps {
  clientId: number;
  clientName: string;
}

export const ClientPublicPageInfo = ({ clientId, clientName }: ClientPublicPageInfoProps) => {
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const baseUrl = window.location.origin;
  const publicUrl = publicToken ? `${baseUrl}/client/public/${publicToken}` : null;
  const shortenedUrl = publicUrl ? `${baseUrl.split('//')[1]}/client/public/${publicToken.slice(0, 8)}...` : null;

  // Fetch the current access token for this client
  useEffect(() => {
    fetchClientToken();
  }, [clientId]);

  const fetchClientToken = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('qr_access')
        .select('access_token')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("No existing token found:", error);
        setPublicToken(null);
      } else {
        setPublicToken(data.access_token);
      }
    } catch (err) {
      console.error("Error fetching token:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewToken = async () => {
    try {
      setIsLoading(true);
      
      // Generate a UUID v4 token
      const newToken = crypto.randomUUID();
      
      // Store in database
      const { error } = await supabase
        .from('qr_access')
        .insert([
          { access_token: newToken, client_id: clientId }
        ]);

      if (error) {
        console.error("Error creating token:", error);
        toast.error("Erreur lors de la création du nouveau lien");
        return;
      }

      // Update state with new token
      setPublicToken(newToken);
      toast.success("Nouveau lien créé avec succès");
    } catch (err) {
      console.error("Error generating token:", err);
      toast.error("Erreur lors de la création du lien");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!publicUrl) return;
    
    navigator.clipboard.writeText(publicUrl)
      .then(() => {
        setIsCopied(true);
        toast.success("Lien copié dans le presse-papier");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error("Impossible de copier le lien:", err);
        toast.error("Erreur lors de la copie du lien");
      });
  };

  const openPublicPage = () => {
    if (publicUrl) {
      window.open(publicUrl, "_blank");
    }
  };

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Accès public au profil</p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
              Ce lien permet un accès limité au profil client sans authentification. 
              Idéal pour les partenaires ou le client lui-même.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Lien d'accès public
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            onClick={generateNewToken}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            {publicToken ? "Régénérer" : "Générer un lien"}
          </Button>
        </div>

        {publicToken ? (
          <>
            <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/50">
              <div className="flex-1 truncate text-sm font-mono">
                {shortenedUrl}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={copyToClipboard}
                    >
                      {isCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copier le lien</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={openPublicPage}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ouvrir la page</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={toggleQrCode}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Afficher le QR code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {showQrCode && (
              <div className="flex justify-center p-4 border rounded-md bg-background">
                <ClientQRCode 
                  clientId={clientId}
                  clientName={clientName}
                  size={200}
                  customUrl={publicUrl}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">
              Aucun lien d'accès public n'a encore été généré pour ce client.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
