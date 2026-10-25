import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Learning Compass" },
      {
        name: "description",
        content:
          "Personalised learning roadmaps, student performance analysis, and smarter academic support.",
      },
      { property: "og:title", content: "Smart Learning Compass" },
      {
        property: "og:description",
        content:
          "Personalised learning roadmaps, student performance analysis, and smarter academic support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function continueToDashboard() {
    if (!userId) return;

    const { data: isFaculty } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "faculty",
    });

    navigate({ to: isFaculty ? "/faculty" : "/student" });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-5 text-5xl">🧭</div>

        <h1 className="text-4xl font-bold sm:text-5xl">
          Smart Learning Compass
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Personalised learning, student performance analysis, and smarter
          academic support.
        </p>

        {userId && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-cyan-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">
              You are already signed in.
            </p>
            <button
              onClick={continueToDashboard}
              className="mt-3 w-full rounded-lg bg-cyan-700 p-3 font-semibold hover:bg-cyan-600"
            >
              Go to my dashboard →
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            to="/auth"
            search={{ role: "student" }}
            className="rounded-2xl border border-cyan-700 bg-slate-900 p-8 text-left transition hover:bg-slate-800"
          >
            <div className="text-4xl">🎓</div>
            <h2 className="mt-4 text-2xl font-bold">Student Panel</h2>
            <p className="mt-2 text-slate-300">
              Learn programming, take assessments, and track your progress.
            </p>
            <span className="mt-5 inline-block rounded-lg bg-cyan-700 px-5 py-3">
              Student Login →
            </span>
          </Link>

          <Link
            to="/auth"
            search={{ role: "faculty" }}
            className="rounded-2xl border border-violet-700 bg-slate-900 p-8 text-left transition hover:bg-slate-800"
          >
            <div className="text-4xl">👨‍🏫</div>
            <h2 className="mt-4 text-2xl font-bold">Faculty Panel</h2>
            <p className="mt-2 text-slate-300">
              Monitor authorised students and identify learning difficulties.
            </p>
            <span className="mt-5 inline-block rounded-lg bg-violet-700 px-5 py-3">
              Faculty Login →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
