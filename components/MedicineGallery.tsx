"use client";

import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";

interface MedicinePhoto {
  url: string;
  key: string;
}

export default function MedicineGallery({
  medicineId,
}: {
  medicineId: string;
}) {
  const { apiUrl, token } = useAppContext();
  const [photos, setPhotos] = useState<MedicinePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Buscar Fotos ---
  const fetchPhotos = async () => {
    if (!apiUrl) return;
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["APIKEY"] = token;

      const res = await fetch(`${apiUrl}/medicines/${medicineId}/photos`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        // Ajuste: O Swagger não detalha a estrutura exata de resposta (array direto ou objeto),
        // assumindo que vem { photos: [...] } ou direto o array. Adapte se necessário.
        setPhotos(Array.isArray(data) ? data : data.photos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar fotos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, token, medicineId]);

  // --- 2. Deletar Foto (PATCH) ---
  const handleDelete = async (photoKey: string) => {
    if (!confirm("Tem certeza que deseja apagar esta imagem?")) return;

    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["APIKEY"] = token;

      // PATCH /medicines/photos com body { key }
      const res = await fetch(`${apiUrl}/medicines/photos`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ key: photoKey }),
      });

      if (!res.ok) throw new Error("Erro ao deletar");

      // Atualiza lista local removendo o item
      setPhotos((prev) => prev.filter((p) => p.key !== photoKey));
    } catch (error) {
      alert("Erro ao apagar imagem.");
    }
  };

  // --- 3. Upload de Foto (POST Multipart) ---
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // Cria o FormData para envio de arquivo
      const formData = new FormData();
      formData.append("file", selectedFile);

      const headers: any = {};
      if (token) headers["APIKEY"] = token;
      // IMPORTANTE: Não defina Content-Type aqui. O browser define como multipart/form-data automaticamente.

      const res = await fetch(`${apiUrl}/medicines/${medicineId}/photos`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload");

      // Sucesso
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchPhotos(); // Recarrega a galeria
    } catch (error) {
      alert("Erro ao enviar imagem.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="mb-8">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon size={18} className="text-blue-500" /> Anexos Fotográficos
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition font-medium border border-blue-100"
        >
          <Plus size={14} /> Adicionar Foto
        </button>
      </div>

      {/* Grid de Imagens */}
      {loading ? (
        <div className="text-center py-4 text-slate-400 text-sm">
          Carregando imagens...
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.key || index}
              className="group relative aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Foto do medicamento"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay de Delete */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.key)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition shadow-lg"
                  title="Excluir imagem"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center flex flex-col items-center justify-center text-slate-400 gap-2">
          <ImageIcon size={32} className="opacity-20" />
          <p className="text-sm">Nenhuma imagem anexada.</p>
        </div>
      )}

      {/* --- MODAL DE UPLOAD --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Nova Foto</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Área de Seleção */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <>
                    <ImageIcon className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-700">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-emerald-500">
                      Clique para trocar
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Clique para selecionar
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Enviar Foto"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
