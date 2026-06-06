import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaBriefcase,
  FaCamera,
  FaTrash,
  FaSave,
  FaCheck,
  FaTimes,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaUndo,
} from "react-icons/fa";

const defaultAvatar = "https://i.pravatar.cc/300?img=12";

export default function AccountSettings() {
  const savedAccount = JSON.parse(
    localStorage.getItem("flowio-account") || "{}"
  );

  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState(savedAccount.avatar || defaultAvatar);

  const [account, setAccount] = useState({
    fullName: savedAccount.fullName || "Omar Khaled",
    username: savedAccount.username || "omar_khaled",
    email: savedAccount.email || "omar@gmail.com",
    phone: savedAccount.phone || "+20 1023456874",
    role: savedAccount.role || "Project Manager",
    department: savedAccount.department || "Product Team",
    linkedin: savedAccount.linkedin || "",
    github: savedAccount.github || "",
    facebook: savedAccount.facebook || "",
  });

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2300);
  };

  const updateField = (key, value) => {
    setAccount((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const uploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result);
      showMessage("Profile picture updated");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAvatar = () => {
    setAvatar(defaultAvatar);
    showMessage("Profile picture removed");
  };

  const resetAccount = () => {
    setAccount({
      fullName: "Omar Khaled",
      username: "omar_khaled",
      email: "omar@gmail.com",
      phone: "+20 1023456874",
      role: "Project Manager",
      department: "Product Team",
      linkedin: "",
      github: "",
      facebook: "",
    });

    setAvatar(defaultAvatar);
    localStorage.removeItem("flowio-account");
    showMessage("Account data reset");
  };

  const saveAccount = () => {
    if (!account.fullName.trim()) {
      showMessage("Full name is required");
      return;
    }

    if (!account.username.trim()) {
      showMessage("Username is required");
      return;
    }

    if (!account.email.trim() || !/\S+@\S+\.\S+/.test(account.email)) {
      showMessage("Please enter a valid email");
      return;
    }

    localStorage.setItem(
      "flowio-account",
      JSON.stringify({
        ...account,
        avatar,
      })
    );

    setSaved(true);
    showMessage("Account settings saved successfully");

    setTimeout(() => setSaved(false), 2200);
  };

  const deleteAccount = () => {
    const ok = window.confirm(
      "Are you sure you want to delete this account data?"
    );

    if (!ok) return;

    localStorage.removeItem("flowio-account");
    resetAccount();
    showMessage("Account data deleted");
  };

  const renderInputField = (
    icon,
    label,
    field,
    placeholder,
    type = "text"
  ) => (
    <div>
      <p className="mb-2 text-[12px] font-bold text-white/70">{label}</p>

      <div className="flex h-12 items-center gap-3 rounded-[16px] border border-blue-300/10 bg-[#0b1246]/85 px-4 transition focus-within:border-[#6eb5ff]/50 focus-within:shadow-[0_0_18px_rgba(95,150,255,.18)]">
        <span className="text-[#78aaff]">{icon}</span>

        <input
          type={type}
          value={account[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35"
        />
      </div>
    </div>
  );

  return (
    <div className="animate-[fadeUp_.35s_ease] space-y-6 pb-4">
      {message && (
        <div className="fixed right-8 top-8 z-[9999] rounded-[18px] border border-blue-300/15 bg-[#10184c] px-5 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,.45)]">
          {message}
        </div>
      )}

      <div className="grid grid-cols-[.9fr_1.1fr] gap-6">
        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <h3 className="mb-2 text-[17px] font-bold">Profile Picture</h3>

          <p className="mb-6 text-[11px] text-white/45">
            Upload, preview or remove your profile photo.
          </p>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <img
                src={avatar}
                alt="Profile"
                className="h-[126px] w-[126px] rounded-full border-4 border-blue-300/20 object-cover shadow-[0_0_25px_rgba(95,150,255,.25)]"
              />

              <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.35)] transition hover:scale-110">
                <FaCamera />

                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <h4 className="text-[18px] font-bold">{account.fullName}</h4>
            <p className="mt-1 text-xs text-white/45">{account.role}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[14px] bg-blue-400/15 px-4 text-xs font-bold text-[#78aaff] transition hover:bg-blue-400/25">
                <FaCamera />
                Edit Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={removeAvatar}
                className="flex h-10 items-center gap-2 rounded-[14px] bg-red-400/15 px-4 text-xs font-bold text-[#ff6b8a] transition hover:bg-red-400/25"
              >
                <FaTrash />
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#141f69]">
          <h3 className="mb-2 text-[17px] font-bold">
            Personal Information
          </h3>

          <p className="mb-6 text-[11px] text-white/45">
            Update your account profile details.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {renderInputField(
              <FaUser />,
              "Full Name",
              "fullName",
              "Enter full name"
            )}

            {renderInputField(
              <FaUser />,
              "Username",
              "username",
              "Enter username"
            )}

            {renderInputField(
              <FaEnvelope />,
              "Email Address",
              "email",
              "Enter email",
              "email"
            )}

            {renderInputField(
              <FaPhoneAlt />,
              "Phone Number",
              "phone",
              "Enter phone number"
            )}

            {renderInputField(
              <FaBriefcase />,
              "Role",
              "role",
              "Enter role"
            )}

            {renderInputField(
              <FaBriefcase />,
              "Department",
              "department",
              "Enter department"
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,.18)] transition-all duration-300 hover:bg-[#141f69]">
        <h3 className="mb-2 text-[17px] font-bold">Social Links</h3>

        <p className="mb-6 text-[11px] text-white/45">
          Add your professional and social media links.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {renderInputField(
            <FaLinkedinIn />,
            "LinkedIn",
            "linkedin",
            "LinkedIn profile link"
          )}

          {renderInputField(
            <FaGithub />,
            "GitHub",
            "github",
            "GitHub profile link"
          )}

          {renderInputField(
            <FaFacebookF />,
            "Facebook",
            "facebook",
            "Facebook profile link"
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[26px] border border-blue-300/10 bg-[#10184c]/75 p-5 shadow-[0_18px_40px_rgba(0,0,0,.18)]">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetAccount}
            className="flex h-11 items-center gap-2 rounded-[16px] bg-blue-400/15 px-5 text-sm font-bold text-[#78aaff] transition hover:bg-blue-400/25"
          >
            <FaUndo />
            Reset
          </button>

          <button
            type="button"
            onClick={deleteAccount}
            className="flex h-11 items-center gap-2 rounded-[16px] bg-red-400/15 px-5 text-sm font-bold text-[#ff6b8a] transition hover:bg-red-400/25"
          >
            <FaTimes />
            Delete Account
          </button>
        </div>

        <button
          type="button"
          onClick={saveAccount}
          className={`flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-[16px] text-sm font-bold transition-all duration-300 ${
            saved
              ? "bg-emerald-400/20 text-[#5fffd0]"
              : "bg-gradient-to-r from-[#6eb5ff] to-[#5b7dff] text-white shadow-[0_0_20px_rgba(95,150,255,.30)] hover:-translate-y-1 hover:brightness-110"
          }`}
        >
          {saved ? (
            <>
              <FaCheck />
              Saved
            </>
          ) : (
            <>
              <FaSave />
              Save Account
            </>
          )}
        </button>
      </div>
    </div>
  );
}