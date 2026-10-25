import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Smart Learning Compass" },
      {
        name: "description",
        content: "Choose a new password for your Smart Learning Compass account.",
      },
      {
        property: "og:title",
        content: "Set a new password — Smart Learning Compass",
      },
      {
        property: "og:description",
        content: "Choose a new password for your Smart Learning Compass account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      setDone(true);
      toast.success("Password updated. Please sign in with your new password.");
      router.navigate({ to: "/auth", search: { role: "student" } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl bg-slate-900 p-6 text-center">
        {!ready ? (
          <p className="text-slate-300">Checking your reset link…</p>
        ) : done ? (
          <>
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="text-2xl font-bold">Password updated</h1>
            <Link
              to="/auth"
              search={{ role: "student" }}
              className="mt-6 inline-block rounded-lg bg-cyan-700 px-5 py-3 font-semibold hover:bg-cyan-600"
            >
              Sign in
            </Link>
          </>
        ) : hasSession ? (
          <>
            <h1 className="text-2xl font-bold">Set a new password</h1>

            <form onSubmit={submit} className="mt-6 text-left">
              <label className="mb-4 block">
                <span className="mb-2 block text-sm">New password</span>
                <input
                  className="w-full rounded-lg bg-slate-800 p-3"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <label className="mb-5 block">
                <span className="mb-2 block text-sm">Confirm new password</span>
                <input
                  className="w-full rounded-lg bg-slate-800 p-3"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your new password"
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-cyan-700 p-3 font-semibold hover:bg-cyan-600 disabled:opacity-60"
              >
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="text-2xl font-bold">Link expired</h1>
            <p className="mt-3 text-slate-300">
              This password reset link is no longer valid. Request a new one to
              continue.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-block rounded-lg bg-cyan-700 px-5 py-3 font-semibold hover:bg-cyan-600"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
