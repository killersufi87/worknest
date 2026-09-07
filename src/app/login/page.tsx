import LoginForms from "./LoginForms"

export default function LoginPage() {
  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>WorkNest Login</h1>
      <p style={{ color: "#666" }}>
        Plain functional version — styling comes later in the UI/UX pass.
      </p>
      <LoginForms />
    </div>
  )
}
