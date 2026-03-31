import { useState } from "react";
import AdminAnalytics from "./AdminAnalytics";
import Useranalytics from "./Useranalytics";

function App() {
  const [view, setView] = useState("admin");

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/* SIMPLE SWITCH */}
      <div style={{
        padding: "10px",
        background: "#111",
        display: "flex",
        gap: "10px"
      }}>
        <button onClick={() => setView("admin")}>Admin</button>
        <button onClick={() => setView("user")}>User</button>
      </div>

      {/* CONTENT */}
      <div style={{ height: "calc(100% - 50px)" }}>
        {view === "admin" ? <AdminAnalytics /> : <Useranalytics />}
      </div>
    </div>
  );
}

export default App;