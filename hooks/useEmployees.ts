
import { useState, useCallback } from 'react';
import { Employee } from '../types';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      const newEmployee = await createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = await updateEmployee(id, updates);
      setEmployees(prev => prev.map(e => e.id === id ? updatedEmployee : e));
      return updatedEmployee;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    employees,
    loading,
    error,
    loadEmployees,
    addEmployee,
    editEmployee,
    removeEmployee
  };
};
