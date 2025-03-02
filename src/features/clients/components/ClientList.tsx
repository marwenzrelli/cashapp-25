
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "../types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, Hash, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatId } from "@/utils/formatId";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  const navigate = useNavigate();
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const { currency } = useCurrency();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const toggleExpand = (clientId: number) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  const handleView = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="divide-y">
          {clients.map((client) => (
            <div key={client.id} className={`p-4 transition-colors ${expandedClientId === client.id ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {client.prenom.charAt(0)}{client.nom.charAt(0)}
                  </div>
                  <div>
                    <h3 
                      className="font-medium cursor-pointer hover:text-primary hover:underline"
                      onClick={() => handleView(client.id)}
                    >
                      {client.prenom} {client.nom}
                    </h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {formatId(client.id)}
                      </span>
                      <span>•</span>
                      <span>{client.telephone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(client.status)}`}>
                    {client.status === 'active' ? 'Actif' : client.status === 'inactive' ? 'Inactif' : client.status}
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1 pr-6 border-r border-transparent">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${client.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.solde.toLocaleString()} {currency}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => toggleExpand(client.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Plus d'informations</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            onClick={() => handleView(client.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir le profil</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                            onClick={() => onEdit(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            onClick={() => onDelete(client)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedClientId === client.id && (
                <div className="mt-4 pl-14 text-sm grid gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{client.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Solde</p>
                      <p className={client.solde >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {client.solde.toLocaleString()} TND
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date de création</p>
                      <p>{new Date(client.date_creation || '').toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dernière mise à jour</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(client.id)}
                    >
                      Voir le profil complet
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
