
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "../types";
import { useNavigate } from "react-router-dom";
import { ClientListItem } from "./client-list/ClientListItem";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  const navigate = useNavigate();
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

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
        </div>
      </CardContent>
    </Card>
  );
};
