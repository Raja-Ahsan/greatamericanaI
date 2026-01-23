// Utility to get full image URL from relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base backend URL

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with /storage, prepend backend URL
  if (url.startsWith('/storage')) {
    return `${BACKEND_URL}${url}`;
  }
  
  // If it's a relative path, prepend backend URL with /storage
  if (url.startsWith('avatars/')) {
    return `${BACKEND_URL}/storage/${url}`;
  }
  
  // Default: assume it's a storage path
  return `${BACKEND_URL}/storage/${url}`;
};

export default getImageUrl;
