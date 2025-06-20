
import React from "react";
import { TreasuryTable } from "./TreasuryTable";
import { TreasurySummary } from "./TreasurySummary";
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
        setSystemBalance(totalClientBalance);
        
        console.log(`Solde système calculé: ${totalClientBalance} TND`);
      } catch (error) {
        console.error('Erreur lors du calcul du solde système:', error);
      }
    };

    calculateSystemBalance();
  }, [localOperations]);

  const handleDataRefresh = (newOperations: Operation[]) => {
    console.log(`TreasuryTab: Mise à jour avec ${newOperations.length} opérations`);
    setLocalOperations(newOperations);
  };

  // Calculer le solde final de trésorerie basé sur les opérations
  const finalTreasuryBalance = React.useMemo(() => {
    const deposits = localOperations.filter(op => op.type === 'deposit').reduce((sum, op) => sum + op.amount, 0);
    const withdrawals = localOperations.filter(op => op.type === 'withdrawal').reduce((sum, op) => sum + op.amount, 0);
    const treasuryBalance = deposits - withdrawals;
    
    console.log(`Calcul final - Versements: ${deposits}, Retraits: ${withdrawals}, Balance: ${treasuryBalance}`);
    return treasuryBalance;
  }, [localOperations]);

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
      />
      <TreasurySummary 
        operations={localOperations}
        finalTreasuryBalance={systemBalance}
      />
    </div>
  );
};
