
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
}

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: "1",
      type: "deposit",
      amount: 1000,
      date: "2024-02-23",
      description: "Dépôt initial",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 500,
      date: "2024-02-22",
      description: "Retrait ATM",
    },
    {
      id: "3",
      type: "transfer",
      amount: 750,
      date: "2024-02-21",
      description: "Virement mensuel",
    },
  ]);

  const getTypeStyle = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "bg-green-50 text-green-600 dark:bg-green-950/50";
      case "withdrawal":
        return "bg-red-50 text-red-600 dark:bg-red-950/50";
      case "transfer":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
    }
  };

  const getTypeIcon = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="h-4 w-4" />;
      case "withdrawal":
        return <ArrowDownCircle className="h-4 w-4" />;
      case "transfer":
        return <RefreshCcw className="h-4 w-4" />;
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
    }
  };

  const filteredOperations = operations.filter(
    (operation) =>
      operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(operation.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Opérations</h1>
        <p className="text-muted-foreground">
          Consultez l'historique des versements, retraits et virements
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des opérations</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOperations.map((operation) => (
              <div
                key={operation.id}
                className="group relative rounded-lg border bg-card p-4 hover:shadow-md transition-all"
              >
                <div className="absolute -left-px top-4 bottom-4 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getTypeStyle(operation.type)}`}>
                      {getTypeIcon(operation.type)}
                      {getTypeLabel(operation.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{operation.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {operation.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {operation.amount.toLocaleString()} €
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {operation.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOperations.length === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune opération trouvée</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modifiez vos critères de recherche pour voir plus de résultats.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Operations;
