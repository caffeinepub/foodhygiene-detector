import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSetApiKey } from "../hooks/useQueries";

interface ApiKeySetupProps {
  onDismiss: () => void;
}

export function ApiKeySetup({ onDismiss }: ApiKeySetupProps) {
  const [key, setKey] = useState("");
  const setApiKey = useSetApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    try {
      await setApiKey.mutateAsync(key.trim());
      toast.success("API key saved successfully");
      onDismiss();
    } catch {
      toast.error("Failed to save API key");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="apikey.dialog"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative glass-card rounded-xl p-5 border border-primary/20 glow-primary"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-foreground">
              Gemini API Key Required
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              This app uses Google Gemini to analyze food hygiene. Enter your
              API key to get started.
            </p>
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <Input
                data-ocid="apikey.input"
                type="password"
                placeholder="AIza..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="flex-1 font-mono text-sm bg-background/60 border-border/60 focus-visible:ring-primary/50"
                autoComplete="off"
              />
              <Button
                data-ocid="apikey.submit_button"
                type="submit"
                disabled={!key.trim() || setApiKey.isPending}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {setApiKey.isPending ? "Saving..." : "Save Key"}
              </Button>
            </form>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
