const ITEMS = ['Hair Cuts', 'Colour', 'Beard Grooming', 'Facials', 'Bridal', 'Threading', 'Unisex'];

export function Marquee() {
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip__track">
        {ITEMS.map((t) => <span key={`a-${t}`}>{t}</span>)}
        {ITEMS.map((t) => <span key={`b-${t}`}>{t}</span>)}
      </div>
    </div>
  );
}
