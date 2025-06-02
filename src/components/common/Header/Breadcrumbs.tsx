"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Remove "admin" ou "afiliado"
  const cleanedSegments = segments.filter(
    (seg) => seg !== "admin" && seg !== "afiliado"
  );

  const isHome = cleanedSegments.length === 1 && cleanedSegments[0] === "home";

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="../home"
        className={`hover:scale-95 hover:brightness-75 transition ${
          isHome ? "text-foreground font-medium" : "text-muted-foreground"
        }`}
      >
        Início
      </Link>

      {!isHome &&
        cleanedSegments.map((segment, index) => {
          const href = "./" + cleanedSegments.slice(0, index + 1).join("/");
          const isLast = index === cleanedSegments.length - 1;

          return (
            <div key={href} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              {isLast ? (
                <span className="capitalize">{segment.replace(/-/g, " ")}</span>
              ) : (
                <Link
                  href={href}
                  className="hover:scale-95 hover:brightness-75 transition text-muted-foreground capitalize"
                >
                  {segment.replace(/-/g, " ")}
                </Link>
              )}
            </div>
          );
        })}
    </nav>
  );
}
