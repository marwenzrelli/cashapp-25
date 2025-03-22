
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Withdrawal } from "../types";
import { UserCircle, ArrowDownCircle, Pencil, Trash2, CalendarIcon, Hash } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Client } from "@/features/clients/types";
import { formatDate } from "../hooks/utils/formatUtils";
import { useNavigate } from "react-router-dom";
import { formatId } from "@/utils/formatId";
import { DateRange } from "react-day-picker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  onEdit: (withdrawal: Withdrawal) => void;
  onDelete: (withdrawal: Withdrawal) => void;
  findClientById: (clientFullName: string) => (Client & {
    dateCreation: string;
  }) | null;
  dateRange?: DateRange;
}

export const WithdrawalTable: React.FC<WithdrawalTableProps> = ({
  withdrawals,
  onEdit,
  onDelete,
  findClientById,
  dateRange
}) => {
  const { currency } = useCurrency();
  const navigate = useNavigate();
  
  // État pour suivre quel retrait est développé
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const handleClientClick = (client: (Client & {
    dateCreation: string;
  }) | null) => {
    if (client) {
      navigate(`/clients/${client.id}`);
    }
  };
  
  // Toggle expanded withdrawal
  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Calculate the total amount for the displayed withdrawals
  const totalAmount = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);
  
  // Format date range for display - convert Date objects to ISO strings first
  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}`
    : "pour toute la période";
  
  return <Card className="w-full mx-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Liste des retraits</CardTitle>
          <div className="text-sm text-muted-foreground">
            Affichage de {withdrawals.length} retraits
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {/* Desktop Table View */}
        <div className="hidden md:block relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Client</th>
                <th className="p-3 text-center">Montant</th>
                <th className="p-3">Date d'opération</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(withdrawal => {
              const client = findClientById(withdrawal.client_name);
              const formattedOperationDate = withdrawal.operation_date ? formatDate(withdrawal.operation_date) : "Date inconnue";
              const operationId = isNaN(parseInt(withdrawal.id)) ? withdrawal.id : formatId(parseInt(withdrawal.id));
              return <tr key={withdrawal.id} className="group border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono text-xs">{operationId}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
                        <div>
                          <p 
                            className="font-medium cursor-pointer hover:text-primary hover:underline transition-colors flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20"
                            onClick={() => handleClientClick(client)}
                          >
                            {withdrawal.client_name}
                            
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {client ? client.id : "Non trouvé"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-danger">
                        <ArrowDownCircle className="h-4 w-4" />
                        <span className="font-medium px-3 py-1 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                          {withdrawal.amount.toLocaleString()} {currency}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formattedOperationDate}
                    </td>
                    <td className="p-3 text-muted-foreground">{withdrawal.notes}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(withdrawal)} className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300">
                          <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                          <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(withdrawal)} className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300">
                          <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                          <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                      </div>
                    </td>
                  </tr>;
            })}
            </tbody>
            <tfoot className="bg-muted/50 font-medium">
              <tr>
                <td colSpan={2} className="p-3 text-right font-semibold">Total {dateRangeText}:</td>
                <td className="p-3 text-center text-danger font-bold">
                  {totalAmount.toLocaleString()} {currency}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Card View - Mise à jour avec Collapsible */}
        <div className="md:hidden space-y-3 w-full px-0">
          {withdrawals.map(withdrawal => {
            const client = findClientById(withdrawal.client_name);
            const formattedOperationDate = withdrawal.operation_date ? formatDate(withdrawal.operation_date) : "Date inconnue";
            const operationId = isNaN(parseInt(withdrawal.id)) ? withdrawal.id : formatId(parseInt(withdrawal.id));
            const isExpanded = expandedId === withdrawal.id;
            
            return (
              <Collapsible 
                key={withdrawal.id} 
                open={isExpanded}
                onOpenChange={() => toggleExpanded(withdrawal.id)}
                className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800/95 dark:to-red-900/10 p-4 border border-red-100/40 dark:border-red-800/20 rounded-xl shadow-sm hover:shadow-md w-full transition-all duration-300 hover:translate-y-[-2px] backdrop-blur-sm animate-in"
              >
                <CollapsibleTrigger className="w-full text-left">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{operationId}</span>
                      </div>
                      <div className="flex items-center text-danger">
                        <ArrowDownCircle className="h-4 w-4 mr-1" />
                        <span className="font-medium px-2 py-0.5 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                          {withdrawal.amount.toLocaleString()} {currency}
                        </span>
                      </div>
                    </div>
                    
                    <p 
                      className="font-medium text-primary flex items-center cursor-pointer mb-2 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientClick(client);
                      }}
                    >
                      {withdrawal.client_name}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formattedOperationDate}
                    </div>
                    
                    {withdrawal.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                        {withdrawal.notes}
                      </p>
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-2 animate-accordion-down">
                  <div className="flex justify-end gap-2 mt-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(withdrawal);
                      }} 
                      className="h-8 w-8 text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(withdrawal);
                      }} 
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          
          {withdrawals.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Aucun retrait trouvé
            </div>
          )}
            
          {/* Mobile Total Section */}
          {withdrawals.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg border mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total {dateRangeText}:</span>
                <span className="text-danger font-bold px-2 py-0.5 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>;
};
