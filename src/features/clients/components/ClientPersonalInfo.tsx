
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";
import { ClientQRCode } from "./ClientQRCode";

interface ClientPersonalInfoProps {
  client: Client;
  formatAmount: (amount: number) => string;
  clientOperations: Operation[];
}

export const ClientPersonalInfo = ({ 
  client, 
  formatAmount, 
  clientOperations 
}: ClientPersonalInfoProps) => {
  // Calculer les statistiques des opérations
  const totalDeposits = clientOperations
    .filter(op => op.type === 'deposit')
    .reduce((sum, op) => sum + op.amount, 0);
  
  const totalWithdrawals = clientOperations
    .filter(op => op.type === 'withdrawal')
    .reduce((sum, op) => sum + op.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
        <Badge 
          variant={client.status === 'active' ? 'default' : 'secondary'}
          className={client.status === 'active' ? 'bg-green-100 text-green-800' : ''}
        >
          {client.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations de base */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="text-lg font-medium text-gray-900">{client.prenom}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-lg font-medium text-gray-900">{client.nom}</p>
            </div>
          </div>

          {(client.email || client.telephone) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{client.email}</p>
                </div>
              )}
              {client.telephone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="text-gray-900">{client.telephone}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Solde actuel</label>
              <p className="text-2xl font-bold text-primary">{formatAmount(client.solde)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Mis à jour le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date de création</label>
              <p className="text-gray-900">
                {new Date(client.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Statistiques des opérations */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé des opérations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-green-600">Total versements</label>
                <p className="text-xl font-bold text-green-700">{formatAmount(totalDeposits)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-red-600">Total retraits</label>
                <p className="text-xl font-bold text-red-700">{formatAmount(totalWithdrawals)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-blue-600">Nombre d'opérations</label>
                <p className="text-xl font-bold text-blue-700">{clientOperations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center lg:justify-start">
          <ClientQRCode 
            clientId={client.id} 
            clientName={`${client.prenom} ${client.nom}`} 
            size={150} 
          />
        </div>
      </div>
    </div>
  );
};
