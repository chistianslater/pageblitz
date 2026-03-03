import { motion } from "framer-motion";

interface TextSkeletonProps {
  lines?: number;
  lineWidths?: string[]; // z.B. ["100%", "80%", "60%"]
  height?: string;
  className?: string;
  animated?: boolean;
}

/**
 * Animated text skeleton with pulse effect
 * Usage:
 * <TextSkeleton lines={3} lineWidths={["100%", "80%", "60%"]} />
 */
export function TextSkeleton({
  lines = 3,
  lineWidths,
  height = "1rem",
  className = "",
  animated = true,
}: TextSkeletonProps) {
  const defaultWidths = ["100%", "85%", "70%", "90%", "60%"];
  const widths = lineWidths || defaultWidths.slice(0, lines);

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-slate-200 dark:bg-slate-700 rounded"
          style={{
            width: widths[i] || "100%",
            height,
          }}
          animate={
            animated
              ? {
                  opacity: [0.4, 0.8, 0.4],
                }
              : {}
          }
          transition={
            animated
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }
              : {}
          }
        />
      ))}
    </div>
  );
}

/**
 * Skeleton specifically for headlines
 */
export function HeadlineSkeleton({
  lines = 2,
  className = "",
  animated = true,
}: {
  lines?: number;
  className?: string;
  animated?: boolean;
}) {
  const heights = ["2.5rem", "2rem"];
  const widths = ["90%", "70%"];

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-slate-300 dark:bg-slate-600 rounded-lg"
          style={{
            width: widths[i] || "60%",
            height: heights[i] || "1.5rem",
          }}
          animate={
            animated
              ? {
                  opacity: [0.4, 0.7, 0.4],
                }
              : {}
          }
          transition={
            animated
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }
              : {}
          }
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for sections
 */
export function CardSkeleton({
  className = "",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={`p-6 rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}>
      <HeadlineSkeleton lines={1} className="mb-4" animated={animated} />
      <TextSkeleton lines={3} animated={animated} />
    </div>
  );
}

export default TextSkeleton;
