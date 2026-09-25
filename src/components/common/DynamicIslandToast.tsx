import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export default function DynamicIslandToast() {
  const { toast, hideToast } = useAppStore();

  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -45, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -45, scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            onClick={hideToast}
            className="pointer-events-auto bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-3 ios-island-shadow max-w-sm w-auto cursor-pointer select-none active:scale-95 transition-transform"
          >
            {/* Status icon */}
            <div className="shrink-0">
              {toast.type === "success" && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {(!toast.type || toast.type === "info") && (
                <div className="w-6 h-6 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Text details */}
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold text-white tracking-tight truncate leading-tight">
                {toast.title}
              </span>
              {toast.description && (
                <span className="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">
                  {toast.description}
                </span>
              )}
            </div>

            {/* Dismiss cross */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                hideToast();
              }}
              className="ml-auto text-zinc-500 hover:text-zinc-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
