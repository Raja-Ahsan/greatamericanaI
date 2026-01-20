import { useStore } from '../store/useStore';

/**
 * Custom hook for authentication
 * Provides auth state and methods
 */
export const useAuth = () => {
  const { user, isAuthenticated, login, logout, register, updateProfile } = useStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
  };
};
