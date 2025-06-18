
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft, Trash2 } from "lucide-react";
import { DirectOperation } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DirectOperationDialog } from "./DirectOperationDialog";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const DirectOperationsList = () => {
  const [operations, setOperations] = useState<DirectOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDirectOperations();
  }, []);

  const fetchDirectOperations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('direct_operations')
        .select('*')
        .order('operation_date', { ascending: false });

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des opérations directes:', error);
      toast.error('Erreur lors du chargement des opérations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOperation = async (operation: DirectOperation) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette opération directe ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('direct_operations')
        .delete()
        .eq('id', operation.id);

      if (error) throw error;

      toast.success('Opération directe supprimée avec succès');
      fetchDirectOperations();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy HH:mm", { locale: fr });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Opérations Directes</h2>
          <p className="text-muted-foreground">
            Gestion des opérations directes entre clients
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Opération Directe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Historique des Opérations Directes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des opérations...</p>
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-8">
              <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune opération directe enregistrée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => (
                <div
                  key={operation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Opération Directe #{operation.id}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(operation.operation_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{operation.from_client_name}</span>
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{operation.to_client_name}</span>
                    </div>
                    
                    <div className="text-lg font-semibold text-blue-600">
                      {formatAmount(operation.amount)}
                    </div>
                    
                    {operation.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {operation.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={operation.status === 'completed' ? 'default' : 'secondary'}
                      className={operation.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {operation.status === 'completed' ? 'Terminé' : operation.status}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOperation(operation)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DirectOperationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchDirectOperations}
      />
    </div>
  );
};
