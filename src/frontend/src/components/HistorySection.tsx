import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Clock, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HygieneVerdict, type ScanRecord } from "../backend";
import { useDeleteRecord } from "../hooks/useQueries";

const VERDICT_LABELS: Record<HygieneVerdict, string> = {
  [HygieneVerdict.excellent]: "Excellent",
  [HygieneVerdict.good]: "Good",
  [HygieneVerdict.fair]: "Fair",
  [HygieneVerdict.poor]: "Poor",
};

const CATEGORY_LABELS: Record<string, string> = {
  fruit: "🍎 Fruit",
  vegetable: "🥦 Vegetable",
  drink: "🥤 Drink",
  "cooked-dish": "🍽️ Cooked Dish",
  "packaged-food": "📦 Packaged Food",
  other: "🍴 Other",
};

interface HistoryItemProps {
  record: ScanRecord;
  ocidIndex: number;
}

function HistoryItem({ record, ocidIndex }: HistoryItemProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const deleteRecord = useDeleteRecord();

  useEffect(() => {
    let url: string | null = null;
    record.image.getBytes().then((bytes) => {
      const blob = new Blob([bytes], { type: "image/jpeg" });
      url = URL.createObjectURL(blob);
      setImgUrl(url);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [record.image]);

  const handleDelete = async () => {
    try {
      await deleteRecord.mutateAsync(record.id);
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const score = Number(record.score);
  const verdict = record.verdict;
  const date = new Date(Number(record.timestamp) / 1_000_000);

  return (
    <motion.div
      data-ocid={`history.item.${ocidIndex}`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-4 flex gap-4 items-start border border-border/30 hover:border-border/50 transition-colors"
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/40 border border-border/30">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt="Food scan"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xl">
            🍽️
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground truncate">
            {CATEGORY_LABELS[record.category] || record.category}
          </span>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border",
              `bg-verdict-${verdict}`,
            )}
          >
            {score} · {VERDICT_LABELS[verdict]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {record.summary}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            {date.toLocaleDateString()}{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            type="button"
            data-ocid={`history.delete_button.${ocidIndex}`}
            onClick={handleDelete}
            disabled={deleteRecord.isPending}
            className="text-muted-foreground/50 hover:text-destructive transition-colors disabled:opacity-40"
            aria-label="Delete record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface HistorySectionProps {
  records: ScanRecord[];
  isLoading: boolean;
}

export function HistorySection({ records, isLoading }: HistorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const sorted = [...records].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-xl text-foreground">
            Scan History
          </h2>
          {records.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
              {records.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass-card rounded-xl p-4 flex gap-4 animate-pulse"
                  >
                    <div className="w-16 h-16 rounded-lg bg-muted/40" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/40 rounded w-1/3" />
                      <div className="h-3 bg-muted/30 rounded w-2/3" />
                      <div className="h-3 bg-muted/20 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div
                data-ocid="history.empty_state"
                className="flex flex-col items-center justify-center py-14 text-center rounded-xl border-2 border-dashed border-border/30"
              >
                <div className="text-5xl mb-4">🔬</div>
                <p className="font-display font-semibold text-foreground">
                  No scans yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a food photo to get started.
                </p>
              </div>
            ) : (
              <div data-ocid="history.list" className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {sorted.map((record, idx) => (
                    <HistoryItem
                      key={String(record.id)}
                      record={record}
                      ocidIndex={idx + 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
