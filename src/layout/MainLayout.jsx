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
    <div className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(90deg,#040511_0%,#050716_48%,#070933_100%)] py-8 flex flex-col items-center">
      <div className="relative w-[92vw] h-[clamp(760px,88vh,980px)] p-[3px] rounded-[32px] bg-gradient-to-r from-[#1D1E62] to-[#1B1B34] shadow-[0_0_42px_rgba(28,35,109,.45)]">
        <div className="w-full h-full rounded-[29px] bg-[radial-gradient(circle_at_50%_47%,#090C4F_0%,#090C4F_28%,#070933_58%,#050716_100%)] flex p-6 overflow-hidden">
          <Sidebar />

          <div className="flex-1 h-full pl-7 overflow-hidden">
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
                  ? "h-[calc(100%-60px)] overflow-hidden"
                  : "h-full overflow-hidden"
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
        className="fixed right-8 bottom-8 z-[999] w-[42px] h-[42px] rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#4f7dff] text-white flex items-center justify-center shadow-[0_0_18px_rgba(95,150,255,.4)] transition hover:-translate-y-1 hover:brightness-110"
      >
        <FaArrowUp />
      </button>
    </div>
  );
}
