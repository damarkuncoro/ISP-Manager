import { useState, useCallback } from 'react';
import { NetworkDevice } from '../types';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../services/deviceService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useDevices = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      setError(err);
      // Don't crash main app load if just this table is missing
      console.warn("Failed to load network devices", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDevice = async (deviceData: Omit<NetworkDevice, 'id' | 'created_at' | 'last_check'>) => {
    try {
      const newDevice = await createDevice(deviceData);
      setDevices(prev => [...prev, newDevice]);
      return newDevice;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editDevice = async (id: string, updates: Partial<NetworkDevice>) => {
    try {
      const updatedDevice = await updateDevice(id, updates);
      setDevices(prev => prev.map(d => d.id === id ? updatedDevice : d));
      return updatedDevice;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeDevice = async (id: string) => {
    try {
      await deleteDevice(id);
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    devices,
    loading,
    error,
    loadDevices,
    addDevice,
    editDevice,
    removeDevice
  };
};