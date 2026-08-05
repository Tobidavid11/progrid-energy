// Loads Paystack's Inline JS script on demand rather than requiring it
// as a permanent <script> tag in index.html — keeps the dependency
// scoped to only where it's actually used (checkout), and this file is
// idempotent: calling it multiple times across renders only ever loads
// the script once.

export interface PaystackTransaction {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number; // kobo
  currency?: string;
  ref: string;
  onClose: () => void;
  callback: (response: PaystackTransaction) => void;
}

interface PaystackPopHandler {
  openIframe: () => void;
}

interface PaystackPopStatic {
  setup: (options: PaystackSetupOptions) => PaystackPopHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopStatic;
  }
}

const SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

let loadPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Paystack script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}