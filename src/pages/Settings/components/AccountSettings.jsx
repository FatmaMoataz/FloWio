import { useState, useEffect } from "react";
import {
  FaUser, FaEnvelope, FaPhoneAlt, FaBriefcase, FaCamera,
  FaTrash, FaSave, FaCheck, FaTimes, FaLinkedinIn,
  FaGithub, FaFacebookF, FaUndo, FaSpinner,
} from "react-icons/fa";
import userService from "../../../services/userService";
import { saveFlowioUser } from "../../../components/User/userProfile";

// const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=12";

// ── Cloudinary config (put these in your .env) ────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // unsigned preset

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "flowio/avatars");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url; // e.g. https://res.cloudinary.com/...
}

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatar, setAvatar] = useState(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState(null); // staged until Save

  const [account, setAccount] = useState({
    fullName: "",
    email: "",
    role: "",
    specialization: "none",
  });

  const [localFields, setLocalFields] = useState({
    phone: "",
    linkedin: "",
    github: "",
    facebook: "",
  });

  // ── Fetch user on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setAccount({
          fullName: user.name || "",
          email: user.email || "",
          role: user.role || "",
          specialization: user.specialization || "none",
        });
        // setAvatar(user.avatar || DEFAULT_AVATAR);
        setAvatar(user.avatar || null); // null triggers initials fallback

        const stored = JSON.parse(localStorage.getItem("flowio-local-profile") || "{}");
        setLocalFields({
          phone: stored.phone || "",
          linkedin: stored.linkedin || "",
          github: stored.github || "",
          facebook: stored.facebook || "",
        });
      } catch (err) {
        showMessage(err.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 2800);
  };

  const updateAccount = (key, value) =>
    setAccount((prev) => ({ ...prev, [key]: value }));

  const updateLocal = (key, value) =>
    setLocalFields((prev) => ({ ...prev, [key]: value }));

  // ── Avatar upload → Cloudinary (staged, not saved yet) ───────────────────
  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image", "error");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setAvatar(localPreview);
    setUploadingAvatar(true);

    try {
      const cloudUrl = await uploadToCloudinary(file);
      setPendingAvatarUrl(cloudUrl);       // stage it
      setAvatar(cloudUrl);                 // update preview to final URL
      showMessage("Photo ready — click Save to apply");
    } catch (err) {
      showMessage("Upload failed, please try again", "error");
      // setAvatar(account.avatar || DEFAULT_AVATAR); // revert preview
      setAvatar(account.avatar || null);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // const removeAvatar = () => {
  //   setAvatar(DEFAULT_AVATAR);
  //   setPendingAvatarUrl(""); // empty string signals "remove avatar" on save
  //   showMessage("Photo removed — click Save to apply");
  // };
  const removeAvatar = () => {
  setAvatar(null);
  setPendingAvatarUrl("");
  showMessage("Photo removed — click Save to apply");
};

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveAccount = async () => {
    if (!account.fullName.trim()) {
      showMessage("Full name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: account.fullName.trim(),
        specialization: account.specialization,
      };

      // Only include avatar if it was changed
      if (pendingAvatarUrl !== null) {
        payload.avatar = pendingAvatarUrl || null;
      }

      // await userService.updateProfile(payload);
      await userService.updateProfile(payload);
      saveFlowioUser({
  name: account.fullName,
  email: account.email,
  avatar: pendingAvatarUrl !== null ? pendingAvatarUrl || "" : avatar || "",
  role: account.role,
  specialization: account.specialization,
});
if (pendingAvatarUrl !== null) {
  localStorage.setItem("userAvatar", pendingAvatarUrl || "");
}
setPendingAvatarUrl(null);
      setPendingAvatarUrl(null); // clear staged change

      localStorage.setItem("flowio-local-profile", JSON.stringify(localFields));

      setSaved(true);
      showMessage("Account settings saved successfully");
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      showMessage(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetAccount = async () => {
    setLoading(true);
    try {
      const user = await userService.getCurrentUser();
      setAccount({
        fullName: user.name || "",
        email: user.email || "",
        role: user.role || "",
        specialization: user.specialization || "none",
      });
      // setAvatar(user.avatar || DEFAULT_AVATAR);
      setAvatar(user.avatar || null);
      setPendingAvatarUrl(null);
      setLocalFields({ phone: "", linkedin: "", github: "", facebook: "" });
      localStorage.removeItem("flowio-local-profile");
      showMessage("Reset to saved profile");
    } catch (err) {
      showMessage(err.message || "Failed to reset", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderInputField = (icon, label, value, onChange, placeholder, type = "text", readOnly = false) => (
    <div>
      <p className="mb-2 text-[12px] font-bold text-white/70">{label}</p>
      <div className={`flex h-12 items-center gap-3 rounded-[16px] border px-4 transition
        ${readOnly
          ? "border-blue-300/5 bg-[#0b1246]/50 cursor-not-allowed"
          : "border-blue-300/10 bg-[#0b1246]/85 focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_18px_rgba(95,150,255,.18)]"
        }`}
      >
        <span className={readOnly ? "text-white/30" : "text-[#78aaff]"}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="h-full w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
        />
        {readOnly && (
          <span className="text-[9px] text-white/25 font-bold uppercase tracking-wider">locked</span>
        )}
      </div>
    </div>
  );

  const renderSelectField = (icon, label, field, options) => (
    <div>
      <p className="mb-2 text-[12px] font-bold text-white/70">{label}</p>
      <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#0b1246]/85 px-4 transition focus-within:border-[#6eb5ff]/50">
        <span className="text-[#78aaff]">{icon}</span>
        <select
          value={account[field]}
          onChange={(e) => updateAccount(field, e.target.value)}
          className="h-full w-full bg-transparent text-xs text-white outline-none appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0b1246]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-2xl text-[#78aaff]" />
        <span className="ml-3 text-sm text-white/50">Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_.35s_ease] space-y-6 pb-4">
      {/* Toast */}
      {message && (
        <div className={`fixed left-3 right-3 top-4 z-[9999] rounded-[18px] border px-4 py-3 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,.45)] sm:left-auto sm:right-8 sm:top-8 sm:px-5 sm:py-4
          ${messageType === "error" ? "border-red-400/20 bg-[#3a1020]" : "border-blue-300/15 bg-[#10184c]"}`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[.9fr_1.1fr] lg:gap-6">
        {/* Profile Picture */}
        <div className="rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69] sm:rounded-[26px] sm:p-6">
          <h3 className="mb-2 text-[17px] font-bold">Profile Picture</h3>
          <p className="mb-6 text-[11px] text-white/45">
            Hosted on Cloudinary — syncs across all devices.
          </p>

          <div className="flex flex-col items-center text-center">


<div className="relative mb-5">
  {/* Avatar: real photo or initials fallback */}
  {avatar ? (
    <img
      src={avatar}
      alt="Profile"
      className="h-[126px] w-[126px] rounded-full border-4 border-blue-300/20 object-cover shadow-[0_0_25px_rgba(95,150,255,.25)]"
    />
  ) : (
    <div className="h-[126px] w-[126px] rounded-full border-4 border-blue-300/20 shadow-[0_0_25px_rgba(95,150,255,.25)] bg-gradient-to-b from-[#6eb5ff] to-[#5b7dff] flex items-center justify-center text-[42px] font-black uppercase text-white">
      {(account.fullName || "?").charAt(0)}
    </div>
  )}

  {/* rest unchanged: spinner overlay, unsaved badge, camera label */}
  {uploadingAvatar && ( 
       <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <FaSpinner className="animate-spin text-xl text-white" />
                </div>
   )}
  {pendingAvatarUrl !== null && !uploadingAvatar && ( 
        <div className="absolute -top-1 -right-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-black">
                  unsaved
                </div>
   )}
  <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:scale-110">
    <FaCamera />
    <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploadingAvatar} />
  </label>
</div>




            <h4 className="text-[18px] font-bold">{account.fullName || "—"}</h4>
            <p className="mt-1 text-xs text-white/45 capitalize">{account.role}</p>
            <p className="mt-0.5 text-[10px] text-white/25 capitalize">{account.specialization}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <label className={`flex h-10 items-center gap-2 rounded-[14px] bg-blue-400/15 px-4 text-xs font-bold text-[#78aaff] transition hover:bg-blue-400/25
                ${uploadingAvatar ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {uploadingAvatar ? <FaSpinner className="animate-spin" /> : <FaCamera />}
                {uploadingAvatar ? "Uploading…" : "Edit Photo"}
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploadingAvatar} />
              </label>

              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploadingAvatar}
                className="flex h-10 items-center gap-2 rounded-[14px] bg-red-400/15 px-4 text-xs font-bold text-[#ff6b8a] transition hover:bg-red-400/25 disabled:opacity-50"
              >
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69] sm:rounded-[26px] sm:p-6">
          <h3 className="mb-2 text-[17px] font-bold">Personal Information</h3>
          <p className="mb-6 text-[11px] text-white/45">Update your account profile details.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderInputField(<FaUser />, "Full Name", account.fullName, (v) => updateAccount("fullName", v), "Enter full name")}
            {renderInputField(<FaEnvelope />, "Email Address", account.email, null, "—", "email", true)}
            {renderInputField(<FaPhoneAlt />, "Phone Number", localFields.phone, (v) => updateLocal("phone", v), "Enter phone number")}
            {renderInputField(<FaBriefcase />, "System Role", account.role, null, "—", "text", true)}
            {renderSelectField(<FaBriefcase />, "Specialization", "specialization", [
              { value: "none", label: "None" },
              { value: "developer", label: "Developer" },
              { value: "designer", label: "Designer" },
              { value: "qa", label: "QA" },
              // { value: "Employee", label: "Employee" },
            ])}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69] sm:rounded-[26px] sm:p-6">
        <h3 className="mb-2 text-[17px] font-bold">Social Links</h3>
        <p className="mb-6 text-[11px] text-white/45">
          Add your professional and social media links.{" "}
          <span className="text-white/30">(Saved locally on this device)</span>
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {renderInputField(<FaLinkedinIn />, "LinkedIn", localFields.linkedin, (v) => updateLocal("linkedin", v), "LinkedIn profile link")}
          {renderInputField(<FaGithub />, "GitHub", localFields.github, (v) => updateLocal("github", v), "GitHub profile link")}
          {renderInputField(<FaFacebookF />, "Facebook", localFields.facebook, (v) => updateLocal("facebook", v), "Facebook profile link")}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 rounded-[22px] border border-blue-300/10 bg-[#10184c]/75 p-4 shadow-[0_18px_40px_rgba(0,0,0,.18)] sm:rounded-[26px] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={resetAccount}
            className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-blue-400/15 px-5 text-sm font-bold text-[#78aaff] transition hover:bg-blue-400/25"
          >
            <FaUndo /> Reset
          </button>
          <button type="button"
            onClick={() => {
              if (window.confirm("Clear locally stored phone and social links?")) {
                localStorage.removeItem("flowio-local-profile");
                setLocalFields({ phone: "", linkedin: "", github: "", facebook: "" });
                showMessage("Local data cleared");
              }
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-red-400/15 px-5 text-sm font-bold text-[#ff6b8a] transition hover:bg-red-400/25"
          >
            <FaTimes /> Clear Local Data
          </button>
        </div>

        <button type="button" onClick={saveAccount} disabled={saving || uploadingAvatar}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-[16px] text-sm font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed lg:w-auto lg:min-w-[170px]
            ${saved ? "bg-emerald-400/20 text-[#5fffd0]" : "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_20px_rgba(95,150,255,.30)] hover:-translate-y-1 hover:brightness-110"}`}
        >
          {saving ? <><FaSpinner className="animate-spin" /> Saving…</>
            : saved ? <><FaCheck /> Saved</>
            : <><FaSave /> Save Account</>}
        </button>
      </div>
    </div>
  );
}
