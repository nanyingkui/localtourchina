"""Apply reviewed catalogue options to legacy service forms in the local preview."""
import json,re
from catalog_registry import records

def apply_service_review(html,lang):
    catalog=records()
    direct=catalog['tickets']['pricing'].get('direct_prices')
    if direct:
        html=html.replace('const directPrices={};','const directPrices='+json.dumps(direct)+';')
        html=re.sub(r"const ticketCatalog=\{version:'[^']+',effective:'[^']+'\};","const ticketCatalog={version:'2026.11.13',effective:'2026-11-13'};",html,count=1)
    # A custom request is not an all-inclusive package until its quote is agreed.
    html=html.replace('포함: 고급형 호텔, 전용차량, 한국어 가이드, 일정상 입장권, 호텔 조식 및 매일 중·석식, 장가계 공항/서역 픽업·샌딩','포함: 선택한 객실·차량·가이드·입장권·식사·접송 중 최종 서면 견적에 명시한 항목만 포함합니다. 식사 횟수와 서비스 시간은 상담 후 확정합니다.')
    html=html.replace('包含：高档酒店、专车、韩语导游、行程所需门票、酒店早餐及每日午晚餐、张家界机场/西站接送','包含：仅包含最终书面报价列明的房间、车辆、导游、门票、餐食及接送；实际餐次与服务时间须确认。')
    record=catalog['vehicles']
    options=record['pricing'].get('options')
    if not options:return html
    if lang=='zh':
        options=json.loads(json.dumps(options))
        for group in options.values():
            for value in group.values():value['ko']=value.get('zh',value['ko'])
    html=re.sub(r'const vehicleProducts=\{.*?\n  \};','const vehicleProducts='+json.dumps(options,ensure_ascii=False)+';',html,count=1,flags=re.S)
    start=html.find('  function renderVehicle(){');end=html.find("  $$('#vehicleService",start)
    if start<0 or end<0:return html
    block=html[start:end]
    block=block.replace('${CATALOG.version}', '2026.11.13').replace('${CATALOG.effective}', '2026-11-13')
    marker="    $('#vehicleSummary').innerHTML="
    guard="""    const known=Number.isFinite(service==='airport'?p[val('#vehicleRoute')]:p.price);
    const capacity=Number.isFinite(p.capacity)&&people<=p.capacity;
    const overtime=service==='rental'&&(+val('#vehicleHours')||8)>8;
    const manual=!ready||!known||!capacity||overtime||(service==='rental'&&(+val('#vehicleDriverMeal')||0)>0);
    const fareText=manual?(document.documentElement.lang.startsWith('zh')?'待确认':'별도 문의'):won(total),fareTextZh=manual?'待确认':wonZh(total);
    if(manual)$('#vehicleFormHint').textContent=!capacity?'인원에 맞는 차량과 짐 적재를 확인한 뒤 견적합니다. / 需按人数与行李核定车型。':overtime?'초과시간 비용은 확인 후 견적합니다. / 超时费用待核价。':!known?'이 차량의 요금은 확인 후 안내합니다. / 此车型报价待确认。':$('#vehicleFormHint').textContent;
"""
    block=block.replace('${won(total)}','${fareText}').replace('${wonZh(total)}','${fareTextZh}')
    block=block.replace(marker,guard+marker)
    html=html[:start]+block+html[end:]
    # Price tables otherwise reveal stale prices before the customer chooses a service.
    note=('选择日期、路线、车型、人数和行李后查看参考价；超时、增加停靠、司机餐费与未确认车型单独报价。' if lang=='zh' else '날짜·노선·차량·인원·짐을 선택한 뒤 참고 요금을 확인하세요. 초과시간, 추가 경유, 기사 식사와 미확인 차종은 별도 견적입니다.')
    html=re.sub(r'(<h2>(?:요금 안내|费用说明)</h2>).*?(?=</section>)',lambda m:m[1]+'<p>'+note+'</p>',html,count=1,flags=re.S)
    if lang=='zh':
        html=html.replace('其他 특수地区','其他特殊地区').replace('必填信息가 모두 입력되었습니다.','必填信息已填写完整。').replace('${luggage}개','${luggage}件')
    return html
