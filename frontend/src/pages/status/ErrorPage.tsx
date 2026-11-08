import "./status.css";

export default function ErrorPage() {
  return (
    <div className="status-page">
      <h1>Oops</h1>
      <p>Something went wrong.</p>
      <button type="button" onClick={() => window.location.assign("/")}>
        Back to home
      </button>
    </div>
  );
}
