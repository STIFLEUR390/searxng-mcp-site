"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "copy",
  copiedLabel = "copied",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="copy"
      onClick={copy}
      data-copied={copied}
      aria-label={copied ? copiedLabel : `${label}: ${value.slice(0, 40)}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
