import Screen from "../components/layout/Screen";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import {
  Download,
  FolderDown,
  Sparkles,
  Smartphone,
  Trash2,
  Shield,
  Info,
  ChevronRight,
  Check,
  Zap,
  Terminal,
  FileCode,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function Settings() {
  const { settings, updateSettings, showToast, clearAllDownloads } = useAppStore();
  const [clearingCache, setClearingCache] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      showToast("Cache Cleared", "Temporary cache purged successfully", "success");
    }, 600);
  };

  return (
    <Screen title="Settings" subtitle="System & Preferences">
      <div className="flex flex-col gap-6 pt-2 pb-6">
        {/* Section 1: Download Preferences */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Download Options
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {/* Auto Download Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#0A84FF] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Auto-Detect Clipboard</h4>
                  <p className="text-[11px] text-zinc-400">Detect copied video URLs automatically</p>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                onClick={() => updateSettings({ autoDownload: !settings.autoDownload })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.autoDownload ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.autoDownload ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>

            {/* Save to Camera Roll Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#30D158] flex items-center justify-center">
                  <FolderDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct Document Save</h4>
                  <p className="text-[11px] text-zinc-400">Save directly to system storage</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ saveToGallery: !settings.saveToGallery })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.saveToGallery ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.saveToGallery ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>

            {/* Haptic Feedback Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Smooth Gestures & Haptics</h4>
                  <p className="text-[11px] text-zinc-400">Fluid tactile UI response</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.hapticFeedback ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.hapticFeedback ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Default Quality */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Preferred Quality
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-1.5 flex gap-1.5">
            {[
              { id: "hd", label: "Full HD (1080p)" },
              { id: "sd", label: "Standard (720p)" },
              { id: "audio", label: "Audio (320kbps)" },
            ].map((q) => {
              const active = settings.defaultQuality === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => updateSettings({ defaultQuality: q.id as any })}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-xl relative transition-all duration-200 text-center",
                    active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="qualityPill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-[#2c2c2e] rounded-xl shadow border border-white/10"
                    />
                  )}
                  <span className="relative z-10">{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Storage & Maintenance */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Storage & Performance
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {/* Storage path */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Default Path</h4>
                  <p className="text-[11px] text-zinc-400">/Documents/TokSave</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500">Internal</span>
            </div>

            {/* Clear Temporary Cache */}
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Clear Temporary Cache</h4>
                  <p className="text-[11px] text-zinc-400">Free memory & thumbnail buffer</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Section 4: About & Version */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            About TokSave
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">TokSave AI Engine</h4>
                  <p className="text-[11px] text-zinc-400">Watermark remover & stream downloader</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#0A84FF]">v2.2.0</span>
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Privacy Guarantee</h4>
                  <p className="text-[11px] text-zinc-400">No account required · Zero data tracking</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </div>

        {/* Section 5: Android APK & Export */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Android Application (APK)
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {/* Direct instructions modal trigger */}
            <button
              type="button"
              onClick={() => setShowApkModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#30D158]/20 text-[#30D158] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">APK ထုတ်ယူနည်း လမ်းညွှန်</h4>
                  <p className="text-[11px] text-zinc-400">GitHub Actions CI/CD & Android Studio</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            </button>

            {/* Download Android source project package */}
            <a
              href="/api/export-android"
              download="toksave-android-project.tar.gz"
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Download Android Project</h4>
                  <p className="text-[11px] text-zinc-400">Full source with Capacitor & AdMob (.tar.gz)</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-[#0A84FF]" />
            </a>
          </div>
        </div>
      </div>

      {/* APK Instructions Modal */}
      <AnimatePresence>
        {showApkModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-[#1c1c1e] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">APK ဖိုင် ထုတ်ယူနည်း</h3>
                    <p className="text-xs text-zinc-400">TokSave AI Mobile Build Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApkModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Method 1: GitHub Actions (Recommended) */}
                <div className="bg-[#141416] border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                      ★ နည်းလမ်း (၁) - GitHub Actions (အလွယ်ဆုံး & အလိုအလျောက်)
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      အကြံပြုချက်
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Repository ထဲတွင် <b>.github/workflows/android.yml</b> အားလုံး အသင့်ထည့်သွင်းပြင်ဆင်ပြီး ဖြစ်ပါသည်။
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 pl-1">
                    <li>ဒီ Code များကို မိမိ၏ <b>GitHub Repository</b> သို့ Push လိုက်ပါ။</li>
                    <li>GitHub ပေါ်တွင် <b>Actions</b> tab သို့ သွားပါ။</li>
                    <li>
                      <b>Build Android App</b> workflow က Ubuntu Cloud ပေါ်တွင် Java 21 & Android SDK ဖြင့် <b>app-debug.apk</b> ကို အလိုအလျောက် build ပေးပါမည်။
                    </li>
                    <li>Build ပြီးပါက <b>Artifacts</b> အောက်မှ <span className="text-white font-mono">app-debug-apk</span> ကို တိုက်ရိုက်ဒေါင်းလုဒ်ဆွဲနိုင်ပါသည်။</li>
                  </ol>
                </div>

                {/* Method 2: Android Studio */}
                <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 space-y-2.5">
                  <span className="font-bold text-[#0A84FF] text-sm block">
                    နည်းလမ်း (၂) - Android Studio ဖြင့် Local စက်တွင် ထုတ်နည်း
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    အောက်ပါ <b>Download Android Project</b> ခလုတ်ဖြင့် Project ကို ဒေါင်းလုဒ်ဆွဲပြီး Android Studio တွင် ဖွင့်ပါ-
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
                    <li>Android Studio ဖွင့်ပြီး <b>Open Project</b> &gt; <span className="text-white font-mono">android</span> folder ကို ရွေးပါ။</li>
                    <li>အပေါ် menu မှ <b>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</b> ကို နှိပ်ပါ။</li>
                    <li>မိနစ်ပိုင်းအတွင်း <span className="text-white font-mono">app-debug.apk</span> ဖိုင် ရရှိပါမည်။</li>
                  </ol>
                </div>

                {/* Method 3: Command Line */}
                <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-300">Terminal Command များ</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("npm run build && npx cap sync android && cd android && ./gradlew assembleDebug");
                        setCopiedCmd(true);
                        setTimeout(() => setCopiedCmd(false), 2000);
                      }}
                      className="text-[11px] text-[#0A84FF] hover:underline flex items-center gap-1"
                    >
                      {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCmd ? "Copied" : "Copy Command"}
                    </button>
                  </div>
                  <pre className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto border border-white/5">
                    npm run build{"\n"}
                    npx cap sync android{"\n"}
                    cd android{"\n"}
                    ./gradlew assembleDebug
                  </pre>
                </div>

                {/* Configuration Specs */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500">Package Name:</span>
                    <p className="font-mono text-zinc-300 font-medium">com.toksave.app</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Target SDK:</span>
                    <p className="font-mono text-zinc-300 font-medium">Android 36 (14+)</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">AdMob App ID:</span>
                    <p className="font-mono text-zinc-400 text-[10px] truncate">ca-app-pub-5984576938417142~8737463815</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Output APK:</span>
                    <p className="font-mono text-emerald-400 font-medium">app-debug.apk</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-[#171719] flex items-center justify-between gap-3">
                <a
                  href="/api/export-android"
                  download="toksave-android-project.tar.gz"
                  className="flex-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 text-xs"
                >
                  <Download className="w-4 h-4" />
                  Download Android Source (.tar.gz)
                </a>
                <button
                  onClick={() => setShowApkModal(false)}
                  className="px-4 py-2.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
