import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock: number;
}

export interface OrderItem extends Product {
  quantity: number;
}

export const STORAGE_KEY = 'barcode_inventory_data';

export function getInventory(): Product[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInventory(data: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
