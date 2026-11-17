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
    $('.intro .location').innerHTML='장가계에서 함께 걸어요.';
    $('.intro .location').classList.add('hand');
    $('.intro h1').innerHTML='이번엔,<br>우리끼리 장가계.';
    add('.intro h1',mark('underline','title-underline'),'afterend');
    add('.landscape',`<div class="hero-photo-writing" data-brand-touch><span class="hand">사진 밖으로,<br>한 걸음.</span>${mark('arrow')}<span class="round-note">다음 여행은<br>장가계</span></div>`);
    add('.landscape',illustratedNote(0,'사진으로 보던 곳에서,<br>우리끼리 한 장.','selection-signature'),'afterend');
    $('.trip-filter > .small').classList.add('hand','compare-hand');
    $$('.quick-row').forEach((el,i)=>{el.dataset.tone=['blue','green','orange'][i];el.insertAdjacentHTML('beforeend',mark('underline','row-underline'));});
    const labels={experience45:['숲길까지','물소리를 따라, 잠깐 천천히.'],regular34:['대표 풍경','짧은 휴가에도, 큰 풍경.'],regular56:['마을의 밤','불이 켜지면, 또 다른 장면.']};
    $$('.route-card').forEach(el=>{
      const [badge,text]=labels[el.dataset.route];
      el.querySelector('figure').insertAdjacentHTML('afterbegin',`<span class="photo-stamp hand" data-brand-touch>${badge}</span>`);
      el.querySelector('figcaption').insertAdjacentHTML('afterbegin',note(text,'pencil'));
      el.querySelector('h2').insertAdjacentHTML('afterend',mark('underline','card-underline'));
    });
    add('#quote',illustratedNote(1,'여행비도,<br>한눈에 알 수 있게.','price-signature'),'afterbegin');
    add('.real-review h2',illustratedNote(7,'가이드와 함께 남긴,<br>진짜 여행의 한 장.','review-signature'),'afterend');
    add('#concerns',illustratedNote(15,'궁금한 것도,<br>마음에 걸리는 것도.','concern-signature'),'afterbegin');
    add('.help-box',note('아직 못 골라도, 여기서부터.','arrow'),'afterbegin');
    add('.footnote',`<div class="brand-signoff" data-brand-touch>${mark('mountain')}<p class="hand">다음 장면은,<br>우리 이야기로.</p><b>로투차</b></div>`,'afterbegin');
  }

  if(page==='detail') {
    add('.hero',`<div class="hero-top-note" data-brand-touch><span class="hand">우리의 다음 여행 노트</span>${mark('wave')}</div><div class="hero-side-note" data-brand-touch><span class="hand">여기,<br>같이 서볼까요?</span>${mark('arrow')}</div><span class="hero-ticket" data-brand-touch>산 위에서 · 숲길에서<br><b>우리끼리 보내는 5일</b></span>`);
    add('.hero h1',mark('underline','hero-title-line'),'afterend');
    add('#overview',illustratedNote(0,'좋은 풍경 앞에서는,<br>우리도 다 같이 한 장.','overview-signature'),'afterbegin');
    add('#price-reference',note('여행의 설렘도, 비용도 구체적으로.','pencil'),'afterbegin');
    add('.decision-summary h2',mark('underline','section-underline'),'afterend');
    const dayArt=[1,5,8,10,13];
    const dayNotes=['오늘은, 잘 도착하는 것부터.','올려다보던 산이, 우리 눈높이로.','오늘은 물소리도 기념으로.','커피 한 모금, 다시 출발.','귀국 시간부터 거꾸로 계획해요.'];
    $$('.day').forEach((el,i)=>{
      const head=el.querySelector('.day-head');
      head.insertAdjacentHTML('afterbegin',art(dayArt[i],'chapter-art'));
      el.querySelector('.day-number').innerHTML=`<span class="day-digit">${i+1}</span><span class="day-word hand">번째 날</span>`;
      head.insertAdjacentHTML('beforeend',note(dayNotes[i],i%2?'pencil':'ink'));
      el.dataset.day=i+1;
    });
    const captions={
      van:['짐은 싣고, 마음은 가볍게.','pencil'],room:['캐리어는 여기, 네 밤 동안.','ink'],
      'guest-tenmile':['이번 사진엔, 우리도 다 같이.','tape'],bailong:['올라가는 길부터 여행!','pencil'],
      peaks:['저 봉우리 앞에, 함께 서기.','ink'],cable:['내려올 땐, 창밖을 보세요.','tape'],
      huangshiview:['겹겹이, 눈에 오래 담아두기.','pencil'],stream:['잠깐 멈춰, 물소리 듣기.','ink'],
      snacks:['아는 맛 하나, 궁금한 맛 하나.','tape'],coffee:['어제 찍은 사진, 같이 볼까요?','pencil'],
      cliff:['발걸음마다 달라지는 풍경.','ink'],'guest-tianmen':['풍경 앞에서, 나다운 한 장.','tape'],
      underground:['이번에는, 산 안으로.','pencil'],glasswalk:['우리 발 아래, 협곡이.','ink'],
      canyon:['물빛까지 보고 돌아가요.','tape'],'guest-airport':['마지막 인사도 사진 한 장.','pencil'],
      table:['오늘 제일 좋았던 장면은?','ink']
    };
    $$('figure').forEach(fig=>{
      const img=fig.querySelector('img');if(!img)return;
      const key=img.getAttribute('src')?.split('/').pop().split('.')[0].replace('-privacy','').replace('-clean','').replace('yuanjiajie-real-review-212','peaks').replace('golden-whip-owner-real','stream'),config=captions[key];
      if(config){fig.classList.add('annotated-photo');const cap=fig.querySelector('figcaption');if(cap)cap.insertAdjacentHTML('afterbegin',note(...config));}
    });
    // Each of the sixteen route drawings has a distinct role on this page.
    add('#d2 .scene',illustratedNote(6,'작은 열차에서 시작하는,<br>오늘의 큰 풍경.','scene-sketch'),'afterbegin');
    add('#d2 .moment-pick',art(7,'pick-art'),'beforebegin');
    add('#d3 .care',art(9,'care-art'),'afterbegin');
    add('#d4 .scene',art(11,'snack-art'),'afterbegin');
    add('#d4 .day-foot',illustratedNote(12,'산 위의 길을 걸었다면,<br>이제는 쉬는 시간.','endday-sketch'),'beforebegin');
    add('#d5 .day-foot',illustratedNote(14,'다리 위에서, 물길 곁까지.','endday-sketch'),'beforebegin');
    add('#stay .included',art(3,'stay-art'),'beforebegin');
    const transport=$$('#stay h3').find(el=>el.textContent.includes('차량과'));
    if(transport)transport.insertAdjacentHTML('beforebegin',illustratedNote(2,'공항에서 만나,<br>마지막 인사까지.','transport-sketch'));
    add('#ask',illustratedNote(15,'이제,<br>우리 일행 이야기로.','consult-signature'),'afterbegin');
    $$('.care').forEach((el,i)=>{el.dataset.note=['첫날의 준비','동선의 작은 이유','함께 맞추는 걸음','천문산 가기 전에','오늘의 마무리','귀국편부터 확인'][i]||'함께 준비해요';el.insertAdjacentHTML('afterbegin',mark('spark','care-spark'));});
    $$('.moment-pick').forEach(el=>el.insertAdjacentHTML('beforeend',`<span class="picked-mark hand" aria-hidden="true">이 장면, 찜!</span>`));
    add('.review',note('좋았던 날도, 아쉬웠던 날도.','pencil'),'afterbegin');
    add('#fit-check h2',mark('underline','section-underline'),'afterend');
    add('#days h2',art(4,'schedule-art'));
    add('footer',`<span class="footer-hand hand" data-brand-touch>다음엔 우리도, 이 풍경 속으로.</span>`,'beforebegin');
    // A small, illustrated reading guide. This is a sequence, not a geographical map.
    add('#days h2',`<div class="route-doodle" data-brand-touch><p class="hand">우리의 5일을 한 줄로 그리면</p><div><a href="#d1"><b>1</b><span>도착</span></a><a href="#d2"><b>2</b><span>봉우리</span></a><a href="#d3"><b>3</b><span>숲길</span></a><a href="#d4"><b>4</b><span>천문산</span></a><a href="#d5"><b>5</b><span>동굴·협곡</span></a></div>${mark('wave')}</div>`,'afterend');
  }

  if(page==='consultation') {
    add('.consult-intro .progress',note('여행 계획은, 대화에서 시작해요.','pencil'),'afterend');
    add('.consult-intro',art(15,'inquiry-hero-art'),'beforeend');
    add('.basic-fields',note('정해진 것부터, 편하게 적어주세요.','ink'),'afterbegin');
    add('.question-section h2',mark('underline','section-underline'),'afterend');
    add('#expectations h2',note('마음에 남은 장면, 잘 담아뒀어요.','pencil'),'afterend');
    add('.expect-box',illustratedNote(0,'어떤 여행을 좋아하는지,<br>먼저 들려주세요.','inquiry-signature'),'afterbegin');
    add('.review-head .progress',note('보내기 전에, 한 번만 같이 확인.','pencil'),'afterend');
    add('.review-message h2',`<span class="message-postmark hand" data-brand-touch>장가계로 보내는<br>첫 번째 메모</span>`,'afterend');
    add('.review-help',`<div class="brand-signoff compact-signoff" data-brand-touch>${mark('mountain')}<p class="hand">장가계에서,<br>함께 걸어요.</p></div>`,'beforeend');
  }
  // Visible source notes keep illustrations distinct from actual guest photographs.
  const credits=$('#credits') || $('.footnote details');
  if(credits)credits.insertAdjacentHTML('beforeend','<p class="illustration-credit">여행 장면을 잇는 그림은 이 페이지를 위해 만든 일러스트입니다. 실제 풍경·고객 사진과 구분해 사용했습니다. 사진 속 여행객의 얼굴은 가렸으며, 운영자가 본인이라고 확인한 두 사진의 가이드 얼굴은 그대로 사용했습니다.</p>');
})();
