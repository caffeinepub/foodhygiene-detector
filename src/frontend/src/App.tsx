import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ScanRecord } from "./backend";
import { ApiKeySetup } from "./components/ApiKeySetup";
import { HistorySection } from "./components/HistorySection";
import { ResultsCard } from "./components/ResultsCard";
import { UploadSection } from "./components/UploadSection";
import {
  useAnalyzeAndStore,
  useGetAllRecords,
  useHasApiKey,
} from "./hooks/useQueries";

const qc = new QueryClient();

function AppContent() {
  const [latestResult, setLatestResult] = useState<ScanRecord | null>(null);
  const [dismissedKeySetup, setDismissedKeySetup] = useState(false);

  const { data: hasApiKey, isLoading: checkingKey } = useHasApiKey();
  const { data: records = [], isLoading: loadingRecords } = useGetAllRecords();
  const analyze = useAnalyzeAndStore();

  const showKeySetup = !checkingKey && !hasApiKey && !dismissedKeySetup;

  const handleAnalyze = async (
    imageBytes: Uint8Array<ArrayBuffer>,
    category: string,
  ) => {
    try {
      const result = await analyze.mutateAsync({ imageBytes, category });
      setLatestResult(result);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Analysis failed. Check your API key and try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/30 backdrop-blur-md bg-background/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-foreground glow-text">
                FoodScan<span className="text-primary">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Hygiene Detection
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground/60 hidden sm:block">
            Powered by Gemini Vision
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hygiene-hero-bg.dim_1400x600.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground leading-tight">
              Detect Food Hygiene
              <br />
              <span className="text-primary glow-text">Instantly with AI</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-base max-w-md">
              Upload any food photo — fruits, vegetables, dishes, drinks, or
              packaged goods — and get a detailed hygiene analysis in seconds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
        {/* API Key Setup Banner */}
        {showKeySetup && (
          <ApiKeySetup onDismiss={() => setDismissedKeySetup(true)} />
        )}

        {/* Upload section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card rounded-2xl p-6 border border-border/30"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-5">
            Upload Food Image
          </h2>
          <UploadSection
            onAnalyze={handleAnalyze}
            isLoading={analyze.isPending}
          />
        </motion.section>

        {/* Results card */}
        {latestResult && <ResultsCard result={latestResult} />}

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <HistorySection records={records} isLoading={loadingRecords} />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppContent />
    </QueryClientProvider>
  );
}
