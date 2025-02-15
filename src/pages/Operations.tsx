
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Sparkles, ArrowUpCircle, ArrowDownCircle, RefreshCcw, AlertTriangle } from "lucide-react";

interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  clientName: string;
}

interface AISuggestion {
  id: string;
  message: string;
  type: "info" | "warning";
  action?: string;
}

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Données de test sans statut
  const operations: Operation[] = [
    {
      id: "1",
      type: "deposit",
      amount: 1500,
      date: "2024-02-20",
      clientName: "Jean Dupont",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 500,
      date: "2024-02-19",
      clientName: "Marie Martin",
    },
    {
      id: "3",
      type: "transfer",
      amount: 1000,
      date: "2024-02-18",
      clientName: "Pierre Durant",
    },
    {
      id: "4",
      type: "transfer",
      amount: 2000,
      date: "2024-02-17",
      clientName: "Sophie Lefebvre",
    }
  ];

  // Suggestions IA
  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Pic d'activité détecté pour les transferts",
      type: "info",
      action: "Surveillance recommandée",
    },
    {
      id: "2",
      message: "Opération inhabituelle identifiée",
      type: "warning",
      action: "Vérification suggérée",
    },
  ];

  const getTypeIcon = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="h-4 w-4 text-success" />;
      case "withdrawal":
        return <ArrowDownCircle className="h-4 w-4 text-danger" />;
      case "transfer":
        return <RefreshCcw className="h-4 w-4 text-primary" />;
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

  const getSuggestionStyle = (type: AISuggestion["type"]) => {
    return type === "warning" 
      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20" 
      : "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
  };

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Recherche d'opérations</h1>
        <p className="text-muted-foreground">
          Recherchez et filtrez les opérations avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Insights IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${getSuggestionStyle(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {suggestion.type === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{suggestion.message}</p>
                      {suggestion.action && (
                        <p className="text-sm text-muted-foreground">
                          {suggestion.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="deposit">Versement</SelectItem>
                    <SelectItem value="withdrawal">Retrait</SelectItem>
                    <SelectItem value="transfer">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Résultats ({filteredOperations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Type</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.map((op) => (
                  <tr key={op.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(op.type)}
                        <span>{getTypeLabel(op.type)}</span>
                      </div>
                    </td>
                    <td className="p-3">{op.clientName}</td>
                    <td className="p-3 font-medium">
                      {op.amount.toLocaleString()} €
                    </td>
                    <td className="p-3 text-muted-foreground">{op.date}</td>
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
