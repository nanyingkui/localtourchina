import React from 'react';
import './handbook-entry.css';

const words={
 ko:{tag:'실사용 테스트에 초대합니다',title:'장가계 A·B 코스, 먼저 써보세요.',body:'직접 둘러보고, 헷갈린 길이나 현장 팁을 여행 수첩 아래 댓글로 남겨주세요.',action:'여행 수첩 실사용 참여',comment:'수첩 아래에 의견 남기기'},
 zh:{tag:'邀请您参与实测',title:'张家界 A/B 线，邀您先体验。',body:'打开旅行手册看看路线，欢迎在手册下方留言，分享疑问和现场经验。',action:'参与旅行手册实测',comment:'到手册下方留言'},
 en:{tag:'Help us test the travel handbook',title:'Try Zhangjiajie’s A & B routes.',body:'Explore the Korean-language handbook, then share questions and on-site tips in the comments below it.',action:'Try the travel handbook',comment:'Leave feedback in the handbook'}
};

export default function HandbookEntry({lang='ko'}){
 const t=words[lang]||words.ko;
 const href='https://map.localtourchina.com/travel?lang='+(lang==='zh'?'zh':'ko')+'&source=home';
 return <section className="handbook-entry" aria-labelledby="handbook-entry-title">
  <img className="handbook-entry-mascot" src="/assets/home-20261013/mascot-clean.webp" width="64" height="64" alt=""/>
  <div className="handbook-entry-copy"><p className="handbook-entry-tag">{t.tag}</p><h2 id="handbook-entry-title">{t.title}</h2><p>{t.body}</p></div>
  <div className="handbook-entry-actions"><a className="handbook-entry-primary" href={href}>{t.action}</a><a className="handbook-entry-comment" href={href+'#vRouteComments'}>{t.comment}</a></div>
 </section>;
}
