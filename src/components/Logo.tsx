import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link
      to="/ana-sayfa"
      aria-label="MySkyParcel ana sayfa"
      className="block w-[150px] max-w-[150px] shrink-0 sm:w-[180px] sm:max-w-[180px] lg:w-[190px] lg:max-w-[190px] 2xl:w-[210px] 2xl:max-w-[210px]"
    >
      <img
        src="/myskyparcel-logo.svg"
        alt="MySkyParcel — Gökyüzünde Sana Özel Bir Yer"
        className="!block !h-auto !w-full !max-w-full object-contain"
        style={{ width: "100%", maxWidth: "100%", height: "auto" }}
        width={1536}
        height={526}
        decoding="async"
      />
    </Link>
  );
}
