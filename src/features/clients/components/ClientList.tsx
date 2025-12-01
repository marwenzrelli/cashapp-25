
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { useNavigate } from "react-router-dom";
import { ClientListItem } from "./client-list/ClientListItem";
import { toast } from "sonner";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";

interface ClientListProps {
  clients: Client[];
  sortBy: "name" | "id" | "balance";
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, sortBy, onEdit, onDelete }: ClientListProps) => {
  const navigate = useNavigate();
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  
  // Add pagination state
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpand = (clientId: number) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  const handleView = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      toast.error("Client introuvable", {
        description: "Impossible d'accéder au profil de ce client"
      });
      return;
    }
    navigate(`/clients/${clientId}`);
  };

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
        const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
        return nameA.localeCompare(nameB);
      case "id":
        return a.id - b.id;
      case "balance":
        return (b.solde || 0) - (a.solde || 0);
      default:
        return 0;
    }
  });

  // Calculate pagination
  const indexOfLastClient = currentPage * parseInt(itemsPerPage);
  const indexOfFirstClient = indexOfLastClient - parseInt(itemsPerPage);
  const currentClients = sortedClients.slice(indexOfFirstClient, indexOfLastClient);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Liste des clients</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {currentClients.map((client) => (
            <ClientListItem
              key={client.id}
              client={client}
              isExpanded={expandedClientId === client.id}
              onToggleExpand={toggleExpand}
              onView={handleView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          
          {sortedClients.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Aucun client à afficher
            </div>
          )}
        </div>
        
        {sortedClients.length > 0 && (
          <div className="p-4">
            <TransferPagination
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalItems={sortedClients.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              label="clients"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
