import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Eye,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import type { IllnessAnalysis } from "../types/illness";

interface IllnessResultsProps {
  result: IllnessAnalysis;
}

const concernConfig = {
  low: {
    label: "Low Concern",
    className: "concern-low",
    icon: CheckCircle2,
    description: "No major illness indicators detected.",
  },
  moderate: {
    label: "Moderate Concern",
    className: "concern-moderate",
    icon: AlertTriangle,
    description: "Some indicators present — consider consulting a doctor.",
  },
  high: {
    label: "High Concern",
    className: "concern-high",
    icon: ShieldAlert,
    description: "Significant indicators present — seek medical attention.",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function Section({
  icon: Icon,
  title,
  items,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <motion.div variants={item} className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <ul className="space-y-2">
        {items.map((text) => (
          <li
            key={text}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function IllnessResults({ result }: IllnessResultsProps) {
  const config = concernConfig[result.concernLevel] ?? concernConfig.moderate;
  const ConcernIcon = config.icon;

  return (
    <div
      data-ocid="results.card"
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Concern level header */}
      <div
        className={cn("px-6 py-5 border-b border-border/30", {
          "bg-green-500/5": result.concernLevel === "low",
          "bg-yellow-500/5": result.concernLevel === "moderate",
          "bg-red-500/5": result.concernLevel === "high",
        })}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center",
                config.className,
              )}
            >
              <ConcernIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Concern Level
              </p>
              <p
                className={cn(
                  "font-display text-xl",
                  config.className.split(" ")[0],
                )}
              >
                {config.label}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "px-3 py-1 text-xs font-semibold border uppercase tracking-wide",
              config.className,
            )}
          >
            {result.concernLevel}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {config.description}
        </p>
      </div>

      {/* Details */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-6 py-5 grid gap-6"
      >
        {result.visibleObservations.length > 0 && (
          <Section
            icon={Eye}
            title="Visible Observations"
            items={result.visibleObservations}
          />
        )}

        {result.possibleConditions.length > 0 && (
          <Section
            icon={Stethoscope}
            title="Possible Conditions"
            items={result.possibleConditions}
          />
        )}

        {result.recommendations.length > 0 && (
          <Section
            icon={Clipboard}
            title="Recommendations"
            items={result.recommendations}
          />
        )}

        {/* Disclaimer */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-muted/20 px-4 py-3 flex gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground/70">
              Medical Disclaimer:{" "}
            </span>
            {result.disclaimer ||
              "This AI analysis is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns."}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
