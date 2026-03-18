export interface VariationOption {
  id: string;
  value: string;
  sortOrder: number;
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
