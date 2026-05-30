import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Footer() {
  return (
    <footer className="relative mx-auto mb-8 mt-16 w-[88vw] overflow-hidden rounded-[32px] border border-blue-300/10 bg-[radial-gradient(circle_at_top_right,rgba(110,181,255,.10),transparent_35%),linear-gradient(180deg,#09103a,#060b28)] shadow-[0_0_45px_rgba(25,40,160,.18)]">
      <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative grid grid-cols-[1.3fr_1fr_.9fr] gap-12 px-10 py-9 text-white">
        <div>
          <div className="mb-5 flex items-center gap-3">
         <img
  src={logo}
  alt="Flowio"
  className="h-[54px] w-[54px] rounded-[16px] object-cover scale-[1.18]"
/>
            <h2 className="bg-gradient-to-r from-white via-[#82b6ff] to-[#4e7dff] bg-clip-text text-[34px] font-extrabold text-transparent">
              Flowio
            </h2>
          </div>

          <p className="max-w-[340px] text-[14px] leading-7 text-white/65">
            Manage projects smarter with AI-powered workflows, productivity
            tracking, team collaboration and intelligent insights.
          </p>

          <div className="mt-6 flex gap-3">
            {[<FaGithub />, <FaLinkedinIn />, <FaTwitter />].map((icon, i) => (
              <button
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#82b6ff] transition-all duration-300 hover:-translate-y-1 hover:border-[#6eb5ff] hover:bg-[#101956]"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-[17px] font-bold">Quick Links</h3>

          <div className="flex flex-col gap-4">
            {[
              ["Dashboard", "/dashboard"],
              ["Projects", "/projects"],
              ["Profile", "/profile"],
              ["Recent Activity", "/recent-activity"],
              ["Settings", "/settings"],
            ].map(([title, path]) => (
              <NavLink
                key={path}
                to={path}
                className="group relative w-fit text-sm text-white/65 transition hover:text-[#82b6ff]"
              >
                {title}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#82b6ff] transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-[17px] font-bold">Contact Us</h3>

          <div className="space-y-3">
            {[
              [<FaPhoneAlt />, "+20 100 123 4567"],
              [<FaEnvelope />, "support@flowio.ai"],
              [<FaMapMarkerAlt />, "Alexandria, Egypt"],
            ].map(([icon, text]) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-[15px] border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all duration-300 hover:border-blue-300/15 hover:bg-[#101956]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-400/10 text-[12px] text-[#82b6ff]">
                  {icon}
                </div>

                <span className="text-[13px] text-white/75">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/5 px-10 py-4">
        <div className="flex items-center justify-between text-[12px] text-white/40">
          <span>© 2026 Flowio. All rights reserved.</span>

          <div className="flex gap-5">
            <button className="transition hover:text-[#82b6ff]">
              Privacy Policy
            </button>

            <button className="transition hover:text-[#82b6ff]">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}