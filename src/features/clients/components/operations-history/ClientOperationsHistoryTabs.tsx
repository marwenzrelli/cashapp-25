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
  return <Tabs defaultValue="all" className="w-full">
      {/* Separate card for tabs on mobile */}
      <Card className="mb-4 shadow-sm my-0 py-0 px-0 mx-0">
        <CardContent className="p-1 sm:p-2 px-0 py-0 mx-0">
          <div className="flex flex-wrap items-center py-0 px-0">
            <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-2 w-full' : 'flex flex-wrap'} gap-2`}>
              <TabsTrigger value="all" className="flex items-center justify-center gap-2 py-3">
                <List className="h-4 w-4" />
                {isMobile ? 'Toutes' : 'Toutes les opérations'}
                <Badge variant="secondary" className="ml-1">{filteredOperations.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="deposits" className="flex items-center justify-center gap-2 py-3">
                <ArrowUpCircle className="h-4 w-4" />
                Versements
                <Badge variant="secondary" className="ml-1">{depositsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center justify-center gap-2 py-3">
                <ArrowDownCircle className="h-4 w-4" />
                Retraits
                <Badge variant="secondary" className="ml-1">{withdrawalsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center justify-center gap-2 py-3">
                <RefreshCcw className="h-4 w-4" />
                Virements
                <Badge variant="secondary" className="ml-1">{transfersCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardContent>
      </Card>

      {/* Separate card for content */}
      <Card className="shadow-sm">
        <CardContent className="p-0 sm:p-0">
          <TabsContent value="all" className="w-full">
            <AllOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="deposits" className="w-full">
            <DepositOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="withdrawals" className="w-full">
            <WithdrawalOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="transfers" className="w-full">
            <TransferOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>;
};