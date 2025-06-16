
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { Operation } from "@/features/operations/types";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
  currency: string;
  isPublicView?: boolean;
}

export const ClientOperationsHistoryTabs = ({ 
  filteredOperations, 
  currency,
  isPublicView = false 
}: ClientOperationsHistoryTabsProps) => {
  const deposits = filteredOperations.filter(op => op.type === 'deposit');
  const withdrawals = filteredOperations.filter(op => op.type === 'withdrawal');
  const transfers = filteredOperations.filter(op => op.type === 'transfer');

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="deposits">Dépôts</TabsTrigger>
        <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
        <TabsTrigger value="transfers">Transferts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <AllOperationsTab 
          operations={filteredOperations} 
          currency={currency}
          isPublicView={isPublicView}
        />
      </TabsContent>
      
      <TabsContent value="deposits" className="space-y-4">
        <DepositOperationsTab 
          operations={deposits} 
          currency={currency}
          isPublicView={isPublicView}
        />
      </TabsContent>
      
      <TabsContent value="withdrawals" className="space-y-4">
        <WithdrawalOperationsTab 
          operations={withdrawals} 
          currency={currency}
          isPublicView={isPublicView}
        />
      </TabsContent>
      
      <TabsContent value="transfers" className="space-y-4">
        <TransferOperationsTab 
          operations={transfers} 
          currency={currency}
          isPublicView={isPublicView}
        />
      </TabsContent>
    </Tabs>
  );
};
