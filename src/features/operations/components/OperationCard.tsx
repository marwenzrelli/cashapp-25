
import { Operation, formatDateTime } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Trash2, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { formatAmount } from "@/utils/formatCurrency";

interface OperationCardProps {
  operation: Operation;
  currency: string;
  onDelete: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  isMobile: boolean;
}

export const OperationCard = ({ 
  operation, 
  currency,
  onDelete,
  onEdit,
  isMobile
}: OperationCardProps) => {
  const { 
    type, 
    amount, 
    date, 
    operation_date, 
    fromClient, 
    toClient, 
    description 
  } = operation;
  
  const getOperationIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getColorClass = () => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return '';
    }
  };
  
  const getFormattedType = () => {
    switch (type) {
      case 'deposit':
        return 'Versement';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Transfert';
      default:
        return 'Opération';
    }
  };
  
  const displayDate = operation_date || date;

  return (
    <Card className={cn(
      "border shadow-sm print:shadow-none print:border-0",
      "hover:shadow-md transition-shadow duration-200",
      "print:break-inside-avoid print:mb-0"
    )}>
      <CardContent className="p-4 print:p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted print:hidden">
              {getOperationIcon()}
            </div>
            
            <div>
              <h3 className="font-medium text-sm print:text-xs">
                {getFormattedType()}
              </h3>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(displayDate || '')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold",
              getColorClass(),
              isMobile ? "text-base" : "text-lg"
            )}>
              {type === 'withdrawal' ? '- ' : ''}{formatAmount(amount, currency as any)}
            </span>
            
            <div className="flex items-center gap-1 print:hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(operation)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Modifier l'opération</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => onDelete(operation)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Supprimer l'opération</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {type === 'transfer' ? 'De' : 'Client'}
              </p>
              <p className="text-sm truncate">{fromClient}</p>
            </div>
            
            {type === 'transfer' && toClient && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">À</p>
                <p className="text-sm truncate">{toClient}</p>
              </div>
            )}
            
            {description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{description}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
