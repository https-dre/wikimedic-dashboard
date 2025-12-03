"use client";

import { useAppContext } from "@/context/AppContext";
import ApiConfig from "@/components/ApiConfig";
import LoginForm from "@/components/LoginForm";
import MedicinesList from "@/components/MedicinesList";

export default function Home() {
  const { token } = useAppContext();

  return (
    <main className="min-h-screen b-white flex flex-col">
      <ApiConfig />

      <div className="flex-1 container bg-white mx-auto max-w-6xl">
        {!token ? <LoginForm /> : <MedicinesList />}
      </div>
    </main>
  );
}
