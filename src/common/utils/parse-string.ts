import {
  OrderDirection,
  OrderField,
  OrderString,
} from '../validator/order.validator';

export function parseFilterString(filter?: string): string[] {
  if (!filter) return [];

  return filter
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function parseOrderString(order: OrderString) {
  const parts = order.split(' ');

  const [field, direction] = parts;

  return {
    field: field as OrderField,
    direction: direction as OrderDirection,
  };
}
