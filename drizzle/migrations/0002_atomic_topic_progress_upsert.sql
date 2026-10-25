create or replace function public.upsert_topic_progress(
  p_language text,
  p_topic text,
  p_score integer,
  p_completed boolean
)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.student_progress (user_id, language, topic, score, completed)
  values (auth.uid(), p_language, p_topic, p_score, p_completed)
  on conflict (user_id, language, topic)
  do update set
    score = coalesce(excluded.score, public.student_progress.score),
    completed = excluded.completed,
    updated_at = now();
$$;

grant execute on function public.upsert_topic_progress(text, text, integer, boolean) to authenticated;