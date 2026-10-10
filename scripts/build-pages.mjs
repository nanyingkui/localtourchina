import { formatEnglishPrice, englishPricingNote, onlineSupportInquiry } from '../redesign/src/english-pricing.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageDimensions = JSON.parse(await readFile(path.join(root, 'src/image-dimensions.json'), 'utf8'));
await writeFile(path.join(root, 'assets/image-dimensions.js'), 'window.LTCImageSizes = '+JSON.stringify(imageDimensions)+';\n');
function withImageDimensions(html) {
  return html.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1]?.replace(/^\.\.\//, '');
    const dimensions = imageDimensions[src];
    if (!dimensions) return tag;
    return tag.replace(/\s(?:width|height)="[^"]*"/g, '').replace(/>$/, ` width="${dimensions[0]}" height="${dimensions[1]}">`);
  });
}
const template = await readFile(path.join(root, 'src/site-template.html'), 'utf8');
const winterFlights = JSON.parse(await readFile(path.join(root, 'src/winter-flights.json'), 'utf8'));
await writeFile(path.join(root, 'assets/winter-flights-data.js'), 'window.LTC_WINTER_FLIGHTS = '+JSON.stringify(winterFlights)+';\n');
const englishTemplate = await readFile(path.join(root, 'src/english-template.html'), 'utf8');
const zhTravelInfo = await readFile(path.join(root, 'src/zh-travel-info.html'), 'utf8');
const zhPairs = [
  ["4일권 · 재입장 예약 안내", "四日有效门票 · 再次入园预约说明"],
  ["티켓은 최초 활성화 당일부터 4일간 유효하지만, 4일치 입장이 자동으로 예약되는 것은 아닙니다.", "门票自首次激活当日起四天有效，但不代表四天的入园日期已自动预约。"],
  ["동시에 유지할 수 있는 미사용 입장 예약은 최대 2회입니다.", "同时最多保留两个尚未使用的入园预约。"],
  ["3회차 입장을 원하시면 실제 1회차 입장 후 로투차에 연락해 예약을 요청해 주세요.", "如需第3次入园，请在实际完成第1次入园后联系罗途查申请预约。"],
  ["4회차 입장을 원하시면 실제 2회차 입장 후 로투차에 연락해 예약을 요청해 주세요.", "如需第4次入园，请在实际完成第2次入园后联系罗途查申请预约。"],
  ["매번 입장 전 날짜·입구·시간대가 확정되어야 합니다. 희망 예약은 잔여 정원에 따라 달라지며 보장되지 않습니다.", "每次入园前都须确认日期、入口和时段。能否预约以剩余名额为准，不保证所选日期或时段有名额。"],
  ["추가 입장도 4일 유효기간 안에서만 가능합니다. 3·4회차는 방문 순서이며, 연속된 날짜에 방문하거나 4회 모두 방문해야 한다는 뜻은 아닙니다.", "后续入园也须在四天有效期内。第3、4次指入园顺序，并非必须连续日期入园，也不要求入园满四次。"],
  ["동시에 유지할 수 있는 미사용 입장 예약은 최대 2회입니다. 3회차 입장을 원하시면 실제 1회차 입장 후, 4회차 입장을 원하시면 실제 2회차 입장 후 로투차에 연락해 추가 예약을 요청해 주세요.", "同时最多保留两个尚未使用的入园预约。如需第3次入园，请在实际完成第1次入园后联系罗途查；如需第4次入园，请在实际完成第2次入园后联系罗途查申请追加预约。"],

  ['마지막 요청을 확인해 주세요','请确认最后的需求'],['연락처는 다음 상담 화면에서 한 번만 입력합니다. 아직 상담은 접수되지 않았습니다.','联系方式只在下一页填写一次，目前尚未提交咨询。'],['상담 후 견적','咨询后报价'],['먼저 참고 일정을 고르고 필요한 조건만 바꿔 보세요. 맞춤 여행의 최종 금액은 날짜·인원·숙소를 확인한 뒤 안내합니다.','先选参考行程，再按需要调整。定制旅行的最终价格将在确认日期、人数与住宿后提供。'],['머큐어 호텔 외관 참고 사진 · 실제 지점은 상담 후 확인','美居酒店外观参考图，实际分店咨询后确认'],

  ['항공편 참고 자료의 시간으로 채웠습니다. 예약 확정 정보가 아니므로 실제 항공권과 대조하고 수정해 주세요.','已按航班参考资料填入时间，并非已确认预订，请与实际机票核对后修改。'],
  ["내 일정에 맞는 프라이빗 여행 →", "定制适合我的私人行程 →"],
  ["도착·출발 시간부터 함께 계획하세요", "从抵达和离开时间开始规划"],
  ["지금 여행 준비는 어디까지 하셨나요?", "您的旅行准备到哪一步了？"],
  ["항공편부터 살펴볼래요 →", "先看看航班 →"],
  ["11·12월 왕복 일정 참고 자료", "11、12月往返行程参考"],
  ["전체 여행을 계획할래요 →", "规划完整旅程 →"],
  ["도착·출발 시간에 맞춰 일정 구성", "根据抵离时间安排行程"],
  ["필요한 서비스만 고를래요 →", "只选择需要的服务 →"],
  ["입장권·차량·가이드·하루 투어", "门票、车辆、导游及一日游"],
  ["출발 준비를 할래요 →", "准备出发 →"],
  ["입국·결제·통신을 하나씩 준비", "逐项准备入境、支付与通信"],
  ["자유여행 중 온라인 도움이 필요하신가요?", "自由行途中需要在线帮助？"],
  ["한 팀 50,000원 · 최대 7일 · 중국 시간 08:00–20:00 (한국 09:00–21:00). 24시간 대기 서비스는 아닙니다.", "每组50,000韩元 · 最长7天 · 中国时间08:00–20:00（韩国09:00–21:00），非24小时待命服务。"],
  ["11·12월, 항공편부터 여행 일정까지", "11、12月，从航班到旅行行程"],
  ["Trip.com 조회 자료 · 자료 정리일 2026-10-03. 전체 항공편 목록이나 실시간 좌석 현황이 아닙니다. 예약 전 항공사 또는 판매처에서 시간·가격·수하물 조건을 다시 확인하세요.", "Trip.com查询资料 · 整理日期2026-10-03。并非完整航班列表或实时余票；预订前请向航空公司或销售方核对时间、价格和行李条件。"],
  ["편도 6시간 이내·최대 1회 경유·한국 귀국일까지 최대 6일 조건으로 찾은 왕복 조합입니다. 아래 7개는 모두 직항입니다. 12월 31일 출발과 1월 귀국은 조사 범위에 포함되지 않습니다.", "筛选条件：单程6小时内、最多中转1次、计至返回韩国当天最多6天。下列7组均为直飞；调查未覆盖12月31日出发或次年1月返程。"],
  ["출발 월", "出发月份"],
  ["전체", "全部"],
  ["한국 출발 공항", "韩国出发机场"],
  ["청주", "清州"],
  ["부산", "釜山"],
  ["인천", "仁川"],
  ["현지 숙박 /", "晚当地住宿 /"],
  ["여행일", "旅行天数"],
  ["가는 편", "去程"],
  ["오는 편", "返程"],
  ["이 시간으로 일정 검토하기 →", "按此时间规划行程 →"],
  ["해당 조건으로 확인된 자료가 없습니다. 운항하지 않는다는 뜻은 아닙니다.", "暂无符合筛选条件的已核实资料，不代表没有航班。"],
  ["표시 시간은 각 공항의 현지 시간입니다. 한국은 중국보다 1시간 빠릅니다. 귀국일은 한국 도착일 기준이며, 항공권 예약이나 확정을 의미하지 않습니다.", "所示时间均为机场当地时间，韩国比中国快1小时。返国日期按抵达韩国日期计算；本页不代表机票预订或确认。"],
  ['국가삼림공원 남문 코스 시간','国家森林公园南门游览时长'],['천문산 코스 시간','天门山游览时长'],[' 정보를 확인해 주세요.','信息，请检查。'],['로투차 홈','罗途查首页'],['메뉴 ☰','菜单 ☰'],['주요 메뉴','主要菜单'],['언어 선택','语言选择'],
  ['온라인 안심지원','在线旅行支持'],['여행 예약','旅行预订'],['여행 준비','旅行准备'],['맛집·지도','美食·地图'],['여행 후기','旅行评价'],['카톡 상담','联系咨询'],
  ['장가계 여행을 한곳에서 더 간편하게','更方便地规划张家界旅行'],['여행 전체를 맡기는 올인원 프라이빗 투어 또는 필요한 단일 서비스만 선택하세요.','可选择全程定制包团，也可只预订您需要的单项服务。'],
  ['실시간 원화 견적','实时清晰报价'],['한국어 상담','中文沟通'],['카카오톡 예약 문의','微信预订咨询'],['여행 전·현지 온라인 안심지원','行前与旅途中在线支持'],['한 팀 50,000원 · 최대 7일','每组50,000韩元 · 最长7天'],
  ['무엇을 도와드릴까요?','需要我们提供什么帮助？'],['출발 전 일정 검토부터 현지 실시간 도움까지','从行前行程检查到旅途中实时协助'],['전체 일정 또는 필요한 서비스 선택','预订完整行程或选择单项服务'],['입국·결제·통신을 하나씩 준비','逐项准备入境、支付与通信'],['내 여행지 식당과 찾아가는 방법','查找目的地餐厅与路线'],
  ['여행 전체를 맡기고 싶으세요?','想把整段旅程交给我们吗？'],['필요한 서비스만 예약','只预订需要的服务'],['내 여행 만들기 · 여기 눌러 시작','开始定制我的旅行'],
  ['장가계 입장권 예약','张家界景区门票预订'],['관광지를 고르면 필요한 옵션과 예상 금액만 순서대로 보여 드립니다.','选择景区后，将依次显示所需选项与预计费用。'],
  ['장가계부터 하이난 싼야·삼아까지','从张家界到海南三亚'],['가고 싶은 풍경을 고르면 일정, 포함 사항과 예상 금액을 바로 확인할 수 있습니다.','选择想看的风景，即可查看行程、包含项目和预计费用。'],
  ['어느 지역으로 여행하세요?','您要去哪个地区？'],['지역을 고르면 예약 가능한 데이투어만 보여 드립니다.','选择地区后，仅显示可以预订的一日游。'],['장가계','张家界'],['싼야 · 삼아(三亚)','三亚'],['산과 협곡','山峰与峡谷'],['섬과 바다','海岛与海滨'],
  ['한국어 현지가이드','当地导游服务'],['날짜와 원하는 일정만 알려 주세요. 이동과 현장 소통을 함께 준비합니다.','告诉我们日期和期望行程，我们会安排出行及现场沟通。'],
  ['여행 전·현지 온라인 안심지원','行前与旅途中在线支持'],['출발 전에는 일정을 함께 점검하고, 여행 중에는 길·입장·택시·식당·결제 문제를 한국어로 물어보세요.','出发前共同检查行程；旅行中遇到路线、入园、打车、餐厅或支付问题，都可以在线咨询。'],
  ['공항픽업·전용차량','机场接送·专车'],['이동 목적과 인원, 짐 개수를 입력하면 알맞은 차량과 예상 금액을 안내합니다.','输入用车需求、人数及行李数量，即可获得合适车型与预计费用。'],
  ['내게 맞는 장가계 여행','适合我的张家界旅行'],['처음이라면 인기 일정에서 시작하세요. 필요한 경우에만 세부 조건을 바꿀 수 있습니다.','第一次来可从热门路线开始，再按需要调整细节。'],
  ['어떤 여행을 준비하시나요?','您正在准备怎样的旅行？'],['전체 일정을 맡기거나, 필요한 서비스만 골라 보세요.','可以把全程交给我们，也可以只选择需要的服务。'],
  ['전체 여행을 맡길래요','定制完整旅程'],['호텔·식사·차량·가이드가 포함된 맞춤 여행','包含酒店、用餐、车辆和导游的定制旅行'],['하루 투어를 찾고 있어요','查找一日游'],['장가계·싼야의 일정과 포함 사항 비교','比较张家界与三亚线路和包含项目'],['입장권만 필요해요','只需要门票'],['관광지와 방문 날짜에 맞는 티켓','按景区和日期选择门票'],['차량·공항 픽업이 필요해요','需要车辆或机场接送'],['인원과 이동 구간에 맞는 전용차량','根据人数和路线安排专车'],['한국어 가이드가 필요해요','需要导游'],['현지에서 함께할 가이드 요청','申请当地陪同导游'],['여러 서비스를 함께 예약할래요','一起预订多项服务'],['입장권·가이드·차량을 한 번에 문의','一次咨询门票、导游和车辆'],
  ['중국 여행,','中国旅行，'],['지금 어디까지 준비하셨나요?','您准备到哪一步了？'],['현재 여행 단계를 선택하세요. 필요한 안내만 보여 드릴게요.','请选择当前旅行阶段，我们只显示您需要的信息。'],['저장·인쇄','保存·打印'],
  ['`준비 완료 ${n} / ${checks.length}`','`已完成 ${n} / ${checks.length}`'],['복사했어요','已复制'],['아래 중국어 상호를 복사하세요.','请复制下面的中文名称。'],['닫기 ×','关闭 ×'],['咨询内容이 복사되었습니다.','咨询内容已复制。'],
  ["{before:'출발 전 준비',arrived:'중국 도착 후',during:'여행 중 도움'}","{before:'出发前准备',arrived:'抵达中国后',during:'旅行途中需要帮助'}"],['필요한 항목을 눌러 펼쳐 보세요.','点击需要查看的项目展开详情。'],
  ['먹고, 쉬고,','吃饭、休息，'],['현지처럼 장보기','像当地人一样购物'],['식당뿐 아니라 카페·야식·술집·슈퍼까지 여행 중 실제로 필요한 장소를 빠르게 찾으세요.','从餐厅、咖啡馆、夜宵和酒吧到超市，快速找到旅途中真正需要的地点。'],['장가계 로컬 생활 지도','张家界本地生活地图'],['전체 보기','查看全部'],['맛집','美食'],['카페','咖啡馆'],['야식·술','夜宵·酒吧'],['마트','超市'],['가게명·중국어·지역·종류 검색','按店名、中文名、地区或类型搜索'],['조건에 맞는 장소가 없습니다. 다른 종류나 검색어를 선택해 보세요.','没有符合条件的地点，请更换分类或关键词。'],
  ['사업자·서비스 제공자 정보','企业与服务商信息'],['회사소개·사업자 정보','公司介绍·资质信息'],['회사와 채널','公司与官方频道'],['상담','咨询'],
  ['필수 정보 입력 후 복사','填写必填信息后复制'],['필수 정보','必填信息'],['이름','姓名'],['여행 날짜','旅行日期'],['여행 인원','出行人数'],['연락처','联系方式'],['추가 요청','补充需求'],['문의 내용 복사','复制咨询内容'],['예상 금액','预计金额'],['총 금액','总金额'],['포함 사항','包含项目'],['불포함 사항','不包含项目'],['예약 가능 여부','是否可订'],['취소·변경·환불 규정','取消、变更与退款规则'],['확인해 주세요','请确认'],['제출하기','提交'],['다음 단계','下一步'],['이전 단계','上一步']
  ,['로투차 · LOCALTOUR CHINA','罗途查 · LOCALTOUR CHINA'],['장가계 여행을','张家界旅行'],['한곳에서 더 간편하게','一站式安排，更轻松'],
  ['다녀온 여행자의 이야기','听听真实游客怎么说'],['네이버 카페에 직접 남겨주신 여행 후기를 만나보세요.','查看游客在 Naver Cafe 亲自留下的真实评价。'],['여행 후기 모두 보기 →','查看全部旅行评价 →'],
  ['예약 전에, 실제 여행을 먼저 만나보세요','预订前，先看看真实的旅行体验'],['장가계의 대표 풍경부터 숙소와 전용차량까지 직접 확인하고 원하는 여행 방식으로 이어갈 수 있습니다.','从张家界代表性景观到酒店和专车，先查看实拍内容，再选择适合自己的旅行方式。'],
  ['장가계 여행 전체를 한 번에','一站式安排张家界旅行'],['숙박·차량·가이드·입장권을 내 일정에 맞춰 구성','按您的行程组合酒店、车辆、导游与门票'],['현지에서 만나는 한국어 가이드','当地陪同导游'],['공항·역 미팅부터 관광 동행까지','从机场、车站接站到景区陪同'],['대표 관광지 입장권','热门景区门票'],['관광지별 옵션과 예상 금액 확인','查看各景区选项与预计费用'],['대협곡 · 유리다리','张家界大峡谷·玻璃桥'],['하루 코스 살펴보기','查看一日游路线'],['확인 가능한 숙소','可查看实拍的合作酒店'],['호텔 외관·객실·조식 실사진 제공','提供酒店外观、客房与早餐实拍'],['인원에 맞는 전용차량','适合团队人数的专车'],['실차량 사진과 수하물 조건 확인','查看实车照片与行李容量'],
  ['장가계 대표 관광지','张家界代表性景区'],['15장의 현지 풍경 · 산과 호수, 공연까지','15张当地实景图 · 山水与演出'],['국가삼림공원 동문','张家界国家森林公园东门'],['국가삼림공원 남문','张家界国家森林公园南门'],['금편계','金鞭溪'],['천문산 절벽길','天门山悬崖栈道'],['천문동','天门洞'],['황룡동','黄龙洞'],['대협곡 유리다리','大峡谷玻璃桥'],['대협곡 신천호','大峡谷神泉湖'],['보봉호','宝峰湖'],['부용진','芙蓉镇'],['봉황고성','凤凰古城'],['72기루','七十二奇楼'],['매력상서','魅力湘西'],['천문호선','天门狐仙'],['장가계 시내','张家界市区'],
  ['현지 시내와 자유시간','市区与自由活动'],['사진 3장 · 영상 2개 · 간식과 마트','3张照片 · 2段视频 · 小吃与超市'],['현지 간식','当地小吃'],['현지 마트','当地超市'],['현지 간식 영상 · 눌러서 재생','当地小吃视频 · 点击播放'],['현지 마트 영상 · 눌러서 재생','当地超市视频 · 点击播放'],['영상은 자동 재생하지 않으며 사용자가 재생할 때만 데이터를 사용합니다.','视频不会自动播放，仅在您点击播放后加载。'],
  ['호텔 객실과 조식','酒店客房与早餐'],['3개 협력 호텔 · 실사진 12장','3家合作酒店 · 12张实拍图'],['장가계 시내 머큐어호텔','张家界市区美居酒店'],['장가계 시내 오렌지호텔','张家界市区桔子酒店'],['장가계 시내 홈인플러스호텔','张家界市区如家精选酒店'],['외관','外观'],['더블룸','大床房'],['트윈룸','双床房'],['조식','早餐'],['우리 일행의 전용차량','团队专属用车'],['7 · 9 · 14인승 · 외관과 실내 확인','7座、9座、14座 · 查看外观和内饰'],['7인승 차량','7座车辆'],['9인승 차량','9座车辆'],['14인승 차량','14座车辆'],['18인승 차량','18座车辆'],['실내','内饰'],['사진 준비 중','图片准备中'],['실차량 확인 후 이미지를 추가합니다.','确认实际车辆后补充图片。'],
  ['공항픽업과 가이드 미팅','机场接送与导游会合'],['도착 순간부터 확인하는 현장 서비스','从抵达开始即可确认的当地服务'],['공항 픽업','机场接机'],['야간 픽업','夜间接机'],['가이드 미팅','与导游会合'],['실제 여행 동선과 현장 영상을 확인하세요.','查看真实旅行路线与现场视频。'],['영상 보기 →','观看视频 →'],['한국어 여행 정보와 최신 공지를 확인하세요.','查看旅行信息和最新公告。'],['카페 보기 →','前往 Naver Cafe →'],
  ['한 팀 · 한 번의 여행','一个团队 · 一次旅行'],['여행 전체를 연결하는 전담 온라인 도움','贯穿整段旅程的专属在线协助'],['여행 인원이 아니라 한 팀 기준입니다.','按团队收费，不按人数收费。'],['출발 전','出发前'],['항공·호텔·예정 일정을 전달하면 전체 동선을 확인합니다. 예약 후 출발 전까지 준비 질문을 받을 수 있습니다.','提交航班、酒店和初步行程后，我们会检查整体路线；预订后至出发前均可咨询准备问题。'],['여행 중','旅行途中'],['중국시간 08:00–20:00 실시간 답변. 관광 동선, 중국어 주소, 택시, 식당, 결제와 일정 변경을 돕습니다.','中国时间08:00–20:00提供在线回复，协助处理游览路线、中文地址、打车、餐厅、支付及行程调整。'],['필요할 때','必要时'],['문자만으로 해결하기 어려운 상황은 음성 또는 영상 통화로 확인합니다.','遇到文字难以说明的问题时，可通过语音或视频进一步确认。'],['서비스 범위','服务范围'],['온라인 안내 서비스이며 현장 동행, 입장권·차량 비용, 24시간 긴급 구조와 비용 보상은 포함하지 않습니다.','本产品为在线协助服务，不包含现场陪同、门票与车辆费用、24小时紧急救援及费用赔偿。'],
  ['결제 전 꼭 확인해 주세요','付款前请仔细阅读'],['한 팀 · 한 여행 · 최대 7일','一个团队 · 一次旅行 · 最长7天'],['중국시간 08:00–20:00','中国时间08:00–20:00'],['일반 문의 통상 30분 이내','普通咨询通常30分钟内回复'],['필요 시 통화 1일 1회 · 10분','必要时每天可通话1次 · 最长10分钟'],['전체 이용 규칙 펼쳐보기','展开完整服务规则'],
  ['여행 기본정보를 알려 주세요','请填写基本旅行信息'],['답변에 꼭 필요한 내용만 받습니다. 여권·카드 정보는 입력하지 마세요.','只需填写回复所必需的信息，请勿提交护照或银行卡资料。'],['KakaoTalk ID 또는 전화','微信号、KakaoTalk ID或电话'],['여행 시작일','旅行开始日期'],['여행 종료일','旅行结束日期'],['여행지','旅行目的地'],['선택해 주세요','请选择'],['하이난 싼야·삼아','海南三亚'],['중국 기타 지역','中国其他地区'],['총 인원','总人数'],['호텔명·항공편·현재 일정','酒店、航班及现有行程'],['아직 미정인 내용은 미정이라고 적어 주세요.','尚未确定的项目可填写“待定”。'],['필요한 도움','需要的帮助'],['일정·관광 동선','行程与游览路线'],['입장·티켓 안내','入园与门票'],['택시·중국어 주소','打车与中文地址'],['식당·주문','餐厅与点餐'],['결제·앱 사용','支付与应用操作'],['일정 변경·돌발 상황','行程调整与突发情况'],['신청서 저장하고 입금 단계로','保存申请并进入付款步骤'],
  ['신청서가 저장되었습니다.','申请已保存。'],['아래 전용 링크는 견적·일정·진행 상태를 다시 확인할 때 사용합니다.','请保存下面的专属链接，用于再次查看报价、行程和办理进度。'],['내 신청 상태 보기 →','查看我的申请状态 →'],['전용 링크 복사','复制专属链接'],['다른 여행으로 새로 신청','提交另一段旅行'],['아래 계좌로 50,000원을 입금해 주세요','请向以下账户转账50,000韩元'],['입금자명에 신청번호를 함께 적거나, 입금 후 이체 화면을 올려 주세요.','请在转账备注中填写申请编号，或在付款后上传转账截图。'],['은행','银行'],['예금주','户名'],['계좌번호','账号'],['계좌번호 복사','复制账号'],['이체 화면 이미지 (JPG·PNG·WEBP, 최대 5MB)','转账截图（JPG、PNG或WEBP，最大5MB）'],['입금 증빙 업로드','上传付款凭证'],['지금 전담 연락을 연결하세요','现在添加专属联系人'],['개인 KakaoTalk을 추가해 주세요','请添加个人 KakaoTalk'],['추가가 안 되면 채널 상담 열기','无法添加时打开频道咨询'],['이용 순서','使用流程'],['여행 기본정보 제출','提交基本旅行信息'],['안내받은 계좌로 50,000원 입금','向指定账户转账50,000韩元'],['이체 화면 업로드','上传转账截图'],['개인 KakaoTalk 추가','添加个人KakaoTalk'],['담당자 입금 확인 후 서비스 시작','负责人确认到账后开始服务'],['계좌·서비스 먼저 문의하기','先咨询收款账户与服务'],
  ['로투차 · 여행 예약','罗途查 · 旅行预订'],['어떤 여행을 준비하시나요?','您正在计划怎样的旅行？'],['전체 일정을 맡기거나, 필요한 서비스만 골라 보세요.','既可以委托我们安排完整行程，也可以只选择您需要的单项服务。'],
  ['추천','推荐'],['사진 보기 →','查看图片 →'],['접기 ↑','收起 ↑'],['바로가기 →','立即查看 →'],
  ['50,000원은 신청서에 등록한 한 팀의 한 번의 중국 여행, 최대 7일에 적용됩니다. 기간·도시가 늘어나면 추가 견적이 필요합니다.','50,000韩元适用于申请表中登记的一个团队、一次中国旅行，服务期最长7天。增加旅行天数或城市时需另行报价。'],
  ['결제 확인 후 출발 전 전체 일정 검토 1회와 큰 변경 후 재검토 1회를 제공합니다.','确认付款后，可在出发前进行1次完整行程检查；如有重大调整，可再检查1次。'],
  ['여행 중 상담은 중국시간 08:00–20:00입니다. 일반 문의는 통상 30분 이내 답변을 목표로 하지만 현장 상황·통신 상태에 따라 늦어질 수 있습니다.','旅行期间的咨询时间为中国时间08:00–20:00。普通问题通常会在30分钟内回复，但可能因现场情况或网络状态有所延迟。'],
  ['문자 문의는 합리적인 범위에서 이용할 수 있습니다. 현재 위치·문제·원하는 도움을 한 번에 보내 주세요. 반복적인 동일 질문이나 여러 사람의 개별 문의는 한 명의 대표자에게 통합합니다.','可在合理范围内发送文字咨询。请尽量一次说明当前位置、遇到的问题及希望获得的帮助。同一问题反复咨询或多人分别咨询时，将统一与一位团队代表沟通。'],
  ['음성·영상 통화는 문자로 해결하기 어려울 때 하루 1회, 최대 10분을 기준으로 합니다.','仅在文字无法解决问题时提供语音或视频通话，原则上每天1次，每次不超过10分钟。'],
  ['현장 동행, 예약·구매 대행, 비용 선결제, 지속적인 제3자 연락, 24시간 대기, 의료·경찰·영사 긴급 대응과 손해 보상은 포함하지 않습니다.','服务不包含现场陪同、代订代购、垫付费用、持续联系第三方、24小时待命、医疗、警务或领事紧急处置，也不承担损失赔偿。'],
  ['첫 맞춤 일정 검토를 시작하기 전에는 취소 요청이 가능합니다. 검토가 시작된 뒤에는 이미 제공된 맞춤 업무와 서비스 시작 여부를 반영해 환불 가능 금액을 안내합니다.','首次定制行程检查开始前可以申请取消；检查开始后，将根据已经完成的定制工作和服务进度核算可退款金额。'],
  ['위급한 상황은 현지 경찰·의료기관·숙소 직원 또는 영사기관에 먼저 연락해야 합니다.','发生紧急情况时，请优先联系当地警方、医疗机构、酒店工作人员或领事机构。'],
  ['온라인 안심지원 이용 규칙(v2026.10.02), 서비스 범위와 개인정보 안내를 확인하고 동의합니다. 여권·결제 비밀번호 등 민감정보를 보내지 않겠습니다.','我已阅读并同意在线旅行支持服务规则（v2026.10.02）、服务范围及个人信息说明，并承诺不提交护照、支付密码等敏感信息。'],
  ['사진 업로드가 곧 입금 확인을 의미하지 않습니다. 예약 가능 여부와 환불 조건은 결제 전에 카카오톡에서 최종 확인합니다.','上传截图不代表款项已经确认到账。是否可订及退款条件请在付款前通过微信或 KakaoTalk 最终确认。'],
  ['로컬투어차이나 공식 채널','罗途查官方频道'],['네이버 카페','Naver Cafe'],['로투차','罗途查']
  ,['50,000원','50,000韩元'],['KB국민은행','KB国民银行'],['① ID를 복사하고 ② KakaoTalk 친구 추가에서 ID로 검색해 주세요. 증빙은 접수되었지만 입금 확인은 담당자가 별도로 안내합니다.','①复制ID，②在KakaoTalk“添加好友”中按ID搜索。付款凭证提交后，负责人仍会另行确认是否到账。'],['① KakaoTalk ID 복사','① 复制KakaoTalk ID']
  ,['관광지 빠른 선택','快速选择景区'],['국가삼림공원','张家界国家森林公园'],['천문산','天门山'],['대협곡','张家界大峡谷'],['관광지를 선택해 주세요','请选择景区'],['여러 곳을 동시에 선택할 수 있습니다.','可以同时选择多个景区。'],['4일 유효 · 온라인 예약일 최대 2일','门票激活后4天有效 · 最多填写2个入园日期'],['A · B · C 코스 중 필수 선택','必须选择A、B或C线'],['대협곡 · 유리다리 코스','大峡谷·玻璃桥线路'],['관광지별 예약 정보를 입력해 주세요','请填写各景区的预订信息'],['선택한 관광지의 티켓·인원·일정을 각각 설정합니다.','分别设置所选景区的票种、人数和日期。'],['먼저 위에서 관광지를 선택해 주세요.','请先在上方选择景区。'],['4일 유효','激活后4天有效'],['입장 전 꼭 확인하세요','入园前请务必确认'],['전체 이용 안내 보기','查看完整使用说明'],['상품 구성','产品组合'],['연령대별 인원','按年龄填写人数'],['여러 연령대 동시 입력 가능','可同时填写多个年龄段'],['일반권','成人票'],['우대권','优惠票'],['특혜권','优待票'],['어린이권','儿童票'],['만 18–59세','18–59周岁'],['만 14–17세 또는 만 60–64세','14–17周岁或60–64周岁'],['만 65세 이상','65周岁及以上'],['만 14세 미만','14周岁以下'],['온라인 예약일 1','第1个预约入园日期'],['온라인 예약일 2','第2个预约入园日期'],['시간 선택','选择时间'],['입장 게이트','入园门'],['동문 입장 노선','东门入园线路'],['동문','东门'],['남문','南门'],['코스 필수','必须选择线路'],['이동 코스','游览线路'],['기본 입장권','基础门票'],['입장권 + 천문동 에스컬레이터','门票＋天门洞穿山扶梯'],['방문 날짜','游览日期'],['입장 시간','入园时间'],['전체 상품','全线产品'],['입장 가능 시간','可入园时间'],['당일 자유 입장','当日时段内自由入园'],['예약 예상 내역','预订费用明细'],['입력 내용과 예상 금액이 바로 반영됩니다.','所填信息与预计费用会即时更新。'],['선택한 관광지가 없습니다.','尚未选择景区。'],['예상 총 금액','预计总金额'],['예약 문의 내용','预订咨询内容'],['관광지를 선택하면 문의 내용이 자동으로 만들어집니다.','选择景区后，系统会自动生成咨询内容。'],['예약 진행 안내','预订流程说明'],['① 문의 내용 복사','① 复制咨询内容'],['② KakaoTalk 열기','② 打开KakaoTalk'],
  ['데이투어 빠른 선택','快速选择一日游'],['무릉원 풍경','武陵源风景'],['무릉원 핵심','武陵源精华'],['황룡동·대협곡','黄龙洞·大峡谷'],['데이투어 지역 선택','选择一日游地区'],['후난성 湖南省 · 산과 협곡','湖南省 · 山峰与峡谷'],['하이난성 海南省 · 섬과 바다','海南省 · 海岛与海滨'],['예약 정보를 입력해 주세요','请填写预订信息'],['여행일과 인원, 상품별 집결 정보를 알려 주세요.','请填写出行日期、人数及产品要求的集合信息。'],['집결 장소','集合地点'],['픽업 장소','接站地点'],['샌딩 장소','送达地点'],['호텔명 또는 정확한 장소','酒店名称或准确地点'],['데이투어 예상 내역','一日游费用明细'],['선택 내용에 따라 자동 계산됩니다.','费用将根据所选内容自动计算。'],['필수 정보 확인','确认必填信息'],['문의 복사','复制咨询内容'],['KakaoTalk 전송','发送至KakaoTalk'],['① 필수 정보 확인하기','① 检查必填信息'],['예약 가능 여부, 집결 시간, 취소·변경·환불 규정은 결제 전 최종 확인이 필요합니다.','是否可订、集合时间以及取消、变更和退款规则，均需在付款前最终确认。'],
  ['가이드 서비스 바로 선택','快速选择导游服务'],['공항·역 미팅','机场·车站接站'],['시내 동행','市区陪同'],['관광지 안내','景区陪同讲解'],['가이드 요청 내용을 선택해 주세요','请选择导游服务需求'],['1~6시간은 6시간 기준으로 계산됩니다.','1至6小时均按6小时计费。'],['이용 날짜','服务日期'],['＋ 이용 날짜 추가','＋ 添加服务日期'],['연속되지 않은 날짜도 선택할 수 있습니다. 시간·인원·식사 조건은 매일 동일하게 적용됩니다. 날짜별로 다르면 희망 일정에 적어 주세요.','可选择不连续的日期。时间、人数和用餐条件默认每天相同；如每天安排不同，请在期望行程中说明。'],['시작 시간','开始时间'],['미팅 장소','会合地点'],['호텔 로비 또는 정확한 장소','酒店大堂或准确地点'],['서비스 종류','服务类型'],['여행가이드','旅行导游'],['일반생활통역','日常生活翻译'],['비즈니스 통역','商务翻译'],['서비스 방식','服务方式'],['프라이빗','单独包团'],['조인 신청','申请拼团'],['하루 이용 시간','每日服务时长'],['하루 가이드 별도 식사','导游每日用餐安排'],['함께 식사 또는 별도 제공','同行用餐或另行提供'],['희망 관광지 (복수 선택)','希望游览的景区（可多选）'],['숙박 지역','住宿区域'],['기타 지역','其他地区'],['호텔명','酒店名称'],['호텔명을 입력해 주세요','请输入酒店名称'],['교통 계획','交通安排'],['직접 준비','自行安排'],['택시/디디 이용','乘坐出租车/滴滴'],['가이드에게 차량 호출 요청','请导游协助叫车'],['전용차량 상담 필요','需要咨询专车'],['입장권','门票'],['이미 준비했습니다','已经准备好'],['입장권 예약이 필요합니다','需要预订门票'],['희망 가이드','意向导游'],['지정 없음','不指定'],['희망 일정','期望行程'],['관광지를 골랐다면 선택사항','已选景区时可不填'],['원하는 순서나 특별한 일정이 있을 때만 적어 주세요.','如有游览顺序或特别安排，请在此说明。'],['기타 요청','其他需求'],['이동이 불편한 분, 식사, 차량 등 추가 요청을 적어 주세요.','如有行动不便、用餐或车辆等需求，请在此说明。'],['예상 가이드 비용','预计导游费用'],['가이드 동행 비용만 계산됩니다.','此处仅计算导游陪同服务费。'],['포함되지 않아요','以下费用不包含'],['입장권 · 차량 · 식사 · 기타 개인경비. 이동 시 가이드가 택시·디디 호출을 도울 수 있으며 실제 차량 비용은 고객 부담입니다.','门票、车辆、餐费及其他个人消费不包含在内。导游可协助叫出租车或滴滴，实际车费由客人承担。'],['가이드 문의 내용','导游咨询内容'],
  ['서비스를 선택해 주세요','请选择用车服务'],['공항 픽업·샌딩','机场接送'],['일일 전용차량','全天专车'],['이용 정보를 입력해 주세요','请填写用车信息'],['탑승 인원','乘车人数'],['큰 짐','大件行李'],['차량','车型'],['이용 방향','用车方向'],['편도 1회','单程1次'],['왕복 2회','往返2次'],['이용 시간','用车时长'],['기사 식사','司机用餐'],['출발 장소','出发地点'],['도착 장소','到达地点'],['항공편','航班号'],['이동 경로','行车路线'],['차량 예상 내역','用车费用明细'],['차량 문의 내용','用车咨询内容'],
  ['여행 서비스를 함께 예약하세요','一次预订多项旅行服务'],['한 번 입력한 여행 정보로 필요한 서비스를 함께 문의할 수 있습니다.','只需填写一次旅行信息，即可同时咨询多项服务。'],['필요한 서비스를 선택해 주세요','请选择需要的服务'],['선택한 서비스 설정','设置已选服务'],['묶음예약 예상 내역','组合预订费用明细'],['묶음예약 문의 내용','组合预订咨询内容'],['문의에 포함할 서비스','咨询中包含的服务'],
  ['장가계 올인원 프라이빗 투어','张家界一站式定制包团'],['고급형 호텔 · 전용차량 · 한국어 가이드 · 관광지 입장권 · 호텔 조식과 매일 중·석식 · 장가계 공항/서역 픽업·샌딩 포함','包含品质酒店、专车、导游、景区门票、酒店早餐及每日午晚餐，并提供张家界机场或西站接送。'],['여행 조건을 알려 주세요','请填写旅行需求'],['도착 날짜','抵达日期'],['출발 날짜','离开日期'],['도착 교통편','抵达交通方式'],['출발 교통편','离开交通方式'],['호텔 등급','酒店标准'],['객실 수','房间数量'],['원하는 일정','期望行程'],['올인원 예상 내역','定制包团费用明细'],['정확한 일정과 금액은 상담 후 확정됩니다.','准确行程和费用将在沟通后确认。'],['올인원 문의 내용','定制包团咨询内容'],
  ['사진으로 분위기를 확인하고, 중국어 상호를 복사한 뒤 고덕지도에서 바로 찾을 수 있습니다. 상세 후기와 추가 사진은 Cafe 원문으로 연결됩니다.','先通过图片了解环境，复制中文店名后即可在高德地图查找。详细体验和更多图片可前往 Naver Cafe 原文查看。'],['장소 종류','地点类型'],['한 번에 비교','全部比较'],['식사·향토요리','正餐·当地菜'],['휴식·디저트','休息·甜品'],['바·펍·바비큐','酒吧·精酿·烧烤'],['간식·생필품','零食·生活用品'],['예: 싼샤궈, 전망 카페, 슈퍼마켓','例如：三下锅、景观咖啡馆、超市'],['Cafe 실사용 후기와 현지 정보를 편집해 정리했습니다. 가격·영업시간·지점 상태는 바뀔 수 있으므로 방문 당일 지도와 매장에 다시 확인해 주세요. 슈퍼마켓은 특정 지점을 보증하지 않고 가까운 영업 지점을 찾도록 안내합니다.','内容根据 Naver Cafe 真实体验和当地信息整理。价格、营业时间及门店状态可能变化，请在到店当天再次通过地图或商家确认。超市信息用于帮助查找附近仍在营业的门店，不对特定分店作保证。'],
  ['여행자가 남긴','旅行者留下的'],['장가계의 기억','张家界记忆'],['여행을 준비하는 분들에게,','写给正在准备旅行的您，'],['먼저 다녀온 여행자의 이야기를 전합니다.','看看已经出发过的旅行者怎么说。'],['장가계 국가삼림공원의 봉우리 풍경','张家界国家森林公园峰林风光'],['장가계 풍경','张家界风光'],['여행 이야기','旅行故事'],['작성일 최신순','按发布日期由新到旧'],['영상 아래에 남겨진 실제 이용 후기','视频下方的真实游客评价'],['영상과 전체 댓글 보기 ↗','查看视频和全部评论 ↗'],['후기 모음 &amp; 참여 안내','评价汇总与参与方式'],['카페 최신 글 보기 ↗','查看 Naver Cafe 最新文章 ↗'],
  ['중국 여행 준비 체크리스트','中国旅行准备清单'],['현재 여행 단계를 선택하세요','请选择当前旅行阶段'],['출발 전','出发前'],['중국 도착 후','抵达中国后'],['여행 중','旅行途中'],['확인했어요','已确认'],['완료 기준','完成标准'],['잘 안 되거나 조건이 다르다면?','遇到问题或情况不同怎么办？'],['말이 안 통할 때, 이 문장을 보여 주세요','语言不通时，请出示这些句子'],['중국어 복사','复制中文'],
  ['서비스 제공 업체','服务提供商'],['운영자','运营负责人'],['중국 전화','中国电话'],['한국 전화','韩国电话'],['영업집조','营业执照'],['통일사회신용코드','统一社会信用代码'],['법인대표','法定代表人'],['등록자본','注册资本'],['경영범위','经营范围'],['문의 채널','咨询渠道']
  ,['문의 순서','咨询步骤'],['복사 후','复制后'],['KakaoTalk 상담창에 붙여넣어 주세요.','请粘贴到KakaoTalk咨询窗口并发送。'],['KakaoTalk에 붙여넣고 전송','粘贴到KakaoTalk并发送'],['가이드 공항 미팅','导游机场接站'],['장가계 시내 동행','张家界市区陪同'],['장가계 관광 안내','张家界景区陪同'],['끼 +10,000원','餐 +10,000韩元'],['끼 +20,000원','餐 +20,000韩元'],['무릉원','武陵源'],['칠십이기루','七十二奇楼'],['가이드 요금은 일정 확인 후 최종 확정됩니다. 12인 이상은 별도 문의가 필요합니다.','导游费用将在确认具体行程后最终确定；12人以上请另行咨询。'],['곳','家'],
  ['카페의 여행기를 편집 요약했습니다. 닉네임·제목·작성일은 원문 기준이며, 자유여행과 여러 여행 서비스를 이용한 경험이 함께 담겨 있습니다. 같은 여행의 연재 글도 각각 소개합니다. 전체 내용과 사진은 원문에서 확인해 주세요. 카페 로그인 또는 가입이 필요할 수 있습니다.','我们对 Naver Cafe 中公开的旅行记录进行了整理。昵称、标题和发布日期以原文为准，内容包含自由行及不同旅行服务的真实体验。同一段旅行的连载文章会分别展示；完整内容和图片请前往原文查看，部分内容可能需要登录 Naver。'],['로투차 후기 영상의 공개 댓글 중 실제 여행·투어 이용 경험 13건을 원문 의미가 바뀌지 않도록 짧게 정리했습니다.','整理了罗途查视频公开评论中的13条真实旅行及服务体验。'],['작성자 표시는 공개된 YouTube 닉네임 기준입니다. 준비 문의·일반 응원·질문 댓글은 이용 후기로 오해되지 않도록 제외했습니다.','作者名称以 YouTube 公开昵称为准；准备咨询、普通留言和问题类评论未计入真实体验。'],
  ['장가계 운무가 흐르는 봉우리 풍경','张家界云雾峰林'],['장가계의 봉우리 풍경','张家界峰林风光'],['한국어 가이드가 여행객을 맞이하는 모습','导游迎接游客'],['봉우리 풍경','峰林风光'],['절벽 산책로','悬崖栈道'],['현지 대형 마트','当地大型超市'],['실사진','实拍图片'],['투어','旅行'],['코스','路线'],['계곡','峡谷'],['동굴','洞穴'],['공연','演出'],['거리','街景'],['매장','门店'],
  ['빠른 선택','快速选择'],['인승','座'],['예상 이용시간','预计用车时长'],['공항·호텔·정확한 주소','机场、酒店或准确地址'],['추가 이동','额外行程'],['없음','无'],['공항','机场'],['문의 내용','咨询内容'],['원','韩元']
];
const zhTranslations=[...zhPairs].sort((a,b)=>b[0].length-a[0].length);
const zhTranslate = value => zhTranslations.reduce((text,[from,to])=>text.replaceAll(from,to),value);
const zhMeta={
  home:['罗途查｜张家界当地旅行预订','集中查看张家界门票、一日游、中文沟通导游、车辆及一站式定制包团。'],
  booking:['张家界旅行预订｜罗途查','按需要选择完整定制行程、一日游、门票、车辆或导游服务。'],
  ticket:['张家界景区门票预订｜罗途查','比较张家界国家森林公园、天门山和大峡谷门票，查看预计费用和入园要求。'],
  daytour:['张家界与三亚一日游｜罗途查','查看张家界和海南三亚一日游的路线、费用、包含项目及集合方式。'],
  guide:['张家界当地导游服务｜罗途查','可预约机场、车站接站以及景区陪同导游服务，服务时间和费用清晰确认。'],
  onlineguide:['中国旅行在线支持｜罗途查','提供行前行程检查及旅途中路线、打车、餐厅、支付等在线协助，每组50,000韩元，最长7天。'],
  vehicle:['张家界机场接送与专车｜罗途查','根据人数、行李和行驶路线安排张家界机场接送或专车服务。'],
  private:['张家界一站式定制包团｜罗途查','按日期和需求定制包含酒店、专车、导游、门票及用餐的张家界包团旅行。'],
  combo:['张家界旅行组合预订｜罗途查','一次组合咨询门票、一日游、导游和车辆服务。'],
  info:['中国旅行准备指南｜罗途查','分步骤准备入境、支付、通信、交通与行李事项。'],
  food:['张家界美食与生活地图｜罗途查','查找张家界餐厅、咖啡馆、夜宵、酒吧和超市，并复制中文店名打开高德地图。'],
  reviews:['张家界旅行真实评价｜罗途查','查看游客在 Naver Cafe 与 YouTube 留下的张家界旅行真实评价。'],
  company:['公司与服务商资质｜罗途查','查看张家界当地旅行服务商、营业执照及中韩联系方式。']
};
const englishAnalyticsHead = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-232N1VVFP5"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-232N1VVFP5');</script>`;
const englishAnalyticsEvents = `<script>document.addEventListener('click',event=>{const target=event.target.closest('a,button');if(!target||typeof gtag!=='function')return;const href=target.getAttribute('href')||'';if(target.closest('.language-switch')&&target.lang==='ko')gtag('event','language_switch',{from_language:'en',to_language:'ko',service});if(target.id==='copy')gtag('event','inquiry_copy',{language:'en',service});if(href.includes('pf.kakao.com'))gtag('event','kakao_click',{language:'en',service});if(href.includes('youtube.com'))gtag('event','youtube_click',{language:'en',service});if(href.includes('cafe.naver.com'))gtag('event','naver_cafe_click',{language:'en',service});if(href.startsWith('tel:'))gtag('event','phone_click',{language:'en',service})});</script>`;

const reviews = JSON.parse(await readFile(path.join(root, 'src/reviews.json'), 'utf8'));
const restaurants = JSON.parse(await readFile(path.join(root, 'src/restaurants.json'), 'utf8')).filter(item => !['rejected', 'draft', 'needs_reverification'].includes(item.status));
const youtubeReviews = JSON.parse(await readFile(path.join(root, 'src/youtube-reviews.json'), 'utf8'));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const renderFoodExtra = item => !item.images?.length ? '' : `<div class="food-gallery">${item.images.slice(1).map(photo=>`<figure><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${escapeHtml(photo.alt)}</figcaption></figure>`).join('')}</div><p class="food-image-note">${escapeHtml(item.galleryNote||'플랫폼에 공개된 해당 지점 사진입니다. 실제 메뉴와 구성은 달라질 수 있습니다.')}</p><details><summary>주소·영업·현지 이용 안내</summary>${item.address?`<p><b>주소</b> ${escapeHtml(item.address)}</p>`:''}${item.hoursAccess?`<p><b>영업·방문</b> ${escapeHtml(item.hoursAccess)}</p>`:''}${item.payment?`<p><b>결제</b> ${escapeHtml(item.payment)}</p>`:''}${item.address?`<button type="button" class="btn btn-outline" data-prep-copy="${escapeHtml(item.chinese+' '+item.address)}">기사님께 보여 줄 주소 복사</button>`:''}<p>앱이 열리지 않으면 중국어 상호와 주소를 복사해 검색하고 도시와 지점을 다시 확인하세요.</p>${item.source?`<p><a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">정보·사진 출처</a>${item.checkedAt?` · ${escapeHtml(item.checkedAt)} 확인`:''} · 직접 방문 후기가 아닙니다.</p>`:''}</details>`;
const restaurantCards = restaurants.map(item => {
  const cafe=item.article?`https://cafe.naver.com/f-e/cafes/31682774/articles/${item.article}?menuid=${item.menuId||3}&referrerAllArticles=false`:(item.cafeMenu||'https://cafe.naver.com/f-e/cafes/31682774/menus/3');
  const map=item.map||`https://uri.amap.com/search?keyword=${encodeURIComponent(item.chinese)}&city=${encodeURIComponent(item.region==='sanya'?'三亚':'张家界')}&src=rotucha&callnative=0`;
  const kind=/슈퍼|마트|장보기/.test(item.category)?'market':/카페|디저트|브런치|커피|베이커리/.test(item.category)?'cafe':/바 ·|펍|야식/.test(item.category)?'night':'food';
  const kindLabel={food:'식당',cafe:'카페',night:'야식·술',market:'마트'}[kind];
  return `<article id="${escapeHtml(item.id)}" class="food-card" data-food-region="${escapeHtml(item.region||'zhangjiajie')}" data-food-kind="${kind}" data-food-search="${escapeHtml([item.name,item.chinese,item.area,item.category,item.bestFor||''].join(' ').toLowerCase())}"><div class="food-photo"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} 관련 사진" loading="lazy" referrerpolicy="no-referrer"><span>${kindLabel}</span></div><div class="food-card-body"><div class="food-meta"><span>${escapeHtml(item.area)}</span><span>${escapeHtml(item.category)}</span></div><h3>${escapeHtml(item.name)}</h3><p class="food-chinese" lang="zh-CN">${escapeHtml(item.chinese)}</p><p>${escapeHtml(item.note)}</p>${item.bestFor?`<p class="food-use"><b>이럴 때 추천</b>${escapeHtml(item.bestFor)}</p>`:''}${item.tip?`<p class="food-tip"><b>현지 이용 팁</b>${escapeHtml(item.tip)}</p>`:''}${renderFoodExtra(item)}<strong class="food-price">예산 참고 · ${escapeHtml(item.price)}</strong><div class="food-actions"><button type="button" class="btn btn-outline" data-prep-copy="${escapeHtml(item.chinese)}">중국어 상호 복사</button><a class="btn btn-primary" href="${escapeHtml(map)}" target="_blank" rel="noopener noreferrer">고덕지도에서 찾기 ↗</a><a href="${escapeHtml(cafe)}" target="_blank" rel="noopener noreferrer">${item.article?'실사진·상세 후기':item.region==='sanya'?'하이난 맛집 게시판':'장가계 맛집 게시판'} 보기 ↗</a></div></div></article>`;
}).join('\n');
const youtubeReviewCards = youtubeReviews.map(item=>{const preview=item.text.length>90?`${item.text.slice(0,90).trim()}…`:item.text;return `<article class="youtube-review"><span class="youtube-review-mark" aria-hidden="true">▶</span><p class="youtube-review-preview">${escapeHtml(preview)}</p><details><summary>전체 후기 펼쳐보기</summary><blockquote>${escapeHtml(item.text)}</blockquote></details><div><strong>${escapeHtml(item.author)}</strong><a href="https://youtu.be/7QMuXRdhyHg" target="_blank" rel="noopener noreferrer">YouTube 원문 ↗</a></div></article>`}).join('\n');
const sortedReviews = [...reviews].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
const reviewIds = new Set();
for (const review of sortedReviews) {
  if (reviewIds.has(review.id) || !review.title || !review.author || !review.summary || !review.category || !['review','collection','guide'].includes(review.kind)) throw new Error('Incomplete or duplicate review');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(review.publishedAt) || !(new URL(review.sourceUrl).hostname === 'cafe.naver.com' && [ `/lotocha/${review.id}`, `/f-e/cafes/31682774/articles/${review.id}` ].includes(new URL(review.sourceUrl).pathname)) || !/^\d+$/.test(review.id)) throw new Error('Invalid review date or source URL');
  reviewIds.add(review.id);
}
const renderReview = review => {
  const isReview = review.kind === 'review';
  const cta = isReview ? '네이버 카페에서 전체 후기 읽기' : '네이버 카페에서 원문 보기';
  return `<article class="review-card" data-review-id="${escapeHtml(review.id)}"><div class="review-card-top"><span class="review-source">NAVER CAFE</span><time datetime="${escapeHtml(review.publishedAt)}">${escapeHtml(review.publishedAt.replaceAll('-','.'))}</time></div><span class="review-category">${escapeHtml(review.category)}</span><h3><a href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(review.title)}</a></h3><div class="review-summary"><span>${isReview ? '후기 요약' : '게시글 요약'}</span><p>${escapeHtml(review.summary)}</p></div><div class="review-author"><span class="review-avatar" aria-hidden="true">${escapeHtml(Array.from(review.author)[0])}</span><span>${escapeHtml(review.author)}</span></div><a class="review-original" href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(review.title)} — ${cta} (새 창)"><span>${cta}</span><span aria-hidden="true">↗</span></a></article>`;
};
const reviewCards = sortedReviews.filter(review=>review.kind==='review').map(renderReview);
const relatedReviewCards = sortedReviews.filter(review=>review.kind!=='review').map(renderReview);
const zhArea = value => ({'장가계 시내':'张家界市区','72기루':'七十二奇楼','천문산':'天门山','난좡핑':'南庄坪','무릉원 · 바오펑후 인근':'武陵源 · 宝峰湖附近'}[value]||'张家界');
const zhCategory = value => /카페|디저트/.test(value)?'咖啡 · 甜品':/슈퍼|마트/.test(value)?'超市 · 购物':/바 ·|펍/.test(value)?'酒吧 · 夜生活':/바비큐|꼬치/.test(value)?'烧烤 · 夜宵':/한식/.test(value)?'韩国料理':/일식/.test(value)?'日本料理':/서양식/.test(value)?'西餐 · 早午餐':'当地餐厅';
const zhRestaurantCards = restaurants.map(item=>{const cafe=item.article?`https://cafe.naver.com/f-e/cafes/31682774/articles/${item.article}?menuid=${item.menuId||3}&referrerAllArticles=false`:(item.cafeMenu||'https://cafe.naver.com/f-e/cafes/31682774/menus/3');const map=item.map||`https://uri.amap.com/search?keyword=${encodeURIComponent(item.chinese)}&city=${encodeURIComponent(item.region==='sanya'?'三亚':'张家界')}&src=rotucha&callnative=0`;const kind=/슈퍼|마트|장보기/.test(item.category)?'market':/카페|디저트|브런치|커피|베이커리/.test(item.category)?'cafe':/바 ·|펍|야식/.test(item.category)?'night':'food';const note=kind==='market'?'适合购买饮料、水果、零食和旅行所需的日常用品。请在出发前确认最近门店和营业状态。':kind==='cafe'?'适合途中休息、品尝咖啡、饮品或烘焙甜点。价格和营业时间请以到店当天为准。':kind==='night'?'适合晚间寻找烧烤、饮品或小酌。下单前请确认价格、份量及口味。':'当地用餐参考。建议在点餐前确认菜品、辣度、价格及当天营业情况。';const gallery=item.images?.length?`<div class="food-gallery">${item.images.slice(1).map(photo=>`<figure><img src="../${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${escapeHtml(photo.alt)}</figcaption></figure>`).join('')}</div><p class="food-image-note">${escapeHtml(item.galleryNote||'图片来自该门店公开页面，实际菜品和陈列可能变化。')}</p>`:'';return `<article id="${escapeHtml(item.id)}" class="food-card" data-food-region="${escapeHtml(item.region||'zhangjiajie')}" data-food-kind="${kind}" data-food-search="${escapeHtml([item.chinese,zhArea(item.area),zhCategory(item.category)].join(' ').toLowerCase())}"><div class="food-photo"><img src="${escapeHtml(item.image.replace(/^assets\//,'../assets/'))}" alt="${escapeHtml(item.chinese)}相关图片" loading="lazy" referrerpolicy="no-referrer"><span>${zhCategory(item.category)}</span></div><div class="food-card-body"><div class="food-meta"><span>${zhArea(item.area)}</span><span>${zhCategory(item.category)}</span></div><h3 lang="zh-CN">${escapeHtml(item.chinese)}</h3><p>${note}</p>${gallery}<strong class="food-price">人均参考 · ${/\d/.test(item.price)?escapeHtml(item.price.replace('약 ','约').replaceAll('위안','元')):'到店前确认'}</strong><div class="food-actions"><button type="button" class="btn btn-outline" data-prep-copy="${escapeHtml(item.chinese+(item.address?' '+item.address:''))}">复制店名和地址</button><a class="btn btn-primary" href="${escapeHtml(map)}" target="_blank" rel="noopener noreferrer">在高德地图查找 ↗</a><a href="${escapeHtml(cafe)}" target="_blank" rel="noopener noreferrer">${item.article?'查看 Naver Cafe 图文':'查看地区美食板块'} ↗</a></div></div></article>`}).join('\n');
const zhReviewTitles={212:'罗途查旅行体验',210:'非常感谢，想认真留下一篇评价',209:'感谢协助预订武陵源门票',205:'和罗途查一起完成的张家界夫妻旅行',155:'第6天：走过玻璃桥，深入大峡谷',154:'第5天：走进黄龙洞',153:'第4天：漫步金鞭溪',150:'第3天：登上张家界国家森林公园',148:'第2天：前往芙蓉镇',146:'大家庭的天门山C线体验',128:'不加修饰的真实评价',120:'穿过雨雾遇见真景——与父亲的张家界之旅',112:'充实的张家界3天2晚旅行',109:'介于自由行和跟团游之间的旅行方式',91:'母子张家界5天4晚旅行',76:'张家界6天5晚自由行体验',70:'张家界4天3晚家庭旅行',67:'带父母出行的独立包团体验',54:'张家界4天3晚旅行评价',81:'YouTube游客真实评价汇总',44:'欢迎分享您的张家界旅行评价'};
const zhReviewCards = sortedReviews.filter(review=>review.kind==='review').map(review=>`<article class="review-card"><div class="review-card-top"><span class="review-source">NAVER CAFE</span><time datetime="${review.publishedAt}">${review.publishedAt.replaceAll('-','.')}</time></div><span class="review-category">真实旅行记录</span><h3><a href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(zhReviewTitles[review.id]||'张家界旅行评价')}</a></h3><div class="review-summary"><span>内容说明</span><p>该内容由游客本人发布，包含实际行程、同行人员、天气和服务体验。点击下方按钮可查看完整原文及图片。</p></div><div class="review-author"><span class="review-avatar" aria-hidden="true">旅</span><span>${escapeHtml(review.author)}</span></div><a class="review-original" href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer"><span>前往 Naver Cafe 阅读全文</span><span aria-hidden="true">↗</span></a></article>`).join('\n');
const zhRelatedReviewCards = sortedReviews.filter(review=>review.kind!=='review').map(review=>`<article class="review-card"><div class="review-card-top"><span class="review-source">NAVER CAFE</span><time datetime="${review.publishedAt}">${review.publishedAt.replaceAll('-','.')}</time></div><span class="review-category">评价与参与说明</span><h3><a href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(zhReviewTitles[review.id]||'评价汇总')}</a></h3><div class="review-summary"><span>内容说明</span><p>查看已公开的评价汇总或了解如何发布自己的旅行体验。</p></div><a class="review-original" href="${escapeHtml(review.sourceUrl)}" target="_blank" rel="noopener noreferrer"><span>查看原文</span><span aria-hidden="true">↗</span></a></article>`).join('\n');

const pages = [
  {file:'booking.html',service:'booking',title:'여행 예약 | 로투차',description:'맞춤 여행, 데이투어, 입장권, 차량과 가이드를 필요한 만큼 선택하세요.'},
  {file:'food-map.html',service:'food',title:'지역별 맛집·지도 | 로투차',description:'장가계 시내·무릉원·봉황고성·부용진·싼야 식당 안내와 고덕지도.'},
  {file:'reviews.html', service:'reviews', title:'장가계 여행 후기 | 로투차', description:'네이버 카페에 남겨진 장가계 여행 후기의 핵심을 읽고, 원문에서 전체 이야기와 사진을 확인하세요.'},
  {file:'travel-info.html', service:'info', title:'중국 여행 준비·입국 체크리스트 | 로투차', description:'한국 여권 여행자를 위한 중국 무비자·입국신고·결제·통신·교통 준비를 단계별로 확인하세요. 장가계·무릉원·봉황고성·부용진·싼야 맛집 안내 Beta.'},
  {
    file: 'index.html',
    service: 'home',
    title: '로투차 | 장가계 현지 여행 예약',
    description: '장가계 입장권, 데이투어, 한국어 현지가이드, 차량과 올인원 프라이빗 투어를 한곳에서 확인하세요.'
  },
  {
    file: 'private-tour.html',
    service: 'private',
    title: '장가계 올인원 프라이빗 투어 | 로투차',
    description: '호텔, 전용차량, 한국어 가이드, 입장권과 식사가 포함된 장가계 맞춤 프라이빗 투어를 설계하세요.'
  },
  {
    file: 'tickets.html',
    service: 'ticket',
    title: '장가계 관광지 입장권 예약 | 로투차',
    description: '장가계 국가삼림공원, 천문산과 대협곡 입장권 옵션을 비교하고 예상 금액을 확인하세요.'
  },
  {
    file: 'day-tours.html',
    service: 'daytour',
    title: '장가계 · 하이난 싼야·삼아 데이투어 예약 | 로투차',
    description: '장가계와 하이난 싼야·삼아(三亚) 일일 투어의 일정, 요금, 포함 사항과 집결 장소를 확인하세요.'
  },
  {
    file: 'local-guide.html',
    service: 'guide',
    title: '장가계 한국어 현지가이드 | 로투차',
    description: '장가계 공항·역 미팅부터 관광지 동행까지 일정에 맞는 한국어 현지가이드를 요청하세요.'
  },
  {
    file: 'online-guide.html',
    service: 'onlineguide',
    title: '중국 여행 온라인 안심지원 | 로투차',
    description: '출발 전 일정 검토부터 중국 여행 중 한국어 실시간 도움까지, 한 팀 한 번의 여행을 50,000원에 지원합니다.'
  },
  {
    file: 'vehicles.html',
    service: 'vehicle',
    title: '장가계 차량·공항픽업 예약 | 로투차',
    description: '장가계 공항 픽업, 샌딩과 인원에 맞는 전용차량의 사진 및 예상 금액을 확인하세요.'
  },
  {
    file: 'multi-booking.html',
    service: 'combo',
    title: '장가계 여행 서비스 묶음예약 | 로투차',
    description: '입장권, 데이투어, 한국어 가이드와 차량을 한 번에 조합해 문의하세요.'
  },
  {
    file: 'company.html',
    service: 'company',
    title: '사업자·서비스 제공자 정보 | 로투차',
    description: '로투차 장가계 여행 서비스 제공업체, 중국 법인 영업집조와 한국·중국 상담 연락처를 확인하세요.'
  }
];

for (const page of pages) {
  let html = template.replaceAll('{{YOUTUBE_REVIEW_CARDS}}',youtubeReviewCards).replaceAll('{{YOUTUBE_REVIEW_COUNT}}',String(youtubeReviews.length)).replaceAll('{{RESTAURANT_CARDS}}', restaurantCards).replaceAll('{{RESTAURANT_COUNT}}', String(restaurants.length)).replaceAll('{{REVIEW_CARDS}}', reviewCards.join('\n')).replaceAll('{{RELATED_REVIEW_CARDS}}', relatedReviewCards.join('\n')).replaceAll('{{REVIEW_COUNT}}', String(reviewCards.length)).replaceAll('{{FEATURED_REVIEW_CARDS}}', reviewCards.slice(0, 2).join('\n'))
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${page.description}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">`)
    .replace('<body data-initial-service="home">', `<body data-initial-service="${page.service}">`)
    .replace(/service-tab active/g, 'service-tab');

  const activePattern = new RegExp(`(<a class="service-tab)([^"]*" data-service="${page.service}")`);
  html = html.replace(activePattern, '$1 active$2');
  html = html.replace('href="en/index.html" data-en-link', `href="en/${['reviews','booking','food'].includes(page.service) ? 'index.html' : page.file}" data-en-link`);
  html = html.replace('href="zh/index.html" data-zh-link', `href="zh/${page.file}" data-zh-link`);
  html = html.replace('</head>', `  <link rel="alternate" hreflang="ko" href="https://localtourchina.com/${page.file === 'index.html' ? '' : page.file}">\n  <link rel="alternate" hreflang="en" href="https://localtourchina.com/en/${['reviews','booking','food'].includes(page.service) || page.file === 'index.html' ? '' : page.file}">\n  <link rel="alternate" hreflang="zh-CN" href="https://localtourchina.com/zh/${page.file === 'index.html' ? '' : page.file}">\n</head>`);
  if (page.service === 'reviews') html = html.replace(/  <link rel="alternate" hreflang="en"[^>]*>\n/, '');
  html = `<!-- Generated from src/site-template.html. Run: npm run build -->\n${html}`;
  await writeFile(path.join(root, page.file), withImageDimensions(html));
}

const englishPages = [
  {file:'index.html',service:'home',nav:'Home',title:'Zhangjiajie Private Tours | Localtour China',description:'Plan a Zhangjiajie private tour with a fluent English-speaking local guide, tickets, hotels and private transport.',eyebrow:'LOCALTOUR CHINA',heading:'Zhangjiajie travel, made easier',intro:'Choose a complete private trip or request only the local services you need.',image:'../assets/media/hero/home-mobile.jpg',features:[['One local contact','Hotels, transport, tickets and a fluent English-speaking local guide are coordinated together.'],['Designed around your flights','We adapt the route after checking arrival and departure times.'],['Written quote first','Availability, payment and cancellation terms are confirmed before you pay.']]},
  {file:'travel-info.html',service:'info',nav:'Travel guide',title:'Zhangjiajie & Sanya Food and Travel Guide | Localtour China',description:'Practical food, transport, payment and packing advice for Zhangjiajie and Sanya.',eyebrow:'LOCAL TRAVEL GUIDE',heading:'Local food and practical travel tips',intro:'Quick guidance for eating, getting around, paying and preparing for your trip.',image:'../assets/media/sanya/night-market.jpg',features:[['Zhangjiajie food','Try Sanxiaguo, Tujia dishes and rice noodles; ask for the spice level before ordering.'],['Sanya food','Confirm seafood weight, price and cooking charges before payment.'],['Transport, payment and contact','Save your hotel address in Chinese, confirm your payment method and keep the local coordinator on KakaoTalk or WeChat.'],['Personal recommendations','Send your hotel, group size, dietary needs and preferred food. We will suggest options that fit your route.']]},
  {file:'private-tour.html',service:'private',nav:'Private tour',title:'All-inclusive Zhangjiajie Private Tour | Localtour China',description:'Request a tailor-made Zhangjiajie private tour with hotel, a fluent English-speaking local guide, tickets, meals and transport.',eyebrow:'ALL-INCLUSIVE PRIVATE TOUR',heading:'Your Zhangjiajie trip, planned as one journey',intro:'A private itinerary built around your dates, pace, hotel needs and must-see places.',image:'../assets/media/hero/home-mobile.jpg',features:[['Core services included','Hotel, private vehicle, itinerary tickets and the company of a fluent English-speaking local guide.'],['Flexible itinerary','Popular routes can be adjusted to your flights and walking preferences.'],['Human confirmation','A local coordinator checks the route before issuing the quote.']]},
  {file:'tickets.html',service:'ticket',nav:'Tickets',title:'Zhangjiajie Attraction Tickets | Localtour China',description:'Request Zhangjiajie National Forest Park, Tianmen Mountain and Grand Canyon tickets.',eyebrow:'ATTRACTION TICKETS',heading:'Book the right ticket combination',intro:'Tell us where you want to go and we will confirm the correct ticket, date and entry requirements.',image:'../assets/media/attractions/forest-south.jpg',features:[['National Forest Park · 4-day multi-entry ticket','Routes may include Bailong Elevator, Tianzi Mountain and Golden Whip Stream. The ticket is valid for four days from first activation; this does not automatically reserve four entry dates. Keep no more than two unused entry reservations at a time. For a third visit, contact Localtour China after your actual first entry; for a fourth visit, contact us after your actual second entry. Before every entry, your date, entrance and time slot must be confirmed. Reservations depend on remaining availability and are not guaranteed. All visits must fall within the four-day validity period. Third and fourth refer to visit order: visits need not be on consecutive dates, and you do not have to visit four times.'],['Tianmen Mountain','Confirm the selected line, entry date and time before payment.'],['Grand Canyon','Glass Bridge and canyon options depend on the selected product.']]},
  {file:'day-tours.html',service:'daytour',nav:'Day tours',title:'Zhangjiajie Day Tours | Localtour China',description:'Explore Zhangjiajie on a private day tour with transport, tickets and a fluent English-speaking local guide.',eyebrow:'PRIVATE DAY TOURS',heading:'See more of Zhangjiajie in one day',intro:'Choose the scenery you want to experience and travel with a fluent English-speaking local guide.',image:'../assets/media/attractions/canyon-bridge.jpg',features:[['Private schedule','Your group travels without joining a large fixed bus tour.'],['English guide accompaniment','A fluent English-speaking local guide accompanies your group throughout the agreed sightseeing hours.'],['Clear inclusions','The quote identifies transport, guide, meals and tickets separately.']]},
  {file:'local-guide.html',service:'guide',nav:'English guide',title:'Fluent English-speaking Zhangjiajie Local Guide | Localtour China',description:'Travel with a fluent English-speaking local guide for Zhangjiajie airport meetings and sightseeing.',eyebrow:'FLUENT ENGLISH-SPEAKING LOCAL GUIDE',heading:'Explore Zhangjiajie with a fluent English-speaking local guide',intro:'Your local guide accompanies you from the agreed meeting point and communicates with you in fluent English throughout the booked service hours.',image:'../assets/services/guide-reception-desktop.jpg',features:[['Meeting support','Meet your fluent English-speaking local guide at the airport, railway station, hotel or agreed attraction entrance.'],['Accompanied sightseeing','Your guide stays with your group during the agreed itinerary and helps with local communication.'],['Service clearly confirmed','Meeting point, guide service hours and itinerary are written in your quote.']]},
  {file:'vehicles.html',service:'vehicle',nav:'Vehicles',title:'Zhangjiajie Airport Transfer & Private Car | Localtour China',description:'Arrange Zhangjiajie airport transfers and private vehicles based on passenger and luggage count.',eyebrow:'TRANSFER & PRIVATE CAR',heading:'The right vehicle for your group',intro:'Send passenger, luggage and pickup details so we can confirm a suitable local vehicle.',image:'../assets/services/airport-transfer-desktop.jpg',features:[['Airport and station transfer','Pickup and drop-off details are confirmed before travel.'],['Private vehicle service','Vehicle size is matched to passengers and luggage.'],['Real vehicle references','Available vehicle photos can be supplied before confirmation.']]},
  {file:'multi-booking.html',service:'combo',nav:'Multi-service',title:'Zhangjiajie Multi-service Booking | Localtour China',description:'Combine Zhangjiajie tickets, day tours, a fluent English-speaking local guide and private vehicles in one inquiry.',eyebrow:'MULTI-SERVICE REQUEST',heading:'One inquiry for several local services',intro:'Combine tickets, touring, a fluent English-speaking local guide and transport without repeating your trip details.',image:'../assets/media/attractions/tianmen-cliff.jpg',features:[['One trip record','Dates and traveller details are shared across the requested services.'],['English guide option','A fluent English-speaking local guide can accompany your group during the agreed sightseeing hours.'],['Itemised quote','Each included service and payment condition remains visible.']]},
  {file:'company.html',service:'company',nav:'Company',title:'Company & Service Provider | Localtour China',description:'View the Zhangjiajie travel service provider and Localtour China contact information.',eyebrow:'COMPANY & CONTACTS',heading:'Know who provides your local service',intro:'We publish the local service provider and operating contact details for transparency.',image:'../assets/media/hero/home-mobile.jpg',features:[['Service provider','Zhangjiajie Xiangxi International Travel Service Co., Ltd.'],['Operator','Nam Young-gyu (남영규)'],['Contact','China +86 185 8961 0702 · Korea +82 10 5572 2601 · KakaoTalk Buta200 · WeChat nanyingkui · WhatsApp +82 10-5572-2601']]}
];
const enDir=path.join(root,'en');await mkdir(enDir,{recursive:true});
const navHtml=current=>englishPages.map(p=>`<a class="${p.service===current?'active':''}" href="${p.file}">${p.nav}</a>`).join('');
const featureHtml=page=>`<section class="overview card"><div><span class="eyebrow">WHAT TO EXPECT</span><h2>${page.service==='company'?'Verified contact details':'Local support, clearly explained'}</h2><div class="feature-list">${page.features.map(([a,b])=>`<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div><img src="${page.image}" alt="${page.heading}" loading="lazy"></section>`;
for(const page of englishPages){const koPath=`../${page.file}`,canonical=`https://localtourchina.com/en/${page.file==='index.html'?'':page.file}`,koUrl=`https://localtourchina.com/${page.file==='index.html'?'':page.file}`;const html=englishTemplate.replace('<head>',`<head>${englishAnalyticsHead}`).replace('</body>',`${englishAnalyticsEvents}</body>`).replaceAll('{{TITLE}}',page.title).replaceAll('{{DESCRIPTION}}',page.description).replaceAll('{{CANONICAL}}',canonical).replaceAll('{{KO_URL}}',koUrl).replaceAll('{{KO_PATH}}',koPath).replaceAll('{{ZH_PATH}}',`../zh/${page.file}`).replaceAll('{{NAV}}',navHtml(page.service)).replaceAll('{{IMAGE}}',page.image).replaceAll('{{EYEBROW}}',page.eyebrow).replaceAll('{{HEADING}}',page.heading).replaceAll('{{INTRO}}',page.intro).replaceAll('{{CONTENT}}',featureHtml(page)).replaceAll('{{SERVICE_JSON}}',JSON.stringify(page.nav)).replaceAll('{{SERVICE_SLUG}}',page.service);await writeFile(path.join(enDir,page.file),`<!-- Generated from src/english-template.html. Run: npm run build -->\n${html}`)}

const onlineEnglishTemplate = await readFile(path.join(root, 'src/english-online-guide-template.html'), 'utf8');
await writeFile(path.join(enDir, 'online-guide.html'), '<!-- Generated from src/english-online-guide-template.html. Run: npm run build -->\n' + onlineEnglishTemplate.replaceAll('{{ONLINE_SUPPORT_PRICE}}', formatEnglishPrice(50000)).replaceAll('{{ONLINE_SUPPORT_INQUIRY}}', escapeHtml(onlineSupportInquiry())).replaceAll('{{ENGLISH_PRICING_NOTE}}', escapeHtml(englishPricingNote)));

// The Chinese site is generated from the same full-featured source as Korean.
// This keeps layout, calculators, forms and future product changes synchronized.
const zhDir=path.join(root,'zh');await mkdir(zhDir,{recursive:true});
const zhPages=[...pages];
for(const page of zhPages){
  let html=template.replaceAll('{{YOUTUBE_REVIEW_CARDS}}','').replaceAll('{{YOUTUBE_REVIEW_COUNT}}',String(youtubeReviews.length)).replaceAll('{{RESTAURANT_CARDS}}',zhRestaurantCards).replaceAll('{{RESTAURANT_COUNT}}',String(restaurants.length)).replaceAll('{{REVIEW_CARDS}}',zhReviewCards).replaceAll('{{RELATED_REVIEW_CARDS}}',zhRelatedReviewCards).replaceAll('{{REVIEW_COUNT}}',String(reviewCards.length)).replaceAll('{{FEATURED_REVIEW_CARDS}}','')
    .replace(/<title>[\s\S]*?<\/title>/,`<title>${zhMeta[page.service]?.[0]||zhTranslate(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${zhMeta[page.service]?.[1]||zhTranslate(page.description)}">`)
    .replace(/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="https://localtourchina.com/zh/${page.file==='index.html'?'':page.file}">`)
    .replace('<html lang="ko">','<html lang="zh-CN">')
    .replace('<body data-initial-service="home">',`<body data-initial-service="${page.service}">`)
    .replace(/service-tab active/g,'service-tab');
  const activePattern=new RegExp(`(<a class="service-tab)([^"]*" data-service="${page.service}")`);
  html=html.replace(activePattern,'$1 active$2');
  html=html.replace(/<span class="language-switch"[\s\S]*?<\/span>/,`<span class="language-switch" aria-label="语言选择"><a lang="ko" href="../${page.file}">KO</a><a lang="en" href="../en/${englishPages.some(item=>item.file===page.file)?page.file:'index.html'}">EN</a><a class="active" lang="zh-CN" aria-current="page">中文</a></span>`);
  html=html.replace(/<div class="service-nav" id="main-navigation"[\s\S]*?<\/div><span class="language-switch"/,`<div class="service-nav" id="main-navigation" aria-label="主要菜单"><a class="service-tab online-nav${page.service==='onlineguide'?' active':''}" data-service="onlineguide" href="online-guide.html">在线支持</a><a class="service-tab${page.service==='booking'?' active':''}" data-service="booking" href="booking.html">旅行预订</a><a class="service-tab${page.service==='info'?' active':''}" data-service="info" href="travel-info.html">旅行准备</a><a class="service-tab${page.service==='food'?' active':''}" data-service="food" href="food-map.html">美食·地图</a><a class="service-tab${page.service==='reviews'?' active':''}" data-service="reviews" href="reviews.html">旅行评价</a><a class="nav-contact" href="#business-info">微信咨询 ↗</a></div><span class="language-switch"`);
  html=html.replaceAll('assets/','../assets/');
  html=html.replace(/<section class="service-panel" id="service-info"[\s\S]*?(?=<section class="service-panel" id="service-food")/,zhTravelInfo+'\n');
  html=zhTranslate(html).replaceAll('咨询内容이 복사되었습니다.','咨询内容已复制。');
  if(page.service==='home')html=html.replace('</head>','<style>.review-preview{display:none}</style></head>');
  if(page.service==='reviews')html=html.replace('</head>','<style>.youtube-reviews{display:none}</style></head>');
  html=html.replace('</head>',`  <link rel="alternate" hreflang="ko" href="https://localtourchina.com/${page.file==='index.html'?'':page.file}">\n  <link rel="alternate" hreflang="en" href="https://localtourchina.com/en/${['reviews','booking','food'].includes(page.service)||page.file==='index.html'?'':page.file}">\n  <link rel="alternate" hreflang="zh-CN" href="https://localtourchina.com/zh/${page.file==='index.html'?'':page.file}">\n</head>`);
  html=`<!-- Generated from src/site-template.html with Chinese translations. Run: npm run build -->\n${html}`;
  await writeFile(path.join(zhDir,page.file),withImageDimensions(html));
}

const sitemapUrls = [...pages.map(page=>({...page,prefix:''})),...englishPages.map(page=>({...page,prefix:'en/'})),...zhPages.map(page=>({...page,prefix:'zh/'})),{file:'reviews.html',service:'reviews',prefix:'en/'}].map(page => {
  const url = `https://localtourchina.com/${page.prefix}${page.file === 'index.html' ? '' : page.file}`;
  const priority = page.service === 'home' ? '1.0' : '0.8';
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-28</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`);

console.log(`Built ${pages.length} Korean pages, ${englishPages.length} English pages, ${zhPages.length} reviewed Chinese pages and sitemap.xml`);
