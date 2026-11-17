(()=>{
const source='https://cafe.naver.com/f-e/cafes/31682774/articles/212';
const p=(file,title,hand,caption,url=source)=>({file:'/assets/notebook/9d02b65ee233/photos/'+file+'.webp',title,hand,caption,url,credit:"Earlier customer trip record · real food photo · menu reference"});
const photos={
stirfry:p('food-stirfry',"A warm dish of meat and vegetables","Down from the mountains. A warm plate to share.","A local meal with meat and vegetables to share. Tell us beforehand about spice preferences and ingredients you avoid."),
vegetable:p('food-vegetable-dish',"A dish of vegetables and other ingredients","An unfamiliar ingredient? Let’s ask.","Ask the guide if you’re unsure about ingredients. Allergens cannot be identified from a photo alone."),
lotus:p('food-lotus',"Thinly sliced lotus root","Different textures around one table.","Lotus root was one of the shared dishes. Actual orders and cooking styles are confirmed for your group."),
table:p('food-shared-table',"Several dishes shared at a local meal","A little of each. Try it together.","Share a little of each dish and find a flavour you like. This meal was photographed on a separate earlier trip."),
potato:p('food-potato-meat',"A warm dish with potatoes and meat","Start with something familiar if you like.","A local potato and meat dish, shown for reference. We check spice levels and food preferences before ordering."),
breakfast:p('food-dumpling-noodle',"Noodles and dumplings on a breakfast table","Breakfast can be a travel memory too.","An earlier guest bought this breakfast separately during free time. It is not a promise of this trip’s hotel breakfast menu or an included meal.",'https://cafe.naver.com/f-e/cafes/31682774/articles/153')
};
window.TravelPhotoSets={photos,sets:{regular34:['stirfry','vegetable','lotus'],experience45:['table','lotus','breakfast','potato'],regular56:['potato','stirfry','vegetable','lotus'],home:['table','stirfry','lotus','breakfast','potato','vegetable']}};
})();
