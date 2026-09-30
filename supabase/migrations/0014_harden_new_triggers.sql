-- huellar · hardening de seguridad (parte 2)
-- Mismo problema que 0003_harden_security.sql, pero para los triggers
-- agregados en 0011/0012/0013: quedaban invocables directo por RPC pública
-- (/rest/v1/rpc/<nombre>) aunque solo están pensados para dispararse como
-- trigger. El disparo por DML no depende de este grant, así que los
-- triggers siguen funcionando igual después de revocarlo.
revoke execute on function public.award_review_points() from public, anon, authenticated;
revoke execute on function public.notify_on_follow() from public, anon, authenticated;
revoke execute on function public.notify_on_like() from public, anon, authenticated;
revoke execute on function public.notify_on_comment() from public, anon, authenticated;
revoke execute on function public.apply_comment_delta() from public, anon, authenticated;
