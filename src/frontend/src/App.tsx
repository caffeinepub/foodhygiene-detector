import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Activity, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnalysisForm } from "./components/AnalysisForm";
import { IllnessResults } from "./components/IllnessResults";
import { SettingsDialog } from "./components/SettingsDialog";
import { SetupBanner } from "./components/SetupBanner";
import type { IllnessAnalysis } from "./types/illness";

const qc = new QueryClient();

const STORAGE_KEY = "gemini_api_key_illness";

function AppContent() {
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? "",
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [result, setResult] = useState<IllnessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasKey = apiKey.trim().length > 0;

  const handleSaveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    toast.success("API key saved");
  };

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleAnalyze = async (
    imageBase64: string,
    mimeType: string,
    symptoms: string,
  ) => {
    if (!apiKey.trim()) {
      toast.error("Please set your Gemini API key first.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const prompt = `You are a medical screening assistant. Analyze this image of a person and any described symptoms. Identify visible illness indicators (pale skin, redness, swelling, fatigue signs, jaundice, rash, eye discoloration, etc.) and possible conditions.${symptoms ? ` Described symptoms: ${symptoms}` : ""} Return ONLY a valid JSON object with no markdown or extra text: { "concernLevel": "low" | "moderate" | "high", "possibleConditions": string[], "visibleObservations": string[], "recommendations": string[], "disclaimer": string }. Be concise, helpful, and medically responsible.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inline_data: { mime_type: mimeType, data: imageBase64 } },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message ?? `API error ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed: IllnessAnalysis = JSON.parse(cleaned);
      setResult(parsed);
      toast.success("Analysis complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(`Analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen medical-grid">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/30 backdrop-blur-md bg-background/75">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-amber">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg leading-tight text-foreground">
                MediScan<span className="text-primary glow-text-amber">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Illness Detection Assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="settings.open_modal_button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-border/20">
        <img
          src="/assets/generated/illness-hero-bg.dim_1400x500.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-2">
              AI-powered screening
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-snug">
              Visual Illness{" "}
              <span className="text-primary glow-text-amber">Detection</span>
            </h2>
            <p className="mt-2.5 text-muted-foreground text-sm max-w-md">
              Upload a photo and describe symptoms. Our AI will analyze visible
              indicators and suggest possible conditions — not a replacement for
              professional diagnosis.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <AnimatePresence>
          {!hasKey && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <SetupBanner onSave={handleSaveKey} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display text-xl text-foreground mb-5">
            Upload &amp; Analyze
          </h3>
          <AnalysisForm
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            disabled={!hasKey}
          />
        </motion.section>

        {/* Results */}
        <div ref={resultsRef}>
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="loading"
                data-ocid="results.loading_state"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4"
              >
                <div className="relative w-14 h-14">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-foreground">
                    Analyzing...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Examining visual indicators and symptoms
                  </p>
                </div>
              </motion.div>
            )}

            {error && !isAnalyzing && (
              <motion.div
                key="error"
                data-ocid="results.error_state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl p-6 border border-destructive/30"
              >
                <p className="font-semibold text-destructive mb-1">
                  Analysis Failed
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Check your API key and try again.
                </p>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div
                key="result"
                data-ocid="results.success_state"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <IllnessResults result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
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

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentKey={apiKey}
        onSave={handleSaveKey}
      />
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
