import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart,
  Bar,
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
  ComposedChart,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
} from "recharts";

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════════
const DEPARTMENTS = [
  "All",
  "Cardiology",
  "Orthopedics",
  "General",
  "Neurology",
  "Dermatology",
  "Pediatrics",
];

const DOCTORS = [
  "All Doctors",
  "Dr. Priya Shah",
  "Dr. Rahul Nair",
  "Dr. Sunita Iyer",
  "Dr. Arun Mehta",
  "Dr. Kavya Das",
];

const APPT_MONTHLY = [
  { month: "Jan", total: 1140, growth: 11.8 },
  { month: "Feb", total: 1060, growth: -7.0 },
  { month: "Mar", total: 1230, growth: 16.0 },
  { month: "Apr", total: 1310, growth: 6.5 },
  { month: "May", total: 1280, growth: -2.3 },
  { month: "Jun", total: 1190, growth: -7.0 },
  { month: "Jul", total: 1255, growth: 5.5 },
  { month: "Aug", total: 1340, growth: 6.8 },
  { month: "Sep", total: 1385, growth: 3.4 },
  { month: "Oct", total: 1450, growth: 4.7 },
  { month: "Nov", total: 1415, growth: -2.4 },
  { month: "Dec", total: 1520, growth: 7.4 },
];

const APPT_YEARLY = [
  { year: "2021", total: 9800, awareness: 4 },
  { year: "2022", total: 11200, awareness: 5 },
  { year: "2023", total: 12650, awareness: 6 },
  { year: "2024", total: 13880, awareness: 7 },
  { year: "2025", total: 14960, awareness: 8 },
  { year: "2026", total: 15620, awareness: 9 },
];

const PEAK_HOURS = [
  { hour: "8am", load: 25 },
  { hour: "9am", load: 60 },
  { hour: "10am", load: 88 },
  { hour: "11am", load: 95 },
  { hour: "12pm", load: 70 },
  { hour: "1pm", load: 40 },
  { hour: "2pm", load: 55 },
  { hour: "3pm", load: 78 },
  { hour: "4pm", load: 82 },
  { hour: "5pm", load: 65 },
  { hour: "6pm", load: 38 },
  { hour: "7pm", load: 20 },
];

const DEPT_UTILIZATION = [
  { dept: "General", utilization: 94, capacity: 100, doctors: 5, load: "Overloaded" },
  { dept: "Cardiology", utilization: 82, capacity: 80, doctors: 4, load: "High" },
  { dept: "Pediatrics", utilization: 76, capacity: 80, doctors: 4, load: "Normal" },
  { dept: "Orthopedics", utilization: 68, capacity: 70, doctors: 3, load: "Normal" },
  { dept: "Neurology", utilization: 55, capacity: 60, doctors: 3, load: "Normal" },
  { dept: "Dermatology", utilization: 38, capacity: 60, doctors: 2, load: "Low" },
];

const DOCTOR_WORKLOAD = [
  { name: "Dr. Priya Shah", dept: "Cardiology", appts: 68, capacity: 80, rating: 4.8 },
  { name: "Dr. Sunita Iyer", dept: "General", appts: 92, capacity: 90, rating: 4.6 },
  { name: "Dr. Arun Mehta", dept: "General", appts: 88, capacity: 90, rating: 4.7 },
  { name: "Dr. Rahul Nair", dept: "Orthopedics", appts: 54, capacity: 70, rating: 4.5 },
  { name: "Dr. Kavya Das", dept: "Neurology", appts: 42, capacity: 60, rating: 4.9 },
];

const DISEASE_MONTHLY = [
  { month: "Sep", Hypertension: 48, Diabetes: 36, Flu: 22, Fractures: 18, Dermatitis: 12 },
  { month: "Oct", Hypertension: 52, Diabetes: 38, Flu: 35, Fractures: 20, Dermatitis: 14 },
  { month: "Nov", Hypertension: 55, Diabetes: 40, Flu: 68, Fractures: 22, Dermatitis: 16 },
  { month: "Dec", Hypertension: 50, Diabetes: 42, Flu: 82, Fractures: 24, Dermatitis: 15 },
  { month: "Jan", Hypertension: 58, Diabetes: 44, Flu: 60, Fractures: 19, Dermatitis: 18 },
  { month: "Feb", Hypertension: 62, Diabetes: 46, Flu: 40, Fractures: 21, Dermatitis: 20 },
  { month: "Mar", Hypertension: 65, Diabetes: 48, Flu: 30, Fractures: 23, Dermatitis: 22 },
];

const TOP_DISEASES = [
  { name: "Hypertension", count: 390, color: "#e05c5c" },
  { name: "Diabetes", count: 294, color: "#e0b95c" },
  { name: "Flu", count: 337, color: "#5c8de0" },
  { name: "Fractures", count: 147, color: "#c45ce0" },
  { name: "Dermatitis", count: 117, color: "#5cc4a8" },
];

const FORECAST = [
  { month: "Apr", predicted: 1310, actual: null },
  { month: "May", predicted: 1280, actual: null },
  { month: "Jun", predicted: 1190, actual: null },
];

const DISEASE_AWARENESS = {
  Hypertension: {
    dept: "Cardiology",
    color: "#e05c5c",
    severity: 78,
    precautions: ["BP camps", "Salt reduction", "Routine screening", "Exercise messaging"],
  },
  Diabetes: {
    dept: "General Medicine",
    color: "#e0b95c",
    severity: 66,
    precautions: ["Sugar screening", "Diet awareness", "Foot care", "Medication adherence"],
  },
  Flu: {
    dept: "General Medicine",
    color: "#5c8de0",
    severity: 58,
    precautions: ["Mask advisory", "Hydration", "Vaccination drive", "Crowd control messaging"],
  },
  Fractures: {
    dept: "Orthopedics",
    color: "#c45ce0",
    severity: 42,
    precautions: ["Fall prevention", "Road safety", "Bone health", "Casting readiness"],
  },
  Dermatitis: {
    dept: "Dermatology",
    color: "#5cc4a8",
    severity: 61,
    precautions: ["Heat advisory", "Skin hygiene", "Sun protection", "Early rash screening"],
  },
};

// ════════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const KPI = ({ icon, label, value, trend, trendVal, color }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 2px 16px rgba(0,0,0,.06)",
      border: `1.5px solid ${color}20`,
      flex: "1 1 180px",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}18`,
          display: "grid",
          placeItems: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 20,
          background: trend === "up" ? "#dcfce7" : "#fee2e2",
          color: trend === "up" ? "#16a34a" : "#dc2626",
        }}
      >
        {trend === "up" ? "↑" : "↓"} {trendVal}
      </span>
    </div>
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 600,
          marginTop: 2,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

const MiniMetric = ({ label, value, color }) => (
  <div
    style={{
      background: "#f8fafc",
      borderRadius: 12,
      padding: "12px 14px",
      border: "1px solid #e2e8f0",
      minWidth: 110,
    }}
  >
    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
  </div>
);

const Panel = ({ children, title, subtitle, action }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 18,
      padding: 24,
      boxShadow: "0 2px 16px rgba(0,0,0,.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {title}
        </h3>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const loadColor = {
  Overloaded: "#ef4444",
  High: "#f97316",
  Normal: "#22c55e",
  Low: "#94a3b8",
};

const DEPT_COLORS = ["#e05c5c", "#5c8de0", "#5cc4a8", "#c45ce0", "#e0b95c", "#60a5fa"];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [dateRange, setDateRange] = useState("monthly");
  const [deptFilter, setDeptFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [selectedDisease, setSelectedDisease] = useState("Dermatitis");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [activeTab]);

  const TABS = [
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "departments", icon: "🏥", label: "Departments" },
    { id: "diseases", icon: "🦠", label: "Disease Trends" },
    { id: "yearly", icon: "📆", label: "Yearly Trends" },
    { id: "forecasting", icon: "🔮", label: "Forecasting" },
  ];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f1f5f9",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
            }}
          >
            ⚕️
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-.01em" }}>
              HMS Analytics
            </div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Admin Portal · MediCore Hospital</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ color: "#64748b", fontSize: 13 }}>📍 Mumbai</div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6,#8b5cf6)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            AD
          </div>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ width: 220, background: "#0f172a", padding: "24px 16px", flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 4,
                background: activeTab === t.id ? "rgba(59,130,246,.2)" : "transparent",
                color: activeTab === t.id ? "#60a5fa" : "#64748b",
                borderLeft: activeTab === t.id ? "3px solid #3b82f6" : "3px solid transparent",
                transition: "all .2s",
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}

          <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20 }}>
            <div
              style={{
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                marginBottom: 12,
              }}
            >
              FILTERS
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Date Range</div>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={sidebarSelectStyle}>
                {["monthly", "quarterly", "yearly"].map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Department</div>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={sidebarSelectStyle}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Doctor</div>
              <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} style={sidebarSelectStyle}>
                {DOCTORS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Disease Focus</div>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                style={sidebarSelectStyle}
              >
                {Object.keys(DISEASE_AWARENESS).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "28px 28px 40px", overflow: "auto" }}>
          <FadeIn key={animKey}>
            {activeTab === "appointments" && <AppointmentsSection dateRange={dateRange} dept={deptFilter} />}
            {activeTab === "departments" && <DepartmentsSection dept={deptFilter} />}
            {activeTab === "diseases" && <DiseasesSection selectedDisease={selectedDisease} />}
            {activeTab === "yearly" && <YearlySection />}
            {activeTab === "forecasting" && <ForecastSection />}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

const sidebarSelectStyle = {
  width: "100%",
  background: "#1e293b",
  color: "#e2e8f0",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 12,
  fontFamily: "inherit",
};

function FadeIn({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = 0;
    ref.current.style.transform = "translateY(10px)";
    requestAnimationFrame(() => {
      ref.current.style.transition = "opacity .3s ease, transform .3s ease";
      ref.current.style.opacity = 1;
      ref.current.style.transform = "translateY(0)";
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}

// ════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════
function AppointmentsSection({ dateRange, dept }) {
  return (
    <div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
        }}
      >
        Appointment Analytics
      </h2>
      <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14 }}>
        Visual monthly appointment intelligence · {dateRange} view
        {dept !== "All" ? ` · ${dept}` : ""}
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KPI icon="📅" label="Total Appts (Dec)" value="1,520" trend="up" trendVal="7.4%" color="#3b82f6" />
        <KPI icon="📈" label="vs Last Month" value="+105" trend="up" trendVal="MoM" color="#22c55e" />
        <KPI icon="⏰" label="Avg Wait Time" value="18m" trend="up" trendVal="2m↑" color="#f97316" />
        <KPI icon="❌" label="Cancellations" value="47" trend="down" trendVal="12%" color="#ef4444" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <MiniMetric label="Peak Day Load" value="95%" color="#ef4444" />
        <MiniMetric label="Monthly Avg" value="1,281" color="#3b82f6" />
        <MiniMetric label="Forecast Ready" value="91%" color="#8b5cf6" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Panel title="Monthly Growth Trend" subtitle="Jan to Dec appointments and growth %">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={APPT_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.12)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId="left"
                dataKey="total"
                fill="#3b82f620"
                radius={[6, 6, 0, 0]}
                name="Appointments"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="growth"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                name="Growth %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <Panel title="Peak Hours Analysis" subtitle="Average hourly load (%)">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={PEAK_HOURS}>
              <defs>
                <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.12)",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={80}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }}
              />
              <Area type="monotone" dataKey="load" stroke="#f97316" strokeWidth={2.5} fill="url(#peakGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Peak Load Gauge" subtitle="Current operations stress">
          <ResponsiveContainer width="100%" height={190}>
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ name: "load", value: 82, fill: "#f97316" }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={10} />
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="900" fill="#0f172a">
                82%
              </text>
              <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#94a3b8">
                current load
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ════════════════════════════════════════════════════════════════════════════
function DepartmentsSection({ dept }) {
  return (
    <div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
        }}
      >
        Department Utilization
      </h2>
      <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14 }}>
        Capacity, workload distribution, and operational health
        {dept !== "All" ? ` · ${dept}` : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        {DEPT_UTILIZATION.slice(0, 3).map((d) => (
          <div
            key={d.dept}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,.05)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{d.dept}</div>
            <ResponsiveContainer width="100%" height={110}>
              <RadialBarChart
                innerRadius="65%"
                outerRadius="100%"
                data={[{ value: d.utilization, fill: loadColor[d.load] }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
                <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="900" fill="#0f172a">
                  {d.utilization}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 11, color: loadColor[d.load], fontWeight: 800 }}>{d.load}</div>
          </div>
        ))}
      </div>

      <Panel
        title="Department Capacity Utilization"
        subtitle="Live snapshot"
        action={<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>UPDATED 2 MIN AGO</span>}
      >
        <div>
          {DEPT_UTILIZATION.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 0",
                borderBottom: i < DEPT_UTILIZATION.length - 1 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <div style={{ width: 140, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{d.dept}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 8,
                      background:
                        d.utilization >= 90
                          ? "#ef4444"
                          : d.utilization >= 75
                          ? "#f97316"
                          : d.utilization >= 50
                          ? "#22c55e"
                          : "#94a3b8",
                      width: `${d.utilization}%`,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
              <div style={{ width: 50, textAlign: "right", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                {d.utilization}%
              </div>
              <div style={{ width: 80 }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    background: `${loadColor[d.load]}20`,
                    color: loadColor[d.load],
                  }}
                >
                  {d.load}
                </span>
              </div>
              <div style={{ width: 100, fontSize: 12, color: "#94a3b8" }}>👨‍⚕️ {d.doctors} doctors</div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <Panel title="Doctor Workload Distribution" subtitle="Appointments vs capacity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DOCTOR_WORKLOAD} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: "#475569", width: 110 }}
                axisLine={false}
                tickLine={false}
                width={112}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.12)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="capacity" fill="#f1f5f9" radius={[0, 4, 4, 0]} name="Capacity" />
              <Bar dataKey="appts" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Utilization Share by Department" subtitle="Current month">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={DEPT_UTILIZATION}
                dataKey="utilization"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={44}
                paddingAngle={2}
              >
                {DEPT_UTILIZATION.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                  fontSize: 12,
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DISEASES
// ════════════════════════════════════════════════════════════════════════════
function DiseasesSection({ selectedDisease }) {
  const diseaseInfo = DISEASE_AWARENESS[selectedDisease];

  const trendData = useMemo(
    () =>
      DISEASE_MONTHLY.map((item) => ({
        month: item.month,
        value: item[selectedDisease],
      })),
    [selectedDisease]
  );

  const currentValue = trendData[trendData.length - 1]?.value ?? 0;
  const previousValue = trendData[trendData.length - 2]?.value ?? 0;
  const delta = currentValue - previousValue;
  const direction = delta >= 0 ? "up" : "down";

  const miniBars = diseaseInfo.precautions.map((item, i) => ({
    name: item,
    score: 55 + i * 10,
  }));

  return (
    <div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
        }}
      >
        Disease Trends
      </h2>
      <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14 }}>
        Focused single-disease analytics for awareness campaigns and prevention planning
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <KPI
          icon="🩺"
          label={`${selectedDisease} Cases`}
          value={currentValue}
          trend={direction}
          trendVal={`${Math.abs(delta)} vs last month`}
          color={diseaseInfo.color}
        />
        <KPI
          icon="🏥"
          label="Department"
          value={diseaseInfo.dept}
          trend="up"
          trendVal="active"
          color={diseaseInfo.color}
        />
        <KPI
          icon="📣"
          label="Awareness Severity"
          value={`${diseaseInfo.severity}%`}
          trend="up"
          trendVal="campaign"
          color={diseaseInfo.color}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title={`${selectedDisease} Trend`} subtitle="Monthly case trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,.12)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={diseaseInfo.color}
                strokeWidth={3}
                dot={{ r: 4, fill: diseaseInfo.color, stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="diseaseArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={diseaseInfo.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={diseaseInfo.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Area type="monotone" dataKey="value" stroke={diseaseInfo.color} fill="url(#diseaseArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Awareness Gauge" subtitle="Quick visual status">
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              innerRadius="68%"
              outerRadius="100%"
              data={[{ value: diseaseInfo.severity, fill: diseaseInfo.color }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" cornerRadius={12} />
              <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="900" fill="#0f172a">
                {diseaseInfo.severity}%
              </text>
              <text x="50%" y="68%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#94a3b8">
                awareness risk
              </text>
            </RadialBarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniMetric label="This Month" value={currentValue} color={diseaseInfo.color} />
            <MiniMetric label="Department" value={diseaseInfo.dept.split(" ")[0]} color="#0f172a" />
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Panel title="Precaution Campaign Priority" subtitle="Graph-based planning">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={miniBars} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="score" fill={diseaseInfo.color} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Disease Distribution Snapshot" subtitle="All-time context">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={TOP_DISEASES}
                dataKey="count"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={42}
                paddingAngle={2}
              >
                {TOP_DISEASES.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// YEARLY
// ════════════════════════════════════════════════════════════════════════════
function YearlySection() {
  return (
    <div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
        }}
      >
        Yearly Trends & Awareness Planning
      </h2>
      <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14 }}>
        Yearly growth, campaign planning, and long-term hospital trend tracking
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <KPI icon="📆" label="2026 YTD" value="15,620" trend="up" trendVal="4.4%" color="#22c55e" />
        <KPI icon="🏥" label="Campaigns" value="12" trend="up" trendVal="annual" color="#3b82f6" />
        <KPI icon="📣" label="Awareness Events" value="8" trend="up" trendVal="planned" color="#c45ce0" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <Panel title="Yearly Appointment Trend" subtitle="Long-term hospital growth">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={APPT_YEARLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip />
              <Bar yAxisId="left" dataKey="total" fill="#22c55e22" radius={[6, 6, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FORECASTING
// ════════════════════════════════════════════════════════════════════════════
function ForecastSection() {
  const combined = [
    ...APPT_MONTHLY.map((d) => ({ ...d, type: "actual" })),
    ...FORECAST.map((d) => ({ ...d, type: "forecast" })),
  ];

  return (
    <div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-.02em",
        }}
      >
        Predictive Insights & Forecasting
      </h2>
      <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14 }}>
        ML-powered appointment forecasting · graph-first view
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
          borderRadius: 14,
          padding: "16px 24px",
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {[
          { label: "Model Accuracy", value: "91.4%", icon: "🎯" },
          { label: "Forecast Horizon", value: "90 days", icon: "📆" },
          { label: "Last Trained", value: "21 Mar", icon: "🤖" },
          { label: "Confidence Band", value: "±8%", icon: "📊" },
        ].map((m, i) => (
          <div key={i}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
              {m.icon} {m.label}
            </div>
            <div style={{ color: "#f1f5f9", fontWeight: 900, fontSize: 18 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <Panel
        title="Appointment Load Forecast"
        subtitle="Actual vs predicted"
        action={
          <span
            style={{
              fontSize: 11,
              padding: "4px 10px",
              background: "#dbeafe",
              color: "#2563eb",
              borderRadius: 20,
              fontWeight: 700,
            }}
          >
            ML MODEL v2.1
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[700, 1700]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <ReferenceLine
              x="Dec"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "Today", fill: "#94a3b8", fontSize: 10 }}
            />
            <Area
              dataKey="total"
              fill="#3b82f615"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              name="Actual"
            />
            <Line
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
              name="Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
        {[
          { month: "April 2026", appts: "1,310", change: "+6.5%", color: "#22c55e" },
          { month: "May 2026", appts: "1,280", change: "−2.3%", color: "#f97316" },
          { month: "June 2026", appts: "1,190", change: "−7.0%", color: "#94a3b8" },
        ].map((f, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "0 2px 12px rgba(0,0,0,.05)",
              borderTop: `3px solid ${f.color}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              {f.month}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-.02em",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {f.appts}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.change} vs prior month</div>
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
                  width: i === 0 ? "82%" : i === 1 ? "58%" : "44%",
                  height: "100%",
                  background: f.color,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}