"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { getSupabase } from "@/shared/lib/supabase";

/**
 * Account Settings page — GDPR user rights UI.
 * - Right to access + portability: Download data button (calls /api/user/export)
 * - Right to erasure: Delete account button with confirmation modal (calls /api/user/delete)
 *
 * Both operations require active Supabase session (enforced by API routes).
 */
export default function AccountSettingsPage() {
  const { userId, userEmail, userTier, signOut } = useAuthStore();

  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    setStatus(null);
    try {
      const sb = getSupabase();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
      if (!token) throw new Error("No active session");

      const res = await fetch("/api/user/export", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      // Download the JSON file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modulca-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("Your data has been downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const sb = getSupabase();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
      if (!token) throw new Error("No active session");

      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setStatus("Account scheduled for deletion. You have 30 days to restore by contacting privacy@modulca.eu. Signing out now...");

      // Sign out after brief delay so user sees the message
      setTimeout(async () => {
        await signOut();
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-brand-bone-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">Sign in required</h1>
          <p className="text-sm text-brand-gray mb-4">
            You must be signed in to access your account settings.
          </p>
          <Link href="/login" className="inline-block bg-brand-olive-700 text-white px-4 py-2 rounded-lg text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/dashboard" className="text-lg font-bold text-brand-charcoal">
          ← Dashboard
        </Link>
        <span className="text-sm text-brand-gray">Account Settings</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-brand-charcoal">Account & Privacy</h1>

        {/* Account info */}
        <section className="bg-white rounded-lg border border-brand-bone-300/60 p-5">
          <h2 className="text-base font-bold mb-3">Your Account</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-brand-gray">Email</dt>
              <dd className="text-brand-charcoal font-medium">{userEmail || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-gray">Current plan</dt>
              <dd className="text-brand-charcoal font-medium capitalize">{userTier}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-gray">User ID</dt>
              <dd className="text-brand-gray text-xs font-mono">{userId.slice(0, 8)}...</dd>
            </div>
          </dl>
        </section>

        {/* GDPR: Export data */}
        <section className="bg-white rounded-lg border border-brand-bone-300/60 p-5">
          <h2 className="text-base font-bold mb-2">Download Your Data</h2>
          <p className="text-sm text-brand-gray mb-4">
            Under GDPR Article 15 and 20, you have the right to receive all personal data we hold
            about you in a structured, machine-readable format (JSON). The export includes your
            profile, projects, and renders.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-brand-olive-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-olive-800 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Preparing..." : "Download my data (JSON)"}
          </button>
        </section>

        {/* GDPR: Delete account */}
        <section className="bg-white rounded-lg border border-red-200 p-5">
          <h2 className="text-base font-bold mb-2 text-red-700">Delete Account</h2>
          <p className="text-sm text-brand-gray mb-4">
            Under GDPR Article 17, you have the right to request deletion of your account and
            personal data. We offer a <strong>30-day grace period</strong> after which data is
            permanently erased. During the grace period, you can restore your account by emailing{" "}
            <a href="mailto:privacy@modulca.eu" className="text-brand-olive-700 underline">
              privacy@modulca.eu
            </a>
            .
          </p>
          <p className="text-xs text-brand-gray mb-4">
            Note: billing records are retained by Stripe per Romanian tax law (10 years) but are
            not linked to your account after deletion.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-red-50 text-red-700 border border-red-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-800">
                Are you sure? This will cancel subscriptions and sign you out from all devices.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="bg-white text-brand-gray border border-brand-bone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-bone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Status / Error feedback */}
        {status && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-sm">
            {status}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Links */}
        <section className="text-xs text-brand-gray pt-4 border-t border-brand-bone-300/60">
          See our{" "}
          <Link href="/privacy" className="text-brand-olive-700 underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link href="/cookies" className="text-brand-olive-700 underline">Cookie Policy</Link>{" "}
          for full details.
        </section>
      </main>
    </div>
  );
}
