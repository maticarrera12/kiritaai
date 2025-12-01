"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  StarIcon,
  Alert01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Message01Icon,
  ThumbsUpIcon,
  UserIcon,
} from "hugeicons-react";
import { useState, useMemo } from "react";

import { cn } from "@/lib/utils";

export default function ReviewsList({ reviews }: { reviews: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const itemsPerPage = 10;

  const filteredReviews = useMemo(() => {
    if (selectedRating === null) return reviews;
    return reviews.filter((r) => r.score === selectedRating);
  }, [reviews, selectedRating]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentReviews = filteredReviews.slice(start, start + itemsPerPage);

  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (c[r.score] !== undefined) c[r.score]++;
    });
    return c;
  }, [reviews]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const element = document.getElementById("reviews-anchor");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleFilterChange = (rating: number | null) => {
    setSelectedRating(rating);
    setCurrentPage(1);
  };

  return (
    <div id="reviews-anchor" className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Message01Icon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">User Reviews</h2>
            <p className="text-sm text-muted-foreground font-medium">Market sentiment analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => handleFilterChange(null)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
              selectedRating === null
                ? "bg-foreground text-background border-foreground shadow-md"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
            )}
          >
            All <span className="opacity-60">({reviews.length})</span>
          </button>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] || 0;
            const isActive = selectedRating === star;
            const isDisabled = count === 0;

            return (
              <button
                key={star}
                onClick={() => !isDisabled && handleFilterChange(star)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-md"
                    : isDisabled
                      ? "bg-muted/20 text-muted-foreground/30 border-transparent cursor-not-allowed"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                )}
              >
                {star}
                <StarIcon
                  size={10}
                  className={isActive ? "text-yellow-300" : "text-yellow-500/70"}
                />
                <span className="opacity-60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 relative min-h-[200px]">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-border/50 border-dashed">
            <p className="text-muted-foreground font-medium">No reviews match this filter.</p>
            <button
              onClick={() => handleFilterChange(null)}
              className="mt-2 text-primary text-sm font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${selectedRating}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {currentReviews.map((review, i) => {
                const isOpportunity = review.score <= 2;

                return (
                  <div
                    key={i}
                    className={cn(
                      "group p-6 rounded-[1.5rem] border transition-all duration-300 bg-white dark:bg-white/5",
                      isOpportunity
                        ? "border-orange-200/60 bg-orange-50/30 dark:bg-orange-900/5 dark:border-orange-900/30 hover:border-orange-300"
                        : "border-border/50 hover:border-border hover:shadow-md"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-white/20",
                            isOpportunity
                              ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                          )}
                        >
                          {review.userName?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {review.userName || "Anonymous User"}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, starIndex) => (
                              <StarIcon
                                key={starIndex}
                                size={12}
                                className={cn(
                                  starIndex < review.score
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-lg">
                        {new Date(review.at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                      "{review.content}"
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      {isOpportunity ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider border border-orange-200/50">
                          <Alert01Icon size={12} />
                          Pain Point Detected
                        </div>
                      ) : (
                        review.thumbsUpCount > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                            <ThumbsUpIcon size={12} />
                            {review.thumbsUpCount} found helpful
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-foreground bg-transparent hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ArrowLeft01Icon size={18} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Page <span className="text-foreground font-bold">{currentPage}</span> of {totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-foreground bg-transparent hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            Next
            <ArrowRight01Icon size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
