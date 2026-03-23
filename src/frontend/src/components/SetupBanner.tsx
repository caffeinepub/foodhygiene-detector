import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { useState } from "react";

interface SetupBannerProps {
  onSave: (key: string) => void;
}

export function SetupBanner({ onSave }: SetupBannerProps) {
  const [key, setKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    onSave(key.trim());
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">
            Gemini API Key Required
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter your Google Gemini API key to enable illness analysis. Get one
            free at{" "}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              aistudio.google.com
            </a>
            .
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <Input
              data-ocid="setup.input"
              type="password"
              placeholder="AIza..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="flex-1 font-mono text-sm bg-background/60 border-border/50 focus-visible:ring-primary/50"
              autoComplete="off"
            />
            <Button
              data-ocid="setup.submit_button"
              type="submit"
              disabled={!key.trim()}
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Save Key
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
