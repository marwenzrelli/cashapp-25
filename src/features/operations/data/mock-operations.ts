
import { Operation } from "../types";

export const mockOperations: Operation[] = [
  {
    id: "1",
    type: "deposit",
    amount: 1000,
    date: "2024-03-15T10:00:00Z",
    description: "Dépôt initial",
    toClient: "John Doe"
  },
  {
    id: "2",
    type: "withdrawal",
    amount: 500,
    date: "2024-03-16T14:30:00Z",
    description: "Retrait ATM",
    fromClient: "Jane Smith"
  },
  {
    id: "3",
    type: "transfer",
    amount: 750,
    date: "2024-03-17T09:15:00Z",
    description: "Virement mensuel",
    fromClient: "Alice Johnson",
    toClient: "Bob Wilson"
  }
];
