import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ subtitle = "GÖKYÜZÜNDE SANA ÖZEL BİR YER" }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <Sparkles className="h-7 w-7 text-gold" />
      <span className="leading-none">
        <span className="font-display text-lg font-bold tracking-wide sm:text-xl">
          MY SKY<span className="text-gold">PARCEL</span>
        </span>
        <span className="mt-1 block text-[8px] tracking-[0.2em] text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
