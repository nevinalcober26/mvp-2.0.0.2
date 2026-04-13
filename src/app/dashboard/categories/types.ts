
import type { UniqueIdentifier } from '@dnd-kit/core';

export type ScheduleRule = {
  id: string;
  weekday: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Everyday';
  allDay: boolean;
  from?: string; // HH:mm
  to?: string; // HH:mm
  disableOrder: boolean;
};

export type CategoryBase = {
  description?: string;
  schedules?: ScheduleRule[];
  status: 'Published' | 'Draft';
  imageUrl?: string;
  // display
  displayFullwidth?: boolean;
  hiddenTitle?: boolean;
  hiddenImage?: boolean;
  cardShadow?: boolean;
  // advanced
  hidden?: boolean;
  enableLink?: boolean;
  externalLink?: string;
  viewFormat?: string;
  promotions?: string;
  sortOrder?: number;
  enableSpecial?: boolean;
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
