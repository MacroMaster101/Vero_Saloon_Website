// A row of dashboard stat tiles. `n` is the headline value (a count or short
// label) and is rendered as plain text — never raw HTML — so callers can pass
// derived data without opening an XSS hole.
export interface StatTile { k: string; n: string; sub: string }

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="adash__tiles">
      {tiles.map((t) => (
        <div key={t.k} className="atile">
          <div className="atile__k">{t.k}</div>
          <div className="atile__n">{t.n}</div>
          <div className="atile__sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
