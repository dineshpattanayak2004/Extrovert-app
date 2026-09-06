import { useEffect, useRef, useState } from "react";
import "./App.css";

/* ------------------------------------------------------------------ */
/*  Static reference data (demo)                                       */
/* ------------------------------------------------------------------ */

const STATES = [
  { value: "maharashtra", label: "Maharashtra" },
  { value: "delhi", label: "Delhi NCR" },
  { value: "odisha", label: "Odisha" },
  { value: "madhya-pradesh", label: "Madhya Pradesh" },
];

const CITIES = {
  maharashtra: [
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "nagpur", label: "Nagpur" },
  ],
  delhi: [
    { value: "new-delhi", label: "New Delhi" },
    { value: "gurugram", label: "Gurugram" },
  ],
  odisha: [
    { value: "bhubaneswar", label: "Bhubaneswar" },
    { value: "cuttack", label: "Cuttack" },
    { value: "puri", label: "Puri" },
  ],
  "madhya-pradesh": [
    { value: "bhopal", label: "Bhopal" },
    { value: "indore", label: "Indore" },
  ],
};

const COLLEGES = {
  mumbai: ["St. Xavier's College", "Mithibai College", "NM College", "Jai Hind College"],
  pune: ["Fergusson College", "Symbiosis College", "Modern College"],
  nagpur: ["Hislop College", "G. H. Raisoni College"],
  "new-delhi": ["St. Stephen's College", "Hindu College", "Miranda House"],
  gurugram: ["BML Munjal University", "Apeejay Stya University"],
  bhubaneswar: ["Ravenshaw University", "BJB College", "KIIT University"],
  cuttack: ["Christ College", "Ravenshaw College"],
  puri: ["Shailabala Women's College"],
  bhopal: ["MANIT Bhopal", "Barkatullah University", "Sagar Institute"],
  indore: ["DAVV Indore", "Holkar Science College"],
};

const PRONOUNS = ["He/Him", "She/Her", "They/Them", "Other"];
const STEP_LABELS = ["Email", "OTP", "Profile", "Details"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[a-zA-Z][a-zA-Z .'"-]*$/;

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const validateField = (field, data) => {
  const value = data[field] || "";
  const raw = value.trim();
  switch (field) {
    case "email":
      if (!raw) return "Email address is required";
      if (/\s/.test(value)) return "Email cannot contain spaces";
      if (value.length > 100) return "Email must be under 100 characters";
      if (!EMAIL_RE.test(raw)) return "Enter a valid email address";
      return "";
    case "otp":
      if (!raw) return "Enter the 6-digit code";
      if (!/^\d{6}$/.test(raw)) return "The code must be exactly 6 digits";
      return "";
    case "name":
      if (!raw) return "Full name is required";
      if (raw.length < 2) return "Name must be at least 2 characters";
      if (raw.length > 50) return "Name must be under 50 characters";
      if (!NAME_RE.test(raw)) return "Use letters and spaces only";
      return "";
    case "age":
      if (value === "") return "Age is required";
      if (!/^\d{1,3}$/.test(value)) return "Enter a valid age";
      if (Number(value) < 18) return "You must be 18 or older to join.";
      if (Number(value) > 100) return "Enter a valid age";
      return "";
    case "pronouns":
      if (!data[field]) return "Please select your pronouns";
      return "";
    case "phone":
      if (!raw) return "Phone number is required";
      if (!/^\d{10}$/.test(raw)) return "Enter a valid 10-digit phone number";
      return "";
    case "state":
      if (!data[field]) return "Please select your state";
      return "";
    case "city":
      if (!data.state) return "";
      if (!data[field]) return "Please select your city";
      return "";
    case "college":
      if (!data.city) return "";
      if (!data[field]) return "Please select your college";
      return "";
    default:
      return "";
  }
};

const validateStep = (step, data) => {
  const fields =
    step === 1
      ? ["email"]
      : step === 2
        ? ["otp"]
        : step === 3
          ? ["name", "age", "pronouns"]
          : ["phone", "state", "city", "college"];
  const errors = {};
  fields.forEach((f) => {
    const msg = validateField(f, data);
    if (msg) errors[f] = msg;
  });
  return errors;
};


/* ------------------------------------------------------------------ */
/*  OTP input - segmented boxes with auto-advance / backspace / paste  */
/* ------------------------------------------------------------------ */

function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  // Writes digits starting at box `start` (handles a single key press, fast
  // typing and paste) and always moves the focus forward, so an existing
  // digit is never silently overwritten or lost.
  const writeFrom = (start, chars) => {
    const next = value.split("");
    while (next.length < start) next.push("");
    chars.forEach((c, k) => {
      next[start + k] = c;
    });
    onChange(next.slice(0, 6).join(""));
    const focusIdx = Math.min(start + chars.length, 5);
    const el = refs.current[focusIdx];
    if (el) {
      el.focus();
      el.select();
    }
  };

  return (
    <div className={`otp-boxes${disabled ? " is-disabled" : ""}`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`otp-box${d ? " filled" : ""}`}
          inputMode="numeric"
          autoComplete="off"
          value={d}
          disabled={disabled}
          autoFocus={i === 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) {
              // Box was cleared - empty just this box.
              const next = value.split("");
              next[i] = "";
              onChange(next.slice(0, 6).join(""));
              return;
            }
            writeFrom(i, typed.split("").slice(0, 6 - i));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              const next = value.split("");
              next[i - 1] = "";
              onChange(next.slice(0, 6).join(""));
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (text) {
              writeFrom(i, text.split(""));
            }
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function CheckIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5l3.2 3.2L13 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

function MailIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  );
}

function UserIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CalendarIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function XIcon({ size = 10 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function InfoIcon({ size = 11 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.5" x2="12" y2="7.51" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function Logo({ size = "md" }) {
  return (
    <span className={`logo ${size}`}>
      <span className="logo-mark">
        <SparkIcon />
      </span>
      Extroverts
    </span>
  );
}

function ProgressSteps({ step, onJump }) {
  return (
    <div className="progress">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "todo";
        const clickable = n < step;
        return (
          <div
            key={label}
            className={`progress-step ${state}${clickable ? " clickable" : ""}`}
            onClick={() => clickable && onJump(n)}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => clickable && e.key === "Enter" && onJump(n)}
            title={clickable ? `Back to ${label}` : `${label} step`}
          >
            <span className="progress-dot">
              {state === "done" ? <CheckIcon /> : n}
            </span>
            <span className="progress-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">
            {t.type === "error" ? (
              <XIcon />
            ) : t.type === "success" ? (
              <CheckIcon size={11} />
            ) : (
              <InfoIcon />
            )}
          </span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <XIcon size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}


const TERMS_SECTIONS = [
  {
    h: "1. Eligibility",
    p: "You must be at least 18 years old to create an account and use the platform.",
  },
  {
    h: "2. Your account",
    p: "Keep your login details secure. You are responsible for everything done through your account.",
  },
  {
    h: "3. Behaviour",
    p: "Treat members with respect. Harassment, hate speech, spam, or content that endangers others leads to suspension.",
  },
  {
    h: "4. Events & meetups",
    p: "Attend meetups at your own risk. Always meet in public places and follow local guidelines.",
  },
  {
    h: "5. Privacy",
    p: "We use the details you provide to personalise your experience. Data is encrypted in transit and never sold.",
  },
  {
    h: "6. Changes",
    p: "We may update these terms from time to time. Continued use after changes means you accept the new terms.",
  },
];

function Landing({ onStart }) {
  return (
    <section className="landing">
      <div className="landing-orb orb-a" />
      <div className="landing-orb orb-b" />
      <div className="landing-orb orb-c" />
      <div className="landing-orb orb-d" />
      <header className="landing-top">
        <Logo />
      </header>
      <div className="landing-center">
        <span className="landing-badge">Made for real-world people</span>
        <h1>
          Life happens
          <br />
          <em>offline</em>.
        </h1>
        <p>
          Extroverts gets you out of the group chat and into real rooms -
          discover events around you, show up, and let the vibe do the rest.
        </p>
        <button className="btn-primary btn-lg" onClick={onStart}>
          Get Started - it&apos;s free
        </button>
        <div className="landing-footnote"></div>
      </div>
      <ul className="landing-features">
        <li>
          <CheckIcon /> Curated local events
        </li>
        <li>
          <CheckIcon /> Show up solo, leave with friends
        </li>
        <li>
          <CheckIcon /> Zero endless scrolling
        </li>
      </ul>
    </section>
  );
}

function TermsScreen({ onAccept, onBack }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="page terms-page">
      <div className="card terms-card">
        <div className="terms-head">
          <Logo size="sm" />
          <h2>Terms &amp; Conditions</h2>
          <p className="subtitle">
            Please read before joining the Extroverts community.
          </p>
        </div>
        <div className="terms-scroll">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.h}>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
        <label className="agree-row">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I have read and agree to the Terms &amp; Conditions and Privacy
            Policy.
          </span>
        </label>
        <div className="buttons">
          <button className="btn-ghost" onClick={onBack}>
            Back
          </button>
          <button
            className="btn-primary"
            disabled={!agreed}
            onClick={() => agreed && onAccept()}
          >
            I Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ email, onFinish }) {
  return (
    <div className="page success-page">
      <div className="confetti" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <div className="card success-card">
        <div className="success-badge">
          <CheckIcon size={28} />
        </div>
        <h2>You&apos;re in!</h2>
        <p className="success-sub">
          Profile completed. Your invite for <strong>{email}</strong> is on its
          way.
        </p>
        <div className="success-chips">
          <span><CheckIcon /> Profile created</span>
          <span><CheckIcon /> Email verified</span>
          <span><CheckIcon /> Invite sent</span>
        </div>
        <button className="btn-primary btn-lg" onClick={onFinish}>
          Back to home
        </button>
      </div>
    </div>
  );
}

function LiveReview({ formData, onEdit }) {
  const rows = [
    { label: "Email", value: formData.email || "Not set", step: 1 },
    { label: "Name", value: formData.name || "Not set", step: 3 },
    { label: "Age", value: formData.age || "Not set", step: 3 },
    { label: "Pronouns", value: formData.pronouns || "Not set", step: 3 },
    { label: "Phone", value: formData.phone ? `+91 ${formData.phone}` : "Not set", step: 4 },
    { label: "College", value: formData.college || "Not set", step: 4 },
  ];
  return (
    <div className="review">
      <div className="review-head">
        <span>Quick review</span>
        <span className="review-hint">tap an item to edit</span>
      </div>
      <div className="review-grid">
        {rows.map((r) => (
          <button key={r.label} className="review-item" onClick={() => onEdit(r.step)}>
            <span className="review-key">{r.label}</span>
            <span className="review-val">{r.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    age: "",
    pronouns: "",
    phone: "",
    state: "",
    city: "",
    college: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [otpCode, setOtpCode] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  const toastId = useRef(0);

  const showToast = (msg, type = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };

  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const setField = (field, rawValue) => {
    const value =
      field === "phone" || field === "age"
        ? rawValue.replace(/\D/g, "")
        : rawValue;
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field] || errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
    }
  };

  const markTouched = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData) }));
  };

  const changeState = (rawValue) => {
    const next = { ...formData, state: rawValue, city: "", college: "" };
    setFormData(next);
    setErrors((prev) => ({
      ...prev,
      state: validateField("state", next),
      city: "",
      college: "",
    }));
  };

  const changeCity = (rawValue) => {
    const next = { ...formData, city: rawValue, college: "" };
    setFormData(next);
    setErrors((prev) => ({
      ...prev,
      city: validateField("city", next),
      college: "",
    }));
  };

  const jumpToStep = (n) => {
    setStep(n);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (loading || step <= 1) return;
    setStep(step - 1);
    setErrors({});
  };

  const startResendTimer = (secs = 30) => setResendIn(secs);

  const handleResend = () => {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpCode(generateOTP());
      setOtpAttempts(0);
      setErrors((e) => ({ ...e, otp: "" }));
      setFormData((f) => ({ ...f, otp: "" }));
      startResendTimer();
      showToast(`A new code was sent to ${formData.email.trim()}`, "success");
    }, 900);
  };


  const goNext = () => {
    const stepErrors = validateStep(step, formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      setTouched((t) => {
        const fields =
          step === 1
            ? ["email"]
            : step === 2
              ? ["otp"]
              : step === 3
                ? ["name", "age", "pronouns"]
                : ["phone", "state", "city", "college"];
        const nt = { ...t };
        fields.forEach((f) => {
          nt[f] = true;
        });
        return nt;
      });
      showToast(stepErrors[Object.keys(stepErrors)[0]], "error");
      return;
    }

    setLoading(true);

    // Simulated network submission - also prevents duplicate entries
    setTimeout(() => {
      setLoading(false);

      if (step === 1) {
        setOtpCode(generateOTP());
        setOtpAttempts(0);
        setFormData((f) => ({ ...f, otp: "" }));
        setTouched((t) => ({ ...t, otp: false }));
        startResendTimer();
        showToast(`Verification code sent to ${formData.email.trim()}`, "success");
        setStep(2);
        return;
      }

      if (step === 2) {
        if (formData.otp !== otpCode) {
          const attempts = otpAttempts + 1;
          setOtpAttempts(attempts);
          setFormData((f) => ({ ...f, otp: "" }));
          setErrors({
            otp:
              attempts >= 5
                ? "Too many wrong attempts. Resend a new code."
                : `Incorrect code. ${5 - attempts} attempt${attempts === 4 ? "" : "s"} left.`,
          });
          showToast("Verification failed - that code did not match.", "error");
          return;
        }
        showToast("Email verified successfully.", "success");
        setStep(3);
        return;
      }

      if (step === 4) {
        setScreen("success");
        showToast("Profile completed successfully!", "success");
        return;
      }

      setStep(step + 1);
    }, 1200);
  };

  const visibleCityOptions = formData.state ? CITIES[formData.state] || [] : [];
  const visibleCollegeOptions = formData.city ? COLLEGES[formData.city] || [] : [];


  return (
    <div className="app">
      <Toasts toasts={toasts} onDismiss={dismissToast} />

      {screen === "landing" && <Landing onStart={() => setScreen("terms")} />}

      {screen === "terms" && (
        <TermsScreen
          onBack={() => setScreen("landing")}
          onAccept={() => {
            setScreen("signup");
            setStep(1);
            setErrors({});
          }}
        />
      )}

      {screen === "signup" && (
        <div className="wizard">
          <aside className="wizard-brand">
            <Logo />
            <div className="wizard-brand-body">
              <h2>Almost there...</h2>
              <p>
                Verify your email and build your profile in four quick steps.
              </p>
            </div>
            <ul className="wizard-brand-points">
              <li><CheckIcon /> Email verification</li>
              <li><CheckIcon /> Basic profile</li>
              <li><CheckIcon /> Your local community</li>
            </ul>
            <div className="wizard-brand-blob" />
          </aside>

          <main className="wizard-main">
            <div className="mobile-brand">
              <Logo size="sm" />
            </div>

            <div className="card wizard-card">
              <ProgressSteps step={step} onJump={jumpToStep} />

              {step === 1 && (
                <section className="step">
                  <h2>What&apos;s your email?</h2>
                  <p className="subtitle">
                    We&apos;ll send you a 6-digit code to verify it&apos;s really you.
                  </p>

                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <div className="input-wrap">
                      <span className="input-icon"><MailIcon /></span>
                      <input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        maxLength={100}
                        autoFocus
                        disabled={loading}
                        className={errors.email ? "has-error" : ""}
                        value={formData.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                      />
                    </div>
                    <div className="field-meta">
                      {errors.email ? (
                        <span className="error">{errors.email}</span>
                      ) : (
                        <span className="char-hint">{formData.email.length}/100</span>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="step">
                  <h2>Check your inbox</h2>
                  <p className="subtitle">
                    We sent a 6-digit code to{" "}
                    <strong className="email-show">{formData.email.trim()}</strong>.
                  </p>

                  <div className="demo-banner">
                    <span className="demo-banner-label">Demo</span>
                    <span>
                      Your verification code is <code>{otpCode}</code>
                    </span>
                  </div>

                  <div className="field">
                    <span className="field-label">Verification code</span>
                    <OtpInput
                      value={formData.otp}
                      onChange={(v) => setField("otp", v)}
                      disabled={loading}
                    />
                    <div className="field-meta">
                      {errors.otp ? (
                        <span className="error">{errors.otp}</span>
                      ) : otpAttempts > 0 ? (
                        <span className="warning">{5 - otpAttempts} attempts left</span>
                      ) : (
                        <span className="char-hint">Enter all 6 digits</span>
                      )}
                    </div>
                  </div>

                  <div className="otp-actions">
                    <button
                      className="link-btn"
                      onClick={handleResend}
                      disabled={resendIn > 0 || loading}
                    >
                      {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                    </button>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setStep(1);
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      Change email
                    </button>
                  </div>
                </section>
              )}


              {step === 3 && (
                <section className="step">
                  <h2>Tell us about you</h2>
                  <p className="subtitle">
                    This helps people find you at local events.
                  </p>

                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <div className="input-wrap">
                      <span className="input-icon"><UserIcon /></span>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Aarav Sharma"
                        maxLength={50}
                        autoFocus
                        disabled={loading}
                        className={errors.name ? "has-error" : ""}
                        value={formData.name}
                        onChange={(e) => setField("name", e.target.value)}
                        onBlur={() => markTouched("name")}
                      />
                    </div>
                    <div className="field-meta">
                      {errors.name ? (
                        <span className="error">{errors.name}</span>
                      ) : (
                        <span className="char-hint">{formData.name.length}/50</span>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="age">Age</label>
                    <div className="input-wrap">
                      <span className="input-icon"><CalendarIcon /></span>
                      <input
                        id="age"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 22"
                        maxLength={3}
                        disabled={loading}
                        className={errors.age ? "has-error" : ""}
                        value={formData.age}
                        onChange={(e) => setField("age", e.target.value)}
                        onBlur={() => markTouched("age")}
                      />
                    </div>
                    <div className="field-meta">
                      {errors.age ? (
                        <span className="error">{errors.age}</span>
                      ) : (
                        <span className="char-hint">Must be 18 or older</span>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">Pronouns</span>
                    <div className="chips">
                      {PRONOUNS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`chip${formData.pronouns === p ? " selected" : ""}`}
                          onClick={() => setField("pronouns", p)}
                          disabled={loading}
                        >
                          {formData.pronouns === p ? <CheckIcon /> : null}
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="field-meta">
                      {errors.pronouns ? (
                        <span className="error">{errors.pronouns}</span>
                      ) : (
                        <span className="char-hint">How should people refer to you?</span>
                      )}
                    </div>
                  </div>
                </section>
              )}


              {step === 4 && (
                <section className="step">
                  <h2>Your local community</h2>
                  <p className="subtitle">
                    Phone &amp; college help us connect you with people nearby.
                  </p>

                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <div className="input-wrap prefix-wrap">
                      <span className="phone-prefix">+91</span>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        disabled={loading}
                        className={errors.phone ? "has-error" : ""}
                        value={formData.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        onBlur={() => markTouched("phone")}
                      />
                    </div>
                    <div className="field-meta">
                      {errors.phone ? (
                        <span className="error">{errors.phone}</span>
                      ) : (
                        <span className="char-hint">{formData.phone.length}/10</span>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="state">State</label>
                    <select
                      id="state"
                      value={formData.state}
                      disabled={loading}
                      className={errors.state ? "has-error" : ""}
                      onChange={(e) => changeState(e.target.value)}
                      onBlur={() => markTouched("state")}
                    >
                      <option value="">Select your state</option>
                      {STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <div className="field-meta">
                      {errors.state ? <span className="error">{errors.state}</span> : null}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="city">City</label>
                    <select
                      id="city"
                      value={formData.city}
                      disabled={!formData.state || loading}
                      className={errors.city ? "has-error" : ""}
                      onChange={(e) => changeCity(e.target.value)}
                      onBlur={() => markTouched("city")}
                    >
                      <option value="">
                        {formData.state ? "Select your city" : "Pick a state first"}
                      </option>
                      {visibleCityOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="field-meta">
                      {formData.state && !formData.city ? (
                        <span className="char-hint">Cities update based on your state</span>
                      ) : errors.city ? (
                        <span className="error">{errors.city}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="college">College</label>
                    <select
                      id="college"
                      value={formData.college}
                      disabled={!formData.city || loading}
                      className={errors.college ? "has-error" : ""}
                      onChange={(e) => setField("college", e.target.value)}
                      onBlur={() => markTouched("college")}
                    >
                      <option value="">
                        {formData.city ? "Select your college" : "Pick a city first"}
                      </option>
                      {visibleCollegeOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="field-meta">
                      {formData.city && !formData.college ? (
                        <span className="char-hint">Colleges update based on your city</span>
                      ) : errors.college ? (
                        <span className="error">{errors.college}</span>
                      ) : null}
                    </div>
                  </div>

                  <LiveReview formData={formData} onEdit={jumpToStep} />
                </section>
              )}


              <div className="buttons">
                {step > 1 && (
                  <button className="btn-ghost" onClick={goBack} disabled={loading}>
                    <ArrowLeftIcon /> Back
                  </button>
                )}
                <button className="btn-primary" onClick={goNext} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      {step === 1 ? "Sending..." : "Saving..."}
                    </>
                  ) : step === 4 ? (
                    "Complete Profile"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {screen === "success" && (
        <SuccessScreen
          email={formData.email.trim()}
          onFinish={() => {
            setScreen("landing");
            setStep(1);
            setFormData({
              email: "",
              otp: "",
              name: "",
              age: "",
              pronouns: "",
              phone: "",
              state: "",
              city: "",
              college: "",
            });
            setErrors({});
            setTouched({});
            setOtpAttempts(0);
            setOtpCode("");
          }}
        />
      )}
    </div>
  );
}

