(()=>{
const source='https://cafe.naver.com/f-e/cafes/31682774/articles/212';
const p=(file,title,hand,caption,url=source)=>({file:'/assets/notebook/9d5a561af28a/photos/'+file+'.webp',title,hand,caption,url,credit:"以往客人旅行记录 · 真实美食照片 · 菜单参考"});
const photos={
stirfry:p('food-stirfry',"肉与蔬菜一起上桌的热菜","下山后，吃一盘热乎的菜。","当地肉菜搭配的用餐参考。能否吃辣、哪些食材不能吃，请提前告知。"),
vegetable:p('food-vegetable-dish',"蔬菜与配料组成的一盘菜","不认识的食材，一起问问。","对食材有疑问，可以向导游确认。不仅凭照片判断是否含过敏原。"),
lotus:p('food-lotus',"薄切莲藕菜品","同一桌上，也有不同口感。","一起分着吃薄切莲藕的餐桌。实际点菜和做法，会按同行人的需求确认。"),
table:p('food-shared-table',"一起分享几盘菜的当地餐桌","各夹一点，一起尝尝。","每样尝一点，找找喜欢的味道。这顿饭摄于以往另一次行程。"),
potato:p('food-potato-meat',"土豆与肉搭配的热菜","也可以先从熟悉的食材开始。","当地土豆配肉菜品参考，点菜前确认辣度与饮食偏好。"),
breakfast:p('food-dumpling-noodle',"摆着面食和几种饺子的早餐桌","一顿早餐，也是旅行的一个画面。","这是以往客人在自由时间单独吃的早餐，不代表本产品的酒店早餐菜单或包含餐食。",'https://cafe.naver.com/f-e/cafes/31682774/articles/153')
};
window.TravelPhotoSets={photos,sets:{regular34:['stirfry','vegetable','lotus'],experience45:['table','lotus','breakfast','potato'],regular56:['potato','stirfry','vegetable','lotus'],home:['table','stirfry','lotus','breakfast','potato','vegetable']}};
})();
