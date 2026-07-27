import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./AdminLogin.css";

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase returns the same generic message for "wrong password"
      // and "no such user" by design, to avoid leaking which emails
      // have accounts — surface it as-is rather than writing a more
      // specific message we can't actually verify.
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onSuccess?.();
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1 className="admin-login__heading">Admin Sign In</h1>
        <p className="admin-login__desc">
          Access is restricted to Progrid Energy staff accounts.
        </p>

        <div className="admin-login__field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="admin-login__field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {errorMessage && (
          <motion.p
            className="admin-login__error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.p>
        )}

        <motion.button
          type="submit"
          className="btn btn-primary admin-login__submit"
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="admin-login__spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>
    </div>
  );
}