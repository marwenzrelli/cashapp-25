
import React from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
  currency?: string;
}

export const ClientOperationsHistoryTabs = ({
  filteredOperations,
  currency = "TND"
}: ClientOperationsHistoryTabsProps) => {
  // Count operations by type
  const depositsCount = filteredOperations.filter(op => op.type === "deposit").length;
  const withdrawalsCount = filteredOperations.filter(op => op.type === "withdrawal").length;
  const transfersCount = filteredOperations.filter(op => op.type === "transfer").length;

  // Detect if on mobile
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Navigation des onglets dans un espace séparé */}
      <div className="mt-2 px-2 sm:px-4 py-2 bg-muted/20 rounded-md">
        <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-2 w-full' : 'flex flex-wrap'} gap-2 bg-transparent`}>
          <TabsTrigger value="all" className="flex items-center justify-center gap-2 py-1.5 text-xs">
            <List className="h-3 w-3" />
            {isMobile ? 'Tout' : 'Toutes les opérations'}
            <Badge variant="secondary" className="ml-1">{filteredOperations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="deposits" className="flex items-center justify-center gap-2 py-1.5 text-xs">
            <ArrowUpCircle className="h-3 w-3" />
            Versements
            <Badge variant="secondary" className="ml-1">{depositsCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center justify-center gap-2 py-1.5 text-xs">
            <ArrowDownCircle className="h-3 w-3" />
            Retraits
            <Badge variant="secondary" className="ml-1">{withdrawalsCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center justify-center gap-2 py-1.5 text-xs">
            <RefreshCcw className="h-3 w-3" />
            Virements
            <Badge variant="secondary" className="ml-1">{transfersCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <Separator className="my-2" />

      {/* Sections de contenu */}
      <Card className="shadow-sm border-0 rounded-none">
        <CardContent className="p-0 sm:p-0">
          <TabsContent value="all" className="w-full m-0">
            <AllOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="deposits" className="w-full m-0">
            <DepositOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="withdrawals" className="w-full m-0">
            <WithdrawalOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="transfers" className="w-full m-0">
            <TransferOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
