"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Inicializa com a Env Var, mas permite sobreescrita
  const [apiUrl, setApiUrl] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Carrega a URL do env na montagem inicial
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

    // Tenta recuperar token salvo (opcional, para persistência simples)
    const savedToken = localStorage.getItem("wikimedic_token");
    if (savedToken) setToken(savedToken);
  }, []);

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) localStorage.setItem("wikimedic_token", newToken);
    else localStorage.removeItem("wikimedic_token");
  };

  const logout = () => handleSetToken(null);

  return (
    <AppContext.Provider
      value={{ apiUrl, setApiUrl, token, setToken: handleSetToken, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
}
