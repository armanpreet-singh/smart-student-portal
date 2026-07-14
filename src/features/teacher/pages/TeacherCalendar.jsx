import React, { memo } from "react";
import { motion } from "framer-motion";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

const mockEvents = [
  {
    id: 1,
    date: "2023-10-28",
    title: "Submit OS Mid-Sem Results",
    type: "exam",
  },
  { id: 2, date: "2023-10-30", title: "Faculty Meeting", type: "event" },
  { id: 3, date: "2023-11-02", title: "DBMS Lab Final Viva", type: "viva" },
  { id: 4, date: "2023-11-15", title: "Diwali Holidays", type: "holiday" },
];

const TeacherCalendar = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Academic Calendar"
      subtitle="Important academic dates and deadlines"
    />
    <div className="d-cal-list">
      {mockEvents.map((ev) => (
        <motion.div
          key={ev.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <DashboardCard className="d-cal-event">
            <div className="d-cal-date">
              <span className="d-cal-day">{new Date(ev.date).getDate()}</span>
              <span className="d-cal-month">
                {new Date(ev.date).toLocaleString("default", {
                  month: "short",
                })}
              </span>
            </div>
            <div className="d-cal-info">
              <h4>{ev.title}</h4>
              <span className={`d-type-badge ${ev.type}`}>{ev.type}</span>
            </div>
          </DashboardCard>
        </motion.div>
      ))}
    </div>
  </div>
));
export default TeacherCalendar;
