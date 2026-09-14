import { logout } from "@/lib/actions/auth-actions";

export function Topbar({ title, userName }: { title: string; userName: string }) {
  return (
    <header className="h-16 bg-maroon flex items-center justify-between px-6 shrink-0">
      <div className="flex items-baseline gap-3 min-w-0">
        <span className="text-gold font-bold text-xl tracking-tight">POLARIS</span>
        <span className="text-white/90 text-sm truncate">{title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-white text-sm hidden sm:inline">{userName}</span>
        <form action={logout}>
          <button
            type="submit"
            className="bg-maroon-dark hover:bg-black/30 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
          >
            Log Out
          </button>
        </form>
      </div>
    </header>
  );
}
