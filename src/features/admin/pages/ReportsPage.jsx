import React, { memo } from "react";

import AttendancePage from "./AttendancePage";

const ReportsPage = memo(() => (
  <AttendancePage
    title="Reports & Analytics"
    subtitle="Verified university reporting from currently supported administration data"
    showReportScopeNotice
  />
));

export default ReportsPage;
