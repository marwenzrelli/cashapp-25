
import { Operation } from "../types";
import { formatDateTime } from "../types";

// Données de test pour quand Supabase ne répond pas
export const mockOperations: Operation[] = [
  {
    id: "dep-001",
    type: "deposit",
    amount: 1250.00,
    date: new Date().toISOString(),
    description: "Dépôt mensuel",
    fromClient: "Ahmed Ben Salem",
    formattedDate: formatDateTime(new Date().toISOString())
  },
  {
    id: "wdr-002",
    type: "withdrawal",
    amount: 500.00,
    date: new Date().toISOString(),
    description: "Retrait hebdomadaire",
    fromClient: "Fatima Trabelsi",
    formattedDate: formatDateTime(new Date().toISOString())
  },
  {
    id: "trf-003",
    type: "transfer",
    amount: 750.00,
    date: new Date().toISOString(),
    description: "Transfert familial",
    fromClient: "Mohamed Khelifi",
    toClient: "Leila Khelifi",
    formattedDate: formatDateTime(new Date().toISOString())
  },
  {
    id: "dep-004",
    type: "deposit",
    amount: 3000.00,
    date: new Date(Date.now() - 86400000).toISOString(), // Hier
    description: "Dépôt commercial",
    fromClient: "Société Al Baraka",
    formattedDate: formatDateTime(new Date(Date.now() - 86400000).toISOString())
  },
  {
    id: "wdr-005",
    type: "withdrawal",
    amount: 1200.00,
    date: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
    description: "Retrait pour achat",
    fromClient: "Amira Mansouri",
    formattedDate: formatDateTime(new Date(Date.now() - 172800000).toISOString())
  }
];
