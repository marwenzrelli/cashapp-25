import { Operation } from "../types";

export const mockOperations: Operation[] = [
  {
    id: "1",
    type: "deposit",
    amount: 1000,
    date: "2024-02-23",
    description: "Dépôt initial",
    fromClient: "Jean Dupont"
  },
  {
    id: "2",
    type: "withdrawal",
    amount: 500,
    date: "2024-02-22",
    description: "Retrait ATM",
    fromClient: "Marie Martin"
  },
  {
    id: "3",
    type: "transfer",
    amount: 750,
    date: "2024-02-21",
    description: "Virement mensuel",
    fromClient: "Pierre Durant",
    toClient: "Sophie Lefebvre"
  },
  {
    id: "4",
    type: "deposit",
    amount: 2500,
    date: "2024-02-20",
    description: "Versement salaire",
    fromClient: "Lucas Bernard"
  },
  {
    id: "5",
    type: "transfer",
    amount: 350,
    date: "2024-02-19",
    description: "Remboursement restaurant",
    fromClient: "Emma Petit",
    toClient: "Thomas Dubois"
  },
  {
    id: "6",
    type: "withdrawal",
    amount: 200,
    date: "2024-02-18",
    description: "Retrait courses",
    fromClient: "Julie Lambert"
  },
  {
    id: "7",
    type: "deposit",
    amount: 5000,
    date: "2024-02-17",
    description: "Versement épargne",
    fromClient: "François Moreau"
  },
  {
    id: "8",
    type: "transfer",
    amount: 1200,
    date: "2024-02-16",
    description: "Paiement loyer",
    fromClient: "Alice Roux",
    toClient: "Immobilier SARL"
  },
  {
    id: "9",
    type: "withdrawal",
    amount: 150,
    date: "2024-02-15",
    description: "Retrait weekend",
    fromClient: "Marc Simon"
  },
  {
    id: "10",
    type: "deposit",
    amount: 3000,
    date: "2024-02-14",
    description: "Prime annuelle",
    fromClient: "Catherine Leroy"
  },
  {
    id: "11",
    type: "transfer",
    amount: 450,
    date: "2024-02-13",
    description: "Paiement facture électricité",
    fromClient: "Paul Girard",
    toClient: "EDF"
  },
  {
    id: "12",
    type: "withdrawal",
    amount: 300,
    date: "2024-02-12",
    description: "Retrait shopping",
    fromClient: "Sophie Martin"
  }
];
