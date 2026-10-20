import React from 'react';
export default function ReviewArchiveEntry({lang='ko'}){
 const t={ko:['여행 후기','Naver Cafe 여행기와 YouTube 후기를 한곳에서 확인하세요.','전체 후기 보기 →'],zh:['游客后记','集中查看 Naver Cafe 游记与 YouTube 后记。','查看全部后记 →'],en:['Traveller reviews','Browse the Naver Cafe travel stories and YouTube reviews.','View all reviews →']}[lang]||[];
 return <section className="home-day-tours" id="reviews"><header><h2>{t[0]}</h2><p>{t[1]}</p></header><a className="button outline review-browse" href={(lang==='ko'?'/':'/'+lang+'/')+'reviews.html'}>{t[2]}</a></section>;
}
