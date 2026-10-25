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

    const { error } = await supabase.from("student_progress").upsert(
      {
        user_id: userId,
        language: data.language,
        topic: data.topic,
        score: data.score,
        completed: data.completed,
      },
      { onConflict: "user_id,language,topic" }
    );

    if (error) throw new Error(error.message);
    return { ok: true };
  });
