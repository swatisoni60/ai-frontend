import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/chat");
  }, [navigate]);

  const handleLogin = () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    localStorage.setItem("user", username);
    navigate("/chat");
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          width: "350px",
          background: "#111827",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)"
        }}
      >
        <h1 style={{ color: "white", textAlign: "center" }}>
          🔐 Login
        </h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={btnStyle}>
          Login
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "15px",
  borderRadius: "10px",
  border: "none",
  background: "#1f2937",
  color: "white",
  fontSize: "16px"
};

const btnStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "20px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer"
};