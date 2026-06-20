import { useState } from "react";
import { FaArrowUp, FaTimes } from "react-icons/fa";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({
  children,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showSearch = true,
}) {
  const [navOpen, setNavOpen] = useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <div className="flowio-app-shell flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-[linear-gradient(90deg,#040511_0%,#050716_48%,#070933_100%)] px-2 py-2 sm:px-5 sm:py-5 lg:px-0 lg:py-8">
      {navOpen && (
        <div className="fixed inset-0 z-[1200] bg-[#020414]/75 p-3 backdrop-blur-sm md:hidden" onClick={() => setNavOpen(false)}>
          <div className="relative h-full max-w-[320px]" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
              aria-label="Close navigation menu"
            >
              <FaTimes />
            </button>
            <Sidebar variant="mobile" onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}
      <div className="flowio-app-frame relative min-h-[calc(100vh-16px)] w-full rounded-[20px] bg-gradient-to-r from-[#1D1E62] to-[#1B1B34] p-[2px] shadow-[0_0_42px_rgba(28,35,109,.45)] sm:min-h-[calc(100vh-40px)] sm:rounded-[28px] lg:h-[clamp(760px,88vh,980px)] lg:min-h-0 lg:w-[92vw] lg:rounded-[32px] lg:p-[3px]">
        <div className="flowio-app-surface flex min-h-[calc(100vh-20px)] w-full flex-col overflow-visible rounded-[18px] bg-[radial-gradient(circle_at_50%_47%,#090C4F_0%,#090C4F_28%,#070933_58%,#050716_100%)] p-3 sm:min-h-[calc(100vh-44px)] sm:rounded-[26px] sm:p-4 md:flex-row md:overflow-hidden md:p-5 lg:h-full lg:min-h-0 lg:rounded-[29px] lg:p-6">
          <Sidebar />

          <div className="min-w-0 flex-1 pt-4 md:h-full md:overflow-hidden md:pl-5 md:pt-0 lg:pl-7">
            {title && (
              <Topbar
                title={title}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
                showSearch={showSearch}
                onMenuClick={() => setNavOpen(true)}
              />
            )}

            <div
              className={
                title
                  ? "min-h-0 md:h-[calc(100%-60px)] md:overflow-hidden"
                  : "min-h-0 md:h-full md:overflow-hidden"
              }
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-[999] flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#4f7dff] text-white shadow-[0_0_18px_rgba(95,150,255,.4)] transition hover:-translate-y-1 hover:brightness-110 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 lg:h-[42px] lg:w-[42px]"
      >
        <FaArrowUp />
      </button>
    </div>
  );
}
