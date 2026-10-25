import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Smart Learning Compass" },
      {
        name: "description",
        content: "Request a password reset email for your Smart Learning Compass account.",
      },
      { property: "og:title", content: "Reset password — Smart Learning Compass" },
      {
        property: "og:description",
        content: "Request a password reset email for your Smart Learning Compass account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl bg-slate-900 p-6 text-center">
        {sent ? (
          <>
            <div className="mb-4 text-4xl">📧</div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="mt-3 text-slate-300">
              If an account exists for {email}, we've sent a link to reset your
              password.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="mt-2 text-sm text-slate-300">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={submit} className="mt-6 text-left">
              <label className="mb-4 block">
                <span className="mb-2 block text-sm">College Email</span>
                <input
                  className="w-full rounded-lg bg-slate-800 p-3"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-cyan-700 p-3 font-semibold hover:bg-cyan-600 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <Link
          to="/auth"
          search={{ role: "student" }}
          className="mt-6 inline-block text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}
