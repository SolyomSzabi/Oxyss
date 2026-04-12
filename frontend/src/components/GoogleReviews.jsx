// src/components/GoogleReviews.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, ExternalLink } from "lucide-react";

const PLACE_ID = "ChIJg-gd3M5lSEcRdneKQxwkmes";

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

const GoogleReviews = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) return null;

  return (
    <section className="section-padding bg-zinc-50" data-testid="reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Fejléc */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
            {t("reviews.title", "Vendégeink véleménye")}
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-6">
            {t("reviews.subtitle", "Amit ügyfeleink mondanak rólunk")}
          </p>

          {/* Összesített értékelés badge */}
          {!loading && data && (
            <div className="inline-flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-6 py-3 shadow-sm">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-5 w-5"
              />
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

        {/* Kártyák */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : (data?.reviews || []).map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Szerző */}
                  <div className="flex items-center gap-3">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-lg">
                        {review.author?.[0] ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">
                        {review.author}
                      </p>
                      <p className="text-zinc-400 text-xs">{review.time}</p>
                    </div>
                  </div>

                  {/* Csillagok */}
                  <StarRating rating={review.rating} />

                  {/* Szöveg */}
                  <p className="text-zinc-600 text-sm leading-relaxed flex-1">
                    {review.text?.length > 200
                      ? review.text.slice(0, 200) + "…"
                      : review.text || t("reviews.noText", "Pozitív értékelés")}
                  </p>

                  {/* Google logo */}
                  <div className="flex items-center gap-1 mt-auto pt-2 border-t border-zinc-50">
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="h-3 w-3"
                    />
                    <span className="text-xs text-zinc-400">Google Review</span>
                  </div>
                </div>
              ))}
        </div>

        {/* Link a Google-ra */}
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
