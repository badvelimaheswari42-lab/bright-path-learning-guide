import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Role = "student" | "faculty";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search.role === "faculty" ? "faculty" : "student") as Role,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Smart Learning Compass" },
      {
        name: "description",
        content:
          "Sign in or create your account to access your Smart Learning Compass dashboard.",
      },
      { property: "og:title", content: "Sign in — Smart Learning Compass" },
      {
        property: "og:description",
        content:
          "Sign in or create your account to access your Smart Learning Compass dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(target: string | undefined): string | undefined {
  if (!target) return undefined;
  if (!target.startsWith("/") || target.startsWith("//")) return undefined;
  return target;
}

function AuthPage() {
  const router = useRouter();
  const { role, redirect: redirectParam } = Route.useSearch();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const target = safeRedirect(redirectParam);

  async function routeAfterAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: isFaculty } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "faculty",
    });

    if (target) {
      router.history.push(target);
    } else {
      router.navigate({ to: isFaculty ? "/faculty" : "/student" });
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await routeAfterAuth();
    } finally {
      setBusy(false);
    }
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!studentName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: studentName.trim() },
          emailRedirectTo: `${window.location.origin}/auth?role=student`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        await routeAfterAuth();
        return;
      }

      setConfirmSent(true);
    } finally {
      setBusy(false);
    }
  }

  async function socialSignIn(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    if (result.redirected) return;

    await routeAfterAuth();
  }

  const accent = role === "faculty" ? "bg-violet-700 hover:bg-violet-600" : "bg-cyan-700 hover:bg-cyan-600";

  if (confirmSent) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-md rounded-2xl bg-slate-900 p-8 text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-slate-300">
            We sent a confirmation link to{" "}
            <span className="font-semibold">{email}</span>. Click it to activate
            your account, then sign in.
          </p>
          <Link
            to="/auth"
            search={{ role: "student" }}
            className="mt-6 inline-block rounded-lg bg-slate-800 px-5 py-3"
          >
            ← Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-5 text-5xl">🧭</div>

        <h1 className="text-3xl font-bold sm:text-4xl">
          {role === "student" ? "Student" : "Faculty"}{" "}
          {mode === "signup" ? "Sign Up" : "Login"}
        </h1>

        {role === "student" && (
          <div className="mx-auto mt-6 flex max-w-md rounded-lg bg-slate-900 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md p-2 ${
                mode === "signin" ? "bg-cyan-700 font-semibold" : ""
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md p-2 ${
                mode === "signup" ? "bg-cyan-700 font-semibold" : ""
              }`}
            >
              Create account
            </button>
          </div>
        )}

        {role === "faculty" && (
          <p className="mx-auto mt-4 max-w-md text-sm text-slate-400">
            Faculty accounts are created by your administrator. Ask your college
            admin if you need access.
          </p>
        )}

        {role === "student" && mode === "signup" ? (
          <form
            onSubmit={signUp}
            className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-900 p-6 text-left"
          >
            <label className="mb-4 block">
              <span className="mb-2 block text-sm">Student Name</span>
              <input
                className="w-full rounded-lg bg-slate-800 p-3"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>

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

            <label className="mb-5 block">
              <span className="mb-2 block text-sm">Password</span>
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

            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-lg p-3 font-semibold ${accent} disabled:opacity-60`}
            >
              {busy ? "Creating account…" : "Create account"}
            </button>

            <p className="mt-4 text-xs text-slate-400">
              We'll send a confirmation email to verify your address before you
              sign in.
            </p>
          </form>
        ) : (
          <form
            onSubmit={signIn}
            className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-900 p-6 text-left"
          >
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

            <label className="mb-5 block">
              <span className="mb-2 block text-sm">Password</span>
              <input
                className="w-full rounded-lg bg-slate-800 p-3"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-lg p-3 font-semibold ${accent} disabled:opacity-60`}
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>

            <Link
              to="/forgot-password"
              className="mt-3 block text-center text-sm text-slate-400 hover:text-slate-300"
            >
              Forgot password?
            </Link>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              or continue with
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => socialSignIn("google")}
                disabled={busy}
                className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm font-medium hover:bg-slate-700 disabled:opacity-60"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => socialSignIn("lovable")}
                disabled={busy}
                className="lovable-auth-button rounded-lg p-2 text-sm disabled:opacity-60"
              >
                Continue with Lovable
              </button>
            </div>
          </form>
        )}

        <Link
          to="/"
          className="mt-8 inline-block text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to welcome page
        </Link>
      </div>
    </main>
  );
}
