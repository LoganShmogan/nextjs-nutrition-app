"use client";

// Author: Logan & Marty

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          Nutritional Software
        </div>

        <h1 className={styles.heading}>
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>

        <p className={styles.subheading}>
          {mode === "login"
            ? "Sign in to access your nutrition data."
            : "Sign up to start tracking your nutrition."}
        </p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => { setMode("login"); setError(null); }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
            onClick={() => { setMode("signup"); setError(null); }}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className={styles.switchLink}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
