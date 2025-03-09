
import React from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { Card, CardContent } from "@/components/ui/card";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
  currency?: string;
}

export const ClientOperationsHistoryTabs = ({ 
  filteredOperations,
  currency = "TND" 
}: ClientOperationsHistoryTabsProps) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <Card className="mb-4 shadow-sm">
        <CardContent className="p-1 sm:p-2">
          <TabsList className="w-full grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Toutes les opérations
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Versements
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Retraits
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Virements
            </TabsTrigger>
          </TabsList>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <TabsContent value="all">
            <AllOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="deposits">
            <DepositOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>

          <TabsContent value="transfers">
            <TransferOperationsTab operations={filteredOperations} currency={currency} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
