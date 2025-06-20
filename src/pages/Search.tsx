import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Users, CreditCard, Calendar, Filter } from "lucide-react";
import { useClients } from "@/features/clients/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsList } from "@/features/operations/components/OperationsList";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientAutocomplete } from "@/features/operations/components/ClientAutocomplete";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [operationType, setOperationType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"clients" | "operations">("operations");
  
  const { clients } = useClients();
  const { operations, isLoading: operationsLoading } = useOperations();

  const {
    filteredOperations
  } = useOperationsFilter(operations, {
    filterType: operationType,
    filterClient: searchTerm,
    dateRange: dateRange
  });

  // Filtrer les clients selon le terme de recherche
  const filteredClients = clients.filter((client) =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm)
  );

  const handleTypeChange = (value: string) => {
    setOperationType(value === "all" ? null : value);
  };

  // Placeholder functions for edit and delete operations
  const handleEditOperation = (operation: any) => {
    console.log("Edit operation:", operation);
    // TODO: Implement edit functionality
  };

  const handleDeleteOperation = (operation: any) => {
    console.log("Delete operation:", operation);
    // TODO: Implement delete functionality
  };

  return (
    <>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recherche avancée</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Recherchez vos clients et leurs opérations avec des filtres avancés
          </p>
        </div>

        {/* Tabs pour basculer entre clients et opérations */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("operations")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "operations"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Opérations
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "clients"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Clients
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
            <CardDescription>
              {activeTab === "operations" 
                ? "Filtrez les opérations par client, type et période"
                : "Recherchez vos clients par nom, email ou téléphone"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recherche principale */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                {activeTab === "operations" ? (
                  <ClientAutocomplete
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Rechercher par nom de client..."
                    className="pl-9"
                  />
                ) : (
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                )}
              </div>

              {/* Filtres pour les opérations */}
              {activeTab === "operations" && (
                <>
                  {/* Type d'opération */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type d'opération</label>
                    <Select value={operationType || "all"} onValueChange={handleTypeChange}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les opérations</SelectItem>
                        <SelectItem value="deposit">💰 Versements</SelectItem>
                        <SelectItem value="withdrawal">💸 Retraits</SelectItem>
                        <SelectItem value="transfer">🔄 Virements</SelectItem>
                        <SelectItem value="direct_transfer">⚡ Opérations directes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date filter section */}
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="date-filter"
                      checked={showDateFilter}
                      onCheckedChange={setShowDateFilter}
                    />
                    <label htmlFor="date-filter" className="text-sm font-medium">
                      Filtrer par période
                    </label>
                  </div>

                  {showDateFilter && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sélectionner une période
                      </label>
                      <DatePickerWithRange
                        date={dateRange}
                        onDateChange={setDateRange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        {activeTab === "operations" ? (
          <Card>
            <CardHeader>
              <CardTitle>Résultats des opérations</CardTitle>
              <CardDescription>
                {operationsLoading ? (
                  "Chargement des opérations..."
                ) : (
                  `${filteredOperations.length} opération(s) trouvée(s)`
                )}
                {showDateFilter && dateRange?.from && dateRange?.to && (
                  <span className="ml-2 text-muted-foreground">
                    (période sélectionnée)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingIndicator text="Chargement des opérations..." />
                </div>
              ) : (
                <OperationsList 
                  operations={filteredOperations}
                  isLoading={false}
                  showEmptyMessage={true}
                  onEdit={handleEditOperation}
                  onDelete={handleDeleteOperation}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          searchTerm && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats des clients</CardTitle>
                <CardDescription>
                  {filteredClients.length} client(s) trouvé(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun client trouvé pour "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold">{client.prenom} {client.nom}</h3>
                              <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                {client.status === 'active' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {client.email && <p>📧 {client.email}</p>}
                              {client.telephone && <p>📞 {client.telephone}</p>}
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                <span>Solde: {Number(client.solde).toLocaleString('fr-FR')} TND</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
      <ScrollToTop />
    </>
  );
};

export default Search;
