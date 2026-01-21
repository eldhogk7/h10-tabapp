import api from './axios';

/* ================= CREATE PLAYER ================= */
export const createPlayer = async (payload: {
  player_name: string;
  age: number;
  jersey_number: number;
  position: string;
  phone?: string;
  pod_holder_id?: string;
  pod_id?: string;
}) => {
  const res = await api.post('/players', payload);
  return res.data?.data ?? res.data;
};

/* ================= GET CLUB PLAYERS ================= */
export const getMyClubPlayers = async () => {
  const res = await api.get('/players');
  return res.data.data ?? [];
};

/* ================= GET POD HOLDERS (CLUB) ================= */
export const getMyPodHolders = async () => {
  const res = await api.get('/pod-holders'); // already club-filtered in backend
  return res.data?.data ?? res.data;
};

/* ================= GET PODS BY HOLDER ================= */
export const getPodsByHolder = async (podHolderId: string) => {
  const res = await api.get(`/pod-holders/${podHolderId}`);
  return res.data?.pods ?? [];
};

export const assignPodHolderToPlayer = async (
  playerId: string,
  podHolderId: string,
) => {
  return api.post(`/players/${playerId}/assign-pod-holder`, {
    pod_holder_id: podHolderId,
  });
};

export const assignPodToPlayer = async (
  playerId: string,
  podId: string,
) => {
  return api.post(`/players/${playerId}/assign-pod`, {
    pod_id: podId,
  });
};

/* ================= GET PODS FOR LOGGED-IN CLUB ================= */
export const getMyClubPods = async () => {
  const res = await api.get('/pods/my-club');
  return res.data?.data ?? res.data;
};


