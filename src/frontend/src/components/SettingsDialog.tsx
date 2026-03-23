import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onSave: (key: string) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  currentKey,
  onSave,
}: SettingsDialogProps) {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    if (open) setKey(currentKey);
  }, [open, currentKey]);

  const handleSave = () => {
    onSave(key.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="settings.dialog"
        className="glass-card border-border/40 max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Manage your Gemini API key. Your key is stored locally in your
            browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="settings-api-key" className="text-sm font-medium">
              Google Gemini API Key
            </Label>
            <Input
              id="settings-api-key"
              data-ocid="settings.input"
              type="password"
              placeholder="AIza..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono text-sm bg-background/60 border-border/50 focus-visible:ring-primary/50"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Get a free key at{" "}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                aistudio.google.com
              </a>
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid="settings.save_button"
              onClick={handleSave}
              disabled={!key.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Save
            </Button>
            <Button
              data-ocid="settings.cancel_button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
