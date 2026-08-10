import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/pazar-yeri")({
  head: () => ({
    meta: [
      { title: "Pazar Yeri — MySkyParcel" },
      { name: "description", content: "MySkyParcel Pazar Yeri çok yakında." },
    ],
  }),
  component: PazarYeri,
});

function PazarYeri() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-160px)] max-w-4xl items-center px-4 py-14 lg:px-8">
        <article className="panel w-full p-8 text-center sm:p-12">
          <div className="text-5xl" aria-hidden="true">🌌</div>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-5xl">MY SKY PARCEL PAZAR YERİ</h1>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-xl leading-relaxed text-gold sm:text-2xl">
            GÖKYÜZÜNDEKİ PARSELİNİ KEŞFET.<br />KOLEKSİYONUNU BÜYÜT.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
            Çok yakında kullanıcılar sembolik dijital gökyüzü parsellerini <strong className="text-foreground">alabilecek, satabilecek ve keşfedebilecek.</strong>
          </p>
          <p className="mt-8 font-display text-lg text-foreground">PAZAR YERİ ÇOK YAKINDA.</p>
          <p className="mx-auto mt-6 max-w-2xl text-xs leading-6 text-muted-foreground">
            MySkyParcel parselleri sembolik ve dijital koleksiyon niteliğindedir; gerçek mülkiyet veya taşınmaz hakkı sağlamaz.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
