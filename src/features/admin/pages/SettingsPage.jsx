import React, { memo } from "react";
import { useForm } from "react-hook-form";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
const SettingsPage = memo(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <div className="d-page-container">
      <SectionHeader
        title="System Settings"
        subtitle="Configure portal preferences"
      />
      <DashboardCard className="d-settings-form">
        <form onSubmit={handleSubmit((d) => console.log(d))}>
          <div className="d-form-group">
            <label>University Name</label>
            <input
              defaultValue="Lamrin Tech Skills University"
              {...register("uni")}
            />
          </div>
          <div className="d-form-group">
            <label>Admin Email</label>
            <input defaultValue="admin@ltsu.ac.in" {...register("email")} />
          </div>
          <button type="submit" className="d-btn-primary">
            Save Settings
          </button>
        </form>
      </DashboardCard>
    </div>
  );
});
export default SettingsPage;
