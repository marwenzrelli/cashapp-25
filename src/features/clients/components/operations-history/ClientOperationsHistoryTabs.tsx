
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
import { cn } from "@/lib/utils";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const ClientOperationsHistoryTabs = ({
  filteredOperations,
  currency = "TND",
  updateOperation
}: ClientOperationsHistoryTabsProps) => {
  // Count operations by type
  const depositsCount = filteredOperations.filter(op => op.type === "deposit").length;
  const withdrawalsCount = filteredOperations.filter(op => op.type === "withdrawal").length;
  const transfersCount = filteredOperations.filter(op => op.type === "transfer").length;

  // Detect if on mobile
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Navigation des onglets dans un espace séparé avec une meilleure utilisation de l'espace */}
      <div className="mt-2 mb-3 px-2 py-2 bg-muted/20 rounded-md">
        <TabsList className="grid grid-cols-4 w-full bg-transparent">
          <TabsTrigger 
            value="all" 
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 text-xs",
              "hover:bg-slate-100 dark:hover:bg-slate-800/50"
            )}
          >
            <List className="h-3 w-3" />
            <span>Tout</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5 flex items-center justify-center">{filteredOperations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="deposits" 
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 text-xs",
              "text-green-700 data-[state=active]:bg-green-50 data-[state=active]:text-green-800",
              "hover:bg-green-50/50 dark:hover:bg-green-900/20"
            )}
          >
            <ArrowUpCircle className="h-3 w-3" />
            <span className={isMobile ? "hidden" : ""}>Versements</span>
            <span className={isMobile ? "" : "hidden"}>Vers.</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5 flex items-center justify-center bg-green-100 text-green-800">{depositsCount}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="withdrawals" 
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 text-xs",
              "text-red-700 data-[state=active]:bg-red-50 data-[state=active]:text-red-800",
              "hover:bg-red-50/50 dark:hover:bg-red-900/20"
            )}
          >
            <ArrowDownCircle className="h-3 w-3" />
            <span className={isMobile ? "hidden" : ""}>Retraits</span>
            <span className={isMobile ? "" : "hidden"}>Ret.</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5 flex items-center justify-center bg-red-100 text-red-800">{withdrawalsCount}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="transfers" 
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 text-xs",
              "text-blue-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800",
              "hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
            )}
          >
            <RefreshCcw className="h-3 w-3" />
            <span className={isMobile ? "hidden" : ""}>Virements</span>
            <span className={isMobile ? "" : "hidden"}>Vir.</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-800">{transfersCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Sections de contenu */}
      <Card className="shadow-sm border border-border/50 rounded-md">
        <CardContent className="p-0 sm:p-0">
          <TabsContent value="all" className="w-full m-0">
            <AllOperationsTab operations={filteredOperations} currency={currency} updateOperation={updateOperation} />
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
