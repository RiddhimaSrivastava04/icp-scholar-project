import React, { createContext, useContext, useState, useEffect } from 'react';
import internetIdentityService from '../services/InternetIdentityService';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [actor, setActor] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const result = await internetIdentityService.initialize();
      if (result.success && result.isAuthenticated) {
        setIsAuthenticated(true);
        setIdentity(internetIdentityService.getIdentity());
        setActor(internetIdentityService.getActor());
        setUser(internetIdentityService.getUser());

        // Get balance
        const userBalance = await internetIdentityService.getBalance();
        setBalance(userBalance);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const result = await internetIdentityService.login();
      if (result.success) {
        setIsAuthenticated(true);
        setIdentity(result.identity);
        setActor(result.actor);
        setUser(result.user);

        // Get balance
        const userBalance = await internetIdentityService.getBalance();
        setBalance(userBalance);

        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await internetIdentityService.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setActor(null);
      setUser(null);
      setBalance(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const registerUser = async (username, role) => {
    try {
      const result = await internetIdentityService.registerUser(username, role);
      if (result.success) {
        setUser(result.user);

        // Update balance after registration
        const userBalance = await internetIdentityService.getBalance();
        setBalance(userBalance);

        return result;
      } else {
        // Return the error without throwing, so the UI can handle it gracefully
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserData = async () => {
    try {
      const result = await internetIdentityService.updateUserData();
      if (result.success) {
        setUser(result.user);

        // Update balance
        const userBalance = await internetIdentityService.getBalance();
        setBalance(userBalance);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const refreshBalance = async () => {
    try {
      const userBalance = await internetIdentityService.getBalance();
      setBalance(userBalance);
      return userBalance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
      return balance;
    }
  };

  const checkUserExists = async () => {
    try {
      return await internetIdentityService.checkUserExists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    identity,
    actor,
    user,
    isLoading,
    balance,
    login,
    logout,
    registerUser,
    updateUserData,
    refreshBalance,
    checkUserExists,
    principal: internetIdentityService.getPrincipal(),
    hasProfile: internetIdentityService.hasUserProfile(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
