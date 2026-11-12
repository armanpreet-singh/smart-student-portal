import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';

const PROFILE_SETTINGS_KEY = 'ltsu-profile-settings';

const DEFAULT_PROFILE_SETTINGS = {
  name: 'Alex Johnson',
  email: 'alex.johnson@ltsu.ac.in',
  phone: '+91 98765 43210',
};

function loadProfileSettings() {
  try {
    const saved = localStorage.getItem(PROFILE_SETTINGS_KEY);
    if (!saved) return DEFAULT_PROFILE_SETTINGS;

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return DEFAULT_PROFILE_SETTINGS;
    }

    return {
      name: typeof parsed.name === 'string' ? parsed.name : DEFAULT_PROFILE_SETTINGS.name,
      email: typeof parsed.email === 'string' ? parsed.email : DEFAULT_PROFILE_SETTINGS.email,
      phone: typeof parsed.phone === 'string' ? parsed.phone : DEFAULT_PROFILE_SETTINGS.phone,
    };
  } catch {
    return DEFAULT_PROFILE_SETTINGS;
  }
}

const SettingsPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: loadProfileSettings() });

  const onSubmit = (data) => {
    try {
      localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(data));
      toast.success('Profile settings saved on this device.');
    } catch {
      toast.error('Unable to save settings in this browser.');
    }
  };

  return (
    <div className="d-page-container">
      <SectionHeader title="Settings" subtitle="Manage your account preferences" />
      <DashboardCard className="d-settings-form">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="d-form-group">
            <label htmlFor="profile-name">Display Name</label>
            <input
              id="profile-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register('name', { required: 'Display name is required.' })}
            />
            {errors.name && <span className="d-error">{errors.name.message}</span>}
          </div>

          <div className="d-form-group">
            <label htmlFor="profile-email">Official Email</label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Email address is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address.',
                },
              })}
            />
            {errors.email && <span className="d-error">{errors.email.message}</span>}
          </div>

          <div className="d-form-group">
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
            />
          </div>

          <button type="submit" className="d-btn-primary">Save Changes</button>
          <p className="d-form-hint">
            These demo profile settings are saved locally in this browser.
          </p>
        </form>
      </DashboardCard>
    </div>
  );
};

export default SettingsPage;
