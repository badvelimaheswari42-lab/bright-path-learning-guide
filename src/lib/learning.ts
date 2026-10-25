export const languages: Record<string, string[]> = {
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

export function average(scores: number[]) {
  if (scores.length === 0) return null;

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}

export function statusFor(scores: number[]) {
  const score = average(scores);

  if (score === null) return "Insufficient Data";
  if (score < 40) return "Needs Support";
  if (score < 60) return "Needs Improvement";
  return "On Track";
}
