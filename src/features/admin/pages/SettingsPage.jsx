import React, { memo } from "react";
import { Info, Settings } from "lucide-react";

import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";

import "./SettingsPage.css";

const SettingsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="System Settings"
      subtitle="Portal configuration from verified administrative APIs"
    />

    <DashboardCard className="a-settings-unavailable" padding={false}>
      <section
        className="a-settings-unavailable-content"
        role="status"
        aria-labelledby="a-settings-unavailable-title"
      >
        <div className="a-settings-unavailable-icon" aria-hidden="true">
          <Settings size={25} />
        </div>

        <div className="a-settings-unavailable-copy">
          <div className="a-settings-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="a-settings-unavailable-title">
            System configuration is not supported yet
          </h3>

          <p>
            The current backend does not define a portal-configuration model
            or expose an Admin system-settings read or update endpoint.
          </p>
          <p>
            University identity and contact details, portal-wide preferences
            and security configuration cannot be verified or saved through
            the supported APIs. The demonstration form has been removed so
            edits are not presented as persisted settings.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default SettingsPage;
