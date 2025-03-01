
export interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
  fromClient?: string;
  toClient?: string;
  formattedDate?: string; // Ajout du champ pour date formatée
}

export interface ClientStats {
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}

export const TIME_RANGES = [
  { label: "Aujourd'hui", days: 0 },
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "90 derniers jours", days: 90 },
] as const;

// Fonction utilitaire pour formater les dates uniformément dans l'application
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
