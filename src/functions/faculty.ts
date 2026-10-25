import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FacultyStudent = {
  id: string;
  name: string;
  subjects: string[];
  scores: number[];
  completed: number;
  total: number;
};

export const getFacultyOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isFaculty, error: roleError } = await supabase.rpc(
      "has_role",
      { _user_id: userId, _role: "faculty" }
    );

    if (roleError) throw new Error(roleError.message);
    if (!isFaculty) throw new Error("Faculty access is required to view this data.");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, student_progress(language, topic, score, completed)")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<{
      id: string;
      full_name: string;
      student_progress: Array<{
        language: string;
        topic: string;
        score: number | null;
        completed: boolean;
      }>;
    }>;

    return rows.map<FacultyStudent>((profile) => {
      const progress = profile.student_progress ?? [];

      return {
        id: profile.id,
        name: profile.full_name,
        subjects: [...new Set(progress.map((row) => row.language))],
        scores: progress
          .map((row) => row.score)
          .filter((score): score is number => score !== null),
        completed: progress.filter((row) => row.completed).length,
        total: progress.length,
      };
    });
  });
