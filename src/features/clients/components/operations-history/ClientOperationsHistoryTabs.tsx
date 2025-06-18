
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { DirectOperationsTab } from "./DirectOperationsTab";
import { Operation } from "@/features/operations/types";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
  currency: string;
  isPublicView?: boolean;
  clientName?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const ClientOperationsHistoryTabs = ({ 
  filteredOperations, 
  currency,
  isPublicView = false,
  clientName,
  updateOperation,
  onOperationDeleted
}: ClientOperationsHistoryTabsProps) => {
  const deposits = filteredOperations.filter(op => op.type === 'deposit');
  const withdrawals = filteredOperations.filter(op => op.type === 'withdrawal');
  const transfers = filteredOperations.filter(op => op.type === 'transfer');
  const directOperations = filteredOperations.filter(op => op.type === 'direct_transfer');

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="deposits">Dépôts</TabsTrigger>
        <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
        <TabsTrigger value="transfers">Transferts</TabsTrigger>
        <TabsTrigger value="direct">Directes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <AllOperationsTab 
          operations={filteredOperations} 
          currency={currency}
          isPublicView={isPublicView}
          clientName={clientName}
          updateOperation={updateOperation}
          onOperationDeleted={onOperationDeleted}
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
      
      <TabsContent value="direct" className="space-y-4">
        <DirectOperationsTab 
          operations={directOperations} 
          currency={currency}
          isPublicView={isPublicView}
          updateOperation={updateOperation}
          onOperationDeleted={onOperationDeleted}
        />
      </TabsContent>
    </Tabs>
  );
};
