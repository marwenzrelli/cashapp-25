
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClientSearchField } from "./form/ClientSearchField";
import { TransferAmountField } from "./form/TransferAmountField";
import { TransferReasonField } from "./form/TransferReasonField";
import { TransferSubmitButton } from "./form/TransferSubmitButton";
import { useTransferForm } from "../hooks/useTransferForm";
import { ArrowRightLeft, Users, CreditCard } from "lucide-react";

interface TransferFormProps {
  onSuccess?: () => void;
}

export const TransferForm = ({ onSuccess }: TransferFormProps) => {
  const {
    isLoading,
    fromClient,
    setFromClient,
    toClient,
    setToClient,
    amount,
    setAmount,
    reason,
    setReason,
    clients,
    handleTransfer
  } = useTransferForm(onSuccess);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Nouveau virement</CardTitle>
            <p className="text-blue-100 text-sm mt-1">
              Transférer des fonds entre comptes clients
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 bg-white dark:bg-gray-900 rounded-b-lg">
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* Section Comptes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Sélection des comptes
              </h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <ClientSearchField
                id="fromClient"
                label="Compte émetteur"
                clients={clients}
                value={fromClient}
                onChange={setFromClient}
                placeholder="Rechercher le client émetteur..."
                disabledValue={toClient}
              />

              <ClientSearchField
                id="toClient"
                label="Compte bénéficiaire"
                clients={clients}
                value={toClient}
                onChange={setToClient}
                placeholder="Rechercher le client bénéficiaire..."
                disabledValue={fromClient}
              />
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Section Détails */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="p-2 bg-purple-600 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                Détails du virement
              </h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <TransferAmountField 
                value={amount}
                onChange={setAmount}
              />

              <TransferReasonField
                value={reason}
                onChange={setReason}
              />
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Section Action */}
          <div className="pt-2">
            <TransferSubmitButton isLoading={isLoading} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
