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
    $('.intro .location').innerHTML="Walk Zhangjiajie with us.";
    $('.intro .location').classList.add('hand');
    $('.intro h1').innerHTML="This time,<br>Zhangjiajie with your own group.";
    add('.intro h1',mark('underline','title-underline'),'afterend');
    add('.landscape',`<div class="hero-photo-writing" data-brand-touch><span class="hand">Step beyond<br>the photograph.</span>${mark('arrow')}<span class="round-note">Next stop:<br>Zhangjiajie</span></div>`);
    add('.landscape',illustratedNote(0,"A place you’ve seen in pictures.<br>A photo with you in it.",'selection-signature'),'afterend');
    $('.trip-filter > .small').classList.add('hand','compare-hand');
    $$('.quick-row').forEach((el,i)=>{el.dataset.tone=['blue','green','orange'][i];el.insertAdjacentHTML('beforeend',mark('underline','row-underline'));});
    const labels={experience45:["Into the forest","Slow down by the water."],regular34:["The signature views","Big landscapes, even on a short break."],regular56:["The village at night","When the lights come on, the view changes."]};
    $$('.route-card').forEach(el=>{
      const [badge,text]=labels[el.dataset.route];
      el.querySelector('figure').insertAdjacentHTML('afterbegin',`<span class="photo-stamp hand" data-brand-touch>${badge}</span>`);
      el.querySelector('figcaption').insertAdjacentHTML('afterbegin',note(text,'pencil'));
      el.querySelector('h2').insertAdjacentHTML('afterend',mark('underline','card-underline'));
    });
    add('#quote',illustratedNote(1,"Your travel costs,<br>clearly set out.",'price-signature'),'afterbegin');
    add('.real-review h2',illustratedNote(7,"A real moment from<br>a trip with our guide.",'review-signature'),'afterend');
    add('#concerns',illustratedNote(15,"Your questions,<br>and the things on your mind.",'concern-signature'),'afterbegin');
    add('.help-box',note("You don’t need to choose yet. Start here.",'arrow'),'afterbegin');
    add('.footnote',`<div class="brand-signoff" data-brand-touch>${mark('mountain')}<p class="hand">The next chapter<br>can be yours.</p><b>LocalTourChina</b></div>`,'afterbegin');
  }

  if(page==='detail') {
    add('.hero',`<div class="hero-top-note" data-brand-touch><span class="hand">Notes for our next trip</span>${mark('wave')}</div><div class="hero-side-note" data-brand-touch><span class="hand">Shall we<br>stand here together?</span>${mark('arrow')}</div><span class="hero-ticket" data-brand-touch>Above the peaks · Along forest paths<br><b>Five days with your own group</b></span>`);
    add('.hero h1',mark('underline','hero-title-line'),'afterend');
    add('#overview',illustratedNote(0,"A view like this deserves<br>a photo with everyone in it.",'overview-signature'),'afterbegin');
    add('#price-reference',note("Picture the trip. Understand the cost.",'pencil'),'afterbegin');
    add('.decision-summary h2',mark('underline','section-underline'),'afterend');
    const dayArt=[1,5,8,10,13];
    const dayNotes=["Today, just arrive and settle in.","The mountains we looked up at, now at eye level.","Take the sound of the stream home too.","A sip of coffee, then on we go.","We work backwards from your flight home."];
    $$('.day').forEach((el,i)=>{
      const head=el.querySelector('.day-head');
      head.insertAdjacentHTML('afterbegin',art(dayArt[i],'chapter-art'));
      el.querySelector('.day-number').innerHTML=`<span class="day-digit">${i+1}</span><span class="day-word hand">day</span>`;
      head.insertAdjacentHTML('beforeend',note(dayNotes[i],i%2?'pencil':'ink'));
      el.dataset.day=i+1;
    });
    const captions={
      van:["Bags on board. Travel light.",'pencil'],room:["Your bags can stay here for four nights.",'ink'],
      'guest-tenmile':["This time, everyone’s in the photo.",'tape'],bailong:["The ride up is part of the trip!",'pencil'],
      peaks:["Stand together in front of those peaks.",'ink'],cable:["On the way down, look out of the window.",'tape'],
      huangshiview:["Layer upon layer. Take your time with the view.",'pencil'],stream:["Pause and listen to the water.",'ink'],
      snacks:["One familiar flavour, one new discovery.",'tape'],coffee:["Shall we look through yesterday’s photos?",'pencil'],
      cliff:["A different view with every step.",'ink'],'guest-tianmen':["A photo that feels like you.",'tape'],
      underground:["This time, inside the mountain.",'pencil'],glasswalk:["The canyon, beneath our feet.",'ink'],
      canyon:["Take in the water’s colour before we leave.",'tape'],'guest-airport':["One last photo before goodbye.",'pencil'],
      table:["What was your favourite moment today?",'ink']
    };
    $$('figure').forEach(fig=>{
      if(fig.closest('.hotel-choices')||fig.querySelector('[data-media-photo]'))return;
      const img=fig.querySelector('img');if(!img)return;
      const key=img.getAttribute('src')?.split('/').pop().split('.')[0].replace('-privacy','').replace('-clean','').replace('yuanjiajie-real-review-212','peaks').replace('golden-whip-owner-real','stream'),config=captions[key];
      if(config){fig.classList.add('annotated-photo');const cap=fig.querySelector('figcaption');if(cap)cap.insertAdjacentHTML('afterbegin',note(...config));}
    });
    // Each of the sixteen route drawings has a distinct role on this page.
    add('#d2 .scene',illustratedNote(6,"A little train to begin<br>a day of big views.",'scene-sketch'),'afterbegin');
    add('#d2 .moment-pick',art(7,'pick-art'),'beforebegin');
    add('#d3 .care',art(9,'care-art'),'afterbegin');
    add('#d4 .scene',art(11,'snack-art'),'afterbegin');
    add('#d4 .day-foot',illustratedNote(12,"After the mountain paths,<br>time to rest.",'endday-sketch'),'beforebegin');
    add('#d5 .day-foot',illustratedNote(14,"From above the gorge to beside the water.",'endday-sketch'),'beforebegin');
    add('#stay .included',art(3,'stay-art'),'beforebegin');
    const transport=$$('#stay h3').find(el=>el.textContent.includes("Vehicle and"));
    if(transport)transport.insertAdjacentHTML('beforebegin',illustratedNote(2,"From meeting at the airport<br>to our last goodbye.",'transport-sketch'));
    add('#ask',illustratedNote(15,"Now,<br>tell us about your group.",'consult-signature'),'afterbegin');
    $$('.care').forEach((el,i)=>{el.dataset.note=["Getting ready for day one","Why this order works","A pace for your group","Before Tianmen Mountain","A restful end to the day","Start with your flight home"][i]||"We’ll prepare together";el.insertAdjacentHTML('afterbegin',mark('spark','care-spark'));});
    $$('.moment-pick').forEach(el=>el.insertAdjacentHTML('beforeend',`<span class="picked-mark hand" aria-hidden="true">Save this moment!</span>`));
    add('.review',note("The good days, and the honest reflections.",'pencil'),'afterbegin');
    add('#fit-check h2',mark('underline','section-underline'),'afterend');
    add('#days h2',art(4,'schedule-art'));
    add('footer',`<span class="footer-hand hand" data-brand-touch>Next time, we could be in this view.</span>`,'beforebegin');
    // A small, illustrated reading guide. This is a sequence, not a geographical map.
    add('#days h2',`<div class="route-doodle" data-brand-touch><p class="hand">Our five days, in one line</p><div><a href="#d1"><b>1</b><span>Arrival</span></a><a href="#d2"><b>2</b><span>Peaks</span></a><a href="#d3"><b>3</b><span>Forest paths</span></a><a href="#d4"><b>4</b><span>Tianmen</span></a><a href="#d5"><b>5</b><span>Cave & canyon</span></a></div>${mark('wave')}</div>`,'afterend');
  }

  if(page==='consultation') {
    add('.consult-intro .progress',note("A good trip starts with a conversation.",'pencil'),'afterend');
    add('.consult-intro',art(15,'inquiry-hero-art'),'beforeend');
    add('.basic-fields',note("Tell us what you already know.",'ink'),'afterbegin');
    add('.question-section h2',mark('underline','section-underline'),'afterend');
    add('#expectations h2',note("We’ve kept the moments you liked.",'pencil'),'afterend');
    add('.expect-box',illustratedNote(0,"First, tell us<br>how you like to travel.",'inquiry-signature'),'afterbegin');
    add('.review-head .progress',note("One last check before you send.",'pencil'),'afterend');
    add('.review-message h2',`<span class="message-postmark hand" data-brand-touch>Your first note<br>to Zhangjiajie</span>`,'afterend');
    add('.review-help',`<div class="brand-signoff compact-signoff" data-brand-touch>${mark('mountain')}<p class="hand">Let’s walk<br>Zhangjiajie together.</p></div>`,'beforeend');
  }
  // Visible source notes keep illustrations distinct from actual guest photographs.
  const credits=$('#credits') || $('.footnote details');
  if(credits)credits.insertAdjacentHTML('beforeend',"<p class=\"illustration-credit\">The drawings connecting these travel scenes were created for this page and are separate from real scenery and guest photos. Guests’ faces are covered. The guide’s face is kept in only the two photos the operator confirmed show him.</p>");
})();
