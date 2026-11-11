import React, {useEffect, useRef, useState} from 'react';
import data from './data/products.json' with { type: 'json' };
import {CUSTOMER_CHAT_URL, copyChannelBrief} from './chat-handoff.mjs';
import './product-matrix.css';

const t = data.ui_ko;
const money = value => value == null ? t.ask : value === 0 ? t.zero : `₩${value.toLocaleString('ko-KR')}`;
const duration = p => `${p.nights}${t.night} ${p.days}${t.day}`;
const price = (p, pax, season) => pax === 1 ? p.solo_price_krw[season] : p.price_per_person_krw[season][pax];
const priceLabel = value => `${t.per_person} ${money(value)}${t.from}`;
const groups = [...data.styles.map(s => ({...s, products:data.products.filter(p => p.style === s.id && p.tier !== 'guide_car')})), {id:'guide_car',name_ko:data.tiers.find(tier => tier.id === 'guide_car').name_ko,products:data.products.filter(p => p.tier === 'guide_car')}];
const days = [...new Set(data.products.map(p => p.days))].sort((a,b) => a-b);
function List({items}) { return <ul>{items.map((text,i) => <li key={i}>{text}</li>)}</ul>; }
function Options({label, values, value, onChange}) {
  return <fieldset className="pm-control"><legend>{label}</legend><div>{values.map(([id,text]) => <button type="button" key={id} aria-pressed={value===id} onClick={() => onChange(id)}>{text}</button>)}</div></fieldset>;
}
function Supplement({product}) {
  const s = product.single_supplement_krw;
  if (!s) return null;
  return <div><h5>{t.supplement}</h5><p>{s.note_ko}</p>{[['standard_hotel',t.standard],['five_star_upgrade',t.five_star]].map(([key,label]) => s[key] && <p key={key}>{label} · {product.nights}{t.night}: {Object.entries(s[key]).map(([season,value]) => `${t.seasons[season]} ${money(value)}`).join(' · ')}</p>)}</div>;
}
function Addon({addon, product, pax, season}) {
  const a = addon;
  const grouped = a.price_by_pax_krw && Object.entries(a.price_by_pax_krw).filter(([ids]) => !product || ids.split(',').map(id => id.trim()).includes(product.id));
  if (grouped && !grouped.length) return null;
  const selected = a.price_by_pax_season_krw?.[season]?.[pax];
  return <li><strong>{a.name_ko}</strong> · {a.unit_ko}
    {a.price_by_season_krw ? <p>{Object.entries(a.price_by_season_krw).map(([key,value]) => `${t.seasons[key]} ${money(value)}`).join(' · ')}</p> : grouped ? grouped.map(([ids,map]) => <p key={ids}>{!product && `${ids} · `}{money(map[pax])}</p>) : <p>{money(a.price_by_pax_season_krw ? selected : a.price_krw)}</p>}
    {a.note_ko && <p>{a.note_ko}</p>}{a.season_note_ko && <p>{a.season_note_ko}</p>}
  </li>;
}
function Card({product:p, pax, season, variantId, onVariant}) {
  const variant = p.variants?.find(v => v.id === variantId);
  const extra = variant ? data.add_ons.find(a => a.id === 'fenghuang_option').price_by_pax_season_krw[season][pax] : 0;
  const value = price(p,pax,season) + extra;
  const brief = [variant?.name_ko || p.name_ko, duration(p), `${t.party}: ${pax}${t.person}`, `${t.season}: ${t.seasons[season]}`, priceLabel(value), ...(pax === 1 ? [p.solo_note_ko] : [])].join('\n');
  const [notice,setNotice] = useState('');
  const manual = useRef(null), area = useRef(null);
  useEffect(() => setNotice(''), [brief]);
  async function copy() {
    const copied = await copyChannelBrief(brief);
    setNotice(copied ? t.copied : t.copy_failed);
    if (!copied) { manual.current.open = true; area.current.focus(); area.current.select(); }
  }
  return <article className="pm-card" id={`matrix-${p.id}`}>
    <span className={`pm-badge pm-${p.tier}`}>{p.tier_ko}</span><h4>{p.name_ko}</h4><p>{duration(p)}</p><p>{p.tagline_ko}</p>
    <List items={p.highlights_ko}/><p><strong>{t.walking}</strong> · {p.walking_ko}</p>
    <div className="pm-price"><strong>{priceLabel(value)}</strong><p>{pax===1 ? p.solo_note_ko : t.season_basis[season]}</p></div>
    {p.transport_note_ko && <p>{p.transport_note_ko}</p>}
    <details><summary>{t.details}</summary>
      <h5>{t.audience}</h5><List items={p.for_whom_ko}/>
      {p.variants && <Options label={t.itinerary} values={[[p.id,t.base_variant],...p.variants.map(v => [v.id,v.name_ko])]} value={variantId || p.id} onChange={onVariant}/>}
      {variant && <><p>{variant.name_ko}</p><p>{t.variant_addition}: {money(extra)} · {t.per_person}</p></>}
      <h5>{t.itinerary}</h5><ol>{(variant?.itinerary_ko || p.itinerary_ko).map((day,i) => <li key={i}>{day}</li>)}</ol>
      <h5>{t.included}</h5>{pax===1 && <p>{p.solo_note_ko}</p>}<List items={p.included_ko}/><p>{p.guide_note_ko}</p>
      {variant?.included_change_ko && <><h5>{t.changes}</h5><List items={variant.included_change_ko}/></>}
      <h5>{t.excluded}</h5><List items={p.excluded_ko}/>
      {p.transport_note_ko && <p>{p.transport_note_ko}</p>}
      <Supplement product={p}/><p>{p.other_pax_rule_ko}</p><p>{p.price_note_ko}</p>
      <h5>{t.before}</h5><List items={p.notes_ko || []}/>
      <h5>{t.addons}</h5><ul>{data.add_ons.filter(a => p.add_on_ids.includes(a.id)).map(a => <Addon key={a.id} addon={a} product={p} pax={pax} season={season}/>)}</ul>
    </details>
    <div className="pm-actions"><a className="button primary" href={CUSTOMER_CHAT_URL} target="_blank" rel="noopener noreferrer">{t.consult}</a><button type="button" onClick={copy}>{t.copy}</button></div>
    <p role="status">{notice}</p><details ref={manual}><summary>{t.manual}</summary><textarea ref={area} readOnly rows={6} aria-label={t.brief} value={brief} onFocus={e => e.currentTarget.select()}/></details>
  </article>;
}
export default function ProductMatrix() {
  // Deterministic SSR default. Read the shared query only after hydration.
  const [pax,setPax] = useState(4), [season,setSeason] = useState('regular'), [variants,setVariants] = useState({});
  const supported = [...(data.solo_pax_supported ? [1] : []),...data.pax_tiers];
  useEffect(() => {
    const read = () => { const value = Number(new URLSearchParams(window.location.search).get('pax')); setPax(supported.includes(value) ? value : 4); };
    read(); window.addEventListener('popstate',read); return () => window.removeEventListener('popstate',read);
  }, []);
  function changePax(value) { setPax(value); const url = new URL(window.location.href); url.searchParams.set('pax',value); window.history.replaceState(null,'',url); }
  const currentPrice = p => price(p,pax,season) + (p.variants?.some(v => v.id === variants[p.id]) ? data.add_ons.find(a => a.id==='fenghuang_option').price_by_pax_season_krw[season][pax] : 0);
  const rows = [[t.tier,p=>p.tier_ko],[t.style,p=>p.style_ko],[t.duration,duration],[t.walking,p=>p.walking_ko],...data.compare_keys_ko.map(key=>[key,p=>p.compare[key]]),[t.price,p=>priceLabel(currentPrice(p))]];
  const booking = data.booking_notice_ko;
  return <section className="product-matrix" id="zhangjiajie-trips" aria-labelledby="matrix-title">
    <header><h2 id="matrix-title">{t.title}</h2><p>{t.subtitle}</p></header>
    <Options label={t.party} values={supported.map(n=>[n,`${n}${t.person}`])} value={pax} onChange={changePax}/>
    <Options label={t.season} values={['regular','holiday'].map(s=>[s,t.seasons[s]])} value={season} onChange={setSeason}/>
    {groups.map(group => <section className="pm-group" key={group.id}><h3>{group.name_ko}</h3><div className="pm-grid">{days.map(day => <div className="pm-cell" key={day}>{group.products.filter(p=>p.days===day).map(p=><Card key={p.id} product={p} pax={pax} season={season} variantId={variants[p.id]} onVariant={id=>setVariants(v=>({...v,[p.id]:id}))}/>)}{!group.products.some(p=>p.days===day) && <span className="pm-empty" aria-hidden="true">—</span>}</div>)}</div></section>)}
    <section><h3>{t.compare}</h3>{groups.map(group=><details className="pm-comparison" open key={group.id}><summary>{group.name_ko}</summary><div className="pm-scroll" tabIndex={0} role="region" aria-label={`${t.compare} · ${group.name_ko}`}><table><caption>{group.name_ko}</caption><thead><tr><th scope="col">{t.compare}</th>{group.products.map(p=><th scope="col" key={p.id}>{p.name_ko}</th>)}</tr></thead><tbody>{rows.map(([label,get])=><tr key={label}><th scope="row">{label}</th>{group.products.map(p=><td key={p.id}>{get(p)}</td>)}</tr>)}</tbody></table></div></details>)}</section>
    <section><h3>{t.addons}</h3><ul className="pm-addons">{data.add_ons.map(a=><Addon key={a.id} addon={a} pax={pax} season={season}/>)}</ul></section>
    <section className="pm-notes"><h3>{t.price_notes}</h3>{[t.disclaimer,data.holiday_definition_ko,data.peak_definition_ko,data.guide_hours_rule_ko,data.odd_pax_rule_ko,data.solo_rule_ko].map(text=><p key={text}>{text}</p>)}{data.products.map(p=><details key={p.id}><summary>{p.name_ko}</summary><p>{p.other_pax_rule_ko}</p><Supplement product={p}/></details>)}</section>
    <section><h3>{t.booking}</h3><h4>{booking.title_schedule_ko}</h4><List items={booking.schedule_ko}/><h4>{booking.title_cancel_ko}</h4><p>{booking.confirmation_ko}</p><List items={booking.cancel_ko}/></section>
    <List items={data.service_notes_ko}/>
  </section>;
}
