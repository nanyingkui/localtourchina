(() => {
  const routes = {
    experience45: {
      id: 'experience45', nights: 4, title: "张家界，群峰与林间小路", duration: "四晚五天",
      image: 'stream', alt: "金鞭溪林间步道与溪流实拍", caption: "金鞭溪 · 在群峰下，跟着水声走一段",
      heading: "山上的惊叹，<br>接着是林间的从容。",
      story: "俯瞰袁家界的第二天，登上黄石寨，再沿金鞭溪散步。山的高远与森林的亲近，分两天慢慢感受。",
      reason: "用两天游览森林公园。适合不想只看完观景台就离开，也想留时间在林间停下来休息的同行人。",
      tradeoff: "不含芙蓉镇。天门山、黄龙洞、大峡谷仍有步行和台阶路段。",
      scope: "袁家界·天子山／黄石寨·金鞭溪／天门山／黄龙洞·大峡谷",
      condition: "按晚到、晚走航班安排。若返程航班较早，将调整最后一天。",
      included: "韩语导游、专用车辆、4晚酒店、12餐、行程内门票及交通、1杯咖啡、80分钟按摩",
      days: ["在机场会合后前往酒店，抵达当晚休息。", "十里画廊小火车、百龙天梯上行、袁家界、天子山索道下行。", "黄石寨往返索道、午餐与休息、金鞭溪部分路段散步。", "市区超市与咖啡、天门山，下山后用餐及按摩。", "退房后游览黄龙洞、大峡谷，晚餐后前往机场。"],
      detail: 'zhangjiajie.html', note: "同一家市区酒店住4晚 · 与含演出的产品配置不同。"
    },
    regular34: {
      id:'regular34', nights:3, title:"张家界，一直想看的风景", duration:"三晚四天",
      image:'cliff', alt:"沿天门山悬崖延伸的步道", caption:"天门山 · 亲自站上照片里的那条路",
      heading:"短短的假期，<br>留下长久的画面。",
      story:"抵达当晚先休息，第二天走天门山悬崖步道，第三天看袁家界群峰。最后一天游览溶洞与峡谷，再乘晚班飞机返程。",
      reason:"三个游览日分别留给天门山、森林公园、溶洞与峡谷。按晚到晚走安排，第一天不用赶景点，也能看见代表风景。",
      tradeoff:"不安排黄石寨、金鞭溪和芙蓉镇。最后一天仍需步行；若返程航班较早，需重新确定游览范围。",
      scope:"天门山／森林公园·魅力湘西／黄龙洞·大峡谷",
      condition:"按首日深夜抵达、末日晚班返程安排。上午或下午抵达时，重新调整天门山日期；较早返程时，调整最后一天的游览范围。",
      included:"市区酒店3晚、9餐、韩语导游、专用车辆、门票及景区交通、魅力湘西1场、80分钟按摩",
      days:["在机场会合后前往酒店，深夜抵达后休息。", "市区超市与咖啡时间、天门山，按摩时间按实际预约协调。", "十里画廊、天子山索道上行、袁家界、百龙天梯下行，晚餐后看魅力湘西。", "游览黄龙洞、大峡谷，晚餐后前往机场。"],
      detail:'zhangjiajie-4days.html', note:"咖啡、零食自愿购买，费用另计。演出与按摩时间按实际预约协调。"
    },
    regular56: {
      id:'regular56', nights:5, title:"张家界，山间白昼与芙蓉夜色", duration:"五晚六天",
      image:'furong-evening', imageFile:'/assets/notebook/bfeacd45dd7d/photos/furong-riverside-evening.jpg', alt:"芙蓉镇河岸，灯光渐次亮起的傍晚", caption:"芙蓉镇 · 从还留着日光的河岸，走进傍晚",
      heading:"走过山间白昼，<br>把心留在古镇夜色里。",
      story:"看完群峰的第二天，游览黄石寨后回酒店休息。再去天门山，第五天到芙蓉镇，同时看看白天与夜晚。",
      reason:"黄石寨之后的下午回酒店休息，芙蓉镇当天上午自由活动。六天里，在山景与夜景之间，专门留出休息时间。",
      tradeoff:"不安排金鞭溪散步，也不住芙蓉镇。夜景后回张家界，最后一天游览黄龙洞与大峡谷。",
      scope:"森林公园／黄石寨·酒店休息／天门山／芙蓉镇／黄龙洞·大峡谷",
      condition:"按首日深夜抵达、末日晚班返程安排。请一并考虑芙蓉镇的台阶、石板路，以及夜景后乘车返回。",
      included:"市区酒店5晚、15餐、韩语导游、专用车辆、门票及景区交通、芙蓉镇往返、1场演出、80分钟按摩",
      days:["机场接机、酒店入住与休息。", "天子山、袁家界、百龙天梯、十里画廊，晚上看魅力湘西。", "黄石寨往返索道与观景步道，午餐后回酒店休息。", "市区超市与咖啡时间、天门山，晚餐与按摩。", "上午自由活动，下午去芙蓉镇，晚餐、瀑布与夜景后返回张家界。", "退房后游览黄龙洞、大峡谷，晚餐后乘晚班飞机返程。"],
      detail:'zhangjiajie-6days.html', note:"同一家市区酒店住5晚 · 咖啡、零食另计。步行与休息安排不同于四晚五天散步行程。"
    }
  };
  const concerns = ["和父母同行，想了解台阶和步行量。", "有些怕高。", "想了解我们这几个人的当地旅行总价。", "想先看看酒店和客房。"];
  const key = 'ltc-zjj-selection-preview-v1';
  const empty = () => ({ route: '', filter: 'all', moments: {}, concerns: [], fields: {} });
  function read() { try { const s={...empty(), ...JSON.parse(sessionStorage.getItem(key) || '{}')};s.concerns=(s.concerns||[]).map(window.Notebook.translate);for(const k of Object.keys(s.moments||{}))s.moments[k]=s.moments[k].map(window.Notebook.translate);if(s.fields?.pace)s.fields.pace=window.Notebook.translate(s.fields.pace);return s; } catch { return empty(); } }
  function save(state) { try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {} }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const answers = (id) => [
    id === 'experience45' ? "黄石寨搭乘往返索道，但观景台、金鞭溪和溶洞内仍需步行。告诉我们平时能走多远，一起调整路段和休息点。" : id === 'regular56' ? "森林公园、天门山以及芙蓉镇都有台阶或石板路。天数较长不代表步行更少，先看看大家平时的步行情况。" : "比起年龄，我们先了解平时步行量和上下台阶是否吃力。天门山和森林公园仍有步行路段，需要的调整请在咨询时确认。",
    "请提前告知对天门山悬崖步道和大峡谷玻璃桥的顾虑。预订门票前，先确认可行路线及能否省略或替换。",
    "请查看已选行程的基础费用及总价。日期、航班、年龄、酒店和客房适用条件在预订前确认。基础行程已含导游和司机费用。",
    "报价中会写明酒店具体分店、客房和床型，而不只列酒店品牌。如有想住的房型或已预订酒店，请告诉我们。"
  ];
  window.Journey = {routes, concerns, answers, read, save, escape};
})();
