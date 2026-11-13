export const CHANNELS=Object.freeze({ko:{name:'카카오톡',url:'https://pf.kakao.com/_hvrmn/chat'},zh:{name:'微信',id:'nanyingkui',url:null},en:{name:'WhatsApp',url:'https://wa.me/821055722601'}});
export function contactChannel(lang='ko'){return CHANNELS[lang]||CHANNELS.ko;}
