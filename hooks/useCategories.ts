import { useState, useCallback } from 'react';
import { TicketCategoryConfig } from '../types';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useCategories = () => {
  const [categories, setCategories] = useState<TicketCategoryConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (catData: Omit<TicketCategoryConfig, 'id' | 'created_at'>) => {
    try {
      const newCat = await createCategory(catData);
      setCategories(prev => [...prev, newCat]);
      return newCat;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editCategory = async (id: string, updates: Partial<TicketCategoryConfig>) => {
    try {
      const updatedCat = await updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updatedCat : c));
      return updatedCat;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    editCategory,
    removeCategory
  };
};