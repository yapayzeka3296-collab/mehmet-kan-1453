import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/ana-sayfa" aria-label="MySkyParcel ana sayfa" className="block shrink-0">
      <img
        src="/myskyparcel-logo.svg"
        alt="MySkyParcel — Gökyüzünde Sana Özel Bir Yer"
        className="h-auto w-[180px] object-contain sm:w-[220px]"
        width={1536}
        height={526}
        decoding="async"
      />
    </Link>
  );
}