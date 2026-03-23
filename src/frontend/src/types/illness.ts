export interface IllnessAnalysis {
  concernLevel: "low" | "moderate" | "high";
  possibleConditions: string[];
  visibleObservations: string[];
  recommendations: string[];
  disclaimer: string;
}
