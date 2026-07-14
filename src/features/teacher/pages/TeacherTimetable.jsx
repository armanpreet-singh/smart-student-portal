import React, { memo } from "react";
import { motion } from "framer-motion";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

const timetableData = {
  Mon: [{ subject: "DBMS", time: "09:00 AM", room: "301", type: "lecture" }],
  Tue: [{ subject: "CN Lab", time: "11:00 AM", room: "Lab 102", type: "lab" }],
  Wed: [
    { subject: "OS", time: "02:00 PM", room: "205", type: "lecture" },
    { subject: "DBMS Lab", time: "04:00 PM", room: "Lab 101", type: "lab" },
  ],
  Thu: [{ subject: "CN", time: "09:00 AM", room: "302", type: "lecture" }],
  Fri: [{ subject: "OS", time: "11:00 AM", room: "205", type: "lecture" }],
};

const TeacherTimetable = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Weekly Timetable"
      subtitle="Your teaching schedule for the week"
    />
    <div className="d-timetable-grid">
      {Object.entries(timetableData).map(([day, classes]) => (
        <div key={day} className="d-day-col">
          <h4 className="d-day-title">{day}</h4>
          {classes.map((cls, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <DashboardCard className={`d-tt-card ${cls.type}`}>
                <h5>{cls.subject}</h5>
                <p className="d-tt-time">{cls.time}</p>
                <p>{cls.room}</p>
              </DashboardCard>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  </div>
));
export default TeacherTimetable;
