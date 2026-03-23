import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Activity, ImageIcon, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

interface AnalysisFormProps {
  onAnalyze: (imageBase64: string, mimeType: string, symptoms: string) => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function AnalysisForm({
  onAnalyze,
  isAnalyzing,
  disabled,
}: AnalysisFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [symptoms, setSymptoms] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setPreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setImageBase64(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!imageBase64) return;
    onAnalyze(imageBase64, mimeType, symptoms);
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (!preview && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      fileRef.current?.click();
    }
  };

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <label
        data-ocid="upload.dropzone"
        tabIndex={preview ? -1 : 0}
        className={cn(
          "relative block rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden focus-within:ring-2 focus-within:ring-primary/50",
          dragOver
            ? "border-primary/80 bg-primary/8 scale-[1.01]"
            : preview
              ? "border-border/40 bg-card/50"
              : "border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5",
          disabled && "opacity-50 pointer-events-none",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!preview) fileRef.current?.click();
        }}
        onKeyDown={handleDropzoneKeyDown}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Person preview"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm text-foreground/80">
                <ImageIcon className="w-4 h-4" />
                <span>Image ready for analysis</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-14 px-6 text-center"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  dragOver ? "bg-primary/20" : "bg-muted/50",
                )}
              >
                <Upload
                  className={cn(
                    "w-7 h-7 transition-colors",
                    dragOver ? "text-primary" : "text-muted-foreground",
                  )}
                />
              </div>
              <p className="font-display text-lg text-foreground">
                Upload a photo of the person
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag &amp; drop or click to browse — JPG, PNG, WebP
              </p>
              <button
                type="button"
                data-ocid="upload.upload_button"
                onClick={(e) => {
                  e.preventDefault();
                  fileRef.current?.click();
                }}
                className="mt-4 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Browse Files
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {/* Symptoms */}
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          htmlFor="symptoms-input"
        >
          Describe Symptoms{" "}
          <span className="normal-case font-normal text-muted-foreground/60">
            (optional)
          </span>
        </label>
        <Textarea
          id="symptoms-input"
          data-ocid="symptoms.textarea"
          placeholder="e.g. fever, persistent cough, fatigue, headache, skin rash..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={3}
          className="bg-background/50 border-border/50 focus-visible:ring-primary/50 text-sm resize-none"
          disabled={disabled}
        />
      </div>

      {/* Submit */}
      <Button
        data-ocid="analyze.primary_button"
        onClick={handleSubmit}
        disabled={!imageBase64 || isAnalyzing || disabled}
        className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-40 transition-all duration-200"
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            Analyzing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analyze Health Indicators
          </span>
        )}
      </Button>
    </div>
  );
}
