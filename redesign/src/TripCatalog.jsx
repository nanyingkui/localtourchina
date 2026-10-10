import { englishPricingNote } from './english-pricing.mjs';
import React, { useId, useState } from 'react';
import {
  tripCatalog, PARTY_TIERS, catalogCopy, catalogLanguage, packageTitle,
  tripDuration, getTripPrice, formatTripPrice, validPartySize, partyFromSearch,
} from './trip-catalog.mjs';

function TripCard({ product, lang, onSelect }) {
  const id = useId();
  const [expanded, setExpanded] = useState(() => typeof location !== 'undefined' && new URLSearchParams(location.search).get('product') === product.id);
  const [initialPax] = useState(() => partyFromSearch(product, typeof location === 'undefined' ? '' : location.search));
  const [tier, setTier] = useState(PARTY_TIERS.includes(initialPax) ? String(initialPax) : 'custom');
  const [customPax, setCustomPax] = useState(PARTY_TIERS.includes(initialPax) ? '3' : String(initialPax));
  const t = catalogCopy[lang];
  const c = product.copy[lang];
  const selectedPax = tier === 'custom' ? customPax : tier;
  const validPax = validPartySize(selectedPax);
  const price = getTripPrice(product, selectedPax);
  const trekking = product.kind === 'trekking';

  return <article id={`trip-${product.id}`} className="trip-catalog-card" data-trip-id={product.id} aria-labelledby={`${id}-title`}>
    <img className="trip-catalog-image" src={product.image.src} srcSet={product.image.srcSet}
      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px"
      width={product.image.width} height={product.image.height} alt={product.image.alt[lang]}
      loading="lazy" decoding="async" />
    <div className="trip-catalog-body">
      <div className="trip-catalog-meta">
        <span className={`trip-catalog-badge${trekking ? ' is-trekking' : ''}`}>{trekking ? t.trekkingBadge : t.regularBadge}</span>
        <span>{tripDuration(product, lang)}</span>
      </div>
      <h4 id={`${id}-title`}>{packageTitle(product, lang)}</h4>
      <p className="trip-catalog-tagline">{c.tagline}</p>

      <p className={`trip-catalog-walking${trekking ? ' is-high' : ''}`}><strong>{t.walkingLabel}</strong> {c.walking}</p>


      <div className="trip-catalog-price" aria-live="polite" aria-atomic="true">
        <span>{t.reference}{validPax ? ` · ${t.pax(Number(selectedPax))}` : ''}</span>
        <strong>{formatTripPrice(price, lang)}</strong>
        {price !== null && <span>{t.unit}</span>}
      </div>
      <p className="trip-catalog-price-note">{t.basis}<br />{t.priceNote}{lang==='en'&&<><br />{englishPricingNote}</>}</p>

      <details className="trip-configuration" open={!validPax || expanded} onToggle={event => { if (!validPax && !event.currentTarget.open) event.currentTarget.open = true; setExpanded(event.currentTarget.open); }}><summary>{lang==='ko'?'인원·포함사항·일정 확인':lang==='zh'?'查看人数、包含项目与行程':'Party size, inclusions & itinerary'}<span aria-hidden="true"> +</span></summary><div className="trip-configuration-body">
      <ul className="trip-catalog-highlights">{c.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
      <fieldset className="trip-catalog-party" aria-describedby={`${id}-party-help`}>
        <legend>{t.party}</legend>
        <div className="trip-catalog-tiers">
          {[...PARTY_TIERS.map(String), 'custom'].map(value => <label key={value} className={tier === value ? 'is-selected' : undefined}>
            <input type="radio" name={`${id}-pax`} value={value} checked={tier === value} onChange={() => setTier(value)} />
            <span>{value === 'custom' ? t.custom : t.pax(Number(value))}</span>
          </label>)}
        </div>
        {tier === 'custom' && <div className="trip-catalog-custom">
          <label htmlFor={`${id}-custom`}>{t.customLabel}</label>
          <input id={`${id}-custom`} type="number" inputMode="numeric" min="1" max="30" step="1"
            value={customPax} onChange={event => setCustomPax(event.target.value)}
            aria-invalid={!validPax || undefined} aria-describedby={`${id}-party-help`} />
        </div>}
        <p id={`${id}-party-help`} className="trip-catalog-price-note">{t.customHelp}</p>
      </fieldset>

      <dl className="trip-catalog-inclusions">
        <div><dt>{t.includedLabel}</dt><dd>{t.included}</dd></div>
        <div><dt>{t.excludedLabel}</dt><dd>{t.excluded}</dd></div>
      </dl>
      <p className="trip-catalog-price-note">{t.inclusionNote}</p>
      <details className="trip-catalog-details">
        <summary>{t.details}<span aria-hidden="true"> +</span></summary>
        <ol className="trip-catalog-days">{c.itinerary.map((day, index) => <li key={index}>
          <strong>{t.day(index + 1)}</strong><p>{day}</p>
        </li>)}</ol>
        <p className="trip-catalog-price-note">{t.itineraryNote}</p>
      </details>
      </div></details>
      <button type="button" className="trip-catalog-action button primary" disabled={!validPax || typeof onSelect !== 'function'}
        onClick={() => onSelect?.(product, Number(selectedPax))}>{t.action}<span aria-hidden="true"> →</span></button>
    </div>
  </article>;
}

export default function TripCatalog({ lang = 'ko', onSelect, compactHeading = false }) {
  const language = catalogLanguage(lang);
  const t = catalogCopy[language];
  const id = useId();
  return <section className="trip-catalog" id="zhangjiajie-trips" aria-labelledby={`${id}-heading`}>
    <header className={compactHeading ? "trip-catalog-heading sr-only" : "trip-catalog-heading"}>
      <p className="trip-catalog-kicker">{t.kicker}</p>
      <h2 id={`${id}-heading`}>{t.title}</h2>
      <p className="trip-catalog-intro">{t.intro}</p>
    </header>
    {['regular', 'trekking'].map(kind => <section className={`trip-catalog-group trip-catalog-group-${kind}`} key={kind} aria-labelledby={`${id}-${kind}`}>
      <div className="trip-catalog-group-heading">
        <h3 id={`${id}-${kind}`}>{kind === 'regular' ? t.regularTitle : t.trekkingTitle}</h3>
        <p>{kind === 'regular' ? t.regularIntro : t.trekkingIntro}</p>
        <div className="trip-browse-controls" aria-label={language==='ko'?'다른 패키지 보기':language==='zh'?'浏览更多 打包行程':'Browse more packages'}>{[-1,1].map(direction=><button key={direction} type="button" aria-label={direction<0?(language==='ko'?'이전 패키지':language==='zh'?'上一条 打包行程':'Previous package'):(language==='ko'?'다음 패키지':language==='zh'?'下一条 打包行程':'Next package')} onClick={event=>{const grid=event.currentTarget.closest('.trip-catalog-group').querySelector('.trip-catalog-grid');grid.scrollBy({left:direction*(grid.firstElementChild.getBoundingClientRect().width+20),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{direction<0?'‹':'›'}</button>)}</div>
      </div>
      <div className="trip-catalog-grid">{tripCatalog.filter(product => product.kind === kind).map(product =>
        <TripCard key={product.id} product={product} lang={language} onSelect={onSelect} />
      )}</div>
    </section>)}
    <aside className="trip-catalog-terms" aria-labelledby={`${id}-terms`}>
      <h3 id={`${id}-terms`}>{t.termsTitle}</h3>
      <div><h4>{t.hotelTitle}</h4><p>{t.hotels}</p></div>
      <div><h4>{t.vehicleTitle}</h4><p>{t.vehicle}</p><p>{t.meals}</p></div>
      <div><h4>{t.quoteTitle}</h4><p>{t.seasons}</p><p>{t.special}</p></div>
    </aside>
  </section>;
}
