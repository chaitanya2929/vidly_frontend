import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
import api from "@/services/api"; // Your api service

// Define the shape of your user object (decoded from the token)
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  // Add any other properties from your JWT payload
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true

  // This useEffect runs ONCE on app load
  // It checks if a token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token and set user
        const decodedUser = jwtDecode<User>(token);
        setUser(decodedUser);
        // Set token in api headers for all future requests
        api.defaults.headers.common["x-auth-token"] = token;
      } catch (error) {
        // Invalid token
        localStorage.removeItem("token");
      }
    }
    // Finished checking auth
    setLoading(false);
  }, []); // Empty array means run once on mount

  // This is the login function Login.tsx calls
  const login = (token: string) => {
    try {
      // 1. Set token in localStorage
      localStorage.setItem("token", token);
      
      // 2. Decode token to get user info
      const decodedUser = jwtDecode<User>(token);

      // 3. THIS IS THE CRITICAL STEP
      //    Set the user state
      setUser(decodedUser);

      // 4. Set token in api headers
      api.defaults.headers.common["x-auth-token"] = token;
    } catch (error) {
      console.error("Failed to decode token", error);
    }
  };

  // This is the logout function
  const logout = () => {
    // 1. Remove token from localStorage
    localStorage.removeItem("token");
    
    // 2. Clear user from state
    setUser(null);
    
    // 3. Remove token from api headers
    delete api.defaults.headers.common["x-auth-token"];
  };

  // Provide the auth state to children
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};