"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trackFeedbackSubmit } from "@/lib/posthog";

const STORAGE_KEY = "credit_scoring_feedback_submitted_v1";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😐", label: "Fair" },
  { value: 3, emoji: "😊", label: "Good" },
  { value: 4, emoji: "😄", label: "Great" },
  { value: 5, emoji: "🤩", label: "Excellent" },
];

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = () => {
    if (rating === 0) return;
    trackFeedbackSubmit(rating, comment.trim().length > 0);
    localStorage.setItem(STORAGE_KEY, "true");
    setSubmitted(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-sm transition-all duration-300",
          isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-4"
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d20]/98 shadow-2xl backdrop-blur-2xl">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7c6cf0]/15 border border-[#7c6cf0]/20">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white/90">Quick Feedback</span>
                </div>
                <button onClick={handleClose} className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none">&times;</button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-white/50">
                  How was your experience with the Credit Scoring dApp?
                </p>

                {/* Star Rating */}
                <div>
                  <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-white/25">
                    Your Rating
                  </p>
                  <div className="flex items-center gap-2">
                    {RATINGS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRating(r.value)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 transition-all",
                          rating === r.value
                            ? "border-[#7c6cf0]/40 bg-[#7c6cf0]/10 scale-105"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        )}
                        title={r.label}
                      >
                        <span className="text-lg leading-none">{r.emoji}</span>
                        <span className="text-[8px] text-white/25">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
                    Comments <span className="text-white/15 normal-case">(optional)</span>
                  </p>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-px focus-within:border-[#7c6cf0]/30">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What worked well? What could be improved?"
                      rows={3}
                      className="w-full rounded-[11px] bg-transparent px-4 py-3 text-sm text-white/80 placeholder:text-white/15 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
                    Email <span className="text-white/15 normal-case">(optional)</span>
                  </p>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-px focus-within:border-[#7c6cf0]/30">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-[11px] bg-transparent px-4 py-3 text-sm text-white/80 placeholder:text-white/15 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(to right, #7c6cf0, #5b8cf0)",
                    boxShadow: rating > 0 ? "0 0 20px rgba(124,108,240,0.25)" : "none",
                  }}
                >
                  Submit Feedback
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34d399]/15 border border-[#34d399]/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-base font-semibold text-white/90">Thanks for your feedback!</p>
              <p className="text-xs text-white/40">Your response helps us improve the app.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeedbackTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0d0d20]/90 px-4 py-2.5 text-xs text-white/50 shadow-xl backdrop-blur-xl transition-all hover:border-white/[0.15] hover:text-white/80 hover:shadow-[0_0_20px_rgba(124,108,240,0.15)]"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Feedback
    </button>
  );
}

export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);

  const openFeedback = () => setShowFeedback(true);
  const closeFeedback = () => setShowFeedback(false);

  return { showFeedback, openFeedback, closeFeedback };
}
