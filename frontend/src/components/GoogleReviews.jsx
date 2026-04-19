// src/components/GoogleReviews.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, ExternalLink, Cookie } from "lucide-react";
import axios from "axios";
import { useCookieConsent } from "@/components/CookieBanner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PLACE_ID = "ChIJg-gd3M5lSEcRdneKQxwkmes";

// ── Exportált hook – használható Home.jsx-ben is ──────────
export const useGoogleReviews = () => {
  const { consent } = useCookieConsent();
  const googleAllowed = consent?.thirdParty === true;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Only fetch if user has accepted third-party cookies
    if (!googleAllowed) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/reviews`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [googleAllowed]); // re-run if consent changes

  return { data, loading, error, googleAllowed };
};

// ─────────────────────────────────────────────────────────

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= rating
            ? "fill-yellow-500 text-yellow-500"
            : "fill-zinc-200 text-zinc-200"
        }`}
      />
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-6 border border-zinc-100 flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-zinc-200" />
      <div className="flex flex-col gap-1">
        <div className="h-3 w-24 bg-zinc-200 rounded" />
        <div className="h-2 w-16 bg-zinc-100 rounded" />
      </div>
    </div>
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 w-4 bg-zinc-200 rounded" />
      ))}
    </div>
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full bg-zinc-100 rounded" />
      <div className="h-2 w-5/6 bg-zinc-100 rounded" />
      <div className="h-2 w-4/6 bg-zinc-100 rounded" />
    </div>
  </div>
);

// ── Blocked state shown when third-party cookies not accepted ─
const ReviewsBlocked = () => {
  const { t } = useTranslation();

  const openCookieSettings = () => {
    // Clear the stored consent so the banner re-appears
    try {
      localStorage.removeItem("oxyss_cookie_consent");
    } catch {}
    window.location.reload();
  };

  return (
    <section className="section-padding bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
            {t("reviews.title", "Recenziile Clienților")}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <div className="bg-zinc-100 rounded-full p-4">
            <Cookie className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="font-semibold text-zinc-700 text-lg">
            {t("reviews.cookieBlocked.title", "Recenziile necesită cookie-uri Google")}
          </p>
          <p className="text-zinc-500 text-sm max-w-sm text-center">
            {t(
              "reviews.cookieBlocked.desc",
              "Pentru a vedea recenziile Google, acceptă cookie-urile terțe în setările de confidențialitate."
            )}
          </p>
          <button
            onClick={openCookieSettings}
            className="mt-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {t("reviews.cookieBlocked.button", "Gestionează preferințele cookie")}
          </button>
        </div>
      </div>
    </section>
  );
};

// ── Main component ────────────────────────────────────────
const GoogleReviews = () => {
  const { t } = useTranslation();
  const { data, loading, error, googleAllowed } = useGoogleReviews();

  // Show blocked state if third-party cookies not accepted
  if (!googleAllowed) return <ReviewsBlocked />;

  if (error) return null;

  return (
    <section className="section-padding bg-zinc-50" data-testid="reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
            {t("reviews.title", "Vendégeink véleménye")}
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-6">
            {t("reviews.subtitle", "Amit ügyfeleink mondanak rólunk")}
          </p>

          {!loading && data && (
            <div className="inline-flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-6 py-3 shadow-sm">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
              <span className="text-2xl font-bold text-zinc-900">
                {data.overallRating?.toFixed(1)}
              </span>
              <StarRating rating={Math.round(data.overallRating || 0)} />
              <span className="text-zinc-500 text-sm">
                ({data.totalRatings} {t("reviews.ratings", "értékelés")})
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : (data?.reviews || []).map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.author} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-lg">
                        {review.author?.[0] ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{review.author}</p>
                      <p className="text-zinc-400 text-xs">{review.time}</p>
                    </div>
                  </div>

                  <StarRating rating={review.rating} />

                  <p className="text-zinc-600 text-sm leading-relaxed flex-1">
                    {review.text?.length > 200
                      ? review.text.slice(0, 200) + "…"
                      : review.text || t("reviews.noText", "Pozitív értékelés")}
                  </p>

                  <div className="flex items-center gap-1 mt-auto pt-2 border-t border-zinc-50">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3 w-3" />
                    <span className="text-xs text-zinc-400">Google Review</span>
                  </div>
                </div>
              ))}
        </div>

        {!loading && (
          <div className="text-center mt-10">
            <a
              href={`https://search.google.com/local/reviews?placeid=${PLACE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              {t("reviews.viewAll", "Az összes értékelés megtekintése a Google-on")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;