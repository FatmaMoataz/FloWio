import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaCrown,
  FaMinus,
  FaPaperPlane,
  FaPlus,
  FaRocket,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa";
import logo from "../../assets/logo.svg";
import companyService from "../../services/companyService";
import subscriptionService from "../../services/subscriptionService";
import invitationService from "../../services/invitationService";

// Plan ids now match the backend's subscriptionPlan enum exactly
// (free | starter | pro | enterprise) — no more translation layer needed.
const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 19,
    icon: <FaRocket />,
    description: "Perfect for small teams getting started.",
    limit: 5,
    features: [
      "Up to 5 team members",
      "3 active projects",
      "AI tools (basic)",
      "10GB storage",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 49,
    icon: <FaBolt />,
    description: "Built for growing teams and advanced workflows.",
    limit: 20,
    popular: true,
    features: [
      "Up to 20 team members",
      "Unlimited projects",
      "AI tools (advanced)",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    icon: <FaBuilding />,
    description: "For large organizations with custom requirements.",
    limit: null, // unlimited — no self-serve seat selector
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "AI tools (enterprise)",
      "Unlimited storage",
      "SLA and premium support",
      "Advanced security",
    ],
  },
];

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [step, setStep] = useState(2);
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [seats, setSeats] = useState(10);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [inviteRole, setInviteRole] = useState("Member"); // UI only for now — see note below

  const [company, setCompany] = useState(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  const plan = plans.find((item) => item.id === selectedPlan) || plans[1];
  const billingMonths = billing === "yearly" ? 10 : 1;
  // FIXED: price now actually reflects seat count, matching what Stripe will
  // charge (quantity = seats). The original version ignored seats entirely.
  const subtotal = plan.monthly ? plan.monthly * seats * billingMonths : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Load the real company on mount so plan/seats reflect server state
  // instead of starting from arbitrary defaults every time.
  useEffect(() => {
    (async () => {
      try {
        const data = await companyService.getMyCompany();
        setCompany(data);
        if (data?.subscriptionPlan && data.subscriptionPlan !== "free") {
          setSelectedPlan(data.subscriptionPlan);
          // Free plan always stores seats: 1 — that's meaningless for a
          // paid plan, so only trust the stored seat count when the
          // company is actually on a paid plan.
          if (data?.seats) setSeats(data.seats);
          if (data?.billingCycle) setBilling(data.billingCycle);
        }
      } catch (error) {
        toast.error(error.message || "Could not load your company.");
      } finally {
        setIsLoadingCompany(false);
      }
    })();
  }, []);

  // Handles the redirect back from Stripe Checkout:
  //   /onboarding?step=invite&session_id=cs_test_...   (success)
  //   /onboarding?step=plan&canceled=true               (canceled)
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    if (canceled) {
      toast.info("Checkout canceled — pick a plan again whenever you're ready.");
      setSearchParams({}, { replace: true });
      return;
    }

    if (!sessionId) return;

    (async () => {
      try {
        const updatedCompany = await subscriptionService.verifySession(sessionId);
        setCompany(updatedCompany);
        setSelectedPlan(updatedCompany.subscriptionPlan);
        setSeats(updatedCompany.seats);
        setBilling(updatedCompany.billingCycle || "monthly");
        setStep(3);
        toast.success("Subscription confirmed!");
      } catch (error) {
        toast.error(error.message || "Payment is processing — this can take a few seconds.");
      } finally {
        setSearchParams({}, { replace: true });
      }
    })();
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPlan = (nextPlan) => {
    setSelectedPlan(nextPlan.id);
    if (nextPlan.limit) {
      setSeats((current) => Math.min(current, nextPlan.limit));
    }
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();

    if (!email) return;
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.warning("Enter a valid email address.");
      return;
    }
    if (emails.includes(email)) {
      toast.info("That email is already in the invitation list.");
      return;
    }

    setEmails((current) => [...current, email]);
    setEmailInput("");
  };

  const removeEmail = (email) => {
    setEmails((current) => current.filter((item) => item !== email));
  };

  // Replaces the old "set step to 3" no-op with the real flow:
  // free → confirm instantly, paid → redirect to Stripe Checkout, enterprise → email sales.
  const goToCheckout = async (planId) => {
    if (!company) {
      toast.error("Your company isn't loaded yet — try again in a moment.");
      return;
    }

    if (planId === "enterprise") {
      window.location.href = "mailto:sales@flowio.app?subject=Enterprise%20plan";
      return;
    }

    setIsCheckingOut(true);
    try {
      const result = await subscriptionService.startCheckout({
        plan: planId,
        billingCycle: billing,
        seats: planId === "free" ? 1 : seats,
      });

      if (result.free) {
        setCompany(result.data);
        setStep(3);
        toast.success("You're all set on the Free plan.");
        return;
      }

      if (result.url) {
        window.location.href = result.url; // leaves the app for Stripe Checkout
      }
    } catch (error) {
      toast.error(error.message || "Could not start checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Replaces the old fake "invite link" + toast-only sendInvites with real
  // per-email POSTs to /api/invitations.
  const sendInvites = async () => {
    if (emails.length === 0) {
      toast.warning("Add at least one teammate email.");
      return;
    }
    if (!company?._id) {
      toast.error("Your company isn't loaded yet — try again in a moment.");
      return;
    }

    setIsSendingInvites(true);
    try {
      const { succeeded, failed } = await invitationService.sendBulkInvitations(
        emails,
        company._id
      );

      if (succeeded.length > 0) {
        toast.success(`${succeeded.length} invitation${succeeded.length > 1 ? "s" : ""} sent.`);
        const sentEmails = succeeded.map((invite) => invite.emailInvited);
        setEmails((current) => current.filter((email) => !sentEmails.includes(email)));
      }

      failed.forEach(({ email, reason }) => {
        toast.error(`${email}: ${reason || "Could not send invitation."}`);
      });
    } catch (error) {
      toast.error(error.message || "Could not send invitations.");
    } finally {
      setIsSendingInvites(false);
    }
  };

  const enterWorkspace = () => {
    navigate("/dashboard");
  };

  const continueLabel =
    selectedPlan === "enterprise"
      ? "Contact Sales"
      : selectedPlan === "free"
        ? "Continue with Free plan"
        : "Continue to Checkout";

  return (
    <div className="flowio-auth-page min-h-screen bg-[radial-gradient(circle_at_bottom,#071c75_0%,#020617_38%,#030616_100%)] p-3 text-white sm:p-6">
      <main className="flowio-onboarding mx-auto w-full max-w-[1420px] rounded-[20px] border border-blue-400/30 bg-[#060b24]/95 p-3 shadow-[0_0_60px_rgba(37,99,235,.28)] sm:rounded-[30px] sm:p-6 lg:p-8">
        <header className="mb-7">
          <div className="flex items-center justify-center gap-4">
            <img
              src={logo}
              alt="Flowio"
              className="h-16 w-16 rounded-[18px] object-cover sm:h-20 sm:w-20"
            />
            <h1 className="bg-linear-to-b from-[#4F8FE8] to-[#64CFFF] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
              Flowio
            </h1>
          </div>

          <div className="mx-auto mt-7 flex max-w-[600px] items-center justify-center text-[11px] sm:text-sm">
            {[
              [1, "Account"],
              [2, "Subscription"],
              [3, "Invite Team"],
            ].map(([number, label], index) => (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      number < step
                        ? "border-[#64CFFF] bg-[#64CFFF]/15 text-[#64CFFF]"
                        : number === step
                          ? "border-[#4f7dff] bg-[#18296e] text-white shadow-[0_0_18px_rgba(79,125,255,.45)]"
                          : "border-white/30 text-white/60"
                    }`}
                  >
                    {number < step ? <FaCheck /> : number}
                  </span>
                  <span className={number === step ? "hidden font-bold sm:inline" : "hidden text-white/50 sm:inline"}>
                    {label}
                  </span>
                </div>
                {index < 2 && <span className="mx-3 h-px flex-1 bg-white/20" />}
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
          <section className="rounded-[20px] border border-blue-300/10 bg-[#0a1033]/85 p-3 sm:rounded-[22px] sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Choose your <span className="text-[#64CFFF]">subscription</span> plan
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  Select the plan that fits your team. You can upgrade anytime.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                <span className={billing === "monthly" ? "text-white" : "text-white/50"}>Monthly</span>
                <button
                  type="button"
                  onClick={() => setBilling((current) => current === "monthly" ? "yearly" : "monthly")}
                  className="relative h-7 w-12 rounded-full bg-[#2346bd]"
                  aria-label="Toggle yearly billing"
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${billing === "yearly" ? "left-6" : "left-1"}`} />
                </button>
                <span className={billing === "yearly" ? "text-white" : "text-white/50"}>Yearly</span>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-[#64CFFF]">2 months free</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((item) => {
                const selected = selectedPlan === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPlan(item)}
                    className={`relative flex flex-col rounded-[18px] border p-4 text-left transition sm:rounded-[20px] sm:p-5 lg:min-h-[430px] ${
                      selected
                        ? "border-[#3f7cff] bg-[#111b50] shadow-[0_0_26px_rgba(63,124,255,.35)]"
                        : "border-white/10 bg-[#0d153d] hover:border-blue-300/35"
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#245df5] px-4 py-1 text-xs font-bold text-white">
                        Most Popular
                      </span>
                    )}
                    <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-blue-400/35 bg-blue-400/10 text-xl text-[#64CFFF]">
                      {item.icon}
                    </span>
                    <h3 className="mt-4 text-xl font-bold">{item.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/55 lg:min-h-[48px]">
                      {item.description}
                    </p>

                    <div className="my-4 sm:my-5">
                      {item.monthly ? (
                        <>
                          <span className="text-3xl font-extrabold sm:text-4xl">
                            ${billing === "yearly" ? (item.monthly * 10 / 12).toFixed(2) : item.monthly}
                          </span>
                          <span className="ml-1 text-xs text-white/55">/seat/mo</span>
                          {billing === "yearly" ? (
                            <p className="mt-1 text-xs text-white/45">
                              billed annually — ${item.monthly * 10}/seat/yr
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-white/45">billed monthly</p>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-extrabold">Custom</span>
                          <p className="mt-1 text-xs text-white/45">Contact sales</p>
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      {item.features.map((feature) => (
                        <p key={feature} className="flex items-center gap-2 text-xs text-white/70">
                          <FaCheckCircle className="shrink-0 text-[#4f8cff]" />
                          {feature}
                        </p>
                      ))}
                    </div>

                    <span className={`mt-5 flex h-11 items-center justify-center rounded-[14px] font-bold lg:mt-auto ${
                      selected ? "bg-[#245df5] text-white" : "bg-[#19265f] text-white/85"
                    }`}>
                      {selected ? "Selected" : item.monthly ? `Choose ${item.name}` : "Contact Sales"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-[#0d153d] p-4 sm:p-5">
              <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-blue-400/30 bg-blue-400/10 text-xl text-[#64CFFF]">
                    {plan.icon}
                  </span>
                  <div>
                    <p className="font-bold">{plan.name} Plan</p>
                    <p className="mt-1 text-xs text-white/50">
                      {plan.limit ? `Up to ${plan.limit} team members` : "Unlimited team members"}
                    </p>
                  </div>
                </div>

                {plan.monthly ? (
                  <div>
                    <p className="mb-2 text-xs text-white/55">Seats</p>
                    <div className="flex h-10 w-full max-w-[180px] items-center justify-between rounded-xl border border-white/15">
                      <button type="button" onClick={() => setSeats((current) => Math.max(1, current - 1))} className="h-full px-4"><FaMinus /></button>
                      <span className="min-w-10 text-center font-bold">{seats}</span>
                      <button type="button" onClick={() => setSeats((current) => Math.min(plan.limit, current + 1))} className="h-full px-4"><FaPlus /></button>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                <div className="space-y-2 text-sm">
                  {plan.monthly ? (
                    <>
                      <p className="flex justify-between gap-4"><span className="text-white/55">Subtotal ({seats} seats)</span><b>${subtotal.toFixed(2)}</b></p>
                      <p className="flex justify-between gap-4"><span className="text-white/55">Tax (10%)</span><b>${tax.toFixed(2)}</b></p>
                      <p className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base"><span>Total due today</span><b className="text-[#64CFFF]">${total.toFixed(2)}</b></p>
                      {billing === "yearly" && (
                        <p className="text-right text-[11px] text-white/40">
                          Billed once for the year — renews annually
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-white/65">Our sales team will create custom pricing for your organization.</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToCheckout(selectedPlan)}
                disabled={isCheckingOut || isLoadingCompany}
                className="mx-auto mt-5 flex h-12 w-full max-w-[360px] items-center justify-center gap-3 rounded-[14px] bg-[#245df5] font-bold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <FaSpinner className="animate-spin" /> Redirecting to checkout...
                  </>
                ) : (
                  <>
                    {continueLabel} <FaArrowRight />
                  </>
                )}
              </button>

              {selectedPlan !== "free" && (
                <button
                  type="button"
                  onClick={() => goToCheckout("free")}
                  disabled={isCheckingOut || isLoadingCompany}
                  className="mx-auto mt-3 block text-center text-xs font-semibold text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
                >
                  Skip for now — stay on the Free plan
                </button>
              )}

              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/45">
                <FaShieldAlt /> Payments are processed securely by Stripe.
              </p>
            </div>
          </section>

          <aside className={`rounded-[22px] border p-5 sm:p-6 ${
            step === 3
              ? "border-[#3f7cff]/50 bg-[#0e1744] shadow-[0_0_24px_rgba(63,124,255,.2)]"
              : "border-white/10 bg-[#0a1033]/85"
          }`}>
            <div className="flex items-center gap-3">
              <FaUserFriends className="text-2xl text-[#8db4ff]" />
              <h2 className="text-2xl font-bold">Invite Your Team</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Each teammate gets a secure, single-use invitation sent to their email.
            </p>

            <div className="mt-6">
              <span className="mb-2 block text-sm font-semibold">Invite by email</span>
              <div className="rounded-xl border border-white/15 bg-[#080d29] p-3">
                {emails.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <span key={email} className="flex items-center gap-2 rounded-full bg-[#1a2451] px-3 py-1.5 text-xs">
                        {email}
                        <button type="button" onClick={() => removeEmail(email)}>
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addEmail();
                      }
                    }}
                    placeholder="Add email addresses..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
                  />
                  <button type="button" onClick={addEmail} className="rounded-lg bg-blue-400/15 px-3 text-[#8db4ff]"><FaPlus /></button>
                </div>
              </div>
            </div>

            {/* NOTE: the invitation model/route don't currently store a role —
                this selector is UI-only until that's added on the backend. */}
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">Role for invited members</span>
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-[#080d29] px-4 text-sm text-white outline-none"
              >
                <option>Member</option>
                <option>Project Manager</option>
                <option>Team Lead</option>
              </select>
            </label>

            <button
              type="button"
              onClick={sendInvites}
              disabled={isSendingInvites}
              className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#245df5] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingInvites ? (
                <>
                  <FaSpinner className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Invites <FaPaperPlane />
                </>
              )}
            </button>

            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="text-center text-xs text-white/45">How it works</p>
              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {[
                  [<FaCrown />, "Create workspace"],
                  [<FaBolt />, "Select plan"],
                  [<FaPaperPlane />, "Send invites"],
                  [<FaUserFriends />, "Collaborate"],
                ].map(([icon, label], index) => (
                  <div key={label}>
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-400/10 text-[#8db4ff]">
                      {icon}
                    </span>
                    <span className="mx-auto mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#245df5] text-[10px] font-bold">{index + 1}</span>
                    <p className="mt-2 text-[10px] leading-4 text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[16px] border border-blue-400/20 bg-blue-400/5 p-4">
              <p className="flex gap-3 text-xs leading-5 text-white/60">
                <FaShieldAlt className="mt-1 shrink-0 text-[#64CFFF]" />
                Invited members receive a secure link by email. You can manage roles and permissions from workspace settings.
              </p>
            </div>

            <button
              type="button"
              onClick={enterWorkspace}
              className={`mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-[14px] font-bold transition ${
                step === 3
                  ? "bg-[#245df5] text-white hover:bg-[#1d4ed8]"
                  : "cursor-not-allowed bg-white/10 text-white/30"
              }`}
              disabled={step !== 3}
            >
              Enter Flowio Workspace <FaArrowRight />
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}