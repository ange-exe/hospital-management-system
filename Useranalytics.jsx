import { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════════
const MOCK_USER = {
  name: "Aryan Mehta",
  id: "P-00421",
  avatar: "AM",
  bloodGroup: "O+",
  age: 34,
};

const APPOINTMENT_MONTHLY = [
  { month: "Sep", visits: 1 },
  { month: "Oct", visits: 2 },
  { month: "Nov", visits: 1 },
  { month: "Dec", visits: 3 },
  { month: "Jan", visits: 2 },
  { month: "Feb", visits: 4 },
  { month: "Mar", visits: 2 },
];

const DEPT_DISTRIBUTION = [
  { name: "Cardiology", value: 4, color: "#e05c5c" },
  { name: "Orthopedics", value: 3, color: "#5c8de0" },
  { name: "General", value: 6, color: "#5cc4a8" },
  { name: "Neurology", value: 2, color: "#c45ce0" },
  { name: "Dermatology", value: 1, color: "#e0b95c" },
];

const UPCOMING = [
  {
    id: 1,
    dept: "Cardiology",
    doctor: "Dr. Priya Shah",
    date: "28 Mar 2026",
    time: "10:30 AM",
    status: "confirmed",
  },
  {
    id: 2,
    dept: "Orthopedics",
    doctor: "Dr. Rahul Nair",
    date: "02 Apr 2026",
    time: "03:00 PM",
    status: "pending",
  },
];

const PAST = [
  {
    id: 3,
    dept: "General",
    doctor: "Dr. Sunita Iyer",
    date: "10 Mar 2026",
    time: "11:00 AM",
    diagnosis: "Seasonal Flu",
  },
  {
    id: 4,
    dept: "Cardiology",
    doctor: "Dr. Priya Shah",
    date: "14 Feb 2026",
    time: "09:30 AM",
    diagnosis: "Hypertension check",
  },
  {
    id: 5,
    dept: "Orthopedics",
    doctor: "Dr. Rahul Nair",
    date: "22 Jan 2026",
    time: "04:00 PM",
    diagnosis: "Knee pain",
  },
];

const HEALTH_HISTORY = [
  { month: "Oct", severity: 2 },
  { month: "Nov", severity: 3 },
  { month: "Dec", severity: 1 },
  { month: "Jan", severity: 4 },
  { month: "Feb", severity: 2 },
  { month: "Mar", severity: 3 },
];

const SEASONAL_ALERTS = [
  {
    icon: "🌡️",
    title: "Flu Season Active",
    desc: "High flu activity reported in Mumbai.",
    severity: "high",
    score: 90,
  },
  {
    icon: "🌿",
    title: "Allergy Season Ahead",
    desc: "Pollen counts are rising.",
    severity: "medium",
    score: 62,
  },
  {
    icon: "💧",
    title: "Hydration Reminder",
    desc: "Summer onset — increase water intake.",
    severity: "low",
    score: 34,
  },
];

const CARE_SUGGESTIONS = [
  {
    icon: "❤️",
    dept: "Cardiology",
    tip: "Follow-up suggested based on last visit timing.",
    progress: 72,
  },
  {
    icon: "🦴",
    dept: "Orthopedics",
    tip: "Physiotherapy adherence can improve recovery.",
    progress: 64,
  },
  {
    icon: "🩺",
    dept: "General",
    tip: "Annual preventive screening due soon.",
    progress: 82,
  },
];

const AWARENESS_CAMPAIGNS = {
  dermatology: {
    key: "dermatology",
    title: "🩺 Dermatology Alert",
    subtitle: "Rash cases are increasing across recent months",
    department: "Dermatology Department",
    graphLabel: "Rash Cases",
    color: "#f59e0b",
    trendData: [
      { month: "Sep", value: 12 },
      { month: "Oct", value: 14 },
      { month: "Nov", value: 16 },
      { month: "Dec", value: 15 },
      { month: "Jan", value: 18 },
      { month: "Feb", value: 20 },
      { month: "Mar", value: 24 },
    ],
    precautions: [
      "Stay hydrated",
      "Avoid excess sun",
      "Use gentle skin products",
      "Consult early for spreading rash",
    ],
  },
  cancer: {
    key: "cancer",
    title: "🎗️ World Cancer Day Awareness",
    subtitle: "Screening and early detection focus",
    department: "Oncology Awareness",
    graphLabel: "Screening Visits",
    color: "#e05c5c",
    trendData: [
      { month: "Sep", value: 40 },
      { month: "Oct", value: 45 },
      { month: "Nov", value: 48 },
      { month: "Dec", value: 50 },
      { month: "Jan", value: 56 },
      { month: "Feb", value: 68 },
      { month: "Mar", value: 62 },
    ],
    precautions: [
      "Avoid tobacco",
      "Do routine screenings",
      "Track unexplained symptoms",
      "Consult early on warning signs",
    ],
  },
  breast: {
    key: "breast",
    title: "🎀 Breast Cancer Awareness",
    subtitle: "Regular checks can save lives",
    department: "Women’s Health Initiative",
    graphLabel: "Breast Screening Visits",
    color: "#ec4899",
    trendData: [
      { month: "Sep", value: 22 },
      { month: "Oct", value: 34 },
      { month: "Nov", value: 30 },
      { month: "Dec", value: 26 },
      { month: "Jan", value: 32 },
      { month: "Feb", value: 36 },
      { month: "Mar", value: 40 },
    ],
    precautions: [
      "Do self-checks if advised",
      "Don’t delay lump evaluation",
      "Follow age-based screening",
      "Discuss family history",
    ],
  },
  cervical: {
    key: "cervical",
    title: "🌸 Cervical Health Awareness",
    subtitle: "Preventive screening matters",
    department: "Gynecology Preventive Care",
    graphLabel: "Cervical Screening Visits",
    color: "#8b5cf6",
    trendData: [
      { month: "Sep", value: 18 },
      { month: "Oct", value: 20 },
      { month: "Nov", value: 21 },
      { month: "Dec", value: 23 },
      { month: "Jan", value: 24 },
      { month: "Feb", value: 28 },
      { month: "Mar", value: 31 },
    ],
    precautions: [
      "Keep Pap tests on schedule",
      "Discuss HPV vaccination",
      "Report abnormal bleeding",
      "Follow up on results",
    ],
  },
};

// ════════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const StatCard = ({ icon, label, value, sub, color }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 2px 16px rgba(0,0,0,.06)",
      border: `2px solid ${color}18`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      flex: "1 1 160px",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}18`,
        display: "grid",
        placeItems: "center",
        fontSize: 22,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#1a1a2e",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: ".05em",
        }}
      >
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const StatBox = ({ label, value, color }) => (
  <div
    style={{
      background: "#f9fafb",
      borderRadius: 12,
      padding: "10px 14px",
      minWidth: 90,
      border: "1px solid #edf0f5",
    }}
  >
    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
  </div>
);

const SectionHead = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h2
      style={{
        margin: 0,
        fontSize: 18,
        fontWeight: 800,
        color: "#1a1a2e",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {title}
    </h2>
    {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{subtitle}</p>}
  </div>
);

const Badge = ({ text, color }) => (
  <span
    style={{
      background: `${color}18`,
      color: color,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".04em",
    }}
  >
    {text.toUpperCase()}
  </span>
);

const MiniChart = ({ data, color, title }) => {
  const metricKey = Object.keys(data[0]).find((k) => k !== "month");
  return (
    <div
      style={{
        background: "#fff",
        padding: 14,
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.05)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 8 }}>{title}</div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={metricKey}
            stroke={color}
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function UserAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [animKey, setAnimKey] = useState(0);
  const [awarenessKey, setAwarenessKey] = useState("dermatology");

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [activeTab]);

  const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "appts", label: "Appointments", icon: "📅" },
    { id: "health", label: "Health Trends", icon: "🩺" },
    { id: "alerts", label: "Alerts & Care", icon: "🔔" },
  ];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f5f6fa",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "28px 32px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.07)",
              width: `${260 + i * 120}px`,
              height: `${260 + i * 120}px`,
              top: `${-100 + i * -20}px`,
              right: `${-60 + i * -30}px`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,.5)",
                fontSize: 13,
                marginBottom: 6,
                letterSpacing: ".06em",
                fontWeight: 600,
              }}
            >
              PATIENT DASHBOARD
            </div>
            <h1
              style={{
                margin: 0,
                color: "#fff",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-.02em",
              }}
            >
              Hello, {MOCK_USER.name.split(" ")[0]} 👋
            </h1>
            <div
              style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 13,
                marginTop: 6,
              }}
            >
              Patient ID: {MOCK_USER.id} &nbsp;·&nbsp; {MOCK_USER.bloodGroup} &nbsp;·&nbsp; Age{" "}
              {MOCK_USER.age}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <select
              value={awarenessKey}
              onChange={(e) => setAwarenessKey(e.target.value)}
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              <option value="dermatology" style={{ color: "#111" }}>
                Dermatology
              </option>
              <option value="cancer" style={{ color: "#111" }}>
                World Cancer Day
              </option>
              <option value="breast" style={{ color: "#111" }}>
                Breast Awareness
              </option>
              <option value="cervical" style={{ color: "#111" }}>
                Cervical Awareness
              </option>
            </select>

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #e05c5c, #c45ce0)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 18,
                boxShadow: "0 4px 20px rgba(224,92,92,.4)",
              }}
            >
              {MOCK_USER.avatar}
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 32,
            position: "relative",
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                background: activeTab === t.id ? "#fff" : "rgba(255,255,255,.1)",
                color: activeTab === t.id ? "#1a1a2e" : "rgba(255,255,255,.7)",
                transition: "all .2s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "0 24px 40px", maxWidth: 1100, margin: "-52px auto 0" }}>
        <FadeIn key={animKey}>
          {activeTab === "overview" && <OverviewTab awarenessKey={awarenessKey} />}
          {activeTab === "appts" && <AppointmentsTab />}
          {activeTab === "health" && <HealthTab awarenessKey={awarenessKey} />}
          {activeTab === "alerts" && <AlertsTab awarenessKey={awarenessKey} />}
        </FadeIn>
      </div>
    </div>
  );
}

// fade wrapper
function FadeIn({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = 0;
    ref.current.style.transform = "translateY(12px)";
    requestAnimationFrame(() => {
      ref.current.style.transition = "opacity .35s ease, transform .35s ease";
      ref.current.style.opacity = 1;
      ref.current.style.transform = "translateY(0)";
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}

function AwarenessPanel({ awarenessKey }) {
  const campaign = AWARENESS_CAMPAIGNS[awarenessKey];
  const currentValue = campaign.trendData[campaign.trendData.length - 1]?.value ?? 0;
  const previousValue = campaign.trendData[campaign.trendData.length - 2]?.value ?? 0;
  const diff = currentValue - previousValue;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "5px 10px",
              borderRadius: 20,
              background: `${campaign.color}15`,
              color: campaign.color,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".06em",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            {campaign.department}
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 900,
              color: "#1a1a2e",
              letterSpacing: "-.02em",
            }}
          >
            {campaign.title}
          </h3>

          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
            {campaign.subtitle}
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <StatBox label="Current" value={currentValue} color={campaign.color} />
            <StatBox label="Last Month" value={previousValue} color="#94a3b8" />
            <StatBox
              label="Change"
              value={diff >= 0 ? `+${diff}` : diff}
              color={diff >= 0 ? "#ef4444" : "#22c55e"}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 16,
            }}
          >
            {campaign.precautions.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "10px 12px",
                  border: "1px solid #eee",
                  fontSize: 12,
                  color: "#4b5563",
                }}
              >
                ⚡ {tip}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(180deg, #fafafa, #ffffff)",
            borderRadius: 16,
            padding: 18,
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#1a1a2e",
                marginBottom: 4,
              }}
            >
              {campaign.graphLabel} Trend
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Analytics below the awareness notice
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={campaign.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={campaign.color}
                strokeWidth={3}
                dot={{ r: 4, fill: campaign.color, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={campaign.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke={campaign.color}
                fill={campaign.color}
                fillOpacity={0.18}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
function OverviewTab({ awarenessKey }) {
  const campaign = AWARENESS_CAMPAIGNS[awarenessKey];

  return (
    <div style={{ paddingTop: 24 }}>
      <AwarenessPanel awarenessKey={awarenessKey} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon="📅" label="Total Appointments" value={16} sub="Since registration" color="#5c8de0" />
        <StatCard icon="⏳" label="Upcoming" value={2} sub="Next: 28 Mar" color="#5cc4a8" />
        <StatCard icon="✅" label="Completed" value={14} sub="Last: 10 Mar" color="#e0b95c" />
        <StatCard icon="🏥" label="Depts Visited" value={5} sub="Most: General" color="#c45ce0" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginTop: 20,
          marginBottom: 24,
        }}
      >
        <MiniChart data={APPOINTMENT_MONTHLY} color="#5c8de0" title="Visits" />
        <MiniChart data={HEALTH_HISTORY} color="#e05c5c" title="Severity" />
        <MiniChart data={campaign.trendData} color={campaign.color} title="Disease Trend" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 16px rgba(0,0,0,.06)",
          }}
        >
          <SectionHead title="Monthly Visit Trend" subtitle="Last 7 months" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={APPOINTMENT_MONTHLY}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5c8de0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5c8de0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#5c8de0"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ r: 4, fill: "#5c8de0" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 16px rgba(0,0,0,.06)",
          }}
        >
          <SectionHead title="Visits by Department" subtitle="All time" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={DEPT_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {DEPT_DISTRIBUTION.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════
function AppointmentsTab() {
  const [view, setView] = useState("upcoming");

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["upcoming", "past"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              background: view === v ? "#1a1a2e" : "#fff",
              color: view === v ? "#fff" : "#6b7280",
              boxShadow: "0 2px 8px rgba(0,0,0,.06)",
            }}
          >
            {v === "upcoming" ? "⏳ Upcoming" : "✅ Past"}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
          marginBottom: 20,
        }}
      >
        <SectionHead title="Appointments Overview" subtitle="Graphical monthly appointment pattern" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={APPOINTMENT_MONTHLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="visits" fill="#5c8de0" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {(view === "upcoming" ? UPCOMING : PAST).map((appt) => (
          <div
            key={appt.id}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              borderLeft: `4px solid ${
                view === "upcoming"
                  ? appt.status === "confirmed"
                    ? "#5cc4a8"
                    : "#e0b95c"
                  : "#5c8de0"
              }`,
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#f5f6fa",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                }}
              >
                🏥
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{appt.dept}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{appt.doctor}</div>
                {appt.diagnosis && (
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    Diagnosis: {appt.diagnosis}
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{appt.date}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{appt.time}</div>
              {appt.status && (
                <div style={{ marginTop: 6 }}>
                  <Badge
                    text={appt.status}
                    color={appt.status === "confirmed" ? "#5cc4a8" : "#e0b95c"}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: HEALTH TRENDS
// ════════════════════════════════════════════════════════════════════════════
function HealthTab({ awarenessKey }) {
  const campaign = AWARENESS_CAMPAIGNS[awarenessKey];
  const awarenessMiniData = useMemo(
    () => campaign.trendData.map((item) => ({ month: item.month, value: item.value })),
    [campaign]
  );

  return (
    <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >
        <SectionHead
          title={`${campaign.title} Trend`}
          subtitle="Focused awareness analytics"
        />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={awarenessMiniData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={campaign.color}
              strokeWidth={3}
              dot={{ r: 5, fill: campaign.color, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >
        <SectionHead
          title="Awareness Cases by Month"
          subtitle="Bar view for easier month comparison"
        />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={awarenessMiniData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill={campaign.color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >
        <SectionHead
          title="Personal Health Severity Index"
          subtitle="Higher value = more significant health event that month"
        />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={HEALTH_HISTORY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="severity"
              stroke="#e05c5c"
              strokeWidth={3}
              dot={{ r: 5, fill: "#e05c5c", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >
        <SectionHead
          title="Most Visited Departments"
          subtitle="Based on your full appointment history"
        />
        {DEPT_DISTRIBUTION.slice()
          .sort((a, b) => b.value - a.value)
          .map((d, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <span>{d.name}</span>
                <span>{d.value} visits</span>
              </div>
              <div style={{ height: 8, background: "#f0f0f0", borderRadius: 8 }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 8,
                    background: d.color,
                    width: `${(d.value / 6) * 100}%`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB: ALERTS & CARE
// ════════════════════════════════════════════════════════════════════════════
function AlertsTab({ awarenessKey }) {
  const sev = { high: "#e05c5c", medium: "#e0b95c", low: "#5cc4a8" };
  const campaign = AWARENESS_CAMPAIGNS[awarenessKey];

  return (
    <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #fff8fb, #ffffff)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
          border: `1px solid ${campaign.color}22`,
        }}
      >
        <SectionHead title={campaign.title} subtitle={campaign.subtitle} />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={campaign.trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke={campaign.color}
              fill={campaign.color}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <SectionHead
          title="Seasonal Health Alerts"
          subtitle="Visual severity indicators"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SEASONAL_ALERTS.map((a, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "16px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e" }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{a.desc}</div>
                </div>
                <Badge text={a.severity} color={sev[a.severity]} />
              </div>

              <div
                style={{
                  height: 8,
                  background: "#eee",
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    width: `${a.score}%`,
                    height: "100%",
                    background: sev[a.severity],
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHead
          title="Preventive Care Suggestions"
          subtitle="Progress-style visual care guidance"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CARE_SUGGESTIONS.map((c, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #fff)",
                borderRadius: 14,
                padding: "16px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#f0f2ff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#5c8de0",
                      marginBottom: 2,
                    }}
                  >
                    {c.dept}
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{c.tip}</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  height: 6,
                  background: "#eee",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    width: `${c.progress}%`,
                    height: "100%",
                    background: "#5c8de0",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}