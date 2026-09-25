import Screen from "../components/layout/Screen";
import DownloadCard from "../components/DownloadCard";
import { useAppStore } from "../store/useAppStore";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { downloads, favorites } = useAppStore();

  const favDownloads = downloads.filter((d) => !d.isVaulted && favorites.includes(d.id));

  return (
    <Screen
      title="Favorites"
      subtitle="Saved Collections"
      headerAction={
        favDownloads.length > 0 ? (
          <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {favDownloads.length} {favDownloads.length === 1 ? "Video" : "Videos"}
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 pt-2">
        {favDownloads.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-rose-500 shadow-md">
              <Heart className="w-8 h-8 fill-rose-500/30" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-zinc-300">No Favorites Saved</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tap the heart on any video to pin it here
              </p>
            </div>
            <Link
              to="/"
              className="mt-2 text-xs font-bold text-[#0A84FF] bg-[#0A84FF]/10 px-4 py-2 rounded-xl border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 active:scale-95 transition-all"
            >
              Browse Media
            </Link>
          </div>
        ) : (
          favDownloads.map((d) => <DownloadCard key={d.id} item={d} />)
        )}
      </div>
    </Screen>
  );
}
