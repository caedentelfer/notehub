"use client";

import React, { createContext, useState, useEffect } from "react";
import { refreshToken } from "../utils/api";

/**
 * UserContext provides the context for user authentication state, including the user object, token, and functions to log in or log out.
 */
export const UserContext = createContext({
  user: null,
  token: null,
  login: (user, token, rememberMe) => {},
  logout: () => {},
  setUser: (user) => {}, // Add setUser to the context
});

/**
 * UserProvider component manages the authentication state (user and token) and provides login and logout functionalities.
 * It stores user and token in localStorage and loads them on initial render.
 * @returns {JSX.Element} - The UserContext.Provider wrapping child components.
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for user
  const [token, setToken] = useState(null); // State for token

  /**
   * Load user and token from localStorage when the component mounts.
   * If both user and token are found in localStorage, update the state.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const refreshTokenPeriodically = async () => {
      try {
        const response = await refreshToken();
        setToken(response.token);
      } catch (error) {
        console.error("Failed to refresh token:", error);
        logout();
      }
    };

    if (token) {
      const refreshInterval = setInterval(
        refreshTokenPeriodically,
        55 * 60 * 1000
      ); // Refresh every 55 minutes
      return () => clearInterval(refreshInterval);
    }
  }, [token]);

  const login = (userData, tokenData, rememberMe) => {
    setUser(userData);
    setToken(tokenData);
    if (rememberMe) {
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", tokenData);
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      sessionStorage.setItem("token", tokenData);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
