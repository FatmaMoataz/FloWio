import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaCopy,
  FaCrown,
  FaEnvelope,
  FaLink,
  FaMinus,
  FaPaperPlane,
  FaPlus,
  FaRocket,
  FaShieldAlt,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa";
import logo from "../../assets/logo.svg";

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
    limit: 100,
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
  const [step, setStep] = useState(2);
  const [billing, setBilling] = useState("yearly");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [seats, setSeats] = useState(10);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [inviteRole, setInviteRole] = useState("Member");

  const inviteCode = useMemo(
    () => Math.random().toString(36).slice(2, 10),
    [],
  );
  const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
  const plan = plans.find((item) => item.id === selectedPlan) || plans[1];
  const billingMonths = billing === "yearly" ? 10 : 1;
  const subtotal = plan.monthly ? plan.monthly * billingMonths : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const selectPlan = (nextPlan) => {
    setSelectedPlan(nextPlan.id);
    setSeats((current) => Math.min(current, nextPlan.limit));
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

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invitation link copied.");
    } catch {
      toast.error("Could not copy the invitation link.");
    }
  };

  const sendInvites = () => {
    if (emails.length === 0) {
      toast.warning("Add at least one teammate email.");
      return;
    }

    toast.success(`${emails.length} invitation${emails.length > 1 ? "s" : ""} ready to send.`);
  };

  const enterWorkspace = () => {
    localStorage.setItem(
      "flowio-company-onboarding",
      JSON.stringify({
        completed: true,
        plan: selectedPlan,
        billing,
        seats,
        invitedEmails: emails,
        inviteRole,
      }),
    );
    navigate("/dashboard");
  };

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
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-[#64CFFF]">Save 20%</span>
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
                            ${billing === "yearly" ? Math.round(item.monthly * 0.8) : item.monthly}
                          </span>
                          <span className="ml-1 text-xs text-white/55">/mo</span>
                          <p className="mt-1 text-xs text-white/45">
                            billed {billing}
                          </p>
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
                    <p className="mt-1 text-xs text-white/50">Up to {plan.limit} team members</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-white/55">Seats</p>
                  <div className="flex h-10 w-full max-w-[180px] items-center justify-between rounded-xl border border-white/15">
                    <button type="button" onClick={() => setSeats((current) => Math.max(1, current - 1))} className="h-full px-4"><FaMinus /></button>
                    <span className="min-w-10 text-center font-bold">{seats}</span>
                    <button type="button" onClick={() => setSeats((current) => Math.min(plan.limit, current + 1))} className="h-full px-4"><FaPlus /></button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {plan.monthly ? (
                    <>
                      <p className="flex justify-between gap-4"><span className="text-white/55">Subtotal</span><b>${subtotal.toFixed(2)}</b></p>
                      <p className="flex justify-between gap-4"><span className="text-white/55">Tax (10%)</span><b>${tax.toFixed(2)}</b></p>
                      <p className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base"><span>Total due today</span><b className="text-[#64CFFF]">${total.toFixed(2)}</b></p>
                    </>
                  ) : (
                    <p className="text-white/65">Our sales team will create custom pricing for your organization.</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="mx-auto mt-5 flex h-12 w-full max-w-[360px] items-center justify-center gap-3 rounded-[14px] bg-[#245df5] font-bold text-white transition hover:bg-[#1d4ed8]"
              >
                Continue to Invite Team <FaArrowRight />
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/45">
                <FaShieldAlt /> Secure checkout. You can review before payment.
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
              Send invitation links so teammates can join your Flowio workspace.
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold">Invite link</span>
              <div className="flex rounded-xl border border-white/15 bg-[#080d29] p-1">
                <input value={inviteLink} readOnly className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white/55 outline-none" />
                <button type="button" onClick={copyInviteLink} className="flex shrink-0 items-center gap-2 rounded-lg bg-[#19265f] px-3 text-xs font-bold">
                  <FaCopy /> Copy
                </button>
              </div>
            </label>

            <div className="mt-5">
              <span className="mb-2 block text-sm font-semibold">Invite by email</span>
              <div className="rounded-xl border border-white/15 bg-[#080d29] p-3">
                {emails.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <span key={email} className="flex items-center gap-2 rounded-full bg-[#1a2451] px-3 py-1.5 text-xs">
                        {email}
                        <button type="button" onClick={() => setEmails((current) => current.filter((item) => item !== email))}>
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
              className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#245df5] font-bold text-white"
            >
              Send Invites <FaPaperPlane />
            </button>
            <button
              type="button"
              onClick={copyInviteLink}
              className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] border border-white/20 font-semibold"
            >
              Copy Invite Link <FaLink />
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
                Invited members receive a secure link. You can manage roles and permissions from workspace settings.
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
