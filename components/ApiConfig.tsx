"use client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Settings, Save, LogOut } from "lucide-react";

export default function ApiConfig() {
  const { apiUrl, setApiUrl, token, logout } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const handleSave = () => {
    setApiUrl(tempUrl);
    setIsOpen(false);
    alert(`API URL atualizada para: ${tempUrl}`);
  };

  return (
    // MUDANÇA: bg-slate-800 -> bg-blue-600 (Azul Médico Principal)
    <div className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Ícone ou Logo simples */}
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Wikimedic</h1>
            {/* Badge mais sutil */}
            <p className="text-[10px] text-blue-100 opacity-80 font-mono">
              {apiUrl}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setTempUrl(apiUrl);
            }}
            className="text-sm font-medium hover:bg-blue-500 px-3 py-1.5 rounded transition flex items-center gap-2"
          >
            <Settings size={16} /> Configurar
          </button>

          {token && (
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded transition flex items-center gap-2"
            >
              <LogOut size={16} /> Sair
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-20 right-4 md:right-20 bg-white text-slate-800 p-4 rounded-lg shadow-xl border border-blue-100 z-50 w-80 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">
            Endpoint da API
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="border border-slate-300 p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
