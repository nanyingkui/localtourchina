from html import escape as e
import re

def quote_form(record,lang,action):
    t=lambda a,b,c:{'ko':a,'zh':b,'en':c}[lang]
    kind=record['pricing']['service_type'];tour=kind=='day_tour';regional=kind in ('furong_transfer','fenghuang_transfer','changsha_transfer');charter=kind=='day_charter'
    blank=('',t('선택해 주세요','请选择','Please choose'))
    def select(k,label,opts):return '<label for="catalog-'+k+'">'+label+'<select id="catalog-'+k+'" name="'+k+'">'+''.join('<option value="'+e(v)+'">'+e(s)+'</option>' for v,s in opts)+'</select></label>'
    def field(k,label,typ='text',attrs=''):return '<label for="catalog-'+k+'">'+label+'<input id="catalog-'+k+'" name="'+k+'" type="'+typ+'" '+attrs+'></label>'
    zones=[blank,('city',t('장가계 시내','张家界市区','Zhangjiajie city')),('wulingyuan',t('무릉원','武陵源','Wulingyuan'))]
    f=field('date',t('이용 날짜','服务日期','Travel date'),'date')
    f+=field('party',t('우리 일행 인원','我方同行人数','Guests in our party'),'number','min="'+('2' if tour else '1')+'" max="99" step="1" inputmode="numeric"')
    f+=select('mode',t('이용 방식','出发方式','Travel type'),[blank,('private',t('우리 일행 단독','本团独立出发','Private departure'))]+([('shared',t('합류 희망' if tour else '합승 좌석','申请拼团' if tour else '拼车座位','Join a group' if tour else 'Shared seats'))] if tour or kind=='furong_transfer' else []))
    f+=select('vehicleType',t('차량 선택','车型','Vehicle'),[blank,('auto',t('인원에 맞춰 추천','按人数安排合适车型','Recommend for our party')),('car9',t('9인승 차량','9座车','9-seat vehicle')),('car14',t('14인승 차량','14座车','14-seat vehicle'))])
    if charter:f+=select('tourRoute',t('하루 동선','一日用车路线','Day route'),[blank,('forest',t('국가삼림공원·매력상서 공연','森林公园＋魅力湘西','Forest Park + Charming Xiangxi')),('tianmen',t('천문산·시내 체험','天门山＋市区体验','Tianmen + city stops')),('canyon',t('황룡동·대협곡','黄龙洞＋大峡谷','Huanglong Cave + Grand Canyon')),('other',t('다른 동선·별도 문의','其他路线，单独询价','Other route, request a quote'))])
    f+=select('route',t('픽업 지역' if tour or charter else '장가계 쪽 지역','上车区域' if tour or charter else '张家界一侧区域','Pickup area' if tour or charter else 'Zhangjiajie-side area'),zones)
    if tour or charter:f+=select('endZone',t('종료 지역','结束区域','Drop-off area'),zones)
    if kind=='station_transfer':f+=select('direction',t('이동 방향','方向','Direction'),[blank,('station_pickup',t('서역 → 숙소','西站 → 酒店','West Station → hotel')),('station_dropoff',t('숙소 → 서역','酒店 → 西站','Hotel → West Station'))])
    if regional:
        destination={'furong_transfer':t('부용진','芙蓉镇','Furong'),'fenghuang_transfer':t('봉황','凤凰','Fenghuang'),'changsha_transfer':t('창사','长沙','Changsha')}[kind]
        zjj=t('장가계','张家界','Zhangjiajie')
        f+=select('direction',t('이동 방향','方向','Direction'),[blank,('outbound',zjj+' → '+destination),('inbound',destination+' → '+zjj)]+([('round',t('왕복','往返','Return trip'))] if kind!='changsha_transfer' else []))
    if kind=='changsha_transfer':f+=select('changshaPoint',t('창사 승하차 장소','长沙上下车地点','Changsha stop'),[blank,('station',t('창사역','长沙站','Changsha Station')),('south_station',t('창사남역','长沙南站','Changsha South Station')),('airport',t('황화공항','黄花机场','Huanghua Airport'))])
    f+=field('startTime',t('희망 승차 시간 (미정이면 비워 두세요)','上车时间（未定可留空）','Pickup time (optional unless a return trip)'),'time')
    f+=field('pickup',t('픽업 호텔·주소 (선택)','上车酒店／地址（选填）','Pickup hotel / address (optional)'))
    f+=field('dropoff',t('도착 호텔·주소 (선택)','下车酒店／地址（选填）','Drop-off hotel / address (optional)'))
    f+=field('luggage',t('큰 짐 수 (선택)','大件行李数（选填）','Large bags (optional)'),'number','min="0" max="99"')
    if kind.startswith('airport'):f+=field('flight',t('항공편명 (선택)','航班号（选填）','Flight number (optional)'))
    if kind=='station_transfer':f+=field('train',t('열차 번호 (선택)','车次（选填）','Train number (optional)'))
    if kind in ('furong_transfer','fenghuang_transfer'):
        f+='<fieldset class="field-wide" data-transfer-return hidden><legend>'+t('복귀편','回程','Return journey')+'</legend><div class="store-fields">'+field('returnDate',t('복귀 날짜','回程日期','Return date'),'date')+field('returnTime',t('현지 출발 시간','从目的地返程出发时间','Departure time from destination'),'time')+select('returnRoute',t('복귀 종료 지역','回程结束区域','Return drop-off area'),zones)+'</div></fieldset>'
    f+='<label class="field-wide" for="catalog-notes">'+t('추가 요청 (어린이·경로·큰 짐 등)','补充要求（儿童、优惠票、额外停靠或大件行李）','Requests (children, concession tickets, extra stops or large bags)')+'<textarea id="catalog-notes" name="notes" rows="2" maxlength="1200"></textarea></label>'
    note=t('투어 요금은 성인 정상권 기준입니다. 합류 인원은 담당자가 확인하며 합류 할인은 확정 전 예시입니다. 차량 좌석에는 기사와 가이드도 포함됩니다.','一日游按成人全票测算，儿童及优惠票由客服核对。拼团总人数由客服确认，页面显示有条件的优惠示例；车型座位数包含司机与导游。','Tour estimates use full-fare adult tickets; ask about child or concession fares. Staff confirm the final group size. Shared savings are conditional examples; vehicle seats include driver and guides.') if tour else t('기사 포함 차량 견적입니다. 가이드·입장권·고객 식사·숙박은 포함하지 않습니다. 수하물과 차량 가능 여부는 확정 전 확인합니다.','这是含司机的用车报价，不含导游、景区门票、游客餐饮与游客住宿。行李装载及车辆可用性须预订前确认。','Vehicle and driver estimate only; guiding, tickets, guest meals and lodging are excluded. Confirm luggage capacity and vehicle availability before booking.')
    f=re.sub(r'<(input|select|textarea)\b',r'<\1 disabled data-quote-initial',f)
    return '<section id="quote" class="store-quote"><p class="store-eyebrow">YOUR JOURNEY</p><h2>'+t('조건을 선택하고 요금을 확인하세요','选好条件，再看报价','Choose your details, then see the price')+'</h2><p>'+note+'</p><form aria-busy="true" data-catalog-form data-product-id="'+e(record['id'])+'"><div class="store-fields">'+f+'</div><button class="store-button primary" disabled data-quote-initial type="submit">'+t('선택 조건 요금 확인','查看所选条件价格','Check price')+'</button><p data-quote-status role="status" hidden></p><div class="store-quote-actions">'+action(record,lang)+action(record,lang,True)+'</div><p data-choice-feedback role="status"></p></form></section><script type="module" src="/tour-config.mjs"></script>'
