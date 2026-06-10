import { FaArrowUp } from "react-icons/fa";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({
  children,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <div className="flowio-app-shell flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-[linear-gradient(90deg,#040511_0%,#050716_48%,#070933_100%)] px-3 py-3 sm:px-5 sm:py-5 lg:px-0 lg:py-8">
      <div className="flowio-app-frame relative min-h-[calc(100vh-24px)] w-full rounded-[24px] bg-gradient-to-r from-[#1D1E62] to-[#1B1B34] p-[2px] shadow-[0_0_42px_rgba(28,35,109,.45)] sm:min-h-[calc(100vh-40px)] sm:rounded-[28px] lg:h-[clamp(760px,88vh,980px)] lg:min-h-0 lg:w-[92vw] lg:rounded-[32px] lg:p-[3px]">
        <div className="flowio-app-surface flex min-h-[calc(100vh-28px)] w-full flex-col overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_50%_47%,#090C4F_0%,#090C4F_28%,#070933_58%,#050716_100%)] p-3 sm:min-h-[calc(100vh-44px)] sm:rounded-[26px] sm:p-4 lg:h-full lg:min-h-0 lg:flex-row lg:rounded-[29px] lg:p-6">
          <Sidebar />

          <div className="min-w-0 flex-1 pt-4 lg:h-full lg:overflow-hidden lg:pl-7 lg:pt-0">
            {title && (
              <Topbar
                title={title}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
              />
            )}

            <div
              className={
                title
                  ? "min-h-0 lg:h-[calc(100%-60px)] lg:overflow-hidden"
                  : "min-h-0 lg:h-full lg:overflow-hidden"
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
