"""Standalone transport service requests; prices resolve from the existing vehicle record."""
from html import escape

def quote_form(record,lang,action):
    def t(a,b,c):return {'ko':a,'zh':b,'en':c}[lang]
    kind=record['pricing']['service_type'];furong=kind=='furong_transfer';phoenix=kind=='fenghuang_transfer';charter=kind=='day_charter';station=kind=='station_transfer'
    blank=('',t('선택해 주세요','请选择','Please choose'))
    def select(name,label,options):return '<label for="catalog-'+name+'">'+label+'<select id="catalog-'+name+'" name="'+name+'">'+''.join('<option value="'+escape(v)+'">'+escape(s)+'</option>' for v,s in options)+'</select></label>'
    def field(name,label,typ='text',attrs=''):return '<label for="catalog-'+name+'">'+label+'<input id="catalog-'+name+'" name="'+name+'" type="'+typ+'" '+attrs+'></label>'
    fields=select('city',t('이용 도시','服务城市','Service city'),[blank,('zhangjiajie',t('장가계','张家界','Zhangjiajie'))])
    fields+=select('mode',t('차량 이용 방식','用车方式','Transfer type'),[blank,('private',t('우리 일행 전용','本团专车','Private vehicle'))]+([('shared',t('합승 좌석','拼车座位','Shared seats'))] if furong else []))
    fields+=field('date',t('이용 날짜','服务日期','Service date'),'date')
    fields+=field('startTime',t('도착 예정 시간' if kind=='airport_pickup' else '희망 승차 시간','预计落地时间' if kind=='airport_pickup' else '期望上车时间','Scheduled landing time' if kind=='airport_pickup' else 'Preferred pickup time'),'time')
    fields+=field('party',t('전체 탑승 인원 (어린이 포함)','乘客总人数（含儿童）','Passengers, including children'),'number','min="1" max="99" inputmode="numeric"')
    fields+=field('luggage',t('큰 짐 개수','大件行李数','Large bags'),'number','min="0" max="40" inputmode="numeric"')
    routes=[blank,('city',t('장가계 시내','张家界市区','Zhangjiajie city')),('wulingyuan',t('무릉원','武陵源','Wulingyuan')),('other',t('그 외 주변 지역 (확인 필요)','其他周边区域（待确认）','Other nearby area (to confirm)'))]
    fields+=select('route',t('숙소·이동 지역','酒店／接送区域','Hotel / transfer area'),routes)
    types=['car9','car14'] if charter else ['car9','mini'] if furong or phoenix else ['car5','car7','car9','mini']
    labels={'car5':t('5인승 (기사 포함)','5座（含司机）','5 seats including driver'),'car7':t('7인승 (기사 포함)','7座（含司机）','7 seats including driver'),'car9':t('9인승 (기사 포함)','9座（含司机）','9 seats including driver'),'car14':t('14인승 (기사 포함)','14座（含司机）','14 seats including driver'),'mini':t('14인승 (기사 포함)','14座（含司机）','14 seats including driver')}
    vehicle=select('vehicleType',t('희망 차량','意向车型','Preferred vehicle'),[blank]+[(key,labels[key]) for key in types]+[('other',t('그 외·추천 요청','其他／请推荐','Other / please advise'))])
    fields+=vehicle.replace('<label ', '<label data-private-vehicle ') if furong else vehicle
    if station:fields+=select('direction',t('이동 방향','接送方向','Direction'),[blank,('station_pickup',t('역 → 숙소','车站 → 酒店','Station → hotel')),('station_dropoff',t('숙소 → 역','酒店 → 车站','Hotel → station'))])
    if furong:fields+=select('direction',t('이동 방향','接送方向','Direction'),[blank,('outbound',t('장가계 → 부용진','张家界 → 芙蓉镇','Zhangjiajie → Furong')),('inbound',t('부용진 → 장가계','芙蓉镇 → 张家界','Furong → Zhangjiajie')),('round',t('왕복','往返','Return trip'))])
    if phoenix:fields+=select('direction',t('이동 방향','接送方向','Direction'),[blank,('round',t('봉황고성 1박·왕복','凤凰古城隔夜往返','Overnight return trip to Fenghuang'))])
    fields+=field('pickup',t('출발지·호텔·주소','上车地点／酒店／地址','Pickup point / hotel / address'))
    fields+=field('dropoff',t('도착지·호텔·주소','下车地点／酒店／地址','Drop-off point / hotel / address'))
    if kind in ('airport_pickup','airport_dropoff'):fields+=field('flight',t('항공편명','航班号','Flight number'))
    if kind=='airport_dropoff':fields+=field('flightTime',t('항공편 출발 시간','航班起飞时间','Flight departure time'),'time')
    if station:
        fields+=field('train',t('열차 번호','车次','Train number'))
        fields+=field('trainTime',t('열차 도착·출발 시간','列车到站／发车时间','Train arrival / departure time'),'time')
    if charter:
        fields+=field('hours',t('예상 이용 시간','预计用车小时数','Expected charter hours'),'number','min="1" max="24" step="0.5"')
        fields+=select('driverMeals',t('기사 식사','司机用餐','Driver meals'),[blank,('provided',t('별도 제공','另行提供','Provided separately')),('quote',t('식대 포함 견적 요청','需含餐费报价','Include meal allowance in quote'))])
        fields+='<label class="field-wide" for="catalog-routePlan">'+t('방문 순서·경유지','行驶顺序与停靠点','Route and stops in order')+'<textarea id="catalog-routePlan" name="routePlan" rows="3" maxlength="1000"></textarea></label>'
    if furong or phoenix:
        fields+='<fieldset class="field-wide" data-transfer-return hidden><legend>'+t('복귀편','回程','Return leg')+'</legend><div class="store-fields">'+field('returnDate',t('복귀 날짜','回程日期','Return date'),'date')+field('returnTime',t('복귀 승차 시간','回程上车时间','Return pickup time'),'time')+select('returnRoute',t('복귀 지역','回程区域','Return area'),routes)+field('returnPickup',t('복귀 출발지','回程上车地点','Return pickup point'))+field('returnDropoff',t('복귀 도착지','回程下车地点','Return drop-off point'))+'</div></fieldset>'
    fields+='<label class="field-wide" for="catalog-notes">'+t('추가 요청 (짐 크기·카시트 등)','补充要求（行李尺寸、儿童座椅等）','Requests (bag sizes, child seats, etc.)')+'<textarea id="catalog-notes" name="notes" rows="2" maxlength="1200"></textarea></label>'
    return '<section id="quote" class="store-quote"><p class="store-eyebrow">YOUR TRANSFER</p><h2>'+t('필요한 이동만 선택하세요','只选择你需要的用车','Choose just the transfer you need')+'</h2><p>'+t('날짜·인원·노선을 알려 주세요. 미정이어도 담거나 상담할 수 있습니다.','填写日期、人数与路线。尚未确定也可以先加入清单或咨询。','Share your date, party and route. You can save or ask even if details are undecided.')+'</p><form data-catalog-form data-product-id="'+record['id']+'"><div class="store-fields">'+fields+'</div><button class="store-button primary" type="submit">'+t('선택 조건 요금 확인','查看所选条件报价','Check this transfer')+'</button><p data-quote-status role="status" hidden></p><div class="store-quote-actions">'+action(record,lang)+action(record,lang,True)+'</div><p data-choice-feedback role="status"></p></form><p class="store-fine">'+t('예약 확정 전 참고 견적입니다. 항공·열차 지연 시 연락 방법과 대기 조건을 사전에 확인합니다.','当前为参考报价。航班或列车延误时的联络方式及等候规则须事前确认，客服确认后再预订。','Reference quote only. Agree on delay contact and waiting arrangements before booking; availability requires staff confirmation.')+'</p></section><script type="module" src="/tour-config.mjs"></script>'
