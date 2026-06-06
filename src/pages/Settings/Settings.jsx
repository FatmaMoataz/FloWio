import MainLayout from "../../layout/MainLayout";
import SettingsTabs from "./components/SettingsTabs";

export default function Settings() {
  return (
    <MainLayout title="Settings">
      <div className="h-full rounded-[28px] border border-blue-300/10 bg-gradient-to-br from-[#151e66]/95 to-[#0c123f]/95 p-7 text-white shadow-[0_22px_55px_rgba(0,0,0,.30)]">
        <SettingsTabs />
      </div>
    </MainLayout>
  );
}