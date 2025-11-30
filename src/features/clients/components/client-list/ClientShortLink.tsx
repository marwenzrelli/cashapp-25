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
      <div className="bg-white dark:bg-gray-800/60 rounded px-2 py-1">
        <p className="text-xs text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded px-2 py-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground mr-1">Accès:</span>
        <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded">
          {token}
        </code>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-muted"
          onClick={handleCopyLink}
          title="Copier le lien"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-muted"
          onClick={handleOpenLink}
          title="Ouvrir le lien"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
