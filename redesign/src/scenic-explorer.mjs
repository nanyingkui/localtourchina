export const scenicPlaces=[
 ['yuanjiajie','원가계','袁家界','Yuanjiajie'],['tianzishan','천자산','天子山','Tianzi Mountain'],['golden-whip','금편계','金鞭溪','Golden Whip Stream'],['ten-mile','십리화랑','十里画廊','Ten-mile Gallery'],['huangshizhai','황석채','黄石寨','Huangshizhai'],['tianmen','천문산','天门山','Tianmen Mountain'],['canyon','대협곡 유리다리','大峡谷玻璃桥','Grand Canyon Glass Bridge'],['baofeng','보봉호','宝峰湖','Baofeng Lake'],['huanglong','황룡동','黄龙洞','Yellow Dragon Cave'],['seventy-two','72기루','七十二奇楼','Seventy-two Wonder Towers'],['fenghuang','봉황고성','凤凰古城','Fenghuang Ancient Town'],['furong','부용진','芙蓉镇','Furong Town']
].map(([id,ko,zh,en])=>({id,ko,zh,en,cave:id==='huanglong',extension:['fenghuang','furong'].includes(id)}));
export const sceneAsset=(id,phase)=>'/travel-planner/assets/scenery/places/'+id+'-'+phase+'.webp';
export function nightOpacity(hour){const p=Math.max(0,Math.min(1,(Number(hour)-15)/6));return p*p*(3-2*p);}
export function sceneTime(hour){const min=Math.round(Math.max(8,Math.min(22,Number(hour)))*60);return String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0');}
export function scrollSceneHour(top,viewport){const start=viewport*.85,end=viewport*.12;return 8+14*Math.max(0,Math.min(1,(start-top)/(start-end)));}
