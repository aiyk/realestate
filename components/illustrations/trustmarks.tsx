import { cn } from "@/lib/utils";

/**
 * Monochrome wordmarks for the "Powered by" footer strip.
 * These are stylised type, not the official trade-marked logos —
 * we use currentColor so they read as one piece on the footer.
 */

type Props = { className?: string };

export function PaystackMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 96 24"
      aria-label="Paystack"
      role="img"
      className={cn("h-5 w-auto fill-current", className)}
    >
      <rect x="0" y="4" width="6" height="16" rx="1" />
      <rect x="8" y="0" width="6" height="20" rx="1" opacity="0.7" />
      <rect x="16" y="8" width="6" height="12" rx="1" opacity="0.5" />
      <text
        x="28"
        y="17"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        Paystack
      </text>
    </svg>
  );
}

export function DojahMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 80 24"
      aria-label="Dojah"
      role="img"
      className={cn("h-5 w-auto fill-current", className)}
    >
      <circle cx="10" cy="12" r="8" />
      <circle cx="10" cy="12" r="3" fill="#fff" opacity="0.9" />
      <text
        x="22"
        y="17"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        Dojah
      </text>
    </svg>
  );
}

export function ResendMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 80 24"
      aria-label="Resend"
      role="img"
      className={cn("h-5 w-auto fill-current", className)}
    >
      <path d="M2 4 L18 4 L18 20 L14 20 L14 8 L6 8 L6 20 L2 20 Z" />
      <text
        x="22"
        y="17"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        Resend
      </text>
    </svg>
  );
}

export function R2Mark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 96 24"
      aria-label="Cloudflare R2"
      role="img"
      className={cn("h-5 w-auto fill-current", className)}
    >
      <path d="M4 16 Q4 8 12 8 Q20 8 22 14 Q26 8 32 8 Q40 8 40 16 L36 16 Q36 12 32 12 Q28 12 28 16 L24 16 L24 14 Q20 12 16 12 Q12 12 12 16 Z" />
      <text
        x="46"
        y="17"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        R2 storage
      </text>
    </svg>
  );
}

export function Trustmarks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-3 text-muted-foreground",
        className,
      )}
    >
      <PaystackMark />
      <DojahMark />
      <ResendMark />
      <R2Mark />
    </div>
  );
}
