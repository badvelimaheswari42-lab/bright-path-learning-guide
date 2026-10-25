import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgressRow = {
  language: string;
  topic: string;
  score: number | null;
  completed: boolean;
};

export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [progress, profile] = await Promise.all([
      supabase
        .from("student_progress")
        .select("language, topic, score, completed"),
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);

    if (progress.error) throw new Error(progress.error.message);

    return {
      fullName: profile.data?.full_name ?? "",
      rows: (progress.data ?? []) as ProgressRow[],
    };
  });

export const saveTopicProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      language: string;
      topic: string;
      score: number | null;
      completed: boolean;
    }) => input
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Atomic upsert: keeps an existing score when only the completed flag
    // changes, with no read-modify-write race.
    const { error } = await supabase.rpc("upsert_topic_progress", {
      p_language: data.language,
      p_topic: data.topic,
      p_score: data.score,
      p_completed: data.completed,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });
