"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Unit = "km" | "mile";

const DistanceUnitContext = createContext<{
  unit: Unit;
  setUnit: (unit: Unit) => void;
} | null>(null);

export const DistanceUnitProvider = ({ children }: { children: React.ReactNode }) => {
  const [unit, setUnit] = useState<Unit>("km");

  // Load once
  useEffect(() => {
    const saved = localStorage.getItem("distance_unit") as Unit | null;
    if (saved) setUnit(saved);
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem("distance_unit", unit);
  }, [unit]);

  return (
    <DistanceUnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </DistanceUnitContext.Provider>
  );
};

export const useDistanceUnit = () => {
  const ctx = useContext(DistanceUnitContext);
  if (!ctx) throw new Error("Wrap with DistanceUnitProvider");
  return ctx;
};