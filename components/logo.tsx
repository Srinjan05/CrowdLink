import Link from "next/link";
import { Waypoints } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 font-semibold tracking-tight ${
        className ?? ""
      }`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-[0_8px_30px_-12px_var(--color-accent)]">
        <Waypoints className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="text-lg tracking-wide">CROWDLINK</span>
    </Link>
  );
}
