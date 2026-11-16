(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const page = document.body.dataset.page || 'detail';
  document.body.classList.add('travel-notebook');
  const paths = {
    arrow:'M8 8C48 0 78 8 62 34C52 51 39 48 48 40C58 31 81 48 86 65M69 58L87 66L86 47',
    spark:'M34 4L32 27M7 13L23 31M4 42L23 39M52 16L40 31M57 45L41 40',
    underline:'M3 14C50 3 91 18 153 9C189 4 227 5 272 11M10 23C99 12 187 23 260 16',
    mountain:'M4 51L13 31L19 34L25 9L33 8L38 34L44 27L50 42L57 20L66 19L71 48L79 36L86 53M20 52L26 42M55 51L61 36M6 60C31 56 59 64 86 58',
    wave:'M3 16C16 3 26 29 40 15S64 29 78 14S102 28 116 15S140 28 154 15',
    circle:'M96 19C74 0 12 4 5 34C-5 67 78 83 106 53C120 36 100 13 75 10'
  };
  const mark = (type='spark',cls='') => `<svg class="pen-mark ${cls}" viewBox="${type==='underline'?'0 0 280 30':type==='wave'?'0 0 160 34':type==='circle'?'0 0 120 85':'0 0 96 78'}" aria-hidden="true"><path d="${paths[type]}"/></svg>`;
  const art = (i,cls='') => `<span class="travel-sketch ${cls}" aria-hidden="true" style="--sx:${(i%4)*100/3}%;--sy:${Math.floor(i/4)*100/3}%" data-art="${i}"></span>`;
  const note = (text,kind='ink') => `<div class="hand-note ${kind}" data-brand-touch>${mark(kind==='arrow'?'arrow':'spark')}<span>${text}</span></div>`;
  const add = (selector,html,where='beforeend') => { const el=$(selector); if(el)el.insertAdjacentHTML(where,html); };
  const illustratedNote = (i,text,cls='') => `<div class="illustrated-note ${cls}" data-brand-touch>${art(i)}<p class="hand">${text}</p></div>`;
  $$('.brand').forEach(el=>el.insertAdjacentHTML('afterbegin',mark('mountain','brand-drawing')));

  if(page==='selection') {
    $('.intro .location').innerHTML="在张家界，一起走走。";
    $('.intro .location').classList.add('hand');
    $('.intro h1').innerHTML="这一次，<br>我们自己的张家界。";
    add('.intro h1',mark('underline','title-underline'),'afterend');
    add('.landscape',`<div class="hero-photo-writing" data-brand-touch><span class="hand">走出照片，<br>向前一步。</span>${mark('arrow')}<span class="round-note">下一站<br>张家界</span></div>`);
    add('.landscape',illustratedNote(0,"在照片里的地方，<br>留下我们的一张。",'selection-signature'),'afterend');
    $('.trip-filter > .small').classList.add('hand','compare-hand');
    $$('.quick-row').forEach((el,i)=>{el.dataset.tone=['blue','green','orange'][i];el.insertAdjacentHTML('beforeend',mark('underline','row-underline'));});
    const labels={experience45:["走进林间","跟着水声，慢慢走一会儿。"],regular34:["代表风景","短假期，也能遇见大风景。"],regular56:["古镇的夜晚","灯亮了，又是一番风景。"]};
    $$('.route-card').forEach(el=>{
      const [badge,text]=labels[el.dataset.route];
      el.querySelector('figure').insertAdjacentHTML('afterbegin',`<span class="photo-stamp hand" data-brand-touch>${badge}</span>`);
      el.querySelector('figcaption').insertAdjacentHTML('afterbegin',note(text,'pencil'));
      el.querySelector('h2').insertAdjacentHTML('afterend',mark('underline','card-underline'));
    });
    add('#quote',illustratedNote(1,"旅行费用，<br>也要一眼看明白。",'price-signature'),'afterbegin');
    add('.real-review h2',illustratedNote(7,"与导游一起留下的，<br>真实旅行瞬间。",'review-signature'),'afterend');
    add('#concerns',illustratedNote(15,"好奇的事，<br>放心不下的事。",'concern-signature'),'afterbegin');
    add('.help-box',note("还没选好，也可以从这里开始。",'arrow'),'afterbegin');
    add('.footnote',`<div class="brand-signoff" data-brand-touch>${mark('mountain')}<p class="hand">下一个画面，<br>写进我们的故事。</p><b>罗途查</b></div>`,'afterbegin');
  }

  if(page==='detail') {
    add('.hero',`<div class="hero-top-note" data-brand-touch><span class="hand">我们的下一本旅行手记</span>${mark('wave')}</div><div class="hero-side-note" data-brand-touch><span class="hand">一起，<br>站在这里吧。</span>${mark('arrow')}</div><span class="hero-ticket" data-brand-touch>在山上 · 在林间<br><b>属于我们的五天</b></span>`);
    add('.hero h1',mark('underline','hero-title-line'),'afterend');
    add('#overview',illustratedNote(0,"遇见好风景，<br>也给大家留一张合照。",'overview-signature'),'afterbegin');
    add('#price-reference',note("把期待和费用，都说得具体。",'pencil'),'afterbegin');
    add('.decision-summary h2',mark('underline','section-underline'),'afterend');
    const dayArt=[1,5,8,10,13];
    const dayNotes=["今天，先好好抵达。","曾经仰望的山，来到眼前。","今天，也把水声记住。","喝一口咖啡，再出发。","从返程航班时间倒推安排。"];
    $$('.day').forEach((el,i)=>{
      const head=el.querySelector('.day-head');
      head.insertAdjacentHTML('afterbegin',art(dayArt[i],'chapter-art'));
      el.querySelector('.day-number').innerHTML=`<span class="day-digit">${i+1}</span><span class="day-word hand">天</span>`;
      head.insertAdjacentHTML('beforeend',note(dayNotes[i],i%2?'pencil':'ink'));
      el.dataset.day=i+1;
    });
    const captions={
      van:["行李装好，轻松出发。",'pencil'],room:["接下来的四晚，行李就放这里。",'ink'],
      'guest-tenmile':["这张照片里，大家都在。",'tape'],bailong:["上山的路，也是旅行的一部分！",'pencil'],
      peaks:["一起站在那座山峰前。",'ink'],cable:["下山时，记得看看窗外。",'tape'],
      huangshiview:["层层叠叠的山，多看一会儿。",'pencil'],stream:["停一下，听听水声。",'ink'],
      snacks:["一个熟悉的味道，一个想尝的新味道。",'tape'],coffee:["一起看看昨天拍的照片？",'pencil'],
      cliff:["走几步，风景又不同。",'ink'],'guest-tianmen':["在风景前，拍一张自己的样子。",'tape'],
      underground:["这一次，走进山的里面。",'pencil'],glasswalk:["峡谷，就在脚下。",'ink'],
      canyon:["看过这片水色，再回去。",'tape'],'guest-airport':["道别时，也留一张照片。",'pencil'],
      table:["今天最喜欢哪个瞬间？",'ink']
    };
    $$('figure').forEach(fig=>{
      const img=fig.querySelector('img');if(!img)return;
      const key=img.getAttribute('src')?.split('/').pop().split('.')[0].replace('-privacy','').replace('-clean','').replace('yuanjiajie-real-review-212','peaks').replace('golden-whip-owner-real','stream'),config=captions[key];
      if(config){fig.classList.add('annotated-photo');const cap=fig.querySelector('figcaption');if(cap)cap.insertAdjacentHTML('afterbegin',note(...config));}
    });
    // Each of the sixteen route drawings has a distinct role on this page.
    add('#d2 .scene',illustratedNote(6,"从小火车开始，<br>看今天的大风景。",'scene-sketch'),'afterbegin');
    add('#d2 .moment-pick',art(7,'pick-art'),'beforebegin');
    add('#d3 .care',art(9,'care-art'),'afterbegin');
    add('#d4 .scene',art(11,'snack-art'),'afterbegin');
    add('#d4 .day-foot',illustratedNote(12,"走过山上的路，<br>接下来，好好歇一会儿。",'endday-sketch'),'beforebegin');
    add('#d5 .day-foot',illustratedNote(14,"从桥上，走到水边。",'endday-sketch'),'beforebegin');
    add('#stay .included',art(3,'stay-art'),'beforebegin');
    const transport=$$('#stay h3').find(el=>el.textContent.includes("车辆与"));
    if(transport)transport.insertAdjacentHTML('beforebegin',illustratedNote(2,"从机场见面，<br>到最后道别。",'transport-sketch'));
    add('#ask',illustratedNote(15,"现在，<br>聊聊我们的旅行吧。",'consult-signature'),'afterbegin');
    $$('.care').forEach((el,i)=>{el.dataset.note=["第一天的准备","这样安排的小理由","一起调整步调","去天门山之前","今天的收尾","先确认返程航班"][i]||"一起准备";el.insertAdjacentHTML('afterbegin',mark('spark','care-spark'));});
    $$('.moment-pick').forEach(el=>el.insertAdjacentHTML('beforeend',`<span class="picked-mark hand" aria-hidden="true">这个画面，想去！</span>`));
    add('.review',note("顺心的那天，和有些遗憾的那天。",'pencil'),'afterbegin');
    add('#fit-check h2',mark('underline','section-underline'),'afterend');
    add('#days h2',art(4,'schedule-art'));
    add('footer',`<span class="footer-hand hand" data-brand-touch>下一次，我们也走进这片风景。</span>`,'beforebegin');
    // A small, illustrated reading guide. This is a sequence, not a geographical map.
    add('#days h2',`<div class="route-doodle" data-brand-touch><p class="hand">把我们的五天，画成一条线</p><div><a href="#d1"><b>1</b><span>抵达</span></a><a href="#d2"><b>2</b><span>群峰</span></a><a href="#d3"><b>3</b><span>林间</span></a><a href="#d4"><b>4</b><span>天门山</span></a><a href="#d5"><b>5</b><span>溶洞·峡谷</span></a></div>${mark('wave')}</div>`,'afterend');
  }

  if(page==='consultation') {
    add('.consult-intro .progress',note("旅行计划，从聊天开始。",'pencil'),'afterend');
    add('.consult-intro',art(15,'inquiry-hero-art'),'beforeend');
    add('.basic-fields',note("先把确定的事，轻松写下来。",'ink'),'afterbegin');
    add('.question-section h2',mark('underline','section-underline'),'afterend');
    add('#expectations h2',note("喜欢的画面，已经帮你记好了。",'pencil'),'afterend');
    add('.expect-box',illustratedNote(0,"先说说，<br>你喜欢怎样旅行。",'inquiry-signature'),'afterbegin');
    add('.review-head .progress',note("发送前，一起再看一遍。",'pencil'),'afterend');
    add('.review-message h2',`<span class="message-postmark hand" data-brand-touch>寄往张家界的<br>第一张便笺</span>`,'afterend');
    add('.review-help',`<div class="brand-signoff compact-signoff" data-brand-touch>${mark('mountain')}<p class="hand">在张家界，<br>一起走走。</p></div>`,'beforeend');
  }
  // Visible source notes keep illustrations distinct from actual guest photographs.
  const credits=$('#credits') || $('.footnote details');
  if(credits)credits.insertAdjacentHTML('beforeend',"<p class=\"illustration-credit\">串联旅行场景的插画为本页面创作，与真实风景及客人照片区分使用。照片中游客的脸部已遮挡；仅保留经营者确认是本人导游的两张照片中的脸部。</p>");
})();
