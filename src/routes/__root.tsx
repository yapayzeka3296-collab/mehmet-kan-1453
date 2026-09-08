import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import "../styles.css";
import "../gokyuzu-scale.css";
import "../myskyparcel-layer-fix.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteVisitTracker } from "@/components/SiteVisitTracker";

function NotFoundComponent() { return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors">Go home</Link></div></div></div>; }
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) { console.error(error); const router = useRouter(); useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]); return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">Go home</a></div></div></div>; }

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "MySkyParcel — Kişiye Özel Dijital Hediye ve Gökyüzü Parseli" },
    { name: "description", content: "Kişiye özel hediye ve dijital hediye arayanlar için MySkyParcel: gökyüzünde sembolik parsel seçimi, kişiye özel dijital sertifika ve unutulmaz bir sürpriz." },
    { name: "author", content: "MySkyParcel" }, { property: "og:title", content: "MySkyParcel — Kişiye Özel Dijital Hediye ve Gökyüzü Parseli" },
    { property: "og:description", content: "Sevgiliye özel, farklı ve anlamlı bir dijital hediye: kişiye özel gökyüzü parseli ve sertifika." }, { property: "og:type", content: "website" },
    { property: "og:url", content: "https://myskyparcel.com/" }, { property: "og:image", content: "https://myskyparcel.com/hero-background.jpg" },
    { property: "og:image:width", content: "1200" }, { property: "og:image:height", content: "630" }, { property: "og:image:alt", content: "MySkyParcel gökyüzü parselleri" },
    { name: "twitter:card", content: "summary_large_image" }, { name: "twitter:title", content: "MySkyParcel — Kişiye Özel Dijital Hediye ve Gökyüzü Parseli" },
    { name: "twitter:description", content: "Sevgiliye özel, farklı ve anlamlı bir dijital hediye: kişiye özel gökyüzü parseli ve sertifika." }, { name: "twitter:image", content: "https://myskyparcel.com/hero-background.jpg" },
    { name: "google", content: "notranslate" },
  ], links: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap" },
  ], scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": "https://myskyparcel.com/#website", "url": "https://myskyparcel.com/", "name": "MySkyParcel", "description": "Kişiye özel dijital hediye, sembolik gökyüzü parseli ve dijital sertifika platformu.", "inLanguage": "tr-TR" },
    { "@type": "Organization", "@id": "https://myskyparcel.com/#organization", "name": "MySkyParcel", "url": "https://myskyparcel.com/" }
  ] }) }]}), shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="tr" translate="no"><head><HeadContent /><meta name="google-site-verification" content="FnBKvdIxURn7yQQY7YNxhbM-sxPfNEjJf4GgmZKh0ec" /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><AuthProvider><SiteVisitTracker /><Outlet /></AuthProvider></QueryClientProvider>; }
