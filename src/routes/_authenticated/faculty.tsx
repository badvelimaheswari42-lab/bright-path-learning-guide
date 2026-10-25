import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { average, statusFor } from "@/lib/learning";
import { getFacultyOverview } from "@/server/faculty";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — Smart Learning Compass" },
      {
        name: "description",
        content: "Student performance analysis and academic support alerts.",
      },
      {
        property: "og:title",
        content: "Faculty Dashboard — Smart Learning Compass",
      },
      {
        property: "og:description",
        content: "Student performance analysis and academic support alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const overviewQuery = useQuery({
    queryKey: ["faculty-overview"],
    queryFn: getFacultyOverview,
  });

  const students = useMemo(() => overviewQuery.data ?? [], [overviewQuery.data]);

  const allSubjects = useMemo(
    () => [...new Set(students.flatMap((student) => student.subjects))],
    [students]
  );

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch = student.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesSubject =
          subjectFilter === "All" || student.subjects.includes(subjectFilter);

        return matchesSearch && matchesSubject;
      }),
    [students, search, subjectFilter]
  );

  const needingSupport = students.filter((student) => {
    const score = average(student.scores);
    return score !== null && score < 40;
  }).length;

  const assessedStudents = students.filter(
    (student) => average(student.scores) !== null
  );

  const classAverage = average(
    assessedStudents.map((student) => average(student.scores)!)
  );

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true, search: { role: "faculty" } });
  }

  if (overviewQuery.error) {
    return (
      <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-slate-900 p-8 text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="text-2xl font-bold">Faculty access required</h1>
          <p className="mt-3 text-slate-300">
            Your account doesn't have faculty access. Contact your college
            administrator if you believe this is a mistake.
          </p>
          <button
            onClick={signOut}
            className="mt-6 rounded-lg bg-slate-800 px-5 py-3"
          >
            Log Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="mt-2 text-slate-300">
              Student performance and academic support
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg bg-slate-800 px-4 py-2"
          >
            Log Out
          </button>
        </header>

        <section className="my-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Registered Students</p>
            <h2 className="mt-2 text-3xl font-bold">{students.length}</h2>
          </div>
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Need Support</p>
            <h2 className="mt-2 text-3xl font-bold">{needingSupport}</h2>
          </div>
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Class Average</p>
            <h2 className="mt-2 text-3xl font-bold">
              {classAverage === null ? "N/A" : `${classAverage}%`}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-bold">
            Student Performance
          </h2>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student name"
              className="rounded-lg bg-slate-800 p-3"
            />

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="rounded-lg bg-slate-800 p-3"
            >
              <option value="All">All Subjects</option>
              {allSubjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {overviewQuery.isLoading && (
            <p className="py-4 text-slate-400">Loading students…</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Subjects</th>
                  <th className="p-3">Average</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => {
                  const score = average(student.scores);
                  const status = statusFor(student.scores);

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-800"
                    >
                      <td className="p-3">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-slate-400">{student.subjects.join(", ") || "Not started"}</p>
                      </td>
                      <td className="p-3">{student.subjects.join(", ") || "—"}</td>
                      <td className="p-3">
                        {score === null ? "N/A" : `${score}%`}
                      </td>
                      <td className="p-3">
                        {student.completed}/{student.total} topics
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 ${
                            status === "Needs Support"
                              ? "bg-red-950 text-red-300"
                              : status === "Needs Improvement"
                                ? "bg-amber-950 text-amber-300"
                                : status === "On Track"
                                  ? "bg-green-950 text-green-300"
                                  : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && !overviewQuery.isLoading && (
            <p className="py-6 text-center text-slate-400">
              No matching students found.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-amber-800 bg-amber-950/30 p-5">
          <h2 className="text-xl font-bold">Academic Support Alerts</h2>
          <p className="mt-2 text-sm text-slate-300">
            These indicators use assessment averages. Review individual
            assessments and discuss learning difficulties with students before
            deciding on additional support.
          </p>

          <div className="mt-4 space-y-3">
            {students
              .filter((student) => {
                const score = average(student.scores);
                return score !== null && score < 40;
              })
              .map((student) => (
                <div
                  key={student.id}
                  className="rounded-lg bg-slate-900 p-4"
                >
                  <p className="font-semibold">
                    {student.name} — {student.subjects.join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-amber-300">
                    Needs additional academic support. Average:{" "}
                    {average(student.scores)}%
                  </p>
                </div>
              ))}

            {needingSupport === 0 && (
              <p className="text-sm text-slate-300">
                No students currently meet the support-alert threshold.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
