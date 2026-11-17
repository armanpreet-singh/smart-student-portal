import React, { useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, CalendarClock, CheckCircle2, ChevronDown,
  CircleHelp, ClipboardList, Copy, ExternalLink, FileText, Mail,
  MessageCircle, Search, ShieldCheck, UserRound, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import SectionHeader from "../../dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../dashboard/components/DashboardCard/DashboardCard";
import { showErrorMessage, showSuccessMessage } from "../../../components/ui/toastUtils";
import "./HelpSupportPage.css";

const COMMON_FAQS = [
  {
    category: "Account & sign-in",
    question: "I cannot sign in to the portal. What should I check?",
    answer: "Check that you selected the correct portal role and entered your university username and password. Usernames are case-sensitive where configured. If your account requires a password change, complete that step before opening the dashboard. If the problem continues, include the exact error message in your support request; never include your password.",
  },
  {
    category: "Account & sign-in",
    question: "How do I update my account information?",
    answer: "Open the profile menu and choose My Profile to review the verified information on your account. Use Account Settings for the preferences and security options currently available to your role. If a verified field is incorrect or missing, contact the university administrator rather than entering unverified details.",
  },
  {
    category: "Account & sign-in",
    question: "What should I do if my session expires?",
    answer: "Return to the login page and sign in again. If the portal cannot verify your session, check your internet connection and retry. Avoid sharing your access token or password with anyone.",
  },
  {
    category: "Portal troubleshooting",
    question: "A page is blank, slow, or is not updating. What can I do?",
    answer: "Refresh the page once, check your internet connection, and sign out and back in if the issue persists. You can also try a current version of Chrome, Edge, Firefox or Safari. Include the page name, approximate time and steps that led to the problem in your support request.",
  },
  {
    category: "Privacy & security",
    question: "What information should I include in a support request?",
    answer: "Include your name, portal role, username, the page or feature affected, what you expected, what happened, the approximate time and any visible error text. Do not include your password, one-time codes, session tokens or sensitive personal documents.",
  },
];

const STUDENT_FAQS = [
  {
    category: "Student portal",
    question: "My attendance or course information looks incorrect. What should I do?",
    answer: "Open the relevant Attendance or Courses page and note the subject, date and displayed value. Contact your teacher or the university office responsible for academic records with those details. The portal displays the records available from the university system.",
  },
  {
    category: "Student portal",
    question: "I cannot find an assignment or learning resource.",
    answer: "Check the Assignments and Resources pages and confirm that you are viewing the correct course. If an item is still missing, include the course or subject name and the assignment/resource title in your support request.",
  },
  {
    category: "Student portal",
    question: "Where can I check results and announcements?",
    answer: "Use Results for published grades and Announcements for notices shared with your student portal. If expected information is not visible, contact the relevant teacher or university office.",
  },
];

const TEACHER_FAQS = [
  {
    category: "Teacher portal",
    question: "A class or subject is missing from my portal.",
    answer: "Check the Classes page and confirm that you are signed in with your Teacher account. Subject access is based on assignments made by the university administrator. If an expected class is missing, include its name/code in your support request and ask the Admin team to review your assignment.",
  },
  {
    category: "Teacher portal",
    question: "I need to correct an attendance record.",
    answer: "Open Attendance, select the relevant class/subject and date, and use the correction workflow available for that register. If the record is locked or the correction option is unavailable, report the class, date and affected student identifier to the university office. Do not send student passwords or unnecessary personal data.",
  },
  {
    category: "Teacher portal",
    question: "Students cannot see an assignment, announcement or resource.",
    answer: "Check that the item was saved or published and that its target class/subject and visibility are correct. Include the item title, target class and approximate publication time when reporting a visibility issue.",
  },
];

function makeSupportDraft(user, role) {
  return [
    "LTSU Smart Portal — Support Request",
    "",
    `Name: ${user?.fullName || "Not available"}`,
    `Role: ${role === "TEACHER" ? "Teacher" : "Student"}`,
    `Username: ${user?.username || "Not available"}`,
    `Email: ${user?.email || "Not provided"}`,
    "",
    "Page / feature affected:",
    "Approximate date and time:",
    "What I expected:",
    "What happened:",
    "Steps to reproduce:",
    "Visible error message (if any):",
    "",
    "I have not included my password, one-time codes or session tokens.",
  ].join("\n");
}

const HelpSupportPage = ({ role = "STUDENT" }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedFaq, setExpandedFaq] = useState(0);
  const teacher = role === "TEACHER";
  const faqs = useMemo(
    () => [...COMMON_FAQS, ...(teacher ? TEACHER_FAQS : STUDENT_FAQS)],
    [teacher],
  );
  const categories = useMemo(
    () => ["All", ...new Set(faqs.map((item) => item.category))],
    [faqs],
  );
  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faqs.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = !query || `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, activeCategory]);
  const supportDraft = useMemo(() => makeSupportDraft(user, role), [user, role]);

  const copyRequest = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(supportDraft);
      showSuccessMessage("Support request template copied. Paste it into your message to the university support team.");
    } catch {
      showErrorMessage("Could not copy automatically. Select and copy the support request text below.");
    }
  };

  const openEmailDraft = () => {
    const subject = encodeURIComponent("LTSU Smart Portal support request");
    const body = encodeURIComponent(supportDraft);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="d-page-container d-help-page">
      <SectionHeader
        title="Help & Support"
        subtitle={teacher ? "Guidance and troubleshooting for your Teacher portal" : "Guidance and troubleshooting for your Student portal"}
      />

      <section className="d-help-hero">
        <div className="d-help-hero-icon"><CircleHelp size={28} /></div>
        <div className="d-help-hero-copy">
          <span className="d-help-eyebrow">LTSU SMART PORTAL HELP CENTRE</span>
          <h2>How can we help you today?</h2>
          <p>Find answers to common questions or prepare a support request with the details the university team will need.</p>
        </div>
        <div className="d-help-hero-mark"><ShieldCheck size={52} /></div>
      </section>

      <div className="d-help-shortcuts">
        <Link to={teacher ? "/teacher/profile" : "/dashboard/profile"} className="d-help-shortcut">
          <UserRound size={19} /><span><strong>My Profile</strong><small>Review your account details</small></span><ArrowRight size={16} />
        </Link>
        <Link to={teacher ? "/teacher/settings" : "/dashboard/settings"} className="d-help-shortcut">
          <ShieldCheck size={19} /><span><strong>Account Settings</strong><small>Manage available preferences</small></span><ArrowRight size={16} />
        </Link>
        <a href="#d-help-contact" className="d-help-shortcut">
          <MessageCircle size={19} /><span><strong>Contact Support</strong><small>Prepare a request for the university team</small></span><ArrowRight size={16} />
        </a>
      </div>

      <DashboardCard className="d-help-faq-card">
        <div className="d-help-section-heading">
          <div><h3>Frequently asked questions</h3><p>Answers for common {teacher ? "Teacher" : "Student"} portal tasks.</p></div>
          <BookOpen size={22} />
        </div>
        <label className="d-help-search">
          <Search size={17} aria-hidden="true" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setExpandedFaq(-1); }} placeholder="Search help articles..." aria-label="Search help articles" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}
        </label>
        <div className="d-help-categories" aria-label="FAQ categories">
          {categories.map((category) => (
            <button key={category} type="button" className={activeCategory === category ? "active" : ""} onClick={() => { setActiveCategory(category); setExpandedFaq(-1); }}>{category}</button>
          ))}
        </div>
        <div className="d-help-faq-list">
          {visibleFaqs.length ? visibleFaqs.map((item, index) => {
            const expanded = expandedFaq === index;
            return (
              <article className={`d-help-faq-item ${expanded ? "expanded" : ""}`} key={item.question}>
                <button type="button" aria-expanded={expanded} onClick={() => setExpandedFaq(expanded ? -1 : index)}>
                  <span><small>{item.category}</small><strong>{item.question}</strong></span>
                  <ChevronDown size={18} />
                </button>
                {expanded && <p>{item.answer}</p>}
              </article>
            );
          }) : <p className="d-help-empty">No help articles match that search. Try another phrase or clear the category filter.</p>}
        </div>
      </DashboardCard>

      <div className="d-help-bottom-grid" id="d-help-contact">
        <DashboardCard className="d-help-contact-card">
          <div className="d-help-contact-icon"><Mail size={22} /></div>
          <h3>Contact the university support team</h3>
          <p>Prepare a clear report containing your account role, username and issue details. Your email app will open with a draft; add the official university support address before sending.</p>
          <div className="d-help-contact-actions">
            <button type="button" onClick={openEmailDraft}><Mail size={16} /> Open email draft <ExternalLink size={14} /></button>
            <button type="button" className="secondary" onClick={copyRequest}><Copy size={16} /> Copy request template</button>
          </div>
        </DashboardCard>
        <DashboardCard className="d-help-safety-card">
          <div className="d-help-contact-icon"><ShieldCheck size={22} /></div>
          <h3>Keep your account safe</h3>
          <ul>
            <li>Never share your password, one-time code or session token.</li>
            <li>Do not attach sensitive student records unless the university specifically requests them through an approved channel.</li>
            <li>Include the page name, date/time and exact error text to help the team investigate.</li>
          </ul>
          <p className="d-help-note"><CheckCircle2 size={15} /> Your support draft is prepared locally; it is not submitted or stored by this portal.</p>
        </DashboardCard>
      </div>
    </div>
  );
};

export default HelpSupportPage;
