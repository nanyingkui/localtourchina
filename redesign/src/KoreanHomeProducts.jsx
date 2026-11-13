import React from 'react';
import {CUSTOMER_CHAT_URL} from './chat-handoff.mjs';

const places = '/assets/media/attractions/';
const groups = [
  ['추천 패키지', [
    ['장가계 핵심 3박 4일', '천문산과 국가삼림공원 중심', '/?route=regular34#recommended-title', 'forest-east'],
    ['장가계 4박 5일', '늦게 도착하는 날은 호텔로, 다음 날부터 관광', '/zhangjiajie-4n5d.html', 'canyon-bridge-wide'],
  ]],
  ['장가계 및 주변 투어', [
    ['무릉원 국가삼림공원', '원가계·천자산 · 약 11시간 30분', '/day-forest.html', 'forest-east'],
    ['천문산', '전통시장·천문동 · 약 8시간 20분', '/day-tianmen.html', 'tianmen-cave'],
    ['황룡동·대협곡', '동굴·유리다리 · 약 8시간', '/day-canyon.html', 'canyon-bridge-wide'],
    ['부용진 폭포·야경 일일투어', '2인 단독 240,000원 · 4인 합류 170,000원 / 1인', '/day-furong.html', 'furong-town'],
    ['봉황고성 야경 1박 2일', '2인 단독 560,000원 · 4인 합류 390,000원 / 1인', '/day-fenghuang.html', 'fenghuang'],
  ]],
];

export default function KoreanHomeProducts() {
  return <>
    <section className="kr-travel-hero">
      <img src="/travel-planner/assets/scenery/places/yuanjiajie-day.webp" alt="장가계 원가계의 바위 봉우리" fetchPriority="high" />
      <div><h1>장가계 한국어 현지여행</h1><p>전체 일정부터 하루 관광과 필요한 서비스까지.</p>
        <nav aria-label="여행 시작"><a href="#zhangjiajie-products">여행 일정 보기</a><a href={CUSTOMER_CHAT_URL} target="_blank" rel="noopener noreferrer">카카오톡 상담</a></nav>
      </div>
    </section>
    <div id="zhangjiajie-products">
      {groups.map(([label, products]) => <section className="kr-products" key={label}>
        <h2>{label}</h2><div className="kr-product-grid" data-size={products.length === 2 ? 2 : 3}>
        {products.map(([title, detail, url, image]) => <a href={url} key={url}>
          <img src={places + image + '-jpg-640.webp'} alt="" loading="lazy" />
          <div><h3>{title}</h3><p>{detail}</p><span>일정 보기 →</span></div>
        </a>)}</div>
      </section>)}
    </div>
  </>;
}

const photos = '/assets/destination-photos/';
const credits = [
  ['Spice shop in Fenghuang Hunan.jpg','Spice_shop_in_Fenghuang_Hunan.jpg','Lianguanlun','by/4.0'],
  ['三亚太阳湾公路旁海滩 20260115.jpg','三亚太阳湾公路旁海滩_20260115.jpg','Steven Sun','by-sa/4.0'],
  ['Art du tissage des Li.jpg','Art_du_tissage_des_Li.jpg','Popolon','by-sa/4.0'],
  ['Fishing boat of Tanka.JPG','Fishing_boat_of_Tanka.JPG','Shizhao','by-sa/3.0'],
];

export function KoreanDestinationPhotos() {
  return <section className="kr-products">
    <h2>사진으로 보는 여행지</h2>
    <div className="kr-destinations">
      <section><h3>후난 · 장가계와 샹시</h3><div>
        <img src={places+'furong-town-jpg-960.webp'} alt="부용진 폭포와 마을" loading="lazy"/>
        <img src={places+'fenghuang-jpg-640.webp'} alt="봉황고성 강변" loading="lazy"/>
        <img src={photos+'spice-shop.jpg'} alt="봉황고성의 향신료 가게" loading="lazy"/>
      </div><a href="/travel-info.html">여행정보 보기 →</a></section>
      <section><h3>하이난 · 싼야</h3><div>
        <img src={photos+'sun-bay.jpg'} alt="싼야 타이양완 해안" loading="lazy"/>
        <img src={photos+'li-weaving.jpg'} alt="하이난 리족 전통 직조" loading="lazy"/>
        <img src={photos+'tanka-boat.jpg'} alt="싼야 단자 어민의 어선" loading="lazy"/>
      </div><a href="/day-tours.html?destination=sanya">싼야 여행 보기 →</a></section>
    </div>
    <details className="kr-photo-credits"><summary>사진 출처</summary><ul>{credits.map(([title,file,author,license])=>
      <li key={file}><a href={'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file)}>{title}</a> · {author} · Wikimedia Commons · <a href={'https://creativecommons.org/licenses/'+license+'/'}>CC {license.toUpperCase().replace('/',' ')}</a></li>
    )}</ul><p>화면에 맞춰 사진 크기와 표시 범위를 조정했습니다.</p></details>
  </section>;
}
