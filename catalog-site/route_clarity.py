"""Readable route comparisons and schedules derived from reviewed product content."""
from functools import lru_cache
from html import escape, unescape
from pathlib import Path
import json
import re


@lru_cache(maxsize=1)
def highlights():
    return json.loads(Path(__file__).with_name('route-highlights.json').read_text())


def route_highlights(record, lang):
    values = highlights().get(record['id'], {}).get(lang)
    if not values:
        return ''
    return '<div class="route-highlights"><p class="route-focus">' + escape(values[0]) + '</p><ul>' + ''.join('<li>' + escape(value) + '</li>' for value in values[1:]) + '</ul></div>'


def sentences(text):
    return [part.strip() for part in re.split(r'(?<=[。.!?])\s+(?=\S)|(?<=。)(?=\S)', text) if part.strip()]


def day_content(day, lang):
    text = day['text'][lang]
    parts = sentences(text)
    route = parts[0]
    notes = parts[1:]
    # Arrival-day sightseeing is conditional. Keep that condition visible next to the route.
    if day['code'] == 'early':
        route = {
            'ko': '정오 무렵 공항 미팅 → 짐 보관·점심 → 오후 입장 가능 시 천문산·천문동·개방 산정길 → 호텔 체크인·저녁',
            'zh': '中午抵达接机 → 行李安排、午餐 → 确认可入园后游天门山、天门洞及开放山顶步道 → 入住、晚餐',
            'en': 'Airport meeting around noon → luggage and lunch → Tianmen and open summit paths if an afternoon entry is confirmed → hotel and dinner',
        }[lang]
        notes = [{
            'ko': '도착·이동·대기 시간과 입장권을 확인해 당일 관람을 정합니다. 늦어지면 호텔에서 쉬고 관광일을 조정합니다.',
            'zh': '按实际到达、转场、排队与门票时段确认能否当天游览。衔接不上时先入住休息，景点调整至后续日期。',
            'en': 'Same-day sightseeing depends on arrival, transfer and queue times and the entry slot. If these do not fit, rest at the hotel and reschedule the visit.',
        }[lang]]
    if day['code'] in ('forest', 'canyon') and notes:
        route += ' → ' + notes.pop(0)
        if day['code'] == 'forest' and notes and re.match(r'매력상서|One Charming', notes[0]):
            route += ' → ' + notes.pop(0)
    if day['code'] == 'furong' and lang == 'zh' and notes == ['夜景结束后返回酒店休息。']:
        notes = []
    stops = [part.strip() for part in route.split('→')]
    # Two or three readable route rows, preserving every stop and reference time.
    size = max(2, (len(stops) + 2) // 3)
    rows = [' → '.join(stops[i:i + size]) for i in range(0, len(stops), size)]
    schedule = ''.join('<p class="day-route-row">' + escape(row) + '</p>' for row in rows)
    if notes:
        label = {'ko': '이날 확인할 점', 'zh': '当天提示', 'en': 'For this day'}[lang]
        schedule += '<aside class="day-note"><strong>' + label + '</strong>' + ''.join('<p>' + escape(note) + '</p>' for note in notes) + '</aside>'
    if day['code'] == 'early':
        label = {'ko': '도착일 상세 조건', 'zh': '查看抵达日详细条件', 'en': 'Arrival-day details'}[lang]
        schedule += '<details class="day-conditions"><summary>' + label + '</summary><p>' + escape(text) + '</p></details>'
    return '<strong>' + escape(day['title'][lang]) + '</strong>' + schedule


def cost_list(body):
    """Split fee prose at list separators, preserving numbers and parenthetical conditions."""
    def paragraph(match):
        text = unescape(match[1])
        if '<' in text:
            return match[0]
        text = text.replace('所选方案实际餐次及一次80分钟按摩', '所选方案实际餐次、一次80分钟按摩').replace('일정표의 식사와 80분 마사지 1회', '일정표의 식사, 80분 마사지 1회').replace('the meals in the selected plan and one 80-minute massage', 'the meals in the selected plan, one 80-minute massage')
        items = []
        for sentence in sentences(text):
            if re.search(r'10小时|10시간|10 hours|20,000|含晚场|포함된 공연|Agree longer|including long', sentence, re.I):
                items.append(sentence)
                continue
            depth = 0
            start = 0
            for i, char in enumerate(sentence):
                if char in '(（': depth += 1
                if char in ')）': depth = max(0, depth - 1)
                if char in ',、，；;' and depth == 0:
                    if char == ',' and i and i + 1 < len(sentence) and sentence[i - 1].isdigit() and sentence[i + 1].isdigit():
                        continue
                    items.append(sentence[start:i].strip())
                    start = i + 1
            items.append(sentence[start:].strip())
        joined = []
        for item in items:
            if joined and re.match(r'with an additional|plus one|including ', item, re.I):
                joined[-1] += ', ' + item
            else:
                joined.append(item)
        items = joined
        return '<ul class="cost-items">' + ''.join('<li' + (' class="cost-condition"' if re.search(r'20,000|초과|超出|overtime', item, re.I) else '') + '>' + escape(item) + '</li>' for item in items if item) + '</ul>'
    return re.sub(r'<p>(.*?)</p>', paragraph, body, flags=re.S)


def package_fees(record, lang):
    """Display the package's reviewed common terms as complete, individual items."""
    nights = record['pricing']['nights']
    selected_hotel = record['id'] == '34'
    t = lambda ko, zh, en: {'ko': ko, 'zh': zh, 'en': en}[lang]
    hotel = t(f'선택한 호텔 {nights}박 및 조식' if selected_hotel else f'시내 동급 부티크 호텔 {nights}박 및 조식', f'所选酒店{nights}晚及早餐' if selected_hotel else f'市区同级精品酒店{nights}晚及早餐', f'{nights} nights with breakfast at your selected hotel' if selected_hotel else f'{nights} nights with breakfast in city boutique hotels')
    included = [
        hotel,
        t('2인 1실 · 홀수 인원의 남는 1명은 별도 객실 포함', '双人一间；奇数人数余下1人的单独客房已计入', 'Twin sharing, with a separate room included for an unpaired guest'),
        t('한국어 가이드', '当地导游（服务语言与对应报价需确认）', 'Local guide (confirm your preferred language and the applicable quote)'),
        t('일행과 가이드 좌석을 확보한 차량 및 기사', '按游客和导游实际座位配置的车辆及司机', 'Vehicle and driver, with seats for guests and guide'),
        t('일정 내 주차비·도로비', '行程内停车费与道路通行费', 'Parking and road tolls on the itinerary'),
        t('장가계 공항 픽업·샌딩', '张家界机场接机与送机', 'Zhangjiajie airport pickup and drop-off'),
        t('선택한 일정표에 명시된 식사', '所选行程方案列明的餐次', 'Meals listed in your selected itinerary'),
        t('마사지 80분 1회', '80分钟按摩一次', 'One 80-minute massage'),
        t('국가삼림공원·천문산 입장권', '森林公园、天门山门票', 'Forest Park and Tianmen admission'),
        t('선택한 일정에 명시된 다른 관광지 입장권 및 해당 이동시설', '所选方案列明的其他景区门票及对应景区交通', 'Other attraction tickets and internal transport listed in your selected plan'),
        t('매력상서 공연 1회', '魅力湘西演出一次', 'One Charming Xiangxi performance'),
    ]
    excluded = [
        t('항공권 및 장거리 교통', '机票及外部大交通', 'Flights and external long-distance transport'),
        t('비자 및 여행자보험', '签证与旅行保险', 'Visas and travel insurance'),
        t('개인 경비', '个人消费', 'Personal expenses'),
        t('추가 주문한 식사·음료·주류', '增加的餐食、饮品与酒水', 'Extra meals and drinks'),
        t('추가 객실 및 호텔 업그레이드', '额外客房或酒店升级', 'Extra rooms and hotel upgrades'),
        t('별도로 요청한 관광', '另外要求的景点', 'Separately requested attractions'),
    ]
    if record['id'] == '56fh':
        included[0] += t(' · 마지막 1박은 봉황 동급 호텔', '，最后一晚住凤凰同级酒店', ', with the final night in an equivalent Fenghuang hotel')
        included.append(t('봉황 왕복 전용 차량·타강 야간 유람선', '本团车辆往返凤凰及沱江夜游船', 'Your group’s vehicle to and from Fenghuang and a Tuo River night cruise'))
        excluded.append(t('고속철도·봉황고성 9경 통합권', '高铁及凤凰九景联票', 'High-speed rail and the Fenghuang nine-sight ticket'))
    hotel_note = t('호텔·객실은 예약 가능 여부 확인 후 확정합니다.', '酒店与房型须确认房态后预订。', 'Hotel and room availability must be confirmed before booking.')
    if selected_hotel:
        hotel_note += t(' 대체 호텔은 사전에 협의합니다.', '如需替换酒店，事先协商。', ' Any hotel substitution is agreed in advance.')
    scope_note = ''
    if record['id'].startswith('trek'):
        scope_note = t('늦게 도착하는 일정에는 황룡동·대협곡이 제외됩니다. 도착 시간에 맞는 일정과 가격을 함께 확인하세요.', '晚到方案不含黄龙洞与大峡谷，按实际抵达方案核对行程和价格。', 'Late-arrival plans exclude Huanglong Cave and the Grand Canyon. Check both itinerary and price for your arrival plan.')
    overtime = t('하루 약 10시간 안내 기준입니다. 초과 일정은 미리 협의하고, 시간당 ₩20,000을 가이드에게 직접 지급합니다.', '导游每日约10小时为基准。超出安排事先约定，客人另付导游₩20,000／小时。', 'Guiding is based on about 10 hours a day. Agree extra hours in advance and pay the guide ₩20,000 per extra hour directly.')
    overtime += t(' 공연을 포함해 서비스가 길어지는 날의 시간과 1시간 미만 정산 방식도 사전에 확인합니다.', '含晚场的长服务日须提前确认时长，不足1小时的结算方式事先约定。', ' Confirm hours for longer days with shows, and partial-hour billing, before departure.')
    def listing(items):
        return '<ul class="cost-items">' + ''.join('<li>' + escape(item) + '</li>' for item in items) + '</ul>'
    note_label = t('예약 전 확인', '预订提示', 'Before booking')
    notes = '<aside class="day-note"><strong>' + note_label + '</strong><p>' + hotel_note + '</p>' + ('<p>' + scope_note + '</p>' if scope_note else '') + '</aside>'
    return '<section><h2>' + t('포함 항목', '包含项', 'Inclusions') + '</h2>' + listing(included) + notes + '</section><section><h2>' + t('불포함·별도 비용', '不包含与另付费用', 'Exclusions and separate charges') + '</h2>' + listing(excluded) + '<aside class="day-note"><strong>' + t('가이드 초과 시간 요금', '导游超时费用', 'Guide overtime') + '</strong><p>' + overtime + '</p></aside></section>'
