"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import {
  Activity,
  Eye,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Stethoscope, // Mudei o ícone para um estetoscópio, mais médico
} from "lucide-react";

interface Medicine {
  id: string;
  commercial_name: string;
  description: string;
  registry_code: string;
  categories: string[];
}

export default function MedicinesList() {
  const { apiUrl, token } = useAppContext();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const fetchMedicines = useCallback(async () => {
    if (!apiUrl) return;
    setLoading(true);

    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["APIKEY"] = token;

      let data;
      let currentListSize = 0;

      if (searchText.trim().length > 0) {
        const res = await fetch(`${apiUrl}/medicines/search`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ name: searchText }),
        });
        if (!res.ok) throw new Error("Erro na busca");
        data = await res.json();
        const results = data.medicines || [];
        setMedicines(results);
        currentListSize = results.length;
        setHasMore(false);
      } else {
        const res = await fetch(
          `${apiUrl}/medicines?page=${page}&pageSize=${pageSize}`,
          { method: "GET", headers }
        );
        if (!res.ok) throw new Error("Erro ao listar");
        data = await res.json();
        const results = data.medicines || [];
        setMedicines(results);
        currentListSize = results.length;
        if (currentListSize < pageSize) setHasMore(false);
        else setHasMore(true);
      }
    } catch (error) {
      console.error("Erro:", error);
      setMedicines([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, page, searchText]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMedicines(), 500);
    return () => clearTimeout(timer);
  }, [fetchMedicines]);

  const handleNextPage = () => {
    if (hasMore) setPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setPage(1);
    setHasMore(false);
  };

  return (
    <div className="p-6 w-full bg-white">
      {/* --- Cabeçalho --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
            {/* Ícone Azul */}
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="text-blue-600" size={28} />
            </div>
            Catálogo
          </h2>
          <p className="text-slate-500 mt-1 ml-1">
            Gerenciamento da base de medicamentos
          </p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchText}
            onChange={handleSearchChange}
            // Foco Azul
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* --- Tabela --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/90 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
              <span className="text-xs text-blue-600 font-medium animate-pulse">
                Carregando...
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 tracking-wider text-blue-900">
                  Medicamento
                </th>
                <th className="px-6 py-4 tracking-wider text-blue-900">
                  Registro MS
                </th>
                <th className="px-6 py-4 tracking-wider text-blue-900">
                  Classificação
                </th>
                <th className="px-6 py-4 text-center tracking-wider text-blue-900">
                  Opções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.length > 0
                ? medicines.map((med) => (
                    <tr
                      key={med.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 text-base block">
                          {med.commercial_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[11px] font-mono border border-slate-200">
                          {med.registry_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap w-48">
                          {med.categories?.map((cat, idx) => (
                            // Tags Azuis
                            <span
                              key={idx}
                              className="text-[10px] uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold border border-blue-100"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/medicines/${med.id}`}
                          // Botão Outline Azul
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition text-xs font-medium"
                        >
                          <Eye size={14} /> Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-16 text-center text-slate-400"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-slate-200 mb-3" />
                          <p>Nenhum medicamento localizado na base.</p>
                        </div>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Rodapé --- */}
      {!loading && searchText === "" && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-sm text-slate-500">
            Mostrando página{" "}
            <span className="font-bold text-slate-900">{page}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || medicines.length === 0}
              className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
