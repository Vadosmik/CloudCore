import { Link } from "react-router";
import "./status.css";

export default function ForbiddenPage() {
  return (
    <div className="status-page">
      <h1>403</h1>
      <p>You don't have access to this page.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}
