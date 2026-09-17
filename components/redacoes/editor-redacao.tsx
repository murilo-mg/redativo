"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type EditorRedacaoProps = {
  action: (formData: FormData) => void | Promise<void>;
  id?: string;
  tituloInicial?: string;
  temaInicial?: string;
  conteudoInicial?: JSONContent | null;
  textoInicial?: string;
  textoBotao?: string;
};

export function EditorRedacao({
  action,
  id,
  tituloInicial = "",
  temaInicial = "",
  conteudoInicial = null,
  textoInicial = "",
  textoBotao = "Salvar rascunho",
}: EditorRedacaoProps) {
  const [conteudo, setConteudo] = useState(
    JSON.stringify(
      conteudoInicial ?? {
        type: "doc",
        content: [
          {
            type: "paragraph",
          },
        ],
      },
    ),
  );

  const [textoPlain, setTextoPlain] = useState(textoInicial);

  const editor = useEditor({
    extensions: [StarterKit],
    content: conteudoInicial ?? undefined,
    immediatelyRender: false,

    onUpdate({ editor: editorAtualizado }) {
      setConteudo(JSON.stringify(editorAtualizado.getJSON()));
      setTextoPlain(editorAtualizado.getText());
    },
  });

  if (!editor) {
    return <p>Carregando editor...</p>;
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      {id && <input type="hidden" name="id" value={id} />}

      <input type="hidden" name="conteudo" value={conteudo} />
      <input type="hidden" name="texto_plain" value={textoPlain} />

      <div className="space-y-2">
        <label htmlFor="titulo" className="block text-sm font-medium">
          Título
        </label>

        <input
          id="titulo"
          name="titulo"
          type="text"
          defaultValue={tituloInicial}
          required
          className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-zinc-400"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tema" className="block text-sm font-medium">
          Tema da redação
        </label>

        <input
          id="tema"
          name="tema"
          type="text"
          defaultValue={temaInicial}
          required
          className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-zinc-400"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-700">
        <div className="flex flex-wrap gap-2 border-b border-zinc-700 p-3">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-md border px-3 py-1 text-sm ${
              editor.isActive("bold")
                ? "bg-zinc-200 text-zinc-900"
                : "border-zinc-700"
            }`}
          >
            Negrito
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-md border px-3 py-1 text-sm ${
              editor.isActive("italic")
                ? "bg-zinc-200 text-zinc-900"
                : "border-zinc-700"
            }`}
          >
            Itálico
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded-md border px-3 py-1 text-sm ${
              editor.isActive("bulletList")
                ? "bg-zinc-200 text-zinc-900"
                : "border-zinc-700"
            }`}
          >
            Lista
          </button>
        </div>

        <EditorContent
          editor={editor}
          className="min-h-96 px-4 py-4 [&_.ProseMirror]:min-h-80 [&_.ProseMirror]:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {textoPlain.trim().length} caracteres
        </p>

        <button
          type="submit"
          className="rounded-md bg-white px-5 py-2 font-medium text-black hover:bg-zinc-200"
        >
          {textoBotao}
        </button>
      </div>
    </form>
  );
}