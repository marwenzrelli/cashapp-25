
import React, { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
  
  // État pour suivre les opérations sélectionnées
  const [selectedOperations, setSelectedOperations] = useState<Record<string, boolean>>({});
  
  // Fonction pour gérer la sélection/désélection d'une opération
  const toggleOperation = (operationId: string) => {
    setSelectedOperations(prev => ({
      ...prev,
      [operationId]: !prev[operationId]
    }));
  };
  
  // Fonction pour désélectionner toutes les opérations
  const clearSelections = () => {
    setSelectedOperations({});
  };
  
  // Compter le nombre d'opérations sélectionnées
  const selectedCount = Object.values(selectedOperations).filter(Boolean).length;
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <Card className="mb-4 shadow-sm my-0 py-0 px-0 mx-0">
        <CardContent className="p-1 sm:p-2 px-0 py-0 mx-0">
          <div className="flex flex-wrap justify-between items-center px-2 py-2">
            <TabsList className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Toutes les opérations
                <Badge variant="secondary" className="ml-1">{filteredOperations.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="deposits" className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Versements
                <Badge variant="secondary" className="ml-1">{depositsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />
                Retraits
                <Badge variant="secondary" className="ml-1">{withdrawalsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Virements
                <Badge variant="secondary" className="ml-1">{transfersCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {selectedCount > 0 && (
              <div className="flex items-center mt-2 sm:mt-0">
                <Badge variant="outline" className="mr-2">
                  {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSelections} 
                  className="text-xs h-8"
                >
                  Effacer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <TabsContent value="all" className="w-full">
            <AllOperationsTab 
              operations={filteredOperations} 
              currency={currency} 
              selectedOperations={selectedOperations}
              toggleSelection={toggleOperation}
            />
          </TabsContent>

          <TabsContent value="deposits" className="w-full">
            <DepositOperationsTab 
              operations={filteredOperations} 
              currency={currency} 
              selectedOperations={selectedOperations}
              toggleSelection={toggleOperation}
            />
          </TabsContent>

          <TabsContent value="withdrawals" className="w-full">
            <WithdrawalOperationsTab 
              operations={filteredOperations} 
              currency={currency} 
              selectedOperations={selectedOperations}
              toggleSelection={toggleOperation}
            />
          </TabsContent>

          <TabsContent value="transfers" className="w-full">
            <TransferOperationsTab 
              operations={filteredOperations} 
              currency={currency} 
              selectedOperations={selectedOperations}
              toggleSelection={toggleOperation}
            />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
