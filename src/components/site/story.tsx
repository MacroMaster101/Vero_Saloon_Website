import { ImgSlot } from '@/components/site/img-slot';
import { BLOCK_DEFAULTS, type StoryContent } from '@/lib/content/blocks';

export function Story({ content = BLOCK_DEFAULTS.story }: { content?: StoryContent }) {
  return (
    <section className="section story" id="story">
      <div className="wrap story__grid">
        <div className="story__art reveal">
          <div className="pole"></div>
          <ImgSlot src="/images/story/interior.png" alt="Salon interior" />
        </div>
        <div className="story__copy reveal">
          <span className="eyebrow gold">{content.eyebrow}</span>
          <h2 className="h-section">{content.heading}</h2>
          {content.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <div className="story__stats">
            <div className="stat"><b>4.9★</b><span>Google rating</span></div>
            <div className="stat"><b>Unisex</b><span>Him &amp; her</span></div>
            <div className="stat"><b>Daily</b><span>10 AM – 12 AM</span></div>
          </div>
          <div className="story__sign">{content.sign}</div>
        </div>
      </div>
    </section>
  );
}
