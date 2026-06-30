-- Anonymize one user's bookings: strip PII, keep the row for business records.
create function anonymize_user_bookings(target uuid) returns void
  language sql security definer set search_path = public as $$
  update bookings set
    customer_name  = 'Deleted',
    customer_phone = '',
    customer_email = null,
    notes          = '',
    user_id        = null
  where user_id = target;
$$;

-- Retention purge: anonymize bookings older than N months (default 24).
-- Run manually (`select purge_old_bookings();`) or schedule later.
create function purge_old_bookings(older_than_months int default 24) returns int
  language sql security definer set search_path = public as $$
  with anon as (
    update bookings set
      customer_name='Deleted', customer_phone='', customer_email=null, notes='', user_id=null
    where starts_at < now() - (older_than_months || ' months')::interval
      and customer_name <> 'Deleted'
    returning 1
  ) select count(*)::int from anon;
$$;

-- Lock both to service-role only — no browser-reachable role may invoke them.
revoke execute on function anonymize_user_bookings(uuid) from public, anon, authenticated;
revoke execute on function purge_old_bookings(int)       from public, anon, authenticated;
