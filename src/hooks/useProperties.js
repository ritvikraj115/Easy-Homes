import { useCallback, useEffect, useState } from 'react';
import apiClient from '../api';

export default function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.get('/api/properties');
      setProperties(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    refresh: fetchProperties,
  };
}
