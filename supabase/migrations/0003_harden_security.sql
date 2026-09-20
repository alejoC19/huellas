-- huellar · hardening de seguridad
-- Los triggers (handle_new_user, apply_points_event, apply_like_delta,
-- award_checkin_points, award_qr_points) son SECURITY DEFINER y quedaban
-- invocables directo por RPC pública (/rest/v1/rpc/<nombre>) aunque solo
-- están pensados para dispararse como trigger. Se les revoca EXECUTE;
-- el disparo por DML no depende de ese grant, así que los triggers
-- siguen funcionando igual.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_points_event() from public, anon, authenticated;
revoke execute on function public.apply_like_delta() from public, anon, authenticated;
revoke execute on function public.award_checkin_points() from public, anon, authenticated;
revoke execute on function public.award_qr_points() from public, anon, authenticated;

-- redeem_benefit() sí debe ser invocable, pero solo por usuarios logueados.
revoke execute on function public.redeem_benefit(uuid) from public, anon;
grant execute on function public.redeem_benefit(uuid) to authenticated;
