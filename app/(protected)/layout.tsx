import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ "--header-height": "64px" } as React.CSSProperties}
    >
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-(--header-height) bg-background/95 backdrop-blur-xs z-50 shadow-xs">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link
              href={"/"}
              className="text-emerald-600 hover:text-emerald-700"
            >
              🏠 Lucimmo | Map
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
