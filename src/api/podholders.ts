import api from './axios';

/* ================= AVAILABLE PODS ================= */

export const getAvailablePods = async () => {
  const res = await api.get('/pod-holders/available');

  //  backend wraps result in { data }
  return Array.isArray(res.data?.data) ? res.data.data : [];
};


/* ================= CREATE POD HOLDER ================= */

export const createPodHolder = async (payload: {
  model: string;
  podIds: string[];
}) => {
  const res = await api.post('/pod-holders', payload);
  return res.data;
};
