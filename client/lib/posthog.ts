import posthog from "posthog-js";

export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_placeholder_replace_with_real_key";

export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // manual page view
    capture_pageleave: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.debug();
    },
  });
}

export function trackPageView(path: string) {
  posthog.capture("$pageview", { $current_url: path });
}

export function trackWalletConnect(address: string) {
  posthog.capture("wallet_connected", { address_prefix: address.slice(0, 6) });
  posthog.identify(address, { wallet: address });
}

export function trackWalletDisconnect() {
  posthog.capture("wallet_disconnected");
  posthog.reset();
}

export function trackContractInteraction(
  action: "submit_score" | "lookup_score" | "get_history" | "remove_score",
  meta?: Record<string, unknown>
) {
  posthog.capture(`contract_${action}`, meta ?? {});
}

export function trackOnboardingStep(step: number, label: string) {
  posthog.capture("onboarding_step", { step, label });
}

export function trackFeedbackSubmit(rating: number, hasComment: boolean) {
  posthog.capture("feedback_submitted", { rating, has_comment: hasComment });
}

export default posthog;
