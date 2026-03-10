import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { motion } from "motion/react";
import { HygieneVerdict, type ScanRecord } from "../backend";
import { ScoreMeter } from "./ScoreMeter";

const VERDICT_LABELS: Record<HygieneVerdict, string> = {
  [HygieneVerdict.excellent]: "Excellent",
  [HygieneVerdict.good]: "Good",
  [HygieneVerdict.fair]: "Fair",
  [HygieneVerdict.poor]: "Poor",
};

const VERDICT_ICONS: Record<HygieneVerdict, React.ReactNode> = {
  [HygieneVerdict.excellent]: <CheckCircle2 className="w-4 h-4" />,
  [HygieneVerdict.good]: <CheckCircle2 className="w-4 h-4" />,
  [HygieneVerdict.fair]: <Info className="w-4 h-4" />,
  [HygieneVerdict.poor]: <AlertCircle className="w-4 h-4" />,
};

interface ResultsCardProps {
  result: ScanRecord;
}

export function ResultsCard({ result }: ResultsCardProps) {
  const score = Number(result.score);
  const verdict = result.verdict;

  return (
    <motion.div
      data-ocid="results.card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
      className="glass-card rounded-2xl p-6 space-y-6 border border-primary/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-foreground">
          Hygiene Analysis
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border",
            `bg-verdict-${verdict}`,
          )}
        >
          {VERDICT_ICONS[verdict]}
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {/* Score meter */}
      <div data-ocid="results.score_panel" className="flex justify-center">
        <ScoreMeter score={score} verdict={verdict} animate />
      </div>

      {/* Summary */}
      <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
        <p className="text-sm text-foreground/85 leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Findings */}
      {result.findings.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Findings
          </p>
          <ul className="space-y-2">
            {result.findings.map((finding) => (
              <li
                key={finding}
                className="flex items-start gap-2.5 text-sm text-foreground/80"
              >
                <span className="shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
