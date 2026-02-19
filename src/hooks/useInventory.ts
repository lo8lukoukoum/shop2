import { useState, useEffect, useCallback } from 'react';
import { Product, STORAGE_KEY } from '../lib/utils';

export function useInventory() {
  const [inventory, setInventory] = useState<Product[]>([]);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setInventory(JSON.parse(data));
  }, []);

  const save = useCallback((newInventory: Product[]) => {
    setInventory(newInventory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newInventory));
  }, []);

  const addOrUpdateProduct = (product: Partial<Product>) => {
    const newInventory = [...inventory];
    if (product.id) {
      const index = newInventory.findIndex(p => p.id === product.id);
      if (index > -1) newInventory[index] = product as Product;
    } else {
      newInventory.push({ ...product, id: crypto.randomUUID() } as Product);
    }
    save(newInventory);
  };

  const deleteProduct = (id: string) => {
    save(inventory.filter(p => p.id !== id));
  };

  return { inventory, addOrUpdateProduct, deleteProduct, setInventory: save };
}
