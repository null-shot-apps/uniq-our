export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
};

export type ReceiptData = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

export type Person = {
  id: string;
  name: string;
  color: string;
};

