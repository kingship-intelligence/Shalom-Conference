import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FolderOpen, Upload } from "lucide-react";
import {
  getListShalomFilesQueryKey,
  useCompleteShalomFileUpload,
  useListShalomFiles,
  useRequestShalomFileDownloadUrl,
  useRequestShalomFileUploadUrl,
} from "@workspace/api-client-react";
import AdminSection from "@/components/AdminSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

type UploadJob = {
  id: string;
  name: string;
  progress: number;
  error: string;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadToStorage(
  uploadURL: string,
  file: File,
  contentType: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadURL);
    request.setRequestHeader("Content-Type", contentType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("The file could not be uploaded."));
    };
    request.onerror = () => reject(new Error("The file could not be uploaded."));
    request.send(file);
  });
}

export default function ShalomFilesPanel({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [actionError, setActionError] = useState("");
  const filesQuery = useListShalomFiles({
    query: {
      queryKey: getListShalomFilesQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const requestUpload = useRequestShalomFileUploadUrl({
    request: { credentials: "include" },
  });
  const completeUpload = useCompleteShalomFileUpload({
    request: { credentials: "include" },
  });
  const requestDownload = useRequestShalomFileDownloadUrl({
    request: { credentials: "include" },
  });

  function updateJob(id: string, patch: Partial<UploadJob>) {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }

  async function uploadFiles(fileList: FileList | File[]) {
    setActionError("");
    const files = [...fileList];
    for (const file of files) {
      const id = `${file.name}-${file.size}-${crypto.randomUUID()}`;
      setJobs((current) => [...current, { id, name: file.name, progress: 0, error: "" }]);
      if (file.size < 1 || file.size > MAX_FILE_BYTES) {
        updateJob(id, { error: "Each file must be between 1 byte and 100 MB." });
        continue;
      }

      try {
        const upload = await requestUpload.mutateAsync({
          data: {
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
          },
        });
        await uploadToStorage(upload.uploadURL, file, file.type || "application/octet-stream", (progress) => {
          updateJob(id, { progress });
        });
        await completeUpload.mutateAsync({ fileId: upload.id });
        updateJob(id, { progress: 100 });
        await queryClient.invalidateQueries({ queryKey: getListShalomFilesQueryKey() });
      } catch {
        updateJob(id, { error: "This file could not be uploaded. Please try again." });
      }
    }
  }

  async function downloadFile(fileId: number) {
    setActionError("");
    try {
      const download = await requestDownload.mutateAsync({ fileId });
      window.open(download.downloadURL, "_blank", "noopener,noreferrer");
    } catch {
      setActionError("The download could not be prepared. Please try again.");
    }
  }

  const files = [...(filesQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <AdminSection title="Shalom 2026" defaultOpen={defaultOpen}>
      <section data-testid="section-shalom-files" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary pt-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-wider text-ink">Shalom 2026</h2>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Any file type · 100 MB max
          </p>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void uploadFiles(event.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors ${
            dragging ? "border-primary bg-primary/10" : "border-ink/20 bg-ink/[0.03] hover:border-primary"
          }`}
        >
          <Upload className="h-8 w-8 text-primary" />
          <span className="mt-4 font-bold uppercase tracking-widest text-ink">
            Drop files here or browse
          </span>
          <span className="mt-2 text-sm text-muted-foreground">
            Uploaded files can be viewed and downloaded by Shalom 2026 folder users.
          </span>
          <input
            type="file"
            multiple
            className="sr-only"
            aria-label="Upload files to Shalom 2026"
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-ink/10 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="truncate font-semibold text-ink">{job.name}</p>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {job.error ? "Failed" : job.progress === 100 ? "Uploaded" : `${job.progress}%`}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full bg-primary" style={{ width: `${job.progress}%` }} />
                </div>
                {job.error && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{job.error}</p>}
              </div>
            ))}
          </div>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">{actionError}</p>
        )}

        {filesQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((item) => <Skeleton key={item} className="h-20 w-full rounded-xl bg-ink/5" />)}
          </div>
        ) : filesQuery.isError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center">
            <p className="font-bold text-red-700 dark:text-red-300">The Shalom 2026 folder could not be loaded.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 border-ink/20 text-ink hover:bg-ink/10"
              onClick={() => void filesQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center text-muted-foreground">
            No files uploaded yet
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <article
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-4"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-ink">{file.fileName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBytes(file.size)} · {file.uploadedBy} · {format(new Date(file.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-ink/20 text-ink hover:bg-ink/10"
                  onClick={() => void downloadFile(file.id)}
                  disabled={requestDownload.isPending && requestDownload.variables?.fileId === file.id}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminSection>
  );
}
