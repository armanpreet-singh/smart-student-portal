import React from 'react';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';

const SettingsPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);

  return (
    <div className="d-page-container">
      <SectionHeader title="Settings" subtitle="Manage your account preferences" />
      <DashboardCard className="d-settings-form">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="d-form-group">
            <label>Display Name</label>
            <input defaultValue="Alex Johnson" {...register("name", { required: true })} />
            {errors.name && <span className="d-error">This field is required</span>}
          </div>
          <div className="d-form-group">
            <label>Official Email</label>
            <input type="email" defaultValue="alex.johnson@ltsu.ac.in" {...register("email", { required: true })} />
          </div>
          <div className="d-form-group">
            <label>Phone Number</label>
            <input type="tel" defaultValue="+91 98765 43210" {...register("phone")} />
          </div>
          <button type="submit" className="d-btn-primary">Save Changes</button>
        </form>
      </DashboardCard>
    </div>
  );
};
export default SettingsPage;