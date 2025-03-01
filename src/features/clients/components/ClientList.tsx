
import { Client } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, CreditCard, QrCode, User } from "lucide-react";
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card key={client.id} className="overflow-hidden animate-fadeIn">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 
                  className="text-lg font-bold mb-1 cursor-pointer hover:text-primary transition-colors"
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

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-20">Téléphone:</span>
                <span>{client.telephone}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-20">Email:</span>
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-20">Créé le:</span>
                <span>{format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className={`${client.solde >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                {client.solde.toLocaleString()} €
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={() => navigateToClientProfile(client.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Profil</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => onEdit(client)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-destructive hover:text-destructive" 
                  onClick={() => onDelete(client)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
