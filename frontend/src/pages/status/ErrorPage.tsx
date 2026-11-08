import "./status.css";
import Button from "../../components/ui/button/Button";

export default function ErrorPage() {
  return (
    <div className="status-page">
      <h1 className="status-page__code">Oops</h1>
      <p className="status-page__text">Something went wrong.</p>
      <Button onClick={() => window.location.assign("/")}>Back to home</Button>
    </div>
  );
}
