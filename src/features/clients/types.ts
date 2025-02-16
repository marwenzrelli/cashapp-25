
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
  date_creation: string;
  status: string;
}

export interface AISuggestion {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  clientId: string;
}
