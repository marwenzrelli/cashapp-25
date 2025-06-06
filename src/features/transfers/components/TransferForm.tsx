
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TransferClientSelect } from "./form/TransferClientSelect";
import { TransferAmountField } from "./form/TransferAmountField";
import { TransferReasonField } from "./form/TransferReasonField";
import { TransferSubmitButton } from "./form/TransferSubmitButton";
import { useTransferForm } from "../hooks/useTransferForm";

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
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-primary">Nouveau virement</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Transférer des fonds entre comptes clients
        </p>
      </CardHeader>
      
      <Separator className="mx-6" />
      
      <CardContent className="pt-6">
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* Section Comptes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <h3 className="text-sm font-medium text-foreground">Sélection des comptes</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <TransferClientSelect
                id="fromClient"
                label="Compte émetteur"
                clients={clients}
                value={fromClient}
                onChange={setFromClient}
                placeholder="Sélectionner un client"
              />

              <TransferClientSelect
                id="toClient"
                label="Compte bénéficiaire"
                clients={clients}
                value={toClient}
                onChange={setToClient}
                placeholder="Sélectionner un client"
                disabledValue={fromClient}
              />
            </div>
          </div>

          <Separator />

          {/* Section Détails */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <h3 className="text-sm font-medium text-foreground">Détails du virement</h3>
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

          <Separator />

          {/* Section Action */}
          <div className="pt-2">
            <TransferSubmitButton isLoading={isLoading} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
