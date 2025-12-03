"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import {
  ArrowLeft,
  Save,
  FileText,
  Activity,
  Stethoscope,
  PenLine,
} from "lucide-react";
// Importe o novo componente
import MedicineGallery from "@/components/MedicineGallery";

// ... (Interfaces LeafletData e MedicineDetail continuam aqui) ...
interface LeafletData {
  indicacoes: string[];
  contraindicacoes: string[];
  reacoes_adversas: string[];
  cuidados: string[];
  posologia: string[];
  riscos: string[];
  superdose: string[];
}

interface MedicineDetail {
  id: string;
  commercial_name: string;
  description: string;
  registry_code: string;
  categories?: string[];
  leaflet_data?: LeafletData;
}

export default function MedicineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { apiUrl, token } = useAppContext();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!apiUrl) return;
      try {
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["APIKEY"] = token;

        const res = await fetch(`${apiUrl}/medicines/${id}`, { headers });
        if (!res.ok) throw new Error("Falha ao buscar detalhes");
        const data = await res.json();
        setMedicine(data.medicine);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [apiUrl, token, id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Activity className="animate-spin text-blue-600 h-8 w-8" />
        <span className="text-slate-500 font-medium">
          Carregando prontuário...
        </span>
      </div>
    );

  if (!medicine) return <div className="p-10 text-center">Não encontrado.</div>;
  const safeCategories = medicine.categories || [];

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navegação */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft size={18} /> Voltar
          </Link>
          <button
            disabled
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>

        {/* Documento */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200 min-h-[800px]">
          {/* Cabeçalho */}
          <div className="bg-slate-50 border-b border-slate-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Stethoscope size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Ficha Técnica
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {medicine.commercial_name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                    Reg: {medicine.registry_code}
                  </span>
                  <span>|</span>
                  <div className="flex gap-1">
                    {safeCategories.length > 0
                      ? safeCategories.join(", ")
                      : "Sem categoria"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corpo do Documento */}
          <div className="p-8 md:p-12 space-y-10">
            {/* ---> AQUI: INSERIR A GALERIA DE FOTOS <--- */}
            <MedicineGallery medicineId={medicine.id} />

            {/* Seção: Descrição */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Descrição do
                Produto
              </h2>
              <textarea
                defaultValue={medicine.description}
                className="w-full min-h-[100px] p-3 text-slate-600 leading-relaxed bg-slate-50/50 border border-transparent hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-md transition-all resize-y outline-none"
              />
            </section>

            {/* Seção: Bula */}
            {medicine.leaflet_data ? (
              <div className="space-y-8">
                <DocumentSection
                  title="1. Indicações"
                  data={medicine.leaflet_data.indicacoes}
                  placeholder="Liste as indicações..."
                />
                <DocumentSection
                  title="2. Posologia"
                  data={medicine.leaflet_data.posologia}
                  placeholder="Descreva a posologia..."
                />
                <DocumentSection
                  title="3. Contraindicações"
                  data={medicine.leaflet_data.contraindicacoes}
                  placeholder="Liste contraindicações..."
                />
                <DocumentSection
                  title="4. Cuidados"
                  data={medicine.leaflet_data.cuidados}
                  placeholder="Cuidados necessários..."
                />
                <DocumentSection
                  title="5. Reações Adversas"
                  data={medicine.leaflet_data.reacoes_adversas}
                  placeholder="Efeitos colaterais..."
                />
                <DocumentSection
                  title="6. Riscos"
                  data={medicine.leaflet_data.riscos}
                  placeholder="Riscos..."
                />
                <DocumentSection
                  title="7. Superdose"
                  data={medicine.leaflet_data.superdose}
                  placeholder="Procedimentos..."
                />
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                <p>Nenhum dado de bula vinculado.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-6 text-center text-xs text-slate-400">
            Wikimedic System &copy; {new Date().getFullYear()} - Documento
            Confidencial
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente DocumentSection (Mantenha ele no final do arquivo)
function DocumentSection({
  title,
  data,
  placeholder,
}: {
  title: string;
  data: string[];
  placeholder: string;
}) {
  const contentList = data && data.length > 0 ? data : [""];
  return (
    <section className="group">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
        {title}
        <PenLine
          size={14}
          className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </h3>
      <div className="space-y-3">
        {contentList.map((text, index) => (
          <div key={index} className="relative">
            <textarea
              defaultValue={text}
              placeholder={placeholder}
              rows={Math.max(2, Math.ceil(text.length / 100))}
              className="w-full block w-full rounded-md border-0 py-2.5 px-3 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 resize-y bg-white"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
