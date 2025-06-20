import { Operation } from "@/features/operations/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface PublicAccountFlowTabProps {
  operations: Operation[];
  client?: any;
}

export const PublicAccountFlowTab = ({
  operations,
  client
}: PublicAccountFlowTabProps) => {
  const { currency } = useCurrency();

  const processedOperations = useMemo(() => {
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    const clientId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
    
    console.log("=== DIAGNOSTIC FLUX DE COMPTE - CLIENT PROMO BET ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde en base: ${Number(client.solde).toFixed(3)} TND`);
    console.log(`Total opérations disponibles: ${operations.length}`);
    
    // Filtrage des opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      const isMatching = matchesClientId || matchesFromClientId || matchesToClientId || 
                        matchesFromClientName || matchesToClientName;
      
      if (isMatching) {
        console.log(`✓ Opération retenue: ${op.id} | Type: ${op.type} | Montant: ${op.amount} | Date: ${op.operation_date || op.date}`);
        console.log(`  - client_id: ${op.client_id}, from_client_id: ${op.from_client_id}, to_client_id: ${op.to_client_id}`);
        console.log(`  - fromClient: "${op.fromClient}", toClient: "${op.toClient}"`);
      }
      
      return isMatching;
    });
    
    console.log(`=== OPÉRATIONS FILTRÉES POUR ${clientFullName}: ${clientOperations.length} ===`);
    
    if (clientOperations.length === 0) {
      console.log("⚠️ Aucune opération trouvée");
      return [];
    }

    // Tri chronologique: plus ancien en premier
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      
      if (dateA === dateB) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA - dateB;
    });

    console.log("=== ORDRE CHRONOLOGIQUE POUR CALCUL ===");
    sortedOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss");
      console.log(`${i + 1}. [${date}] ${op.type} | ${op.amount} TND | ID: ${op.id}`);
    });

    // CALCUL CORRIGÉ DES SOLDES
    console.log("\n=== CALCUL CORRIGÉ DES SOLDES ===");
    console.log("🎯 Objectif: Calculer les soldes 'avant' et 'après' pour chaque opération");
    
    let runningBalance = 0; // Démarrage à 0 pour tous les clients
    
    const operationsWithBalance = sortedOperations.map((op, index) => {
      const balanceBefore = runningBalance;
      let impact = 0;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`ID: ${op.id} | Type: ${op.type} | Montant: ${op.amount} TND`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss")}`);
      console.log(`Solde AVANT cette opération: ${balanceBefore.toFixed(3)} TND`);
      
      // CALCUL DE L'IMPACT - logique corrigée
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          console.log(`📥 DÉPÔT: +${impact} TND (ajout au solde)`);
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          console.log(`📤 RETRAIT: ${impact} TND (soustraction du solde)`);
          break;
          
        case "transfer":
          // Vérifier si ce client envoie ou reçoit
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 VIREMENT REÇU: +${impact} TND (de: ${op.fromClient || 'N/A'})`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 VIREMENT ENVOYÉ: ${impact} TND (vers: ${op.toClient || 'N/A'})`);
          } else {
            console.log(`⚠️ TRANSFERT: Ni expéditeur ni destinataire détecté pour ce client`);
          }
          break;
          
        case "direct_transfer":
          // Vérifier si ce client envoie ou reçoit
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 TRANSFERT DIRECT REÇU: +${impact} TND (de: ${op.fromClient || 'N/A'})`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 TRANSFERT DIRECT ENVOYÉ: ${impact} TND (vers: ${op.toClient || 'N/A'})`);
          } else {
            console.log(`⚠️ TRANSFERT DIRECT: Ni expéditeur ni destinataire détecté pour ce client`);
          }
          break;
          
        default:
          console.log(`⚠️ Type d'opération non reconnu: ${op.type}`);
      }
      
      // Application de l'impact
      runningBalance = balanceBefore + impact;
      
      console.log(`Impact appliqué: ${impact >= 0 ? '+' : ''}${impact} TND`);
      console.log(`Solde APRÈS cette opération: ${runningBalance.toFixed(3)} TND`);
      
      return {
        ...op,
        balanceBefore: Number(balanceBefore.toFixed(3)),
        balanceAfter: Number(runningBalance.toFixed(3)),
        balanceChange: Number(impact.toFixed(3))
      };
    });

    console.log("\n=== VÉRIFICATION FINALE ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde calculé chronologiquement: ${runningBalance.toFixed(3)} TND`);
    console.log(`Solde en base de données: ${Number(client.solde).toFixed(3)} TND`);
    
    const difference = Math.abs(runningBalance - Number(client.solde));
    console.log(`Écart absolu: ${difference.toFixed(3)} TND`);
    
    if (difference > 0.01) {
      console.error("❌ INCOHÉRENCE DÉTECTÉE POUR PROMO BET!");
      console.error(`Le calcul chronologique (${runningBalance.toFixed(3)} TND) ne correspond pas au solde en base (${Number(client.solde).toFixed(3)} TND)`);
      console.error("Possible causes :");
      console.error("- Opérations manquantes");
      console.error("- Erreur dans le calcul d'impact");
      console.error("- Données incohérentes en base");
      
      // Diagnostic détaillé pour promo bet
      console.log("\n=== DIAGNOSTIC DÉTAILLÉ PROMO BET ===");
      operationsWithBalance.forEach((op, i) => {
        console.log(`${i + 1}. ${op.type} | Avant: ${op.balanceBefore} | Impact: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} | Après: ${op.balanceAfter}`);
      });
    } else {
      console.log("✅ COHÉRENCE CONFIRMÉE pour promo bet");
    }

    // Retourner en ordre inverse pour affichage (plus récent en premier)
    return [...operationsWithBalance].reverse();
  }, [operations, client]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
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

  const getAmountClass = (type: string, clientFullName: string, operation: any) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") {
      if (operation.toClient === clientFullName) return "text-green-600";
      if (operation.fromClient === clientFullName) return "text-red-600";
    }
    if (type === "direct_transfer") {
      if (operation.toClient === clientFullName) return "text-green-600";
      if (operation.fromClient === clientFullName) return "text-red-600";
    }
    return "text-blue-600";
  };

  const getAmountPrefix = (type: string, clientFullName: string, operation: any) => {
    if (type === "withdrawal") return "- ";
    if (type === "transfer" && operation.fromClient === clientFullName) return "- ";
    if (type === "direct_transfer" && operation.fromClient === clientFullName) return "- ";
    return "+ ";
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : '';

  return (
    <Card className="mt-4">
      <AccountFlowMobileView operations={processedOperations} isPublicView={true} />

      <div className="hidden md:block">
        <ScrollArea className="h-[600px] w-full rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-right">Solde avant</TableHead>
                <TableHead className="w-[120px] text-right">Montant</TableHead>
                <TableHead className="w-[150px] text-right">Solde après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Aucune opération trouvée
                  </TableCell>
                </TableRow>
              ) : (
                processedOperations.map((op: any) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">
                      {formatDateTime(op.operation_date || op.date)}
                    </TableCell>
                    <TableCell>{op.id.toString().split('-')[1] || op.id}</TableCell>
                    <TableCell>
                      <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                        {getTypeIcon(op.type)}
                        {getTypeLabel(op.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {op.description || "-"}
                    </TableCell>
                    <TableCell className={`text-right ${getBalanceClass(op.balanceBefore)}`}>
                      {formatAmount(op.balanceBefore)}
                    </TableCell>
                    <TableCell className={`text-right ${getAmountClass(op.type, clientFullName, op)}`}>
                      {getAmountPrefix(op.type, clientFullName, op)}{formatAmount(op.amount)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                      {formatAmount(op.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};
