"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FeedbackData {
  rating: number;
  role: string;
  comment: string;
  walletAddress?: string;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "#fbbf24" : "none"}
            stroke={(hovered || value) >= star ? "#fbbf24" : "rgba(255,255,255,0.2)"}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    role: "",
    comment: "",
  });

  const handleSubmit = useCallback(() => {
    if (feedback.rating === 0) return;

    // Store in localStorage (in production: POST to /api/feedback)
    const all: FeedbackData[] = JSON.parse(
      localStorage.getItem("microloan_feedback") ?? "[]"
    );
    all.push({ ...feedback, walletAddress: undefined });
    localStorage.setItem("microloan_feedback", JSON.stringify(all));
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback({ rating: 0, role: "", comment: "" });
    }, 2500);
  }, [feedback]);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0c0c1d]/90 px-4 py-3 text-sm font-medium text-white/70 backdrop-blur-xl shadow-2xl transition-all hover:border-[#7c6cf0]/30 hover:text-white hover:shadow-[0_0_30px_rgba(124,108,240,0.15)] sm:bottom-8 sm:right-8"
        aria-label="Share feedback"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-8"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="relative w-full max-w-sm animate-fade-in-up rounded-2xl border border-white/[0.08] bg-[#0c0c1d]/95 p-6 shadow-2xl backdrop-blur-2xl">
            {!submitted ? (
              <>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white/90">Share your experience</h2>
                    <p className="mt-0.5 text-xs text-white/35">Help us improve the protocol</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/30 hover:text-white/70 text-lg leading-none transition-colors"
                  >
                    &times;
                  </button>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                    Overall Rating
                  </label>
                  <StarRating
                    value={feedback.rating}
                    onChange={(r) => setFeedback((f) => ({ ...f, rating: r }))}
                  />
                </div>

                {/* Role selector */}
                <div className="mb-4">
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Borrower", "Lender", "Evaluator"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFeedback((f) => ({ ...f, role: r }))}
                        className={cn(
                          "rounded-lg border py-2 text-xs font-medium transition-all",
                          feedback.role === r
                            ? "border-[#7c6cf0]/40 bg-[#7c6cf0]/10 text-[#7c6cf0]"
                            : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/70"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-5">
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                    Comments (optional)
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) =>
                      setFeedback((f) => ({ ...f, comment: e.target.value }))
                    }
                    rows={3}
                    maxLength={300}
                    placeholder="What worked well? What could be improved?"
                    className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/80 placeholder:text-white/15 outline-none transition-all focus:border-[#7c6cf0]/30 focus:shadow-[0_0_20px_rgba(124,108,240,0.08)]"
                  />
                  <div className="mt-1 text-right text-[10px] text-white/20">
                    {feedback.comment.length}/300
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={feedback.rating === 0}
                  className={cn(
                    "w-full rounded-xl py-3 text-sm font-medium transition-all",
                    feedback.rating > 0
                      ? "bg-gradient-to-r from-[#7c6cf0] to-[#5b8cf0] text-white hover:shadow-[0_0_25px_rgba(124,108,240,0.3)] active:scale-[0.98]"
                      : "bg-white/[0.04] text-white/25 cursor-not-allowed"
                  )}
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-white/90">Thank you!</p>
                  <p className="mt-1 text-sm text-white/40">
                    Your feedback helps improve the protocol.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
