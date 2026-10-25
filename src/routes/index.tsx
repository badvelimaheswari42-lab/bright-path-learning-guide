import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";

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
  component: SmartLearningCompass,
});

type Student = {
  id: string;
  name: string;
  subject: string;
  scores: number[];
  completed: number;
  total: number;
};

const languages: Record<string, string[]> = {
  C: ["Variables", "Conditions", "Loops", "Functions", "Pointers"],
  "C++": ["Basics", "Functions", "OOP", "Pointers", "STL"],
  Java: ["Basics", "Conditions", "Loops", "Methods", "OOP"],
  Python: ["Variables", "Conditions", "Loops", "Functions", "Lists"],
  JavaScript: ["Variables", "Functions", "DOM", "Promises"],
  TypeScript: ["Types", "Interfaces", "Functions", "Generics"],
  "C#": ["Basics", "Methods", "OOP", "LINQ"],
  SQL: ["SELECT", "Filtering", "JOINs", "Subqueries"],
  HTML: ["Elements", "Links", "Images", "Forms"],
  CSS: ["Selectors", "Box Model", "Flexbox", "Grid"],
  PHP: ["Variables", "Conditions", "Functions", "Database"],
  Rust: ["Ownership", "Functions", "Structs", "Traits"],
  Go: ["Basics", "Functions", "Structs", "Goroutines"],
  Kotlin: ["Basics", "Functions", "Classes", "Coroutines"],
  Swift: ["Basics", "Functions", "Structures", "Protocols"],
  Ruby: ["Basics", "Methods", "Classes", "Modules"],
  R: ["Variables", "Vectors", "Data Frames", "Plots"],
  MATLAB: ["Matrices", "Functions", "Loops", "Plots"],
  Dart: ["Basics", "Functions", "Classes", "Async"],
  Assembly: ["Registers", "Instructions", "Memory", "Branches"],
};

const sampleStudents: Student[] = [
  {
    id: "ST001",
    name: "Student A",
    subject: "C",
    scores: [30, 35, 32],
    completed: 2,
    total: 5,
  },
  {
    id: "ST002",
    name: "Student B",
    subject: "Python",
    scores: [45, 52, 48],
    completed: 3,
    total: 5,
  },
  {
    id: "ST003",
    name: "Student C",
    subject: "Java",
    scores: [75, 82, 78],
    completed: 4,
    total: 5,
  },
];

function average(scores: number[]) {
  if (scores.length === 0) return null;

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}

function statusFor(scores: number[]) {
  const score = average(scores);

  if (score === null) return "Insufficient Data";
  if (score < 40) return "Needs Support";
  if (score < 60) return "Needs Improvement";
  return "On Track";
}

export default function SmartLearningCompass() {
  const [role, setRole] = useState<"welcome" | "student" | "faculty">(
    "welcome"
  );
  const [signedIn, setSignedIn] = useState(false);
  const [language, setLanguage] = useState("C");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [students] = useState<Student[]>(sampleStudents);

  const topics = languages[language];

  const studentAverage = average(
    topics
      .filter((topic) => scores[`${language}:${topic}`] !== undefined)
      .map((topic) => scores[`${language}:${topic}`])
  );

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.id.toLowerCase().includes(search.toLowerCase());

        const matchesSubject =
          subjectFilter === "All" || student.subject === subjectFilter;

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

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    if (role === "student" && !studentName.trim()) {
      alert("Please enter your name.");
      return;
    }

    // Demo sign-in only. Replace this with real, secure authentication.
    setSignedIn(true);
  }

  function selectRole(nextRole: "student" | "faculty") {
    setRole(nextRole);
    setSignedIn(false);
    setEmail("");
    setPassword("");
  }

  function resetToWelcome() {
    setRole("welcome");
    setSignedIn(false);
    setStudentName("");
    setEmail("");
    setPassword("");
  }

  if (role === "welcome" || !signedIn) {
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

          {role === "welcome" ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <button
                onClick={() => selectRole("student")}
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
              </button>

              <button
                onClick={() => selectRole("faculty")}
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
              </button>
            </div>
          ) : (
            <form
              onSubmit={login}
              className="mx-auto mt-10 max-w-md rounded-2xl bg-slate-900 p-6 text-left"
            >
              <h2 className="mb-5 text-2xl font-bold">
                {role === "student" ? "Student Login" : "Faculty Login"}
              </h2>

              {role === "student" && (
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
              )}

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

              <p className="mb-4 text-sm text-amber-300">
                Demo interface only. Real authentication must be configured
                before this login can provide secure access.
              </p>

              <button
                type="submit"
                className="w-full rounded-lg bg-cyan-700 p-3 font-semibold hover:bg-cyan-600"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setRole("welcome")}
                className="mt-4 w-full text-sm text-slate-400"
              >
                ← Back to welcome page
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  if (role === "student") {
    return (
      <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Student Dashboard</h1>
              <p className="mt-2 text-slate-300">
                Welcome, {studentName}!
              </p>
            </div>
            <button
              onClick={resetToWelcome}
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
                {
                  topics.filter((topic) =>
                    completed.includes(`${language}:${topic}`)
                  ).length
                }{" "}
                / {topics.length}
              </h2>
            </div>
            <div className="rounded-xl bg-slate-900 p-5">
              <p className="text-slate-400">Assessment Average</p>
              <h2 className="mt-2 text-2xl font-bold">
                {studentAverage === null
                  ? "Not assessed"
                  : `${studentAverage}%`}
              </h2>
            </div>
          </section>

          <section className="rounded-2xl bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Your Learning Roadmap</h2>
            <div className="space-y-3">
              {topics.map((topic, index) => {
                const key = `${language}:${topic}`;
                const score = scores[key];

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
                        {score === undefined
                          ? "Not assessed"
                          : `Score: ${score}%`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <select
                        aria-label={`${topic} demo assessment score`}
                        value={score ?? ""}
                        onChange={(event) => {
                          if (event.target.value !== "") {
                            setScores((previous) => ({
                              ...previous,
                              [key]: Number(event.target.value),
                            }));
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
                        onClick={() =>
                          setCompleted((previous) =>
                            previous.includes(key)
                              ? previous.filter((item) => item !== key)
                              : [...previous, key]
                          )
                        }
                        className="rounded-lg bg-cyan-700 px-3 py-2 text-sm"
                      >
                        {completed.includes(key) ? "Done ✓" : "Complete"}
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
            onClick={resetToWelcome}
            className="rounded-lg bg-slate-800 px-4 py-2"
          >
            Log Out
          </button>
        </header>

        <section className="my-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-slate-400">Demo Students</p>
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
            Subject-Wise Student Performance
          </h2>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student name or ID"
              className="rounded-lg bg-slate-800 p-3"
            />

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="rounded-lg bg-slate-800 p-3"
            >
              <option value="All">All Subjects</option>
              {Object.keys(languages).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Subject</th>
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
                        <p className="text-slate-400">{student.id}</p>
                      </td>
                      <td className="p-3">{student.subject}</td>
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

          {filteredStudents.length === 0 && (
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
                    {student.name} — {student.subject}
                  </p>
                  <p className="mt-1 text-sm text-amber-300">
                    Needs additional academic support. Average:{" "}
                    {average(student.scores)}%
                  </p>
                </div>
              ))}

            {needingSupport === 0 && (
              <p className="text-sm text-slate-300">
                No students currently meet the support-alert threshold in
                this dataset.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
