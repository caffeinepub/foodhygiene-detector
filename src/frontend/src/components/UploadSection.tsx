import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlaskConical, ImageIcon, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const CATEGORIES = [
  { id: "fruit", label: "🍎 Fruit" },
  { id: "vegetable", label: "🥦 Vegetable" },
  { id: "drink", label: "🥤 Drink" },
  { id: "cooked-dish", label: "🍽️ Cooked Dish" },
  { id: "packaged-food", label: "📦 Packaged Food" },
  { id: "other", label: "🍴 Other" },
];

interface UploadSectionProps {
  onAnalyze: (imageBytes: Uint8Array<ArrayBuffer>, category: string) => void;
  isLoading: boolean;
}

export function UploadSection({ onAnalyze, isLoading }: UploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBytes, setImageBytes] = useState<Uint8Array<ArrayBuffer> | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState("fruit");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      setImageBytes(new Uint8Array(arrayBuffer));
      setPreview(URL.createObjectURL(file));
    };
    reader.readAsArrayBuffer(file);
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
    setImageBytes(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!imageBytes) return;
    onAnalyze(imageBytes, selectedCategory);
  };

  const handleDropzoneClick = () => {
    if (!preview) fileRef.current?.click();
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent) => {
    if (!preview && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      fileRef.current?.click();
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone as label for accessibility */}
      <label
        data-ocid="upload.dropzone"
        className={cn(
          "relative block rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden focus-within:ring-2 focus-within:ring-ring",
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : preview
              ? "border-border/40 bg-card/50"
              : "border-border/40 bg-card/30 hover:border-primary/50 hover:bg-primary/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
        onKeyDown={handleDropzoneKeyDown}
        tabIndex={preview ? -1 : 0}
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
                alt="Food preview"
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
              <p className="font-display font-semibold text-foreground text-lg">
                Drop a food image here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — JPG, PNG, WebP supported
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {/* Category selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              type="button"
              data-ocid={`upload.category.${idx + 1}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                selectedCategory === cat.id
                  ? "bg-primary/20 border-primary/60 text-primary shadow-glow-sm"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <Button
        data-ocid="upload.submit_button"
        onClick={handleSubmit}
        disabled={!imageBytes || isLoading}
        className="w-full h-12 bg-primary text-primary-foreground font-display font-semibold text-base hover:bg-primary/90 transition-all duration-200 disabled:opacity-40"
      >
        {isLoading ? (
          <span
            data-ocid="upload.loading_state"
            className="flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4 scan-pulse" />
            Analyzing hygiene...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Analyze Hygiene
          </span>
        )}
      </Button>
    </div>
  );
}
