import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { login, fetchCsrfToken } from "../lib/auth";
import { Input } from "../components/primitives/Input";
import { Button } from "../components/primitives/Button";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        await login(email, password);
        // Prime CSRF token before any authenticated API calls are made
        await fetchCsrfToken();
        // Clear all cached queries so bootstrap re-fetches with the new session
        queryClient.clear();
        // Honour redirect-after-login if present in the URL (?next=/queue/…)
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        navigate(next && next.startsWith("/") ? next : "/", { replace: true });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate, queryClient],
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-app">
      <div
        className={cn(
          "w-full max-w-[400px]",
          "rounded-[var(--radius-xl)]",
          "border border-border-default",
          "bg-bg-surface",
          "p-8",
          "shadow-md",
        )}
      >
        {/* Logo / Title */}
        <div className="text-center">
          <h1
            className={cn(
              "text-[length:var(--text-heading-lg-size)]",
              "font-semibold",
              "text-fg-default",
            )}
          >
            ControlDesk
          </h1>
          <p
            className={cn(
              "mt-[var(--space-1)]",
              "text-[length:var(--text-body-size)]",
              "text-fg-muted",
            )}
          >
            Sign in to your operator account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Username or Email"
            type="text"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className={cn(
                "rounded-[var(--radius-md)]",
                "border border-status-danger/30",
                "bg-status-danger-subtle",
                "px-3 py-2",
                "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                "text-status-danger",
              )}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !email || !password}
            className="mt-2 w-full justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
