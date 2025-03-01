import { CalendarIcon, Trash, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Activity, Hash } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatId } from "@/utils/formatId";

export interface AuditLogEntry {
  id: string;
  action_type: string;
  action_date: string;
  performed_by: string;
  details: string;
  target_id?: string;
  target_name?: string;
  amount?: number;
}

export interface OperationLogEntry {
  id: string;
  type: string;
  amount: number;
  date: string;
  client_name?: string;
  from_client?: string;
  to_client?: string;
  created_by?: string;
  created_by_name?: string;
  description: string;
}

interface LogEntryRendererProps {
  entry: AuditLogEntry | OperationLogEntry;
  index: number;
  type: 'audit' | 'transaction' | 'operation';
}

export const LogEntryRenderer = ({ entry, index, type }: LogEntryRendererProps) => {
  const formatTransactionId = (id: string) => {
    if (!isNaN(Number(id))) {
      return id.padStart(6, '0');
    }
    
    return id.slice(0, 6);
  };

  if (type === 'audit') {
    const log = entry as AuditLogEntry;
    return (
      <div 
        key={log.id} 
        className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
      >
        <div className="flex-shrink-0 mt-1">
          {log.action_type === 'Connexion' ? (
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{log.action_type}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{log.action_date}</span>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              {log.performed_by}
            </Badge>
          </div>
          <p className="text-sm mt-1">{log.details}</p>
        </div>
      </div>
    );
  } else if (type === 'transaction') {
    const log = entry as AuditLogEntry;
    return (
      <div 
        key={log.id} 
        className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
      >
        <div className="flex-shrink-0 mt-1">
          <Trash className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{log.action_type}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{log.action_date}</span>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              {log.performed_by}
            </Badge>
          </div>
          <p className="text-sm mt-1">{log.details}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {log.target_id ? formatTransactionId(log.target_id) : 'N/A'}
            </span>
            {log.amount && (
              <Badge variant="secondary" className="font-semibold">
                {log.amount.toLocaleString()} TND
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    const operation = entry as OperationLogEntry;
    return (
      <div 
        key={operation.id} 
        className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
      >
        <div className="flex-shrink-0 mt-1">
          {getOperationIcon(operation.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">
                {operation.type === 'deposit' ? 'Versement' : 
                 operation.type === 'withdrawal' ? 'Retrait' : 'Virement'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{operation.date}</span>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              {operation.created_by_name || 'Système'}
            </Badge>
          </div>
          <p className="text-sm mt-1">{operation.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {formatTransactionId(operation.id.includes("deposit-") || operation.id.includes("withdrawal-") || operation.id.includes("transfer-")
                ? operation.id.split('-')[1]
                : operation.id)}
            </span>
            <Badge 
              variant="secondary" 
              className={`font-semibold ${
                operation.type === 'deposit' ? 'bg-green-100 text-green-800' : 
                operation.type === 'withdrawal' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}
            >
              {operation.amount.toLocaleString()} TND
            </Badge>
          </div>
        </div>
      </div>
    );
  }
};

const getOperationIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    case 'withdrawal':
      return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
    case 'transfer':
      return <RefreshCcw className="h-5 w-5 text-blue-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
};
