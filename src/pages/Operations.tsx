import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Edit2, Trash2, Filter, Check, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, parseISO, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
  fromClient?: string;
  toClient?: string;
}

const TIME_RANGES = [
  { label: "Aujourd'hui", days: 0 },
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "90 derniers jours", days: 90 },
] as const;

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: "1",
      type: "deposit",
      amount: 1000,
      date: "2024-02-23",
      description: "Dépôt initial",
      fromClient: "Jean Dupont"
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 500,
      date: "2024-02-22",
      description: "Retrait ATM",
      fromClient: "Marie Martin"
    },
    {
      id: "3",
      type: "transfer",
      amount: 750,
      date: "2024-02-21",
      description: "Virement mensuel",
      fromClient: "Pierre Durant",
      toClient: "Sophie Lefebvre"
    },
    {
      id: "4",
      type: "deposit",
      amount: 2500,
      date: "2024-02-20",
      description: "Versement salaire",
      fromClient: "Lucas Bernard"
    },
    {
      id: "5",
      type: "transfer",
      amount: 350,
      date: "2024-02-19",
      description: "Remboursement restaurant",
      fromClient: "Emma Petit",
      toClient: "Thomas Dubois"
    },
    {
      id: "6",
      type: "withdrawal",
      amount: 200,
      date: "2024-02-18",
      description: "Retrait courses",
      fromClient: "Julie Lambert"
    },
    {
      id: "7",
      type: "deposit",
      amount: 5000,
      date: "2024-02-17",
      description: "Versement épargne",
      fromClient: "François Moreau"
    },
    {
      id: "8",
      type: "transfer",
      amount: 1200,
      date: "2024-02-16",
      description: "Paiement loyer",
      fromClient: "Alice Roux",
      toClient: "Immobilier SARL"
    },
    {
      id: "9",
      type: "withdrawal",
      amount: 150,
      date: "2024-02-15",
      description: "Retrait weekend",
      fromClient: "Marc Simon"
    },
    {
      id: "10",
      type: "deposit",
      amount: 3000,
      date: "2024-02-14",
      description: "Prime annuelle",
      fromClient: "Catherine Leroy"
    },
    {
      id: "11",
      type: "transfer",
      amount: 450,
      date: "2024-02-13",
      description: "Paiement facture électricité",
      fromClient: "Paul Girard",
      toClient: "EDF"
    },
    {
      id: "12",
      type: "withdrawal",
      amount: 300,
      date: "2024-02-12",
      description: "Retrait shopping",
      fromClient: "Sophie Martin"
    }
  ]);

  const handleDateRangeSelect = (days: number) => {
    setDate({
      from: subDays(new Date(), days),
      to: new Date(),
    });
    setIsCustomRange(false);
  };

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

  const handleEdit = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedOperation) return;
    
    setOperations(prev => prev.map(op => 
      op.id === selectedOperation.id ? selectedOperation : op
    ));
    
    setIsEditDialogOpen(false);
    toast.success("Opération modifiée avec succès");
  };

  const handleConfirmDelete = () => {
    if (!selectedOperation) return;
    
    setOperations(prev => prev.filter(op => op.id !== selectedOperation.id));
    setIsDeleteDialogOpen(false);
    toast.success("Opération supprimée avec succès");
  };

  const filteredOperations = operations.filter(operation => {
    const operationDate = parseISO(operation.date);
    const matchesSearch = 
      operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.fromClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.toClient?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" ? true : operation.type === selectedType;
    
    const matchesDate = isWithinInterval(operationDate, {
      start: startOfDay(date.from),
      end: endOfDay(date.to)
    });

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Recherche d'opérations</h1>
        <p className="text-muted-foreground">
          Consultez et gérez l'historique des versements, retraits et virements
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtres de recherche
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {(["all", "deposit", "withdrawal", "transfer"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                    className={`gap-2 ${
                      type === "all" ? "" : getTypeStyle(type as Operation["type"])
                    }`}
                  >
                    {type === "all" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      getTypeIcon(type as Operation["type"])
                    )}
                    {type === "all" ? "Tout" : getTypeLabel(type as Operation["type"])}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {isCustomRange
                          ? `${format(date.from, "d MMM", { locale: fr })} - ${format(date.to, "d MMM", { locale: fr })}`
                          : `${format(date.from, "d MMM", { locale: fr })} - ${format(date.to, "d MMM", { locale: fr })}`}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="grid gap-2 p-4">
                      <div className="space-y-2">
                        {TIME_RANGES.map((range) => (
                          <Button
                            key={range.days}
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => handleDateRangeSelect(range.days)}
                          >
                            <Calendar className="h-4 w-4" />
                            {range.label}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => setIsCustomRange(true)}
                        >
                          <Calendar className="h-4 w-4" />
                          Plage personnalisée
                        </Button>
                      </div>
                      {isCustomRange && (
                        <div className="border-t pt-4 mt-2">
                          <div className="flex gap-2 mb-2 items-center justify-center text-sm text-muted-foreground">
                            <span>Du</span>
                            <span>{format(date.from || new Date(), "d MMM", { locale: fr })}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>au</span>
                            <span>{format(date.to || new Date(), "d MMM", { locale: fr })}</span>
                          </div>
                          <CalendarComponent
                            mode="range"
                            selected={{
                              from: date.from,
                              to: date.to,
                            }}
                            onSelect={(range) => {
                              if (range && range.from && range.to) {
                                setDate({ from: range.from, to: range.to });
                              }
                            }}
                            numberOfMonths={2}
                            locale={fr}
                          />
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{operation.date}</span>
                        {operation.type === "transfer" ? (
                          <>
                            <span>•</span>
                            <span>De: {operation.fromClient}</span>
                            <span>•</span>
                            <span>À: {operation.toClient}</span>
                          </>
                        ) : (
                          <>
                            <span>•</span>
                            <span>Client: {operation.fromClient}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {operation.amount.toLocaleString()} €
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {operation.id}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(operation)}
                        className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4 transition-transform hover:scale-110" />
                        <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(operation)}
                        className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 transition-transform hover:scale-110" />
                        <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                      </Button>
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

      {/* Modal de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'opération</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l'opération sélectionnée
            </DialogDescription>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={selectedOperation.description}
                  onChange={(e) => setSelectedOperation({
                    ...selectedOperation,
                    description: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  value={selectedOperation.amount}
                  onChange={(e) => setSelectedOperation({
                    ...selectedOperation,
                    amount: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmEdit}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Operations;
