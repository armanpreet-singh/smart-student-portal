import React, { memo } from "react";
import {
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import loginBg from "../../../assets/images/bg/login.webp";

const FEATURES = [
  {
    icon: <ClipboardCheck size={22} strokeWidth={2.2} color="#C9A84C" />,
    title: "Attendance Management",
    desc: "Track attendance, leave requests & class records.",
  },
  {
    icon: <BookOpen size={22} strokeWidth={2.2} color="#C9A84C" />,
    title: "Assignments & Results",
    desc: "Submit coursework and view grades instantly.",
  },
  {
    icon: <GraduationCap size={22} strokeWidth={2.2} color="#C9A84C" />,
    title: "Student Services",
    desc: "Access notices, documents & campus resources.",
  },
];

const FeatureCard = memo(({ icon, title, desc }) => (
  <div className="feat-card" role="listitem">
    <div className="feat-icon" aria-hidden="true">
      {icon}
    </div>
    <div className="feat-text">
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
    <div className="feat-check" aria-hidden="true">
      <CheckCircle2 size={18} strokeWidth={2.5} />
    </div>
  </div>
));

FeatureCard.displayName = "FeatureCard";

const FeaturePanel = () => (
  <div className="panel-left" aria-label="LTSU campus welcome panel">
    {/* Background image + gradient overlay */}
   <div
  className="bg-image"
  role="img"
  aria-label="LTSU Campus"
  style={{
    backgroundImage: `
      linear-gradient(
        160deg,
        rgba(18,42,80,0.82) 0%,
        rgba(27,58,107,0.68) 40%,
        rgba(15,30,60,0.88) 100%
      ),
      url(${loginBg})
    `,
  }}
/>

    {/* Floating ambient blobs */}
    <div className="blob blob-1" aria-hidden="true" />
    <div className="blob blob-2" aria-hidden="true" />
    <div className="blob blob-3" aria-hidden="true" />

    <div className="left-content animate-fadeup">
      {/* Badge */}
      <div className="portal-badge">
        <div className="portal-badge-dot" aria-hidden="true" />
        <span>LTSU Smart Portal</span>
      </div>

      {/* Heading */}
      <h1 className="left-heading">
        Welcome <em>Back</em>
        <br />
        to <em>LTSU</em> Smart Portal.
      </h1>

      <p className="left-sub">
        Access your attendance, assignments, results, announcements, academic
        records, and university services from one secure portal.
      </p>

      {/* Feature cards */}
      <div className="feature-cards" role="list">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </div>
  </div>
);

export default memo(FeaturePanel);
