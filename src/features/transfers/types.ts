
export interface Transfer {
  id: string;
  fromClient: string;
  toClient: string;
  amount: number;
  date: string;
  reason: string;
}

export interface Suggestion {
  id: string;
  fromClient: string;
  toClient: string;
  amount: number;
  reason: string;
}

export interface EditFormData {
  fromClient: string;
  toClient: string;
  amount: string;
  reason: string;
}
