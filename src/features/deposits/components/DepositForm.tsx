
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Deposit } from "@/features/deposits/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { ClientSelect } from "./deposit-form/ClientSelect";
import { AmountField } from "./deposit-form/AmountField";
import { DateTimeField } from "./deposit-form/DateTimeField";
import { DescriptionField } from "./deposit-form/DescriptionField";
import { SubmitButton } from "./deposit-form/SubmitButton";
import { useDepositForm } from "./deposit-form/useDepositForm";

interface StandaloneDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
}

export const StandaloneDepositForm = ({
  clients,
  onConfirm,
  refreshClientBalance
}: StandaloneDepositFormProps) => {
  const { currency } = useCurrency();
  
  const {
    selectedClient,
    setSelectedClient,
    amount,
    setAmount,
    date,
    setDate,
    time,
    setTime,
    description,
    setDescription,
    isLoading,
    handleSubmit
  } = useDepositForm({ clients, onConfirm, refreshClientBalance });

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-700">Nouveau versement</CardTitle>
        <CardDescription>
          Créez un nouveau versement pour un client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DateTimeField 
            date={date} 
            setDate={setDate} 
            time={time} 
            setTime={setTime} 
          />

          <ClientSelect 
            clients={clients} 
            selectedClient={selectedClient} 
            setSelectedClient={setSelectedClient} 
            currency={currency} 
          />

          <AmountField 
            amount={amount} 
            setAmount={setAmount} 
            currency={currency} 
          />

          <DescriptionField 
            description={description} 
            setDescription={setDescription} 
          />

          <SubmitButton isLoading={isLoading} />
        </form>
      </CardContent>
    </Card>
  );
};
