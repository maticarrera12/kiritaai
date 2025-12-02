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
  ArrowDown01Icon,
} from "hugeicons-react";
import { useState, useMemo, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export default function ReviewsList({ reviews }: { reviews: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as globalThis.Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getFilterLabel = () => {
    if (selectedRating === null) {
      return `All (${reviews.length})`;
    }
    return `${selectedRating}★ (${counts[selectedRating] || 0})`;
  };

  return (
    <div id="reviews-anchor" className="mt-8 md:mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-primary/10 text-primary rounded-lg md:rounded-xl">
            <Message01Icon size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              User Reviews
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Market sentiment analysis
            </p>
          </div>
        </div>

        {/* Mobile: Dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-background hover:bg-muted/50",
              selectedRating === null ? "border-foreground/20" : "border-border"
            )}
          >
            <span className="flex items-center gap-1.5">
              {selectedRating !== null && <StarIcon size={14} className="text-yellow-500" />}
              {getFilterLabel()}
            </span>
            <ArrowDown01Icon
              size={14}
              className={cn("transition-transform", isDropdownOpen && "rotate-180")}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleFilterChange(null)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                      selectedRating === null
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>All</span>
                    <span className="text-xs text-muted-foreground">({reviews.length})</span>
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
                          "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : isDisabled
                              ? "opacity-40 cursor-not-allowed text-muted-foreground"
                              : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <StarIcon
                            size={14}
                            className={cn(isActive ? "text-yellow-500" : "text-yellow-500/70")}
                          />
                          {star}★
                        </span>
                        <span className="text-xs text-muted-foreground">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop: Horizontal buttons */}
        <div className="hidden md:flex items-center gap-2">
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
                  className={cn(isActive ? "text-yellow-300" : "text-yellow-500/70")}
                />
                <span className="opacity-60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 md:space-y-4 relative min-h-[200px]">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-muted/10 rounded-xl md:rounded-[2rem] border border-border/50 border-dashed">
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              No reviews match this filter.
            </p>
            <button
              onClick={() => handleFilterChange(null)}
              className="mt-2 text-primary text-xs md:text-sm font-bold hover:underline"
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
              className="space-y-3 md:space-y-4"
            >
              {currentReviews.map((review, i) => {
                const isOpportunity = review.score <= 2;

                return (
                  <div
                    key={i}
                    className={cn(
                      "group p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border transition-all duration-300 bg-white dark:bg-white/5",
                      isOpportunity
                        ? "border-orange-200/60 bg-orange-50/30 dark:bg-orange-900/5 dark:border-orange-900/30 hover:border-orange-300"
                        : "border-border/50 hover:border-border hover:shadow-md"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-sm border border-white/20 shrink-0",
                            isOpportunity
                              ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                          )}
                        >
                          {review.userName?.charAt(0).toUpperCase() || (
                            <UserIcon size={14} className="md:w-4 md:h-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-bold text-foreground truncate">
                            {review.userName || "Anonymous User"}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, starIndex) => (
                              <StarIcon
                                key={starIndex}
                                size={10}
                                className={cn(
                                  "md:w-3 md:h-3",
                                  starIndex < review.score
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] md:text-xs font-medium text-muted-foreground/60 bg-muted/30 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg shrink-0">
                        {new Date(review.at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-foreground/80 text-xs md:text-sm leading-relaxed font-medium break-words">
                      "{review.content}"
                    </p>

                    <div className="mt-3 md:mt-4 flex items-center gap-2">
                      {isOpportunity ? (
                        <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-orange-200/50">
                          <Alert01Icon size={10} className="md:w-3 md:h-3" />
                          Pain Point Detected
                        </div>
                      ) : (
                        review.thumbsUpCount > 0 && (
                          <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-muted/50 text-muted-foreground text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                            <ThumbsUpIcon size={10} className="md:w-3 md:h-3" />
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
        <div className="flex justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/40 gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-foreground bg-transparent hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ArrowLeft01Icon size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Page <span className="text-foreground font-bold">{currentPage}</span> of {totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-foreground bg-transparent hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight01Icon size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
}
