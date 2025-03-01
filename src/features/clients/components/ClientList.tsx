
import { Client } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, CreditCard, QrCode, User, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  const navigate = useNavigate();

  // Fonction pour naviguer vers le profil du client avec son ID
  const navigateToClientProfile = (clientId: number) => {
    console.log("Navigation vers le profil client:", clientId);
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="w-full space-y-3">
      {clients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </div>
      )}
      
      <Card className="w-full overflow-hidden">
        {clients.length > 0 && (
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm">
            <div className="col-span-3">Nom</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Créé le</div>
            <div className="col-span-2">Solde</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        )}
        
        <div className="divide-y">
          {clients.map((client) => (
            <div key={client.id} className="hover:bg-muted/30 transition-colors animate-fadeIn">
              {/* Version Mobile */}
              <div className="block md:hidden p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigateToClientProfile(client.id)}
                    >
                      {client.prenom} {client.nom}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>ID: {client.id}</span>
                    </div>
                  </div>
                  <Badge
                    variant={client.status === "active" ? "default" : "destructive"}
                    className={`capitalize ${client.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}`}
                  >
                    {client.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-2 mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{client.telephone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`${client.solde >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {client.solde.toLocaleString()} €
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-1" 
                    onClick={() => navigateToClientProfile(client.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Profil</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => onEdit(client)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-1 text-destructive hover:text-destructive" 
                    onClick={() => onDelete(client)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Supprimer</span>
                  </Button>
                </div>
              </div>
              
              {/* Version Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 items-center">
                <div className="col-span-3">
                  <div 
                    className="font-medium cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => navigateToClientProfile(client.id)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{client.prenom} {client.nom}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ID: {client.id}
                  </div>
                </div>
                
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{client.telephone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>
                
                <div className="col-span-2 text-sm">
                  {format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}
                </div>
                
                <div className="col-span-2 font-medium">
                  <span className={`${client.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {client.solde.toLocaleString()} €
                  </span>
                </div>
                
                <div className="col-span-1">
                  <Badge
                    variant={client.status === "active" ? "default" : "destructive"}
                    className={`capitalize ${client.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}`}
                  >
                    {client.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                
                <div className="col-span-2 flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigateToClientProfile(client.id)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(client)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(client)} 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
