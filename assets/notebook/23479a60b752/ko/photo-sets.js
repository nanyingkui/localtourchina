(()=>{
const source='https://cafe.naver.com/f-e/cafes/31682774/articles/212';
const p=(file,title,hand,caption,url=source)=>({file:'/assets/notebook/23479a60b752/photos/'+file+'.webp',title,hand,caption,url,credit:'기존 고객 여행 기록 · 실제 음식 사진 · 메뉴 참고'});
const photos={
stirfry:p('food-stirfry','고기와 채소를 함께 담은 따뜻한 요리','산에서 내려와, 따뜻한 한 접시.','고기와 채소를 함께 나누는 현지 식사 참고. 매운맛과 먹기 어려운 재료를 미리 알려주세요.'),
vegetable:p('food-vegetable-dish','채소와 재료를 담은 접시 요리','낯선 재료는, 같이 물어봐요.','재료가 궁금하면 가이드에게 확인해 보세요. 사진만으로 알레르기 성분을 판단하지 않습니다.'),
lotus:p('food-lotus','얇게 썬 연근 요리','한 상 안에서도, 다른 식감.','얇게 썬 연근도 함께 나눠 먹던 식탁. 실제 주문 메뉴와 조리 방식은 일행에 맞춰 확인합니다.'),
table:p('food-shared-table','여러 접시를 함께 나누는 현지 식탁','조금씩 덜고, 같이 맛보고.','한 가지씩 나눠 담고 마음에 드는 맛을 찾아보세요. 기존 별도 여행에서 촬영한 식사입니다.'),
potato:p('food-potato-meat','감자와 고기가 담긴 따뜻한 요리','익숙한 재료에서 시작해도 좋아요.','감자와 고기를 함께 담은 현지 요리 참고. 매운맛과 음식 취향은 주문 전에 확인합니다.'),
breakfast:p('food-dumpling-noodle','국수와 여러 만두를 놓은 아침 식탁','아침의 한 끼도, 여행의 한 장면.','기존 고객이 자유시간에 따로 먹은 아침입니다. 이번 상품의 호텔 조식 메뉴나 포함 식사로 약속하는 사진은 아니에요.','https://cafe.naver.com/f-e/cafes/31682774/articles/153')
};
window.TravelPhotoSets={photos,sets:{regular34:['stirfry','vegetable','lotus'],experience45:['table','lotus','breakfast','potato'],regular56:['potato','stirfry','vegetable','lotus'],home:['table','stirfry','lotus','breakfast','potato','vegetable']}};
})();
