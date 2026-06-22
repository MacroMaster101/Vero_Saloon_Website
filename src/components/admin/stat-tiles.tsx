export interface StatTile { k: string; n: string; sub: string }

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="adash__tiles">
      {tiles.map((t) => (
        <div key={t.k} className="atile">
          <div className="atile__k">{t.k}</div>
          <div className="atile__n" dangerouslySetInnerHTML={{ __html: t.n }} />
          <div className="atile__sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
