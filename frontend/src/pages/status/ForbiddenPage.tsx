import "./status.css";
import LinkButton from "../../components/ui/button/LinkButton";

export default function ForbiddenPage() {
  return (
    <div className="status-page">
      <h1 className="status-page__code">403</h1>
      <p className="status-page__text">You don't have access to this page.</p>
      <LinkButton to="/">Back to home</LinkButton>
    </div>
  );
}
