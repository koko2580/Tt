import { useState } from "react";
import Screen from "../components/layout/Screen";
import DownloadCard from "../components/DownloadCard";
import { useAppStore } from "../store/useAppStore";
import { Lock, Unlock, ShieldAlert, KeyRound, Delete } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Vault() {
  const { downloads, showToast } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState<string>("");
  const [isShaking, setIsShaking] = useState(false);

  const vaulted = downloads.filter((d) => d.isVaulted);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === "1234") {
        setTimeout(() => {
          setIsAuthenticated(true);
          setPin("");
          showToast("Vault Unlocked", "Private storage opened", "success");
        }, 150);
      } else {
        // Trigger shake
        setIsShaking(true);
        showToast("Incorrect Passcode", "Try default passcode: 1234", "error");
        setTimeout(() => {
          setIsShaking(false);
          setPin("");
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const keypad = [
    { num: "1", sub: "" },
    { num: "2", sub: "ABC" },
    { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" },
    { num: "5", sub: "JKL" },
    { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" },
    { num: "8", sub: "TUV" },
    { num: "9", sub: "WXYZ" },
    { num: "", sub: "" },
    { num: "0", sub: "" },
    { num: "del", sub: "" },
  ];

  if (!isAuthenticated) {
    return (
      <Screen title="Private Vault" subtitle="Biometric & PIN">
        <div className="flex flex-col items-center justify-center pt-8 pb-6">
          {/* iOS Lock Glyph */}
          <div className="w-16 h-16 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 shadow-lg shadow-purple-500/10">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Enter Passcode</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6">Default PIN is 1234</p>

          {/* PIN Indicators with spring dots */}
          <motion.div
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-4 mb-8"
          >
            {[1, 2, 3, 4].map((i) => {
              const filled = pin.length >= i;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    filled
                      ? "bg-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                      : "border border-zinc-600 bg-transparent"
                  }`}
                />
              );
            })}
          </motion.div>

          {/* iOS Passcode Keypad */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-xs w-full px-4">
            {keypad.map((k, idx) => {
              if (k.num === "") {
                return <div key={idx} />;
              }

              if (k.num === "del") {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-400 hover:text-white mx-auto active:scale-90 transition-all"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleKeyPress(k.num)}
                  className="w-16 h-16 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/[0.08] flex flex-col items-center justify-center mx-auto active:bg-zinc-700 active:scale-95 transition-all select-none shadow-sm"
                >
                  <span className="text-xl font-medium text-white leading-none">
                    {k.num}
                  </span>
                  {k.sub && (
                    <span className="text-[8px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">
                      {k.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title="Private Vault"
      subtitle="Encrypted Storage"
      headerAction={
        <button
          onClick={() => {
            setIsAuthenticated(false);
            showToast("Vault Locked", undefined, "info");
          }}
          className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock Vault
        </button>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="bg-[#1c1c1e] border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Vault Unlocked</p>
              <p className="text-[10px] text-zinc-400">{vaulted.length} Hidden items</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-1">
          {vaulted.length === 0 ? (
            <div className="text-center text-zinc-500 mt-16 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-purple-400 shadow-md">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-zinc-300">Your Vault is Empty</p>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">
                  Tap the Shield icon on any download in your Library to protect it in this private vault.
                </p>
              </div>
            </div>
          ) : (
            vaulted.map((d) => <DownloadCard key={d.id} item={d} />)
          )}
        </div>
      </div>
    </Screen>
  );
}
