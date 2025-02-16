
export interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
  fromClient?: string;
  toClient?: string;
}

export const TIME_RANGES = [
  { label: "Aujourd'hui", days: 0 },
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "90 derniers jours", days: 90 },
] as const;
