
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
      {/* Compact tab navigation */}
      <Card className="mb-1 shadow-sm border-b rounded-b-none">
        <CardContent className="p-0">
          <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-0.5' : 'flex'} w-full gap-0.5 p-0.5 bg-transparent`}>
            <TabsTrigger value="all" className="flex items-center justify-center gap-0.5 py-1.5 text-xs sm:text-sm">
              <List className="h-3.5 w-3.5" />
              {isMobile ? 'Toutes' : 'Toutes les opérations'}
              <Badge variant="secondary" className="ml-0.5 text-xs">{filteredOperations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center justify-center gap-0.5 py-1.5 text-xs sm:text-sm">
              <ArrowUpCircle className="h-3.5 w-3.5" />
              Versements
              <Badge variant="secondary" className="ml-0.5 text-xs">{depositsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center justify-center gap-0.5 py-1.5 text-xs sm:text-sm">
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Retraits
              <Badge variant="secondary" className="ml-0.5 text-xs">{withdrawalsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center justify-center gap-0.5 py-1.5 text-xs sm:text-sm">
              <RefreshCcw className="h-3.5 w-3.5" />
              Virements
              <Badge variant="secondary" className="ml-0.5 text-xs">{transfersCount}</Badge>
            </TabsTrigger>
          </TabsList>
        </CardContent>
      </Card>

      {/* Content area with no extra padding */}
      <Card className="shadow-sm w-full">
        <CardContent className="p-0 w-full">
          <TabsContent value="all" className="w-full m-0 p-0">
            <AllOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="deposits" className="w-full m-0 p-0">
            <DepositOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="withdrawals" className="w-full m-0 p-0">
            <WithdrawalOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="transfers" className="w-full m-0 p-0">
            <TransferOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
