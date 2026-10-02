export const BACKEND_URL = (import.meta as any).env?.VITE_API_BASE || 'https://productive-gap-vote-telling.trycloudflare.com';
export const API_BASE = `${BACKEND_URL}/api`;

export const apiFetch = async (endpointOrUrl: string, init?: RequestInit) => {
  const url = endpointOrUrl.startsWith('http') 
    ? endpointOrUrl 
    : `${API_BASE}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`;
    
  return fetch(url, init);
};
