// App-level loading UI shown during route navigation / server data fetches.
// A trimmed version of the homepage splash — the gold brand badge + spinner.
export default function Loading() {
  return (
    <div className="home-route-loader" role="status" aria-label="Loading">
      <div className="home-loader-badge">
        <span className="home-loader-ring home-loader-ring--outer" />
        <span className="home-loader-ring home-loader-ring--inner" />
        <span className="home-loader-mark">V</span>
      </div>
      <span className="home-loader-sub">Loading</span>
    </div>
  );
}
