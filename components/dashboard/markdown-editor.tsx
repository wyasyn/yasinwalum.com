"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MarkdownEditorProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  autosave?: boolean;
  draftKey?: string;
};

type Mode = "write" | "preview";
type DraftState = "idle" | "saving" | "saved";

const actions = [
  { label: "Bold", prefix: "**", suffix: "**" },
  { label: "Italic", prefix: "*", suffix: "*" },
  { label: "H2", prefix: "## ", suffix: "" },
  { label: "Code", prefix: "`", suffix: "`" },
  { label: "Link", prefix: "[text](", suffix: ")" },
] as const;

async function toHtml(markdown: string): Promise<string> {
  if (!markdown.trim()) {
    return "";
  }

  const result = await remark().use(remarkHtml).process(markdown);
  return String(result);
}

function filenameToAlt(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  return base.length > 0 ? base : "image";
}

export function MarkdownEditor({
  id,
  name,
  label,
  defaultValue = "",
  rows = 16,
  required,
  autosave = true,
  draftKey,
}: MarkdownEditorProps) {
  const pathname = usePathname();
  const storageKey = draftKey ?? `portfolio:markdown-draft:${pathname}:${name}`;

  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<Mode>("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [uploadError, setUploadError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    const words = value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length;
    return {
      words,
      chars: value.length,
    };
  }, [value]);

  useEffect(() => {
    if (!autosave) {
      return;
    }

    const saved = localStorage.getItem(storageKey);

    if (saved && saved !== defaultValue) {
      setValue(saved);
      setDraftState("saved");
    }
  }, [autosave, defaultValue, storageKey]);

  useEffect(() => {
    if (!autosave) {
      return;
    }

    setDraftState("saving");

    const timeout = window.setTimeout(() => {
      localStorage.setItem(storageKey, value);
      setDraftState("saved");
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [autosave, storageKey, value]);

  async function switchToPreview() {
    setMode("preview");
    setLoadingPreview(true);

    const html = await toHtml(value);

    setPreviewHtml(html);
    setLoadingPreview(false);
  }

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setValue((current) => `${current}\n${text}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;

    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function applyFormat(prefix: string, suffix: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;

    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function clearDraft() {
    localStorage.removeItem(storageKey);
    setDraftState("idle");
  }

  async function uploadMarkdownImage(file: File) {
    setUploadError("");
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads/markdown-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setUploadError("Image upload failed.");
        return;
      }

      const payload = (await response.json()) as { url?: string };

      if (!payload.url) {
        setUploadError("Image upload failed.");
        return;
      }

      const alt = filenameToAlt(file.name);
      insertAtCursor(`![${alt}](${payload.url})`);
    } catch {
      setUploadError("Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">
          {stats.words} words, {stats.chars} chars
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormat(action.prefix, action.suffix)}
          >
            {action.label}
          </Button>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadMarkdownImage(file);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage ? "Uploading..." : "Upload Image"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={mode === "write" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("write")}
        >
          Write
        </Button>
        <Button
          type="button"
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={switchToPreview}
        >
          Preview
        </Button>

        {autosave ? (
          <>
            <span className="text-xs text-muted-foreground">
              Draft: {draftState === "saving" ? "Saving..." : draftState === "saved" ? "Saved" : "Not saved"}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={clearDraft}>
              Clear Draft
            </Button>
          </>
        ) : null}
      </div>

      {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}

      {mode === "write" ? (
        <Textarea
          id={id}
          name={name}
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required={required}
          className="font-mono"
        />
      ) : (
        <div className="min-h-60 rounded-md border bg-muted/20 p-4">
          {loadingPreview ? (
            <p className="text-sm text-muted-foreground">Rendering preview...</p>
          ) : previewHtml ? (
            <article
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
