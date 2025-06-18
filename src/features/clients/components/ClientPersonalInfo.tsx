
import { PersonalInfoFields } from "./PersonalInfoFields";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";

interface ClientPersonalInfoProps {
  client: Client;
  formatAmount?: (amount: number) => string;
  clientOperations?: Operation[];
}

export const ClientPersonalInfo = ({ client, formatAmount, clientOperations }: ClientPersonalInfoProps) => {
  return (
    <PersonalInfoFields 
      client={client} 
      formatAmount={formatAmount}
      clientOperations={clientOperations}
    />
  );
};
