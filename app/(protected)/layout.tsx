import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link
              href={"/"}
              className="text-emerald-600 hover:text-emerald-700"
            >
              🏠 Lucie Immo Map
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Full screen content */}
      <div className="flex-1 relative">{children}</div>
    </main>
  );
}
