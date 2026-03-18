export interface VariationOption {
  id: string;
  value: string;
  sortOrder: number;
  photoUrl?: string;
  regularPrice?: number;
  salePrice?: number;
  stock?: number;
  description?: string;
  allowMultiQuantity?: boolean;
  maxQuantity?: number;
}

export interface VariationGroup {
  id:string;
  name: string;
  options: VariationOption[];
  sortOrder: number;
  multiple: boolean;
  required: boolean;
  maxChoices?: number;
}
