import React from 'react';
import AssignmentCard from '../components/AssignmentCard/AssignmentCard';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { assignmentsData } from '../data/mockDashboardData';

const AssignmentsPage = () => (
  <div className="d-page-container">
    <SectionHeader title="Assignments" subtitle="Track your pending and completed tasks" />
    <div className="d-grid-2">
      {assignmentsData.map(asg => <AssignmentCard key={asg.id} {...asg} />)}
    </div>
  </div>
);
export default AssignmentsPage;