import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  actionHref,
  showLogout,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  showLogout?: boolean;
}) {
  return (
    <header className="px-6 pt-6">
      {backHref && (
        <a
          href={backHref}
          className="text-sm text-text-muted hover:text-foreground inline-flex items-center gap-1.5 mb-4"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {backLabel}
        </a>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
          <Image
            src="/logo.png"
            alt="Logo Duisburg-Menzil e.V."
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-muted leading-tight">{subtitle}</p>
          )}
        </div>
        <ThemeToggle />
        {showLogout && <LogoutButton />}
        
        {actionHref && (
          <a
            href={actionHref}
            className="w-10 h-10 rounded-full bg-menzil-green flex items-center justify-center shrink-0"
            aria-label="Yeni ekle"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        )}
      </div>
    </header>
  );
}
