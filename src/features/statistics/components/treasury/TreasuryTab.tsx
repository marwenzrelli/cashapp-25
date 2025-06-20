
import React from "react";
import { TreasuryTable } from "./TreasuryTable";
import { TreasuryTotals } from "./TreasuryTotals";
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";

interface TreasuryTabProps {
  operations: Operation[];
  isLoading: boolean;
}

export const TreasuryTab = ({ operations, isLoading }: TreasuryTabProps) => {
  const [localOperations, setLocalOperations] = React.useState<Operation[]>(operations);
  const [systemBalance, setSystemBalance] = React.useState<number>(0);

  // Mettre à jour les opérations locales quand les props changent
  React.useEffect(() => {
    setLocalOperations(operations);
  }, [operations]);

  // Calculer le solde système réel
  React.useEffect(() => {
    const calculateSystemBalance = async () => {
      try {
        // Récupérer le total des soldes de tous les clients
        const { data: clients, error } = await supabase
          .from('clients')
          .select('solde');

        if (error) throw error;

        const totalClientBalance = clients?.reduce((sum, client) => sum + (client.solde || 0), 0) || 0;
        console.log('Solde système calculé:', totalClientBalance);
        setSystemBalance(totalClientBalance);
      } catch (error) {
        console.error('Erreur lors du calcul du solde système:', error);
      }
    };

    calculateSystemBalance();
  }, [localOperations]);

  const handleDataRefresh = (newOperations: Operation[]) => {
    setLocalOperations(newOperations);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des données de trésorerie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TreasuryTable 
        operations={localOperations} 
        onDataRefresh={handleDataRefresh}
        systemBalance={systemBalance}
      />
      <TreasuryTotals 
        operations={localOperations}
        finalBalance={systemBalance}
      />
    </div>
  );
};
