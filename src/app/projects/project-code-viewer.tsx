"use client";

import { useState } from "react";

const MAX_PROJECT_CODE_PREVIEW_BYTES = 512 * 1024;
const MAX_NOTEBOOK_FILE_BYTES = 10 * 1024 * 1024;

async function fetchProjectCodePreview(
  fileUrl: string,
  maxBytes: number,
): Promise<{ source: string; truncated: boolean }> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Could not load the code preview (HTTP ${response.status}).`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Your browser could not read this code preview.");
  }

  const decoder = new TextDecoder();
  let source = "";
  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return { source: source + decoder.decode(), truncated: false };
    }

    const remainingBytes = maxBytes - bytesRead;
    if (value.byteLength > remainingBytes) {
      source += decoder.decode(value.subarray(0, remainingBytes), {
        stream: true,
      });
      source += decoder.decode();
      await reader.cancel();
      return { source, truncated: true };
    }

    bytesRead += value.byteLength;
    source += decoder.decode(value, { stream: true });
  }
}

function formatNotebookPreview(
  notebookJson: string,
): { source: string; truncated: boolean } {
  let notebook: unknown;
  try {
    notebook = JSON.parse(notebookJson);
  } catch {
    throw new Error("This notebook file is not valid JSON.");
  }

  if (
    typeof notebook !== "object" ||
    notebook === null ||
    !("cells" in notebook) ||
    !Array.isArray(notebook.cells)
  ) {
    throw new Error("This file does not contain a valid notebook.");
  }

  const cells = notebook.cells.map((cell, index) => {
    if (typeof cell !== "object" || cell === null) {
      return `# Cell ${index + 1}\n`;
    }

    const cellType =
      "cell_type" in cell && typeof cell.cell_type === "string"
        ? cell.cell_type
        : "cell";
    const source =
      "source" in cell && typeof cell.source === "string"
        ? cell.source
        : "source" in cell && Array.isArray(cell.source)
          ? cell.source
              .filter((line: unknown): line is string => typeof line === "string")
              .join("")
          : "";

    return `# ${cellType} cell ${index + 1}\n${source}`;
  });
  const source = cells.join("\n\n");
  const bytes = new TextEncoder().encode(source);
  if (bytes.byteLength <= MAX_PROJECT_CODE_PREVIEW_BYTES) {
    return { source, truncated: false };
  }

  return {
    source: new TextDecoder().decode(
      bytes.slice(0, MAX_PROJECT_CODE_PREVIEW_BYTES),
    ),
    truncated: true,
  };
}

export default function ProjectCodeViewer({
  assetId,
  fileName,
  fileUrl,
}: {
  assetId: string;
  fileName: string;
  fileUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      if (fileName.toLowerCase().endsWith(".ipynb")) {
        const preview = await fetchProjectCodePreview(
          fileUrl,
          MAX_NOTEBOOK_FILE_BYTES,
        );
        if (preview.truncated) {
          throw new Error(
            "This notebook is larger than 10 MB and cannot be previewed here. Add a GitHub link to view it.",
          );
        }
        const notebookPreview = formatNotebookPreview(preview.source);
        setSource(notebookPreview.source);
        setTruncated(notebookPreview.truncated);
      } else {
        const preview = await fetchProjectCodePreview(
          fileUrl,
          MAX_PROJECT_CODE_PREVIEW_BYTES,
        );
        setSource(preview.source);
        setTruncated(preview.truncated);
      }
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Could not load the code preview.",
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePreview() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && source === null && !loading) {
      void loadPreview();
    }
  }

  const previewId = `project-code-preview-${assetId}`;

  return (
    <div className="project-code-viewer">
      <button
        type="button"
        className="project-code-view-button"
        aria-expanded={open}
        aria-controls={previewId}
        onClick={togglePreview}
      >
        {open ? "Hide" : "View"} {fileName}
      </button>
      {open && (
        <div className="project-code-preview" id={previewId}>
          {loading && <p role="status">Loading code preview…</p>}
          {error && <p className="experience-state--error" role="alert">{error}</p>}
          {source !== null && (
            <>
              {truncated && (
                <p role="status">
                  Showing a preview only. Add a GitHub link to view the full file.
                </p>
              )}
              <pre><code>{source}</code></pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
