/**
 * SkeletonOverlay – shown when isLoading=true in OnboardingChat
 * Renders a full-page skeleton that mimics a generic website structure
 * so the user sees "something is coming" before they enter their data.
 */
import { motion } from "framer-motion";
import { HeadlineSkeleton, TextSkeleton } from "./TextSkeleton";

interface SkeletonOverlayProps {
  cs: { primary: string; background: string; onBackground: string; surface: string };
}

function Pulse({ width, height, className = "" }: { width: string; height: string; className?: string }) {
  return (
    <motion.div
      className={`rounded ${className}`}
      style={{ width, height, backgroundColor: "currentColor", opacity: 0.12 }}
      animate={{ opacity: [0.08, 0.18, 0.08] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function SkeletonOverlay({ cs }: SkeletonOverlayProps) {
  return (
    <div style={{ fontFamily: "inherit", backgroundColor: cs.background, color: cs.onBackground, minHeight: "100vh" }}>
      {/* Nav skeleton */}
      <div style={{ backgroundColor: cs.background, borderBottom: `1px solid ${cs.onBackground}10`, height: "4rem", display: "flex", alignItems: "center", padding: "0 2rem", justifyContent: "space-between" }}>
        <Pulse width="120px" height="1.5rem" />
        <div style={{ display: "flex", gap: "2rem" }}>
          <Pulse width="70px" height="0.75rem" />
          <Pulse width="60px" height="0.75rem" />
          <Pulse width="80px" height="0.75rem" />
        </div>
        <Pulse width="100px" height="2rem" />
      </div>

      {/* Hero skeleton */}
      <div style={{ padding: "6rem 2rem 4rem", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          {/* Badge */}
          <Pulse width="140px" height="1.5rem" />
          <div style={{ marginTop: "2rem" }}>
            <HeadlineSkeleton lines={2} animated />
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <TextSkeleton lines={2} lineWidths={["90%", "70%"]} height="1rem" animated />
          </div>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <motion.div
              style={{ width: "160px", height: "3rem", borderRadius: "2px", backgroundColor: cs.primary, opacity: 0.4 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <Pulse width="140px" height="3rem" />
          </div>
        </div>
        {/* Hero image skeleton */}
        <motion.div
          style={{ aspectRatio: "4/3", borderRadius: "4px", backgroundColor: cs.surface, border: `1px solid ${cs.onBackground}10` }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Services skeleton */}
      <div style={{ padding: "4rem 2rem", backgroundColor: cs.surface }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Pulse width="200px" height="2rem" className="mx-auto" />
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
              <TextSkeleton lines={1} lineWidths={["400px"]} height="1rem" animated />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ padding: "2rem", borderRadius: "8px", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}08` }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              >
                <Pulse width="2.5rem" height="2.5rem" />
                <div style={{ marginTop: "1rem" }}>
                  <Pulse width="70%" height="1.25rem" />
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <TextSkeleton lines={2} lineWidths={["100%", "80%"]} height="0.875rem" animated />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* About skeleton */}
      <div style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <motion.div
          style={{ aspectRatio: "3/4", borderRadius: "4px", backgroundColor: cs.surface, border: `1px solid ${cs.onBackground}10` }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <div>
          <Pulse width="100px" height="0.75rem" />
          <div style={{ marginTop: "1.5rem" }}>
            <HeadlineSkeleton lines={2} animated />
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <TextSkeleton lines={4} lineWidths={["100%", "90%", "85%", "60%"]} height="1rem" animated />
          </div>
        </div>
      </div>
    </div>
  );
}
