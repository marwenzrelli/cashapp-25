
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Shield, UserCog, Users } from "lucide-react";

const serviceExplanations = [
  {
    name: "Finance",
    description: "Gestion des ressources financières et budgets",
    roles: {
      supervisor: "Validation des opérations importantes",
      manager: "Suivi des performances financières",
      cashier: "Transactions quotidiennes"
    },
    icon: <Building className="h-6 w-6 text-blue-600" />
  },
  {
    name: "Opérations",
    description: "Exécution des processus opérationnels",
    roles: {
      supervisor: "Supervision des processus",
      manager: "Coordination des équipes",
      cashier: "Gestion des opérations"
    },
    icon: <Users className="h-6 w-6 text-green-600" />
  },
  {
    name: "Comptabilité",
    description: "Suivi comptable et reporting",
    roles: {
      supervisor: "Validation des bilans",
      manager: "Contrôle des écritures",
      cashier: "Saisie comptable"
    },
    icon: <UserCog className="h-6 w-6 text-purple-600" />
  }
];

export const ServiceExplanations = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Services et Rôles</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble des responsabilités par service
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {serviceExplanations.map((service) => (
          <Card 
            key={service.name}
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {service.icon}
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Superviseur:</span>
                  <span className="text-sm text-muted-foreground">{service.roles.supervisor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Gestionnaire:</span>
                  <span className="text-sm text-muted-foreground">{service.roles.manager}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Caissier:</span>
                  <span className="text-sm text-muted-foreground">{service.roles.cashier}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
