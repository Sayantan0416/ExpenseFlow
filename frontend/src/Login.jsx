
import { useState } from "react";
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const storedAccount = JSON.parse(
        localStorage.getItem("expenseflow_account")
      );

      // ======================================================
      // SIGN UP
      // ======================================================

      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        if (storedAccount) {
          setError(
            "An account already exists. Please sign in instead."
          );
          return;
        }

        const account = {
          email: cleanEmail,
          password: password,
        };

        localStorage.setItem(
          "expenseflow_account",
          JSON.stringify(account)
        );

        localStorage.setItem(
          "expenseflow_logged_in",
          "true"
        );

        localStorage.setItem(
          "expenseflow_user_email",
          cleanEmail
        );

        onLogin({
          email: cleanEmail,
        });

        return;
      }

      // ======================================================
      // LOGIN
      // ======================================================

      if (!storedAccount) {
        setError(
          "No account found. Please create an account first."
        );
        return;
      }

      if (
        storedAccount.email !== cleanEmail ||
        storedAccount.password !== password
      ) {
        setError("Incorrect email or password.");
        return;
      }

      localStorage.setItem(
        "expenseflow_logged_in",
        "true"
      );

      localStorage.setItem(
        "expenseflow_user_email",
        cleanEmail
      );

      onLogin({
        email: cleanEmail,
      });
    } catch (loginError) {
      console.error("Authentication error:", loginError);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "signup" : "login"
    );

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-one" />
      <div className="auth-background-shape auth-shape-two" />

      <div className="auth-container">

        {/* ==================================================
            LEFT BRANDING PANEL
        ================================================== */}

        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="auth-logo">
              <Wallet size={25} strokeWidth={2.2} />
            </div>

            <span>
              ExpenseFlow
            </span>

          </div>

          <div className="auth-brand-content">

            <span className="auth-eyebrow">
              PERSONAL FINANCE
            </span>

            <h1>
              Take control of
              <br />
              your money.
            </h1>

            <p>
              A smarter and cleaner way to track your
              income, expenses, and financial progress.
            </p>

          </div>

          <div className="auth-security">

            <div className="auth-security-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>
                Your account, your control
              </strong>

              <span>
                Securely manage your personal finances.
              </span>
            </div>

          </div>

        </div>


        {/* ==================================================
            AUTH CARD
        ================================================== */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-mobile-logo">
              <Wallet size={22} />
            </div>

            <span className="auth-card-eyebrow">
              {mode === "login"
                ? "WELCOME BACK"
                : "GET STARTED"}
            </span>

            <h2>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {mode === "login"
                ? "Sign in to continue to your dashboard."
                : "Create your ExpenseFlow account to get started."}
            </p>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="auth-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label htmlFor="auth-password">
                  Password
                </label>

              </div>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  id="auth-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            {mode === "signup" && (
              <div className="auth-field">

                <label htmlFor="auth-confirm-password">
                  Confirm password
                </label>

                <div className="auth-input-wrapper">

                  <Lock size={18} />

                  <input
                    id="auth-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              <span>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </span>

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>


          {/* ==================================================
              SWITCH LOGIN / SIGNUP
          ================================================== */}

          <div className="auth-switch">

            <span>
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
            >
              {mode === "login"
                ? "Create account"
                : "Sign in"}
            </button>

          </div>

          <div className="auth-footer">
            ExpenseFlow • Personal Finance Dashboard
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;

