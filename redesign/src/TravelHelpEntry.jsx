import React from 'react';
import './travel-help-entry.css';
const cases=[['장가계','삼림공원 재입장, 가족 예약이 빠졌다면','S153'],['후난·창사','택시비는 결제됐는데 다시 내라고 한다면','S163'],['하이난','리조트 배달·수영장·공항 이동에서 막혔다면','S201']];
export default function TravelHelpEntry({lang='ko'}){
 if(lang!=='ko')return <section className="home-travel-help compact"><h2>{lang==='zh'?'旅行中遇到问题？':'Need help during your trip?'}</h2><a href="/travel-help.html">여행 중 문제 해결 · 한국어 →</a></section>;
 return <section className="home-travel-help" aria-labelledby="travel-help-title"><header><div><span className="help-eyebrow">여행자의 현장 경험</span><h2 id="travel-help-title">여행 중 막혔다면, 여기서 찾아보세요.</h2><p>결제가 안 될 때부터 입장권·이동·숙소 문제까지. 처리 결과와 원문을 함께 살펴보세요.</p></div><a className="help-all" href="/travel-help.html">문제 해결 사례 전체 보기 <span aria-hidden="true">↗</span></a></header><form action="/travel-help.html" role="search"><label htmlFor="home-help-search">어떤 문제가 생겼나요?</label><div><input id="home-help-search" name="q" type="search" placeholder="예: 결제 오류, 재입장, 호텔 단수"/><button type="submit">찾아보기</button></div></form><div className="help-featured">{cases.map(([place,title,id])=><a key={id} href={'/travel-help.html?case='+id}><small>{place}</small><strong>{title}</strong><span aria-hidden="true">→</span></a>)}</div><p className="help-footnote">작성 시점의 개인 경험입니다. 해결된 일과 아직 확인되지 않은 결과를 구분해 안내해요.</p></section>;
}
