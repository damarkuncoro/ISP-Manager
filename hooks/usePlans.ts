import { useState, useCallback } from 'react';
import { SubscriptionPlan } from '../types';
import { fetchPlans, createPlan, deletePlan } from '../services/planService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const usePlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlans();
      setPlans(data);
    } catch (err) {
      setError(err);
      // We don't throw here to avoid blocking the main app load if plans fail
      console.warn("Failed to load plans", err); 
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'created_at'>) => {
    try {
      const newPlan = await createPlan(planData);
      setPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removePlan = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    plans,
    loading,
    error,
    loadPlans,
    addPlan,
    removePlan
  };
};