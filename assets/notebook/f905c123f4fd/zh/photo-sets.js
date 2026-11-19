(()=>{
const source='https://cafe.naver.com/f-e/cafes/31682774/articles/212';
const p=(file,title,hand,caption,url=source)=>({file:'/assets/notebook/f905c123f4fd/photos/'+file+'.webp',title,hand,caption,url,credit:"以往客人旅行记录 · 真实美食照片 · 菜单参考"});
const photos={oysters:{"file": "/assets/notebook/f905c123f4fd/photos/food-oysters.webp", "title": "蒜蓉生蚝", "hand": "尝一口新的味道。", "caption": "Cafe 海鲜烧烤介绍中的生蚝。想尝试时，先确认可点菜品和另付价格。", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/87", "credit": "罗途查 Cafe 美食资料 · 菜单参考 · 非固定包含餐食"},shrimp:{"file": "/assets/notebook/f905c123f4fd/photos/food-shrimp.webp", "title": "辣椒炒虾", "hand": "想吃的口味，先告诉我们。", "caption": "真实菜品照片。先确认海鲜过敏和辣度，想点的菜另外核价。", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/87", "credit": "罗途查 Cafe 美食资料 · 菜单参考 · 非固定包含餐食"},sanxiaguo:{"file": "/assets/notebook/f905c123f4fd/photos/food-sanxiaguo.webp", "title": "三下锅，一起分享的当地菜", "hand": "摆在中间，一起分着吃。", "caption": "富正毅三下锅介绍中的菜品。搭配因店而异，下单前确认内脏等忌口食材。", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/85", "credit": "罗途查 Cafe 美食资料 · 菜单参考 · 非固定包含餐食"},ingredients:{"file": "/assets/notebook/f905c123f4fd/photos/food-market-ingredients.webp", "title": "看着食材挑选想吃的菜", "hand": "这个怎么吃？", "caption": "当地餐厅的食材展示。可以问清做法和辣度再选择，不固定承诺到这家店。", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/85", "credit": "罗途查 Cafe 美食资料 · 菜单参考 · 非固定包含餐食"},dinner:{"file": "/assets/notebook/f905c123f4fd/photos/food-local-dinner.webp", "title": "热菜、汤和主食的一桌", "hand": "今天路上的故事，饭桌上接着聊。", "caption": "Cafe 美食记录中的一桌菜，并非所有菜品和饮料都包含的套餐，按餐厅和点菜内容确认。", "url": "https://cafe.naver.com/f-e/cafes/31682774/articles/85", "credit": "罗途查 Cafe 美食资料 · 菜单参考 · 非固定包含餐食"},
stirfry:p('food-stirfry',"肉与蔬菜一起上桌的热菜","下山后，吃一盘热乎的菜。","当地肉菜搭配的用餐参考。能否吃辣、哪些食材不能吃，请提前告知。"),
vegetable:p('food-vegetable-dish',"蔬菜与配料组成的一盘菜","不认识的食材，一起问问。","对食材有疑问，可以向导游确认。不仅凭照片判断是否含过敏原。"),
lotus:p('food-lotus',"薄切莲藕菜品","同一桌上，也有不同口感。","一起分着吃薄切莲藕的餐桌。实际点菜和做法，会按同行人的需求确认。"),
table:p('food-shared-table',"一起分享几盘菜的当地餐桌","各夹一点，一起尝尝。","每样尝一点，找找喜欢的味道。这顿饭摄于以往另一次行程。"),
potato:p('food-potato-meat',"土豆与肉搭配的热菜","也可以先从熟悉的食材开始。","当地土豆配肉菜品参考，点菜前确认辣度与饮食偏好。"),
breakfast:p('food-dumpling-noodle',"摆着面食和几种饺子的早餐桌","一顿早餐，也是旅行的一个画面。","这是以往客人在自由时间单独吃的早餐，不代表本产品的酒店早餐菜单或包含餐食。",'https://cafe.naver.com/f-e/cafes/31682774/articles/153')
};
window.TravelPhotoSets={photos,sets:{regular34:['breakfast','stirfry','lotus','sanxiaguo'],experience45:['table','vegetable','oysters','ingredients'],regular56:['potato','shrimp','dinner'],home:['breakfast','sanxiaguo','vegetable','oysters','shrimp','lotus','dinner','ingredients']}};
})();
