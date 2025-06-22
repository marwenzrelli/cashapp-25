import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { DirectOperationsTab } from "./DirectOperationsTab";
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";

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
        <TabsTrigger 
          value="all"
          className={cn(
            "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800",
            "hover:bg-gray-50"
          )}
        >
          Toutes
        </TabsTrigger>
        <TabsTrigger 
          value="deposits"
          className={cn(
            "data-[state=active]:bg-green-100 data-[state=active]:text-green-800",
            "hover:bg-green-50"
          )}
        >
          Dépôts
        </TabsTrigger>
        <TabsTrigger 
          value="withdrawals"
          className={cn(
            "data-[state=active]:bg-red-100 data-[state=active]:text-red-800",
            "hover:bg-red-50"
          )}
        >
          Retraits
        </TabsTrigger>
        <TabsTrigger 
          value="transfers"
          className={cn(
            "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800",
            "hover:bg-blue-50"
          )}
        >
          Transferts
        </TabsTrigger>
        <TabsTrigger 
          value="direct"
          className={cn(
            "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800",
            "hover:bg-purple-50"
          )}
        >
          Directes
        </TabsTrigger>
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
