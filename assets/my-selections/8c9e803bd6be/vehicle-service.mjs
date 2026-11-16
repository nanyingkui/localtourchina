const pick=(l,...v)=>v[l==='zh'?1:l==='en'?2:0];
export const vehicleLabels={city:['이용 도시','服务城市','Service city'],route:['접송 지역','接送区域','Transfer area'],startTime:['요청 시간','服务时间','Requested time'],luggage:['큰 짐','大件行李','Large bags'],vehicleType:['차량','车型','Vehicle'],pickup:['출발지','上车地点','Pickup point'],dropoff:['도착지','下车地点','Drop-off point'],flight:['항공편','航班','Flight'],flightTime:['항공편 출발','航班起飞时间','Flight departure'],train:['열차','车次','Train'],trainTime:['열차 도착·출발','列车到站／发车','Train arrival / departure'],direction:['방향','方向','Direction'],hours:['이용 시간','用车小时','Charter hours'],driverMeals:['기사 식사','司机用餐','Driver meals'],routePlan:['방문 순서','行驶顺序','Route and stops'],returnDate:['복귀 날짜','回程日期','Return date'],returnTime:['복귀 시간','回程时间','Return time'],returnRoute:['복귀 지역','回程区域','Return area'],returnPickup:['복귀 출발지','回程上车点','Return pickup point'],returnDropoff:['복귀 도착지','回程下车点','Return drop-off point']};
const values={zhangjiajie:['장가계','张家界','Zhangjiajie'],sanya:['싼야 (확인 필요)','三亚（待确认）','Sanya (to confirm)'],city:['장가계 시내','张家界市区','Zhangjiajie city'],wulingyuan:['무릉원','武陵源','Wulingyuan'],other:['그 외·별도 확인','其他／待确认','Other / to confirm'],car5:['5인승','5座','5 seats'],car7:['7인승','7座','7 seats'],car9:['9인승','9座','9 seats'],car14:['14인승','14座','14 seats'],mini:['14인승','14座','14 seats'],provided:['별도 제공','另行提供','Provided separately'],quote:['식대 포함 견적 요청','需含餐费报价','Quote including meals'],outbound:['장가계 → 부용진','张家界 → 芙蓉镇','Zhangjiajie → Furong'],inbound:['부용진 → 장가계','芙蓉镇 → 张家界','Furong → Zhangjiajie'],round:['왕복','往返','Return trip'],station_pickup:['역 → 숙소','车站 → 酒店','Station → hotel'],station_dropoff:['숙소 → 역','酒店 → 车站','Hotel → station']};
export function vehicleConditionLines(c,lang){return Object.entries(vehicleLabels).filter(([k])=>c[k]!==''&&c[k]!=null).map(([k,label])=>pick(lang,...label)+': '+(values[c[k]]?pick(lang,...values[c[k]]):c[k]));}
export function vehicleMissing(record,c,lang){
 const type=record.pricing.service_type;
 let keys=['city','route','startTime','luggage','pickup','dropoff'];
 if(type!=='furong_transfer'||c.mode==='private')keys.push('vehicleType');
 if(type.startsWith('airport_'))keys.push('flight');
 if(type==='airport_dropoff')keys.push('flightTime');
 if(type==='station_transfer')keys.push('train','trainTime','direction');
 if(type==='day_charter')keys.push('hours','driverMeals','routePlan');
 if(['furong_transfer','fenghuang_transfer'].includes(type)){keys.push('direction');if(c.direction==='round')keys.push('returnDate','returnTime','returnRoute','returnPickup','returnDropoff');}
 return keys.filter(k=>c[k]===undefined||String(c[k]).trim()==='').map(k=>pick(lang,...vehicleLabels[k]));
}
const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const time=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||'');
export function vehicleServiceQuote(record,c){
 const p=record.pricing,type=p.service_type,n=Number(c.party),bags=Number(c.luggage);
 if(p.requires_manual_review||vehicleMissing(record,c,'en').length||c.city!=='zhangjiajie'||!date(c.date)||!time(c.startTime)||!Number.isInteger(n)||n<1||n>99||!Number.isInteger(bags)||bags<0||bags>40)return null;
 let rate,total,unit='vehicle',floor;
 if(['station_transfer','fenghuang_transfer'].includes(type))return null;
 if(type==='furong_transfer'){
  if(c.mode==='private'&&c.vehicleType!=='car9')return null;
  const table=p.furong_transfer;if(!table||n>table.capacity||!['private','shared'].includes(c.mode)||!['outbound','inbound','round'].includes(c.direction))return null;
  rate=table.rates[c.route]?.[c.mode];
  if(c.direction==='round'){
   if(!date(c.returnDate)||!time(c.returnTime)||Date.parse(c.returnDate+'T'+c.returnTime)<=Date.parse(c.date+'T'+c.startTime))return null;
   const back=table.rates[c.returnRoute]?.[c.mode];if(!(back>0))return null;rate+=back;
  }
  total=rate*(c.mode==='shared'?n:1);unit=c.mode==='shared'?'seat':'vehicle';floor=table.fx_cny_floor;
 }else{
  if(c.mode!=='private')return null;
  const option=p.options?.[type==='day_charter'?'rental':'airport']?.[c.vehicleType];
  if(!option||!Number.isInteger(option.capacity)||n>option.capacity)return null;
  if(type==='day_charter'){
   if(!(Number(c.hours)>0&&Number(c.hours)<=8)||c.driverMeals!=='provided'||!['city','wulingyuan'].includes(c.route))return null;rate=option.price;
  }else{if(type==='airport_dropoff'&&!time(c.flightTime))return null;rate=option[c.route];}
  total=rate;
 }
 if(!(rate>0&&Number.isSafeInteger(total)))return null;
 return {basis:'vehicle-service',unit,perUnitKRW:rate,perPersonKRW:null,totalKRW:total,currency:'KRW',fxCnyFloor:floor,serviceType:type,conditions:{...c}};
}
