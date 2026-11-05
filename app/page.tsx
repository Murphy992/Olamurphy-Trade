
"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase";

type Profile = { id: string; email: string | null; display_name: string | null; role: "customer" | "admin"; created_at: string };
type Wallet = { balance: number };
type Activity = { id: number; activity_type: string; asset: string | null; amount: number; created_at: string; note: string | null };

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState(10000);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("100");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(true);
  const supabase = supabaseBrowser();

  async function loadAccount(currentUser: User) {
    const { data: p } = await supabase.from("profiles").select("id,email,display_name,role,created_at").eq("id", currentUser.id).single();
    if (p) setProfile(p as Profile);
    const { data: w } = await supabase.from("demo_wallets").select("balance").eq("user_id", currentUser.id).single();
    if (w) setBalance(Number((w as Wallet).balance));
    const { data: a } = await supabase.from("demo_activity").select("id,activity_type,asset,amount,created_at,note").eq("user_id", currentUser.id).order("created_at", { ascending: false }).limit(20);
    setActivity((a || []) as Activity[]);
    if (p?.role === "admin") {
      const { data: allUsers, error } = await supabase.from("profiles").select("id,email,display_name,role,created_at").order("created_at", { ascending: false });
      if (!error) setUsers((allUsers || []) as Profile[]);
    }
  }

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadAccount(data.session.user);
    }).catch(() => setConfigured(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadAccount(session.user);
      else { setProfile(null); setActivity([]); setUsers([]); setBalance(10000); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
        if (error) throw error;
        setMessage("Registration submitted. Check your email if email confirmation is enabled, then sign in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Signed in successfully.");
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "Authentication failed."); }
    finally { setBusy(false); }
  }

  async function practiceTrade(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) { setMessage("Enter a valid amount."); setBusy(false); return; }
    const { error } = await supabase.rpc("place_demo_trade", { p_asset: asset, p_amount: n, p_side: "BUY" });
    if (error) setMessage(error.message);
    else { setMessage("Demo buy order recorded. No real crypto was purchased."); if (user) await loadAccount(user); }
    setBusy(false);
  }
