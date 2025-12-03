"use client";

import { useAppContext } from "@/context/AppContext";
import ApiConfig from "@/components/ApiConfig";
import LoginForm from "@/components/LoginForm";
import MedicinesList from "@/components/MedicinesList";

export default function Home() {
  const { token } = useAppContext();

  return (
    <main className="min-h-screen h-full b-white flex flex-col">
      <ApiConfig />
      <MedicinesList />
    </main>
  );
}
