import { NavLink, useLocation } from "react-router-dom";
import { Compass, ArrowDownToLine, Heart, Shield, Settings } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export default function BottomNav() {
  const location = useLocation();
  const tabs = [
    { to: "/", icon: Compass, label: "Home" },
    { to: "/downloads", icon: ArrowDownToLine, label: "Downloads" },
    { to: "/favorites", icon: Heart, label: "Favorites" },
    { to: "/vault", icon: Shield, label: "Vault" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const isNative = typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 flex justify-center pointer-events-none px-4",
        isNative ? "bottom-14 pb-2" : "bottom-0 pb-safe"
      )}
    >
      <nav
        aria-label="Main Navigation"
        className={cn(
          "pointer-events-auto w-full max-w-md bg-[#18181b]/85 dark:bg-[#161618]/90 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex items-center justify-around",
          !isNative && "mb-3"
        )}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 select-none min-w-[56px] min-h-[46px]",
                isActive ? "text-[#0A84FF]" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {/* Active subtle pill backing with spring */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 bg-[#0A84FF]/10 rounded-full border border-[#0A84FF]/20"
                />
              )}

              <motion.div
                animate={isActive ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "stroke-[2.2]" : "stroke-[1.7]"
                  )}
                />
              </motion.div>

              <span
                className={cn(
                  "relative z-10 text-[10px] tracking-tight mt-0.5 font-medium transition-colors",
                  isActive ? "text-[#0A84FF] font-semibold" : "text-zinc-400"
                )}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
