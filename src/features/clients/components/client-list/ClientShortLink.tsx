import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ClientShortLinkProps {
  clientId: number;
}

export const ClientShortLink = ({ clientId }: ClientShortLinkProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase
          .from('qr_access')
          .select('access_token')
          .eq('client_id', clientId)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setToken(data.access_token);
        } else {
          // Créer un nouveau token court si aucun n'existe
          const generateShortToken = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let token = '';
            for (let i = 0; i < 10; i++) {
              token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return token;
          };

          const newToken = generateShortToken();
          const { data: newData, error: insertError } = await supabase
            .from('qr_access')
            .insert({
              client_id: clientId,
              expires_at: null,
              access_token: newToken
            })
            .select('access_token')
            .single();

          if (insertError) throw insertError;
          setToken(newData.access_token);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [clientId]);

  const handleCopyLink = async () => {
    if (!token) return;
    const url = `${window.location.origin}/public/client/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié!", { duration: 2000 });
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handleOpenLink = () => {
    if (!token) return;
    const url = `${window.location.origin}/public/client/${token}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <span className="text-xs text-muted-foreground">Accès: Chargement...</span>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <span className="text-xs text-muted-foreground">
      Accès: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{token}</code>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-muted ml-1 inline-flex"
        onClick={handleCopyLink}
        title="Copier le lien"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-muted ml-0.5 inline-flex"
        onClick={handleOpenLink}
        title="Ouvrir le lien"
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
    </span>
  );
};
