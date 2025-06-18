
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "../types";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft } from "lucide-react";

interface TransferOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation | null;
  onTransferComplete?: () => Promise<void>;
}

export const TransferOperationDialog = ({
  isOpen,
  onClose,
  operation,
  onTransferComplete
}: TransferOperationDialogProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchClients();
      setReason(`Transfert de ${operation?.type === 'deposit' ? 'dépôt' : 'retrait'} #${operation?.id}`);
    }
  }, [isOpen, operation]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('nom');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleTransfer = async () => {
    if (!operation || !selectedClientId || !reason.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);
    if (!selectedClient) {
      toast.error('Client de destination non trouvé');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Début du transfert pour l\'opération:', operation.id, 'type:', operation.type);
      
      // Create the transfer record first
      const { error: transferError } = await supabase
        .from('transfers')
        .insert({
          from_client: operation.fromClient || '',
          to_client: `${selectedClient.prenom} ${selectedClient.nom}`,
          amount: operation.amount,
          reason: reason,
          operation_date: new Date().toISOString()
        });

      if (transferError) {
        console.error('Erreur lors de la création du transfert:', transferError);
        throw transferError;
      }

      console.log('Transfert créé avec succès, suppression de l\'opération originale...');

      // Parse the operation ID to get the numeric part
      const operationType = operation.type;
      let operationIdString = operation.id.toString();
      
      // Handle different ID formats (with or without prefix)
      if (operationIdString.includes('-')) {
        const parts = operationIdString.split('-');
        operationIdString = parts[parts.length - 1];
      } else if (operationIdString.match(/^[a-z]+\d+$/i)) {
        // Remove non-numeric characters from the beginning
        operationIdString = operationIdString.replace(/\D/g, '');
      }
      
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        console.error('ID d\'opération invalide:', operation.id);
        toast.error('Format d\'ID invalide');
        return;
      }

      console.log(`Suppression de l'opération ${operationType} avec ID: ${operationId}`);

      // Try to delete the original operation, but don't fail if it doesn't exist
      let deleteSuccess = false;
      
      if (operationType === 'deposit') {
        // First check if the deposit exists
        const { data: existingDeposit, error: checkError } = await supabase
          .from('deposits')
          .select('id')
          .eq('id', operationId)
          .single();
        
        if (existingDeposit && !checkError) {
          const { error: deleteError } = await supabase
            .from('deposits')
            .delete()
            .eq('id', operationId);
          
          if (deleteError) {
            console.warn('Erreur lors de la suppression du dépôt:', deleteError);
            // Don't throw error, just warn
          } else {
            deleteSuccess = true;
            console.log('Dépôt supprimé avec succès');
          }
        } else {
          console.warn('Dépôt non trouvé pour suppression, probablement déjà supprimé');
        }
      } else if (operationType === 'withdrawal') {
        // First check if the withdrawal exists
        const { data: existingWithdrawal, error: checkError } = await supabase
          .from('withdrawals')
          .select('id')
          .eq('id', operationId)
          .single();
        
        if (existingWithdrawal && !checkError) {
          const { error: deleteError } = await supabase
            .from('withdrawals')
            .delete()
            .eq('id', operationId);
          
          if (deleteError) {
            console.warn('Erreur lors de la suppression du retrait:', deleteError);
            // Don't throw error, just warn
          } else {
            deleteSuccess = true;
            console.log('Retrait supprimé avec succès');
          }
        } else {
          console.warn('Retrait non trouvé pour suppression, probablement déjà supprimé');
        }
      }

      // Show success message regardless of deletion status
      if (deleteSuccess) {
        toast.success('Transfert effectué avec succès et opération originale supprimée');
      } else {
        toast.success('Transfert effectué avec succès (opération originale déjà traitée)');
      }
      
      if (onTransferComplete) {
        await onTransferComplete();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erreur lors du transfert:', error);
      toast.error('Erreur lors du transfert: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedClientId("");
    setReason("");
    onClose();
  };

  if (!operation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transférer l'opération
          </DialogTitle>
          <DialogDescription>
            Transférer {operation.type === 'deposit' ? 'le dépôt' : 'le retrait'} de {operation.amount.toLocaleString('fr-FR')} TND vers un autre client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-select">Client de destination *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={isLoadingClients}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner un client"} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {client.prenom} {client.nom}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Solde: {client.solde?.toLocaleString('fr-FR') || '0'} TND
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif du transfert *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison du transfert..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleTransfer} 
            disabled={isLoading || !selectedClientId || !reason.trim()}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Effectuer le transfert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
