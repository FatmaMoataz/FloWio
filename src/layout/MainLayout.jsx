import { FaArrowUp } from "react-icons/fa";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({ children, title }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_left,rgba(0,40,170,.5),transparent_35%),linear-gradient(90deg,#02030f_0%,#07144a_55%,#05060f_100%)] py-10 flex flex-col items-center">
      <div className="relative w-[92vw] h-[82vh] rounded-[32px] border border-[rgba(84,100,220,.45)] bg-[rgba(6,10,30,.82)] flex p-6 shadow-[0_0_35px_rgba(25,40,160,.3)] overflow-hidden">
        <Sidebar />
        <div className="flex-1 h-full pl-7 overflow-hidden">
          {title && <Topbar title={title} />}
          <div className={title ? "h-[calc(100%-74px)] overflow-hidden" : "h-full overflow-hidden"}>{children}</div>
        </div>
      </div>
      <Footer />
      <button onClick={scrollToTop} className="fixed right-8 bottom-8 z-[999] w-[42px] h-[42px] rounded-full bg-gradient-to-b from-[#6eb5ff] to-[#4f7dff] text-white flex items-center justify-center shadow-[0_0_18px_rgba(95,150,255,.4)] transition hover:-translate-y-1 hover:brightness-110"><FaArrowUp /></button>
    </div>
  );
}
