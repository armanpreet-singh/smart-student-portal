  import React, { memo } from 'react';

const FEATURES = [
  {
    icon: '📊',
    title: 'Student Dashboard',
    desc: 'Grades, timetables & announcements',
  },
  {
    icon: '🖥️',
    title: 'Faculty Workspace',
    desc: 'Course management & collaboration',
  },
  {
    icon: '🎓',
    title: 'Academic Records',
    desc: 'Transcripts, awards & credentials',
  },
];

const FeatureCard = memo(({ icon, title, desc }) => (
  <div className="feat-card" role="listitem">
    <div className="feat-icon" aria-hidden="true">{icon}</div>
    <div className="feat-text">
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
    <div className="feat-check" aria-hidden="true">✓</div>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

const FeaturePanel = () => (
  <div className="panel-left" aria-label="LTSU campus welcome panel">
    {/* Background image + gradient overlay */}
    <div
      className="bg-image"
      role="img"
      aria-label="Aerial view of the university campus"
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
        <br />to Campus
      </h1>

      <p className="left-sub">
        Continue your academic journey with secure, unified access to every
        resource the university offers.
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
