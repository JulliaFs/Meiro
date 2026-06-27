import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useLandingI18n } from "./i18n";

export function WaitlistForm() {
  const { t } = useLandingI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: insertError } = await supabase.from("waitlist_signups").insert({ email });
    setLoading(false);
    if (insertError) {
      if (insertError.code === "23505") {
        setDone(true);
        return;
      }
      setError(t.beta.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-success py-2.5">
        <Check size={16} />
        {t.beta.success}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          required
          placeholder={t.beta.placeholder}
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn btn-primary justify-center px-5 shrink-0">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t.beta.button}
        </button>
      </form>
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  );
}
