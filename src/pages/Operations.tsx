
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowUpCircle, ArrowDownCircle, RefreshCcw, AlertTriangle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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
  insights?: string[];
}

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  // Données de test enrichies
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

  // Suggestions IA enrichies
  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Pic d'activité détecté pour les transferts",
      type: "info",
      action: "Surveillance recommandée",
      insights: [
        "Augmentation de 25% des transferts ce mois-ci",
        "Tendance similaire observée les années précédentes à cette période",
      ],
    },
    {
      id: "2",
      message: "Opération inhabituelle identifiée",
      type: "warning",
      action: "Vérification suggérée",
      insights: [
        "Montant supérieur à la moyenne habituelle",
        "Premier transfert vers ce bénéficiaire",
      ],
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

  const handleOperationClick = (operation: Operation) => {
    setSelectedOperation(operation);
    const suggestion = aiSuggestions.find(s => 
      (operation.type === "transfer" && s.message.includes("transfert")) ||
      (operation.amount > 1000 && s.message.includes("inhabituelle"))
    );
    
    if (suggestion) {
      toast.info("Analyse IA disponible", {
        description: suggestion.message,
      });
    }
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
          Recherchez et analysez vos opérations avec l'assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Insights IA
            </CardTitle>
            <CardDescription>
              Analyses et recommandations basées sur l'intelligence artificielle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getSuggestionStyle(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {suggestion.type === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="space-y-2 w-full">
                      <div>
                        <p className="text-sm font-medium">{suggestion.message}</p>
                        {suggestion.action && (
                          <p className="text-sm text-muted-foreground">
                            {suggestion.action}
                          </p>
                        )}
                      </div>
                      {suggestion.insights && (
                        <div className="text-sm space-y-1 pt-2 border-t">
                          {suggestion.insights.map((insight, index) => (
                            <p key={index} className="text-muted-foreground flex items-center gap-2">
                              <ChevronDown className="h-3 w-3" />
                              {insight}
                            </p>
                          ))}
                        </div>
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
            <CardTitle>Filtres intelligents</CardTitle>
            <CardDescription>
              Affinez votre recherche avec des filtres contextuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Recherche contextuelle</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, montant..."
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
          <CardDescription>
            Cliquez sur une opération pour plus de détails
          </CardDescription>
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
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.map((op) => (
                  <tr 
                    key={op.id} 
                    className={`border-b transition-colors hover:bg-muted/50 cursor-pointer ${
                      selectedOperation?.id === op.id ? "bg-muted/30" : ""
                    }`}
                    onClick={() => handleOperationClick(op)}
                  >
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
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Analyse détaillée en cours...");
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyser
                      </Button>
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
