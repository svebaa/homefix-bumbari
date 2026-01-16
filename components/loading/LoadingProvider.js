"use client";

import { createContext, useContext, useRef, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const counter = useRef(0);

  function start() {
    counter.current += 1;
    setVisible(true);
  }

  function stop() {
    counter.current = Math.max(0, counter.current - 1);
    if (counter.current === 0) {
      setVisible(false);
    }
  }

  return (
    <LoadingContext.Provider value={{ start, stop }}>
      {children}
      <LoadingOverlay open={visible} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
}
