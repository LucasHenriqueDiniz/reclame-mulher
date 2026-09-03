"use client";

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The formatting row above the Markdown editor.
 *
 * It reaches the textarea with `document.querySelector`, which is how it already
 * worked and is left alone here: this is a split, not a rewrite. It does mean the
 * toolbar edits whichever textarea is first in the document, so a second one on
 * this page would break it silently.
 */
export function MarkdownToolbar({
  content,
  onChange,
}: {
  content: string;
  onChange: (next: string) => void;
}) {
  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const before = content.substring(0, start);
    const after = content.substring(end);

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "bold":
        newText = `${before}**${selectedText}**${after}`;
        cursorOffset = selectedText ? 2 : 2 + placeholder.length;
        break;
      case "italic":
        newText = `${before}*${selectedText}*${after}`;
        cursorOffset = selectedText ? 1 : 1 + placeholder.length;
        break;
      case "h1":
        newText = `${before}\n# ${selectedText || "Título"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 6;
        break;
      case "h2":
        newText = `${before}\n## ${selectedText || "Subtítulo"}${after}`;
        cursorOffset = selectedText ? 4 : 4 + 10;
        break;
      case "quote":
        newText = `${before}\n> ${selectedText || "Citação"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 8;
        break;
      case "ul":
        newText = `${before}\n- ${selectedText || "Item"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 4;
        break;
      case "ol":
        newText = `${before}\n1. ${selectedText || "Item"}${after}`;
        cursorOffset = selectedText ? 4 : 4 + 4;
        break;
      case "link":
        newText = `${before}[${selectedText || "texto"}](url)${after}`;
        cursorOffset = selectedText ? selectedText.length + 3 : 9;
        break;
      case "image":
        newText = `${before}![${selectedText || "alt"}](url)${after}`;
        cursorOffset = selectedText ? selectedText.length + 4 : 9;
        break;
      case "code":
        newText = `${before}\`${selectedText || "código"}\`${after}`;
        cursorOffset = selectedText ? 1 : 1 + 7;
        break;
      case "hr":
        newText = `${before}\n\n---\n\n${after}`;
        cursorOffset = 6;
        break;
      default:
        return;
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-xl border border-b-0 border-gray-200">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("bold", "texto em negrito")}
        title="Negrito"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("italic", "texto em itálico")}
        title="Itálico"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("h1")}
        title="Título H1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("h2")}
        title="Título H2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("ul")}
        title="Lista"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("ol")}
        title="Lista Numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("quote")}
        title="Citação"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("code")}
        title="Código"
      >
        <Code className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("link")}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("image")}
        title="Imagem"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
