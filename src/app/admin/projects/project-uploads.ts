import * as tus from "tus-js-client";

export const MAX_PROJECT_UPLOAD_BYTES = 150 * 1024 * 1024;
export const PROJECT_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const PROJECT_FILE_ACCEPT =
  ".zip,.py,.ipynb,.js,.jsx,.ts,.tsx,.html,.css,.sql,.r,.rmd,.csv,.xlsx,.xls,.pdf,.md,.txt,.json,.pptx,.docx";

const imageContentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const projectFileContentTypes: Record<string, string> = {
  zip: "application/zip",
  py: "text/x-python",
  ipynb: "application/json",
  js: "text/javascript",
  jsx: "text/javascript",
  ts: "text/plain",
  tsx: "text/plain",
  html: "text/html",
  css: "text/css",
  sql: "text/plain",
  r: "text/plain",
  rmd: "text/markdown",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pdf: "application/pdf",
  md: "text/markdown",
  txt: "text/plain",
  json: "application/json",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function getProjectImageContentType(fileName: string): string | null {
  return imageContentTypes[getExtension(fileName)] ?? null;
}

export function getProjectFileContentType(fileName: string): string | null {
  return projectFileContentTypes[getExtension(fileName)] ?? null;
}

export async function hasValidProjectImageSignature(
  file: File,
  contentType: string,
): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (contentType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export function getProjectStoragePath(userId: string, fileName: string): string {
  const extension = getExtension(fileName);
  return `${userId}/${crypto.randomUUID()}.${extension}`;
}

export function uploadProjectObject({
  supabaseUrl,
  accessToken,
  bucketName,
  objectPath,
  file,
  contentType,
  onProgress,
}: {
  supabaseUrl: string;
  accessToken: string;
  bucketName: string;
  objectPath: string;
  file: File;
  contentType: string;
  onProgress: (percentage: number) => void;
}): Promise<void> {
  const parsedUrl = new URL(supabaseUrl);
  const endpoint = parsedUrl.hostname.endsWith(".supabase.co")
    ? `https://${parsedUrl.hostname.replace(".supabase.co", ".storage.supabase.co")}/storage/v1/upload/resumable`
    : `${supabaseUrl.replace(/\/$/, "")}/storage/v1/upload/resumable`;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName,
        objectName: objectPath,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: reject,
      onProgress(bytesUploaded, bytesTotal) {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        resolve();
      },
    });

    upload.start();
  });
}
