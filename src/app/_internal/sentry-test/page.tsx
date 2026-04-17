"use client";

import { useState, type ReactElement } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Internal Sentry verification page — NOT linked from anywhere.
 * Access via direct URL: /_internal/sentry-test
 *
 * Purpose: verify that client-side Sentry captures errors, messages,
 * unhandled promise rejections, and React render errors in production.
 *
 * Safe to leave in repo — the "_internal" folder convention and the
 * noindex meta tag keep it out of search engines.
 *
 * Remove after go-live if desired.
 */

function BrokenChild({ shouldThrow }: { shouldThrow: boolean }): ReactElement {
  if (shouldThrow) {
    throw new Error("Sentry test — React render error from BrokenChild");
  }
  return <span className="text-emerald-600">child is fine</span>;
}

export default function SentryTestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [shouldThrow, setShouldThrow] = useState(false);

  const push = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${msg}`]);

  const fireMessage = () => {
    Sentry.captureMessage("Sentry browser test — info message", "info");
    push("✓ captureMessage sent (info)");
  };

  const fireException = () => {
    try {
      throw new Error("Sentry browser test — caught exception");
    } catch (err) {
      const id = Sentry.captureException(err, {
        tags: { source: "browser-test", page: "_internal/sentry-test" },
      });
      push(`✓ captureException sent (id: ${id.slice(0, 8)}...)`);
    }
  };

  const fireUnhandledRejection = () => {
    // Intentionally NOT awaited — creates unhandled rejection
    void Promise.reject(new Error("Sentry browser test — unhandled promise rejection"));
    push("✓ unhandled rejection fired (should appear in Sentry within 30s)");
  };

  const fireUncaught = () => {
    // setTimeout so we get outside React's error boundary
    setTimeout(() => {
      throw new Error("Sentry browser test — uncaught runtime error");
    }, 0);
    push("✓ uncaught runtime error fired");
  };

  const fireRenderError = () => {
    push("→ triggering React render error...");
    setShouldThrow(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Prevent search engine indexing */}
      <meta name="robots" content="noindex, nofollow" />

      <h1 className="text-2xl font-bold text-brand-teal-800 mb-2">
        Sentry Browser Verification
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Fire each type of error and confirm it shows up in{" "}
        <a
          href="https://modulca.sentry.io/issues/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-amber-500 underline"
        >
          Sentry Issues
        </a>{" "}
        within ~30 seconds.
      </p>

      <div className="space-y-2 mb-6">
        <button
          onClick={fireMessage}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          1. Fire <code className="text-brand-teal-700">captureMessage</code> (info)
        </button>
        <button
          onClick={fireException}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          2. Fire <code className="text-brand-teal-700">captureException</code> (caught)
        </button>
        <button
          onClick={fireUnhandledRejection}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          3. Fire unhandled Promise rejection
        </button>
        <button
          onClick={fireUncaught}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          4. Fire uncaught runtime error (setTimeout)
        </button>
        <button
          onClick={fireRenderError}
          className="block w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
        >
          5. Fire React render error (will crash this page!)
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Log
        </h2>
        {log.length === 0 ? (
          <p className="text-xs text-gray-400">No events fired yet.</p>
        ) : (
          <ul className="space-y-1">
            {log.map((line, i) => (
              <li key={i} className="text-xs font-mono text-gray-700">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg bg-white border border-gray-200 p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Render-test child (controlled)
        </h2>
        <BrokenChild shouldThrow={shouldThrow} />
      </div>

      <p className="mt-6 text-[10px] text-gray-400">
        This page is hidden (noindex) and not linked from anywhere. Delete{" "}
        <code>src/app/_internal/sentry-test/</code> after go-live verification.
      </p>
    </div>
  );
}
