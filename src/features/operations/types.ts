
export interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  createdAt?: string; 
  operation_date?: string; // Add operation_date field
  description: string;
  fromClient?: string;
  toClient?: string;
  formattedDate?: string;
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

/**
 * Fonction utilitaire pour formater les dates uniformément dans l'application
 * Affiche les dates en heure locale
 */
export const formatDateTime = (dateString: string) => {
  try {
    // Convertir la chaîne de date en objet Date (local time)
    const date = new Date(dateString);
    
    // S'assurer que la date est valide
    if (isNaN(date.getTime())) {
      console.error(`Date invalide: ${dateString}`);
      return "Date invalide";
    }
    
    // Formatage complet de la date et de l'heure avec les secondes en temps local
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error(`Erreur lors du formatage de la date ${dateString}:`, error);
    return "Erreur de date";
  }
};
