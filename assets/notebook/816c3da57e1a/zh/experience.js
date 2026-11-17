const photos = {"cliff": {"title": "天门山悬崖旁的步道", "credit": "小红书 · 清清 · 已有原始照片", "url": ""}, "room": {"title": "美居酒店双床房参考", "credit": "现有酒店参考资料 · 实际客房以报价单为准", "url": ""}, "tenmile": {"title": "十里画廊的小火车与步道", "credit": "小红书 · Adam_G · 已有原始照片", "url": ""}, "peaks": {"title": "袁家界观景台前的群峰", "credit": "袁家界参考照片 · 具体来源见图片说明", "url": ""}, "cable": {"title": "从天子山索道车厢里看到的风景", "credit": "Rocio Gil · CC BY-SA 4.0 · 摄于2017年", "url": "https://commons.wikimedia.org/wiki/File:Tianzi_Mountain_(天子山）cable_car.jpg"}, "huangshi": {"title": "黄石寨五指峰全景", "credit": "chensiyuan · CC BY-SA 4.0 · 摄于2012年", "url": "https://commons.wikimedia.org/wiki/File:1_zhangjiajie_huangshizhai_wulingyuan_panorama_2012.jpg"}, "stream": {"title": "金鞭溪林间步道与溪流实拍", "credit": "既有供图原始相册 · 金鞭溪实拍参考", "url": ""}, "snacks": {"title": "在张家界金粒门挑选零食和饮品", "credit": "小红书 · 开心日记 · 已有原图，门店与商品参考", "url": ""}, "tianmenwalk": {"title": "沿天门山悬崖步道行走的游客", "credit": "罗途查现有旅行游记照片 · 2026.09.27", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/212"}, "tianmenfront": {"title": "从广场仰望天门洞与台阶", "credit": "小红书 · 想成为社牛 · 已有原始照片", "url": ""}, "underground": {"title": "黄龙洞内的钟乳石与游览步道", "credit": "小红书 · 小乔的漫游记 · 已有原始照片", "url": ""}, "glasswalk": {"title": "游客行走中的大峡谷玻璃桥", "credit": "小红书 · 美芽 · 已有原始照片", "url": ""}, "canyon": {"title": "在大峡谷谷底遇见的水路", "credit": "小红书 · 嘻嘻 · 已有原始照片", "url": ""}, "table": {"title": "以往旅行游记里的当地餐桌", "credit": "罗途查现有旅行游记照片 · 菜单参考", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/212"}, "van": {"title": "专用车辆内饰参考", "credit": "罗途查现有车辆资料 · 按人数与行李确认车型", "url": ""}, "mist": {"title": "雾中显露的张家界山峰", "credit": "小红书 · 社畜小猪的生活 · 已有原图", "url": ""}, "huangshiview": {"title": "黄石寨观景台与远处层叠的群山", "credit": "小红书 · 薄荷糖三角 · 已有原图", "url": ""}, "coffee": {"title": "喝杯咖啡的休息时光 · 菜单参考图", "credit": "现有咖啡店资料 · kakasu。图片不代表一定到访该店，实际市区门店按行程安排", "url": ""}, "bailong": {"title": "沿悬崖上升的百龙天梯", "credit": "Nyx Ning · CC BY-SA 3.0 · 摄于2009年", "url": "https://commons.wikimedia.org/wiki/File:湖南_张家界_百龙天梯_-_panoramio_(cropped).jpg"}};
Object.assign(photos, {"guest-tenmile": {"title": "在十里画廊留下的真实家庭旅行照片", "credit": "导游陪同的三晚四天家庭游记 · 2026.04.15 · 另一次行程", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/70", "src": "/assets/notebook/816c3da57e1a/photos/guest-tenmile-privacy.png"}, "guest-tianmen": {"title": "在天门洞广场留下的真实家庭旅行照片", "credit": "导游陪同的三晚四天家庭游记 · 2026.04.15 · 另一次行程", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/70", "src": "/assets/notebook/816c3da57e1a/photos/guest-tianmen-privacy.png"}, "guest-airport": {"title": "家庭游客与导游，在机场留下的最后一张照片", "credit": "导游陪同的家庭游记 · 2026.08.01 · 另一次行程", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/155", "src": "/assets/notebook/816c3da57e1a/photos/guest-airport-privacy.png"}});
photos.glasswalk.src='/assets/notebook/816c3da57e1a/photos/glasswalk-privacy.png';
photos.stream.src='/assets/notebook/816c3da57e1a/photos/golden-whip-owner-real.webp';
photos.cliff.src='/assets/notebook/816c3da57e1a/photos/cliff-privacy.png';
photos.underground.src='/assets/notebook/816c3da57e1a/photos/underground-clean.png';
photos.room.src='/assets/notebook/816c3da57e1a/photos/room-clean.png';
photos.coffee.src='/assets/notebook/816c3da57e1a/photos/coffee-clean.png';
photos.coffee.credit+=" · 已移除小水印";
photos.room.credit+=" · 已移除水印并处理电视画面";
for(const key of ['guest-tenmile','guest-tianmen','guest-airport','glasswalk','cliff'])photos[key].credit+=" · 已遮挡脸部";
photos['stream-stones']={title:"金鞭溪的溪水与覆着苔藓的石头",credit:"프로디디 · 自由行游记 · 2026.06.13 · 风景参考",url:'https://cafe.naver.com/f-e/cafes/31682774/articles/120',src:'/assets/notebook/816c3da57e1a/photos/route-stream-stones.webp'};
photos.peaks={title:"袁家界群峰实拍",credit:"레오감자 · 罗途查社区游记 · 2026.09.27",url:"https://cafe.naver.com/f-e/cafes/31682774/articles/212",src:"/assets/notebook/816c3da57e1a/photos/yuanjiajie-real-review-212.webp"};
const dialog = document.querySelector('#lightbox');
for (const button of document.querySelectorAll('[data-photo]')) {
  button.addEventListener('click', () => {
    const key = button.dataset.photo;
    const image = document.querySelector('#large-photo');
    image.src = photos[key].src || '/assets/notebook/816c3da57e1a/photos/' + key + '.webp';
    image.alt = photos[key].title;
    image.dataset.kind = key;
    document.querySelector('#photo-title').textContent = photos[key].title;
    document.querySelector('#photo-source').textContent = photos[key].credit;
    const link = document.querySelector('#photo-link');
    link.hidden = !photos[key].url;
    link.href = photos[key].url || '#';
    dialog.showModal();
  });
}
document.querySelector('#close-photo').onclick = () => dialog.close();
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
