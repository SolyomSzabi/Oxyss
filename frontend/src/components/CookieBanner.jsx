import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Storage key ─────────────────────────────────────────────────────────────
const CONSENT_KEY = 'oxyss_cookie_consent';

// ─── Hook: use anywhere in the app to read consent ───────────────────────────
export const useCookieConsent = () => {
  const [consent, setConsentState] = useState(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveConsent = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    } catch {}
    setConsentState(value);
  };

  const resetConsent = () => {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {}
    setConsentState(null);
  };

  return { consent, saveConsent, resetConsent };
};

// ─── Main Banner Component ────────────────────────────────────────────────────
const CookieBanner = () => {
  const { consent, saveConsent } = useCookieConsent();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [thirdParty, setThirdParty] = useState(false);

  useEffect(() => {
    // Show banner only if no decision has been made yet
    if (consent === null) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, functional: true, thirdParty: true, date: new Date().toISOString() });
    setVisible(false);
  };

  const handleRejectOptional = () => {
    saveConsent({ necessary: true, functional: false, thirdParty: false, date: new Date().toISOString() });
    setVisible(false);
  };

  const handleSaveCustom = () => {
    saveConsent({ necessary: true, functional, thirdParty, date: new Date().toISOString() });
    setVisible(false);
  };

  return (
    <>
      {/* Backdrop for detail panel on mobile */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowDetails(false)}
        />
      )}

      {/* Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-500"
        role="dialog"
        aria-label="Consimțământ cookie-uri"
        aria-modal="true"
      >
        <div className="max-w-4xl mx-auto bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">

          {/* Simple view */}
          {!showDetails ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-600 p-2 rounded-lg flex-shrink-0 mt-0.5">
                  <Cookie className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold mb-2">Acest site folosește cookie-uri</h2>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    Folosim cookie-uri necesare pentru funcționarea site-ului și, cu acordul tău,
                    cookie-uri Google Maps pentru harta interactivă și afișarea recenziilor.
                    Citește{' '}
                    <a href="/cookies" className="text-yellow-400 hover:underline">
                      Politica de Cookie-uri
                    </a>
                    {' '}și{' '}
                    <a href="/privacy" className="text-yellow-400 hover:underline">
                      Politica de Confidențialitate
                    </a>
                    .
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Acceptă toate
                    </Button>
                    <Button
                      onClick={handleRejectOptional}
                      variant="outline"
                      className="border-zinc-600 text-white hover:bg-zinc-800 font-semibold px-5 py-2 rounded-lg"
                    >
                      Doar necesare
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="ghost"
                      className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm px-3 py-2"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Personalizează
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Detail / Customization view */
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-yellow-400" />
                  Preferințe cookie-uri
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {/* Necessary - always on */}
                <div className="flex items-start justify-between bg-zinc-800 rounded-lg p-4">
                  <div className="flex-1 mr-4">
                    <p className="font-semibold text-sm">Cookie-uri Necesare</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      Esențiale pentru funcționarea site-ului. Nu pot fi dezactivate.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xs text-green-400 font-semibold bg-green-900/40 px-2 py-1 rounded-full">
                      Mereu active
                    </span>
                  </div>
                </div>

                {/* Functional */}
                <label className="flex items-start justify-between bg-zinc-800 rounded-lg p-4 cursor-pointer">
                  <div className="flex-1 mr-4">
                    <p className="font-semibold text-sm">Cookie-uri Funcționale</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      Memorează preferința ta de limbă (Română / Maghiară / Engleză).
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="w-5 h-5 rounded accent-yellow-500 cursor-pointer"
                    />
                  </div>
                </label>

                {/* Third-party */}
                <label className="flex items-start justify-between bg-zinc-800 rounded-lg p-4 cursor-pointer">
                  <div className="flex-1 mr-4">
                    <p className="font-semibold text-sm">Cookie-uri Google (Terțe)</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      Necesare pentru Google Maps și recenziile Google. Fără acceptul tău, harta
                      și recenziile nu vor fi afișate.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={thirdParty}
                      onChange={(e) => setThirdParty(e.target.checked)}
                      className="w-5 h-5 rounded accent-yellow-500 cursor-pointer"
                    />
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSaveCustom}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Salvează preferințele
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="border-zinc-600 text-white hover:bg-zinc-800 font-semibold px-5 py-2 rounded-lg"
                >
                  Acceptă toate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieBanner;