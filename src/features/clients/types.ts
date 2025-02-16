
export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
  date_creation?: string;
  status: string;
}

export interface AISuggestion {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  clientId: string;
}
