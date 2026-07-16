import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, GraduationCap } from 'lucide-react';
import SectionHeader from '../../../features/dashboard/components/SectionHeader/SectionHeader';
import DashboardCard from '../../../features/dashboard/components/DashboardCard/DashboardCard';
import { departmentsData } from '../data/mockAdminData';

const DepartmentsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader title="Departments" subtitle="University academic branches" />
    <div className="d-grid-3">
      {departmentsData.map((dept, i) => (
        <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <DashboardCard>
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
              <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'rgba(30, 58, 138, 0.1)', color:'var(--d-primary)', display:'grid', placeItems:'center'}}><Building size={24} /></div>
              <div><h4 style={{margin:'0 0 4px'}}>{dept.name}</h4><p style={{margin:0, fontSize:'13px', color:'var(--d-text-secondary)'}}>HOD: {dept.hod}</p></div>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--d-border)', paddingTop:'16px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', color:'var(--d-text-secondary)'}}><Users size={16}/>{dept.students} Students</div>
              <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', color:'var(--d-text-secondary)'}}><GraduationCap size={16}/>{dept.faculty} Faculty</div>
            </div>
          </DashboardCard>
        </motion.div>
      ))}
    </div>
  </div>
));
export default DepartmentsPage;