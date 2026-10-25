import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { languages, average } from "@/lib/learning";
import { getMyProgress, saveTopicProgress } from "@/server/student";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Smart Learning Compass" },
      {
        name: "description",
        content:
          "Your personalised learning roadmap, assessments, and progress tracking.",
      },
      {
        property: "og:title",
        content: "Student Dashboard — Smart Learning Compass",
      },
      {
        property: "og:description",
        content:
          "Your personalised learning roadmap, assessments, and progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [language, setLanguage] = useState("C");

  const progressQuery = useQuery({
    queryKey: ["my-progress"],
    queryFn: getMyProgress,
  });

  const rows = progressQuery.data?.rows ?? [];
  const fullName = progressQuery.data?.fullName || "student";

  const progressByKey = useMemo(() => {
    const map: Record<string, { score: number | null; completed: boolean }> = {};
    for (const row of rows) {
      map[`${row.language}:${row.topic}`] = {
        score: row.score,
        completed: row.completed,
      };
    }
    return map;
  }, [rows]);

  const topics = languages[language] ?? [];

  const studentAverage = average(
    topics
      .map((topic) => progressByKey[`${language}:${topic}`]?.score)
      .filter((score): score is number => typeof score === "number")
  );

  const completedCount = topics.filter(
    (topic) => progressByKey[`${language}:${topic}`]?.completed
  ).length;

  const save = useMutation({
    mutationFn: (input: {
      language: string;
      topic: string;
      score: number | null;
      completed: boolean;
    }) => saveTopicProgress({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-progress"] }),
    onError: (error) => toast.error((error as Error).message),
  });

  function setScore(topic: string, score: number) {
    const completed = progressByKey[`${language}:${topic}`]?.completed ?? false;
    save.mutate({ language, topic, score, completed });
  }

  function toggleCompleted(topic: string) {
    const entry = progressByKey[`${language}:${topic}`];
    save.mutate({
      language,
      topic,
      score: entry?.score ?? null,
      completed: !(entry?.completed ?? false),
    });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true, search: { role: "student" } });
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="mt-2 text-slate-300">Welcome, {fullName}!</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg bg-slate-800 px-4 py-2"
          >
            Log Out
          </button>
        </header>

        <section className="mt-7 rounded-2xl bg-slate-900 p-5">
          <label className="block font-semibold">
            Choose a programming language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-3 block w-full rounded-lg bg-slate-800 p-3"
            >
              {Object.keys(languages).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="my-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Language</p>
            <h2 className="mt-2 text-2xl font-bold">{language}</h2>
          </div>
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Completed Topics</p>
            <h2 className="mt-2 text-2xl font-bold">
              {completedCount} / {topics.length}
            </h2>
          </div>
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Assessment Average</p>
            <h2 className="mt-2 text-2xl font-bold">
              {studentAverage === null ? "Not assessed" : `${studentAverage}%`}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-bold">Your Learning Roadmap</h2>

          {progressQuery.isLoading && (
            <p className="py-4 text-slate-400">Loading your progress…</p>
          )}

          <div className="space-y-3">
            {topics.map((topic, index) => {
              const key = `${language}:${topic}`;
              const score = progressByKey[key]?.score;

              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {index + 1}. {topic}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {score === undefined || score === null
                        ? "Not assessed"
                        : `Score: ${score}%`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <select
                      aria-label={`${topic} assessment score`}
                      value={score ?? ""}
                      onChange={(event) => {
                        if (event.target.value !== "") {
                          setScore(topic, Number(event.target.value));
                        }
                      }}
                      className="w-24 rounded-lg bg-slate-700 p-2"
                    >
                      <option value="">Score</option>
                      {[20, 40, 60, 80, 100].map((value) => (
                        <option key={value} value={value}>
                          {value}%
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleCompleted(topic)}
                      className="rounded-lg bg-cyan-700 px-3 py-2 text-sm"
                    >
                      {progressByKey[key]?.completed ? "Done ✓" : "Complete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl bg-cyan-950 p-4">
            <h3 className="font-bold">Personalised Learning Analysis</h3>
            <p className="mt-2 text-sm text-slate-200">
              {studentAverage === null
                ? "Complete an assessment to receive recommendations."
                : studentAverage < 40
                  ? "Focus on revising the basics and practise more questions."
                  : studentAverage < 60
                    ? "Review topics with low scores and complete extra exercises."
                    : "Good progress! Continue practising and try a project."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
