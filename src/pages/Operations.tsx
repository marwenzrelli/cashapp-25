
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";

interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  clientName: string;
  status: "completed" | "pending" | "failed";
}

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Données de test (à remplacer par des données réelles)
  const operations: Operation[] = [
    {
      id: "1",
      type: "deposit",
      amount: 1500,
      date: "2024-02-20",
      clientName: "Jean Dupont",
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 500,
      date: "2024-02-19",
      clientName: "Marie Martin",
      status: "completed",
    },
    {
      id: "3",
      type: "transfer",
      amount: 1000,
      date: "2024-02-18",
      clientName: "Pierre Durant",
      status: "pending",
    },
  ];

  const getStatusColor = (status: Operation["status"]) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "Versement";
      case "withdrawal":
        return "Retrait";
      case "transfer":
        return "Virement";
      default:
        return type;
    }
  };

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || op.type === typeFilter;
    const matchesStatus = !statusFilter || op.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Recherche d'opérations</h1>
        <p className="text-muted-foreground">
          Recherchez et filtrez les opérations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nom du client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type d'opération</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="deposit">Versement</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.map((op) => (
                  <tr key={op.id} className="border-b">
                    <td className="p-3">{op.date}</td>
                    <td className="p-3">{getTypeLabel(op.type)}</td>
                    <td className="p-3">{op.clientName}</td>
                    <td className="p-3">{op.amount.toLocaleString()} €</td>
                    <td className={`p-3 ${getStatusColor(op.status)}`}>
                      {op.status.charAt(0).toUpperCase() + op.status.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOperations.length === 0 && (
              <p className="text-center text-muted-foreground p-4">
                Aucune opération trouvée
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Operations;
