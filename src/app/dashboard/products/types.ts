export type Variation = {
  id: string;
  value: string;
  matrix: string;
  price: number;
  visible: boolean;
  hidden: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Archived' | 'Out of Stock';
  smallDescription: string;
  description: string;
  discountedPrice?: number;
  sortOrder?: number;
  recommend?: boolean;
  displayFullwidth?: boolean;
  hiddenTitle?: boolean;
  hiddenImage?: boolean;
  disableLink?: boolean;
  cardShadow?: boolean;
  hidden?: boolean;
  outOfStock?: boolean;
  upsell?: boolean;
  enableCombo?: boolean;
  comboGroup?: string;
  mainImage?: string;
  additionalImages?: string[];
  videoUrl?: string;
  variations?: Variation[];
  properties?: { key: string; value: string }[];
};
