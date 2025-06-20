
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Users, CreditCard, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useClients } from "@/features/clients/hooks/useClients";
import { Badge } from "@/components/ui/badge";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients } = useClients();

  // Filtrer les clients selon le terme de recherche
  const filteredClients = clients.filter((client) =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Recherche globale</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Recherchez rapidement vos clients et leurs informations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche intelligente</CardTitle>
          <CardDescription>
            Trouvez rapidement vos clients par nom, email ou téléphone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de recherche</CardTitle>
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
                      <div className="flex gap-2">
                        <Link to={`/clients/${client.id}`}>
                          <Button variant="outline" size="sm">
                            Voir profil
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez vos clients et consultez leurs profils
            </p>
            <Link to="/clients">
              <Button className="w-full">Accéder aux clients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Opérations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Consultez l'historique des opérations
            </p>
            <Link to="/operations-history">
              <Button className="w-full">Voir les opérations</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Virements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Effectuez des virements entre clients
            </p>
            <Link to="/transfers">
              <Button className="w-full">Faire un virement</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Search;
