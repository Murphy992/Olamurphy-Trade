uid() is null then raise exception ‘You must be signed in.’; end if;
  if p_side <> ‘BUY’ then raise exception ‘This demo starter currently supports BUY simulations only.’; end if;
  if p_asset not in (‘BTC’,’ETH’,’USDT’,’BNB’,’SOL’) then raise exception ‘Unsupported demo asset.’; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then raise exception ‘Invalid demo amount.’; end if;

  select balance into current_balance from public.demo_wallets
  where user_id = auth.uid() for update;

  if current_balance is null then raise exception ‘Demo wallet not found.’; end if;
  if current_balance < p_amount then raise exception ‘Insufficient virtual balance.’; end if;

  update public.demo_wallets
  set balance = balance - p_amount, updated_at = now()
  where user_id = auth.uid();

  insert into public.demo_activity(user_id,activity_type,asset,amount,note)
  values (auth.uid(),’DEMO_BUY’,p_asset,p_amount,’Simulated purchase; no real asset acquired.’);
end;
$$;
revoke all on function public.place_demo_trade(text,numeric,text) from public;
grant execute on function public.place_demo_trade(text,numeric,text) to authenticated;

— IMPORTANT: After creating your own account, promote only your verified account
— manually in the Supabase SQL Editor. Replace with your auth user UUID:
— update public.profiles set role = ‘admin’ where id = ‘YOUR-USER-UUID’;
