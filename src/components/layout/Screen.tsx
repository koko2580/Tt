import { ReactNode } from "react";
import { motion } from "motion/react";
import BottomNav from "./BottomNav";
import DynamicIslandToast from "../common/DynamicIslandToast";
import VideoPlayerModal from "../common/VideoPlayerModal";
import { cn } from "../../lib/utils";

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  hideNav?: boolean;
}

export default function Screen({
  children,
  title,
  subtitle,
  headerAction,
  hideNav = false,
}: ScreenProps) {
  const isNative =
    typeof window !== "undefined" &&
    (window as any).Capacitor &&
    (window as any).Capacitor.isNativePlatform();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-x-hidden">
      {/* Subtle iOS ambient glow background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-[#0A84FF]/8 via-transparent to-transparent pointer-events-none" />

      {/* Global Dynamic Island notification toast */}
      <DynamicIslandToast />

      {/* Global In-App Video Player Sheet Modal */}
      <VideoPlayerModal />

      <div className="w-full max-w-md flex-1 flex flex-col relative z-10">
        {/* iOS Navigation Header */}
        {title && (
          <header className="px-5 pt-8 pb-3 sticky top-0 bg-black/80 backdrop-blur-2xl z-30 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                {subtitle && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-0.5">
                    {subtitle}
                  </p>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {title}
                </h1>
              </div>
              {headerAction && <div>{headerAction}</div>}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={cn(
            "flex-1 px-4",
            isNative ? "pb-36" : "pb-28",
            !title && "pt-6"
          )}
        >
          {children}
        </motion.main>
      </div>

      {/* Bottom Navigation */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
