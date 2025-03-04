
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Nouveau virement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
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

          <TransferAmountField 
            value={amount}
            onChange={setAmount}
          />

          <TransferReasonField
            value={reason}
            onChange={setReason}
          />

          <TransferSubmitButton isLoading={isLoading} />
        </form>
      </CardContent>
    </Card>
  );
};
