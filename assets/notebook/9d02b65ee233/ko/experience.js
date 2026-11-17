const photos = {"cliff": {"title": "천문산 절벽 옆 산책로", "credit": "小红书 · 清清 · 보유 원본 사진", "url": ""}, "room": {"title": "머큐어 호텔 트윈룸 참고", "credit": "로투차 호텔 자료 · 실제 객실은 견적서에 명시", "url": ""}, "tenmile": {"title": "십리화랑의 작은 열차와 산책로", "credit": "小红书 · Adam_G · 보유 원본 사진", "url": ""}, "peaks": {"title": "원가계 전망대에서 마주하는 봉우리", "credit": "로투차 원가계 사진", "url": ""}, "cable": {"title": "천자산 케이블카 안에서 본 풍경", "credit": "Rocio Gil · CC BY-SA 4.0 · 2017년 촬영", "url": "https://commons.wikimedia.org/wiki/File:Tianzi_Mountain_(天子山）cable_car.jpg"}, "huangshi": {"title": "황석채 오지봉 파노라마", "credit": "chensiyuan · CC BY-SA 4.0 · 2012년 촬영", "url": "https://commons.wikimedia.org/wiki/File:1_zhangjiajie_huangshizhai_wulingyuan_panorama_2012.jpg"}, "stream": {"title": "금편계의 실제 숲길과 물길", "credit": "기존 제공 원본 앨범 · 금편계 실사 참고", "url": ""}, "snacks": {"title": "장가계 金粒门에서 고르는 간식과 음료", "credit": "小红书 · 开心日记 · 보유 원본. 매장·상품 참고 사진", "url": ""}, "tianmenwalk": {"title": "절벽을 따라 걷는 천문산 관람객들", "credit": "로투차 기존 여행 후기 사진 · 2026.09.27", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/212"}, "tianmenfront": {"title": "광장에서 올려다본 천문동과 계단", "credit": "小红书 · 想成为社牛 · 보유 원본 사진", "url": ""}, "underground": {"title": "황룡동 내부의 종유석과 관람로", "credit": "小红书 · 小乔的漫游记 · 보유 원본 사진", "url": ""}, "glasswalk": {"title": "사람들이 걷는 대협곡 유리다리", "credit": "小红书 · 美芽 · 보유 원본 사진", "url": ""}, "canyon": {"title": "대협곡 아래에서 만나는 물길", "credit": "小红书 · 嘻嘻 · 보유 원본 사진", "url": ""}, "table": {"title": "기존 여행 후기에 담긴 현지 식탁", "credit": "로투차 기존 여행 후기 사진 · 메뉴 참고", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/212"}, "van": {"title": "전용차량 내부 참고", "credit": "로투차 차량 자료 · 차종은 인원과 짐에 맞춰 확정", "url": ""}, "mist": {"title": "안개 사이로 드러난 장가계의 봉우리", "credit": "小红书 · 社畜小猪的生活 · 보유 원본", "url": ""}, "huangshiview": {"title": "황석채 전망대와 그 너머로 겹치는 산", "credit": "小红书 · 薄荷糖三角 · 보유 원본", "url": ""}, "coffee": {"title": "커피 한 잔의 휴식 · 메뉴 참고 이미지", "credit": "로투차 보유 카페 자료 · kakasu. 사진 속 매장 방문을 뜻하지 않으며 실제 시내 매장은 일정에 맞춰 안내", "url": ""}, "bailong": {"title": "절벽을 따라 오르는 백룡엘리베이터", "credit": "Nyx Ning · CC BY-SA 3.0 · 2009년 촬영", "url": "https://commons.wikimedia.org/wiki/File:湖南_张家界_百龙天梯_-_panoramio_(cropped).jpg"}};
Object.assign(photos, {"guest-tenmile": {"title": "십리화랑에서 남긴 실제 가족여행 사진", "credit": "가이드 동행 3박 4일 가족여행 후기 · 2026.04.15 · 별도 일정", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/70", "src": "/assets/notebook/9d02b65ee233/photos/guest-tenmile-privacy.png"}, "guest-tianmen": {"title": "천문동 광장에서 남긴 실제 가족여행 사진", "credit": "가이드 동행 3박 4일 가족여행 후기 · 2026.04.15 · 별도 일정", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/70", "src": "/assets/notebook/9d02b65ee233/photos/guest-tianmen-privacy.png"}, "guest-airport": {"title": "가족 여행객과 가이드, 공항에서의 마지막 사진", "credit": "가이드 동행 가족여행 후기 · 2026.08.01 · 별도 일정", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/155", "src": "/assets/notebook/9d02b65ee233/photos/guest-airport-privacy.png"}});
photos.glasswalk.src='/assets/notebook/9d02b65ee233/photos/glasswalk-privacy.png';
photos.stream.src='/assets/notebook/9d02b65ee233/photos/golden-whip-owner-real.webp';
photos.cliff.src='/assets/notebook/9d02b65ee233/photos/cliff-privacy.png';
photos.underground.src='/assets/notebook/9d02b65ee233/photos/underground-clean.png';
photos.room.src='/assets/notebook/9d02b65ee233/photos/room-clean.png';
photos.coffee.src='/assets/notebook/9d02b65ee233/photos/coffee-clean.png';
photos.coffee.credit+=' · 작은 워터마크 제거';
photos.room.credit+=' · 워터마크 제거·TV 화면 편집';
for(const key of ['guest-tenmile','guest-tianmen','guest-airport','glasswalk','cliff'])photos[key].credit+=' · 얼굴 가림 처리';
photos['stream-stones']={title:'금편계 물과 이끼 낀 돌',credit:'프로디디 · 개별 여행 후기 · 2026.06.13 · 풍경 참고',url:'https://cafe.naver.com/f-e/cafes/31682774/articles/120',src:'/assets/notebook/9d02b65ee233/photos/route-stream-stones.webp'};
photos.peaks={title:"원가계의 실제 산 풍경",credit:"레오감자 · 로투차 카페 여행기 · 2026.09.27",url:"https://cafe.naver.com/f-e/cafes/31682774/articles/212",src:"/assets/notebook/9d02b65ee233/photos/yuanjiajie-real-review-212.webp"};
const dialog = document.querySelector('#lightbox');
for (const button of document.querySelectorAll('[data-photo]')) {
  button.addEventListener('click', () => {
    const key = button.dataset.photo;
    const image = document.querySelector('#large-photo');
    image.src = photos[key].src || '/assets/notebook/9d02b65ee233/photos/' + key + '.webp';
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
