import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const SESSION_KEY = "myskyparcel_visit_session";

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function SiteVisitTracker() {
  useEffect(() => {
    if (!supabaseBrowser) return;
    const sessionId = getSessionId();
    const record = () => {
      void supabaseBrowser.rpc("record_site_visit", {
        p_session_id: sessionId,
        p_path: window.location.pathname,
      });
    };
    record();
    const timer = window.setInterval(record, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
