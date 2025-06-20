
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisData {
  type: string;
  nombre?: number;
  nombre_clients?: number;
  total?: number;
  solde_total?: number;
}

export const TreasuryAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      console.log("Démarrage de l'analyse de trésorerie...");

      // Requête 1: Totaux des opérations
      const { data: operationsData, error: operationsError } = await supabase.rpc('run_sql', {
        query: `
          SELECT 
            'Versements' as type,
            COUNT(*) as nombre,
            SUM(amount) as total
          FROM deposits 
          WHERE status = 'completed'
          
          UNION ALL
          
          SELECT 
            'Retraits' as type,
            COUNT(*) as nombre,
            SUM(amount) as total
          FROM withdrawals 
          WHERE status = 'completed'
          
          UNION ALL
          
          SELECT 
            'Virements' as type,
            COUNT(*) as nombre,
            SUM(amount) as total
          FROM transfers 
          WHERE status = 'completed'
          
          UNION ALL
          
          SELECT 
            'Opérations directes' as type,
            COUNT(*) as nombre,
            SUM(amount) as total
          FROM direct_operations 
          WHERE status = 'completed';
        `
      });

      // Requête directe alternative sans RPC
      const [depositsResult, withdrawalsResult, transfersResult, clientsResult] = await Promise.all([
        supabase.from('deposits').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('amount').eq('status', 'completed'),
        supabase.from('transfers').select('amount').eq('status', 'completed'),
        supabase.from('clients').select('solde').eq('status', 'active')
      ]);

      if (depositsResult.error) throw depositsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;
      if (transfersResult.error) throw transfersResult.error;
      if (clientsResult.error) throw clientsResult.error;

      // Calculs manuels
      const depositsTotal = depositsResult.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const depositsCount = depositsResult.data?.length || 0;
      
      const withdrawalsTotal = withdrawalsResult.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const withdrawalsCount = withdrawalsResult.data?.length || 0;
      
      const transfersTotal = transfersResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const transfersCount = transfersResult.data?.length || 0;
      
      const clientsTotal = clientsResult.data?.reduce((sum, c) => sum + Number(c.solde), 0) || 0;
      const clientsCount = clientsResult.data?.length || 0;

      // Requêtes pour les opérations en attente et supprimées
      const [pendingDeposits, pendingWithdrawals, deletedDeposits, deletedWithdrawals] = await Promise.all([
        supabase.from('deposits').select('amount').neq('status', 'completed'),
        supabase.from('withdrawals').select('amount').neq('status', 'completed'),
        supabase.from('deleted_deposits').select('amount'),
        supabase.from('deleted_withdrawals').select('amount')
      ]);

      const pendingDepositsTotal = pendingDeposits.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const pendingWithdrawalsTotal = pendingWithdrawals.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const deletedDepositsTotal = deletedDeposits.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const deletedWithdrawalsTotal = deletedWithdrawals.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      const analysisResults: AnalysisData[] = [
        { type: 'Versements complétés', nombre: depositsCount, total: depositsTotal },
        { type: 'Retraits complétés', nombre: withdrawalsCount, total: withdrawalsTotal },
        { type: 'Virements complétés', nombre: transfersCount, total: transfersTotal },
        { type: 'Solde total clients', nombre_clients: clientsCount, solde_total: clientsTotal },
        { type: 'Versements en attente', nombre: pendingDeposits.data?.length || 0, total: pendingDepositsTotal },
        { type: 'Retraits en attente', nombre: pendingWithdrawals.data?.length || 0, total: pendingWithdrawalsTotal },
        { type: 'Versements supprimés', nombre: deletedDeposits.data?.length || 0, total: deletedDepositsTotal },
        { type: 'Retraits supprimés', nombre: deletedWithdrawals.data?.length || 0, total: deletedWithdrawalsTotal }
      ];

      setAnalysisData(analysisResults);

      // Calculs de vérification
      const treasuryBalance = depositsTotal - withdrawalsTotal;
      const difference = Math.abs(treasuryBalance - clientsTotal);

      console.log("=== ANALYSE DE TRÉSORERIE ===");
      console.log(`Versements: ${depositsCount} opérations, ${depositsTotal} TND`);
      console.log(`Retraits: ${withdrawalsCount} opérations, ${withdrawalsTotal} TND`);
      console.log(`Solde trésorerie calculé: ${treasuryBalance} TND`);
      console.log(`Solde total clients: ${clientsTotal} TND`);
      console.log(`Différence: ${difference} TND`);
      
      if (pendingDepositsTotal > 0 || pendingWithdrawalsTotal > 0) {
        console.log(`Opérations en attente - Versements: ${pendingDepositsTotal} TND, Retraits: ${pendingWithdrawalsTotal} TND`);
      }
      
      if (deletedDepositsTotal > 0 || deletedWithdrawalsTotal > 0) {
        console.log(`Opérations supprimées - Versements: ${deletedDepositsTotal} TND, Retraits: ${deletedWithdrawalsTotal} TND`);
      }

      toast.success("Analyse de trésorerie terminée - Vérifiez la console pour les détails");

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse de trésorerie');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Analyse de Trésorerie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={runAnalysis}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyse en cours...' : 'Analyser les écarts'}
          </Button>
        </div>

        {analysisData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {analysisData.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.type}</span>
                  <div className="text-right">
                    {item.nombre !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {item.nombre} opération{item.nombre > 1 ? 's' : ''}
                      </div>
                    )}
                    {item.nombre_clients !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {item.nombre_clients} client{item.nombre_clients > 1 ? 's' : ''}
                      </div>
                    )}
                    {item.total !== undefined && (
                      <div className="font-semibold">
                        {formatAmount(item.total)}
                      </div>
                    )}
                    {item.solde_total !== undefined && (
                      <div className="font-semibold">
                        {formatAmount(item.solde_total)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Analyse des écarts
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Cette analyse compare le solde de trésorerie (versements - retraits) avec le solde total des clients.
                Les écarts peuvent provenir d'opérations en attente, supprimées, ou de problèmes de synchronisation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
