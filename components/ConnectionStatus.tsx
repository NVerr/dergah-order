"use client";

import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Service Worker registrieren (nur im Browser, nicht beim Server-Render).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker Registrierung fehlgeschlagen:", error);
      });
    }

    // Anfangszustand setzen und auf Änderungen reagieren.
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 px-4 font-bold text-lg">
      Keine Verbindung – Bestellung kann gerade nicht aufgegeben werden
    </div>
  );
}
