import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-wide">
          <span className="text-white">MY SKY</span>
          <span className="text-yellow-400">PARCEL</span>
        </h1>

        <p className="text-[11px] uppercase tracking-[4px] text-gray-300">
          GÖKYÜZÜNDE SANA ÖZEL BİR YER
        </p>

        <p className="text-[12px] font-semibold text-yellow-400">
          Geleceğin Dijital Dünyası
        </p>

        <p className="text-[11px] uppercase tracking-[3px] text-white">
          81 İL • 81 MİLYON PARSEL
        </p>
      </div>
    </Link>
  );
}

export default Logo;
