import type { UniqueIdentifier } from '@dnd-kit/core';
import type { Column, Item } from './types';

export const getCategoryOptions = (
  board: Column[],
  currentCategoryId?: UniqueIdentifier
) => {
  const options: { label: string; value: string; depth: number }[] = [];

  const traverseItems = (items: Item[], depth: number) => {
    for (const item of items) {
      // Exclude the current category and its children from being a parent option
      if (currentCategoryId && item.id === currentCategoryId) continue;

      options.push({
        label: item.name,
        value: item.id.toString(),
        depth: depth,
      });
      if (item.children) {
        traverseItems(item.children, depth + 1);
      }
    }
  };

  board.forEach((column) => {
    options.push({
      label: column.name,
      value: column.id.toString(),
      depth: 0,
    });
    traverseItems(column.items, 1);
  });

  return options;
};

export const getCategoryNameOptions = (board: Column[]) => {
  const options: { label: string; value: string; depth: number }[] = [];

  const traverseItems = (items: Item[], depth: number) => {
    for (const item of items) {
      options.push({
        label: item.name,
        value: item.name,
        depth: depth,
      });
      if (item.children) {
        traverseItems(item.children, depth + 1);
      }
    }
  };

  board.forEach((column) => {
    options.push({
      label: column.name,
      value: column.name,
      depth: 0,
    });
    traverseItems(column.items, 1);
  });

  return options;
};
