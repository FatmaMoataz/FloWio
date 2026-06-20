import MainLayout from "../../layout/MainLayout";
import SettingsTabs from "./components/SettingsTabs";

export default function Settings() {
  return (
    <MainLayout title="Settings">
      <div className="rounded-[20px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-3 text-white shadow-[0_22px_55px_rgba(0,0,0,.30)] sm:rounded-[28px] sm:p-7 md:h-full">
        <SettingsTabs />
      </div>
    </MainLayout>
  );
}
