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
  Loader2,
} from "lucide-react";
import MedicineGallery from "@/components/MedicineGallery";
import NotionListInput from "@/components/NotionListInput";

// --- Interfaces ---
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

  const [formData, setFormData] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!apiUrl) return;
      try {
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["APIKEY"] = token;

        const res = await fetch(`${apiUrl}/medicines/${id}`, { headers });
        if (!res.ok) throw new Error("Falha ao buscar detalhes");
        const data = await res.json();
        setFormData(data.medicine);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [apiUrl, token, id]);

  // --- Handlers ---

  const handleBasicChange = (field: keyof MedicineDetail, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // MUDANÇA AQUI: Agora recebe o array inteiro já processado pelo split('\n')
  const handleLeafletChange = (
    section: keyof LeafletData,
    newArrayValues: string[]
  ) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newLeaflet = { ...(prev.leaflet_data || ({} as LeafletData)) };

      // Atualiza a seção inteira com o novo array
      newLeaflet[section] = newArrayValues;

      return { ...prev, leaflet_data: newLeaflet };
    });
  };

  const handleSave = async () => {
    if (!formData || !apiUrl) return;
    setSaving(true);

    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["APIKEY"] = token;

      // 1. Dados Básicos
      const reqBasic = fetch(`${apiUrl}/medicines/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          updated_fields: {
            commercial_name: formData.commercial_name,
            description: formData.description,
            registry_code: formData.registry_code,
          },
        }),
      });

      // 2. Bula (Envia os arrays atualizados)
      const reqLeaflet = fetch(`${apiUrl}/medicines/${id}/leaflet`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          updated_fields: formData.leaflet_data,
        }),
      });

      await Promise.all([reqBasic, reqLeaflet]);
      alert("Medicamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="animate-spin text-blue-600" />
      </div>
    );
  if (!formData) return <div className="p-10 text-center">Não encontrado.</div>;

  const safeCategories = formData.categories || [];
  const safeLeaflet = formData.leaflet_data || {
    indicacoes: [],
    contraindicacoes: [],
    reacoes_adversas: [],
    cuidados: [],
    posologia: [],
    riscos: [],
    superdose: [],
  };

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
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-70 transition shadow-sm font-medium"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200 min-h-[800px]">
          {/* Cabeçalho */}
          <div className="bg-slate-50 border-b border-slate-200 p-8">
            <div className="w-full">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Stethoscope size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Ficha Técnica
                </span>
              </div>

              <input
                type="text"
                value={formData.commercial_name}
                onChange={(e) =>
                  handleBasicChange("commercial_name", e.target.value)
                }
                className="text-3xl font-bold text-slate-900 mb-2 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full transition-colors"
              />

              <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                <div className="flex items-center gap-1 bg-slate-200 px-2 py-0.5 rounded">
                  <span className="text-xs font-bold">REG:</span>
                  <input
                    type="text"
                    value={formData.registry_code}
                    onChange={(e) =>
                      handleBasicChange("registry_code", e.target.value)
                    }
                    className="bg-transparent text-slate-700 font-mono text-xs w-24 focus:outline-none border-b border-transparent focus:border-blue-500"
                  />
                </div>
                <span>|</span>
                <div className="flex gap-1">
                  {safeCategories.length > 0
                    ? safeCategories.join(", ")
                    : "Sem categoria"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            <MedicineGallery medicineId={formData.id} />

            <section>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Descrição do
                Produto
              </h2>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleBasicChange("description", e.target.value)
                }
                className="w-full min-h-[100px] p-3 text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-200 rounded-md focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 transition-all resize-y outline-none"
              />
            </section>

            {/* Bula Editável (Textareas Únicos) */}
            <div className="space-y-8">
              <NotionListInput
                title="1. Indicações"
                data={safeLeaflet.indicacoes}
                onChange={(newArray) =>
                  handleLeafletChange("indicacoes", newArray)
                }
                placeholder="Ex: Indicado para tratamento de..."
              />

              <NotionListInput
                title="2. Posologia"
                data={safeLeaflet.posologia}
                onChange={(newArray) =>
                  handleLeafletChange("posologia", newArray)
                }
                placeholder="Ex: Tomar 1 comprimido a cada 8 horas..."
              />

              <NotionListInput
                title="3. Contraindicações"
                data={safeLeaflet.contraindicacoes}
                onChange={(newArray) =>
                  handleLeafletChange("contraindicacoes", newArray)
                }
                placeholder="Ex: Não usar em caso de gravidez..."
              />

              <NotionListInput
                title="4. Cuidados"
                data={safeLeaflet.cuidados}
                onChange={(newArray) =>
                  handleLeafletChange("cuidados", newArray)
                }
                placeholder="Cuidados gerais..."
              />

              <NotionListInput
                title="5. Reações Adversas"
                data={safeLeaflet.reacoes_adversas}
                onChange={(newArray) =>
                  handleLeafletChange("reacoes_adversas", newArray)
                }
                placeholder="Efeitos colaterais..."
              />

              <NotionListInput
                title="6. Riscos"
                data={safeLeaflet.riscos}
                onChange={(newArray) => handleLeafletChange("riscos", newArray)}
                placeholder="Riscos associados..."
              />

              <NotionListInput
                title="7. Superdose"
                data={safeLeaflet.superdose}
                onChange={(newArray) =>
                  handleLeafletChange("superdose", newArray)
                }
                placeholder="Procedimentos de emergência..."
              />
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-6 text-center text-xs text-slate-400">
            Wikimedic System &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
