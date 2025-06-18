
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { CreateDirectOperationData } from "../types";

interface DirectOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DirectOperationDialog = ({
  isOpen,
  onClose,
  onSuccess
}: DirectOperationDialogProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [fromClientId, setFromClientId] = useState<string>("");
  const [toClientId, setToClientId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

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

  const handleSubmit = async () => {
    if (!fromClientId || !toClientId || !amount) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    if (fromClientId === toClientId) {
      toast.error('Le client expéditeur et destinataire doivent être différents');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Le montant doit être un nombre positif');
      return;
    }

    const fromClient = clients.find(c => c.id.toString() === fromClientId);
    const toClient = clients.find(c => c.id.toString() === toClientId);

    if (!fromClient || !toClient) {
      toast.error('Clients non trouvés');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const operationData: CreateDirectOperationData = {
        from_client_id: parseInt(fromClientId),
        to_client_id: parseInt(toClientId),
        from_client_name: `${fromClient.prenom} ${fromClient.nom}`,
        to_client_name: `${toClient.prenom} ${toClient.nom}`,
        amount: amountNum,
        operation_date: new Date().toISOString(),
        notes: notes.trim() || null
      };

      if (session?.user?.id) {
        (operationData as any).created_by = session.user.id;
      }

      const { error } = await supabase
        .from('direct_operations')
        .insert(operationData);

      if (error) throw error;

      toast.success('Opération directe enregistrée avec succès');
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFromClientId("");
    setToClientId("");
    setAmount("");
    setNotes("");
    onClose();
  };

  const fromClient = clients.find(c => c.id.toString() === fromClientId);
  const toClient = clients.find(c => c.id.toString() === toClientId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Nouvelle Opération Directe
          </DialogTitle>
          <DialogDescription>
            Enregistrer une opération où un client donne de l'argent directement à un autre client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="from-client">Client expéditeur *</Label>
            <Select value={fromClientId} onValueChange={setFromClientId} disabled={isLoadingClients}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner le client qui donne"} />
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
            <Label htmlFor="to-client">Client destinataire *</Label>
            <Select value={toClientId} onValueChange={setToClientId} disabled={isLoadingClients}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner le client qui reçoit"} />
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
            <Label htmlFor="amount">Montant (TND) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails sur l'opération (optionnel)..."
              rows={3}
            />
          </div>

          {fromClient && toClient && amount && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Résumé de l'opération :</p>
              <p className="text-sm">
                <span className="font-medium">{fromClient.prenom} {fromClient.nom}</span>
                {' '} donne {' '}
                <span className="font-medium text-blue-600">{parseFloat(amount || '0').toLocaleString('fr-FR')} TND</span>
                {' '} à {' '}
                <span className="font-medium">{toClient.prenom} {toClient.nom}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !fromClientId || !toClientId || !amount}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer l'opération
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
