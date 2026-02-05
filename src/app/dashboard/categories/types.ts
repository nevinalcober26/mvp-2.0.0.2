import type { UniqueIdentifier } from '@dnd-kit/core';

export type CategoryBase = {
  description?: string;
  // display
  displayFullwidth?: boolean;
  hiddenTitle?: boolean;
  hiddenImage?: boolean;
  cardShadow?: boolean;
  // advanced
  hidden?: boolean;
  disableLink?: boolean;
  externalLink?: string;
  enableSpecial?: boolean;
  specialType?: string;
  displaySeparate?: boolean;
}

export type Item = CategoryBase & {
  id: UniqueIdentifier;
  name: string;
  children: Item[];
};

export type Column = CategoryBase & {
  id: UniqueIdentifier;
  name: string;
  items: Item[];
};
