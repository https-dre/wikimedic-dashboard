"use client";

import { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface NotionListInputProps {
  title: string;
  data: string[];
  onChange: (newData: string[]) => void;
  placeholder?: string;
}

export default function NotionListInput({
  title,
  data,
  onChange,
  placeholder,
}: NotionListInputProps) {
  // Cria o editor
  const editor = useCreateBlockNote({
    // Removemos a linha 'dictionary' que estava dando erro

    // Configuração para tirar o "Vermelho" (Corretor)
    domAttributes: {
      editor: {
        spellcheck: "false", // <--- ISSO resolve o sublinhado vermelho
        class: "min-h-[50px]",
      },
    },
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARREGAR DADOS
  useEffect(() => {
    async function loadInitialData() {
      const markdownToLoad = data && data.length > 0 ? data.join("\n\n") : "";

      // Verifica se o editor já está pronto antes de tentar parsear
      if (editor) {
        const blocks = await editor.tryParseMarkdownToBlocks(markdownToLoad);
        editor.replaceBlocks(editor.document, blocks);
        setIsLoaded(true);
      }
    }

    if (!isLoaded && editor) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. SALVAR DADOS
  const handleChange = async () => {
    if (!editor) return;

    const markdown = await editor.blocksToMarkdownLossy(editor.document);

    const stringArray = markdown
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    onChange(stringArray);
  };

  if (!isLoaded)
    return (
      <div className="h-[50px] bg-slate-50 animate-pulse rounded-md border border-slate-200" />
    );

  return (
    <section className="group mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          {title}
        </h3>
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden bg-white hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all py-3 px-1">
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          theme="light"
          formattingToolbar={true}
          sideMenu={false}
        />

        <style jsx global>{`
          .bn-editor {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .bn-block-content {
            margin-left: 0 !important;
          }
          .bn-block-outer {
            margin-bottom: 0.6rem !important;
          }
          .bn-block-outer:last-child {
            margin-bottom: 0 !important;
          }
        `}</style>

        {!data?.length && (
          <style>{`.bn-editor:empty:before { content: "${
            placeholder || "Digite aqui..."
          }"; color: #94a3b8; pointer-events: none; padding-left: 4px; }`}</style>
        )}
      </div>
    </section>
  );
}
