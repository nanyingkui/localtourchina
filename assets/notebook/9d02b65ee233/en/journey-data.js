(() => {
  const routes = {
    experience45: {
      id: 'experience45', nights: 4, title: "Zhangjiajie: peaks and forest paths", duration: "4 nights, 5 days",
      image: 'stream', alt: "A real photograph of Golden Whip Stream and its forest path", caption: "Golden Whip Stream · follow the water beneath the peaks",
      heading: "From mountain-top wonder<br>to quiet forest paths.",
      story: "The day after Yuanjiajie, go up Huangshizhai and walk beside Golden Whip Stream. Experience the height of the mountains and the closeness of the forest on different days.",
      reason: "Spend two days in the forest park. For groups who want more than viewpoints—and time to pause along the paths.",
      tradeoff: "Furong is not included. Tianmen Mountain, Huanglong Cave and the Grand Canyon still involve walking and steps.",
      scope: "Yuanjiajie & Tianzi Mountain / Huangshizhai & Golden Whip Stream / Tianmen Mountain / Huanglong Cave & Grand Canyon",
      condition: "Based on late arrival and a late return flight. An early flight home means adjusting the final day.",
      included: "Korean-speaking guide, private vehicle, 4 hotel nights, 12 meals, scheduled admission and transport, 1 coffee and an 80-minute massage",
      days: ["Meet at the airport and transfer to the hotel. Rest on arrival night.", "Ten-Mile Gallery train, Bailong Elevator up, Yuanjiajie, Tianzi cable car down.", "Huangshizhai round-trip cable car, lunch and rest, then part of Golden Whip Stream.", "Downtown supermarket and coffee, then Tianmen Mountain. Dinner and massage after descending.", "Check out, visit Huanglong Cave and the Grand Canyon, then dinner and the airport."],
      detail: 'zhangjiajie.html', note: "4 nights in the same downtown hotel. This differs from packages that include the show."
    },
    regular34: {
      id:'regular34', nights:3, title:"Zhangjiajie: the views you came to see", duration:"3 nights, 4 days",
      image:'cliff', alt:"The path along Tianmen Mountain’s cliffs", caption:"Tianmen Mountain · step onto the path you’ve seen in pictures",
      heading:"A short break.<br>Views that stay with you.",
      story:"Rest on arrival night, walk beside Tianmen’s cliffs the next day and see Yuanjiajie’s peaks the day after. Finish with the cave and canyon before a late flight home.",
      reason:"Three sightseeing days for Tianmen, the forest park, and the cave and canyon. A late-arrival, late-departure plan that covers the signature views without rushing into sightseeing on day one.",
      tradeoff:"Huangshizhai, Golden Whip Stream and Furong are not included. The final day involves walking too; an early return flight needs a revised sightseeing plan.",
      scope:"Tianmen Mountain / Forest park & Charming Xiangxi / Huanglong Cave & Grand Canyon",
      condition:"Based on a late arrival on day one and a late flight home. Morning or afternoon arrivals may change the Tianmen day; early departures change the final day.",
      included:"3 downtown hotel nights, 9 meals, Korean-speaking guide, private vehicle, scheduled admission and transport, Charming Xiangxi once and an 80-minute massage",
      days:["Airport meeting and hotel transfer. Rest after your late arrival.", "Downtown supermarket and coffee time, then Tianmen Mountain. Massage timing is arranged around actual bookings.", "Ten-Mile Gallery, Tianzi cable car up, Yuanjiajie, Bailong Elevator down, then Charming Xiangxi after dinner.", "Huanglong Cave and the Grand Canyon, then dinner and the airport."],
      detail:'zhangjiajie-4days.html', note:"Coffee and snacks are optional purchases. Show and massage times depend on actual bookings."
    },
    regular56: {
      id:'regular56', nights:5, title:"Zhangjiajie by day, Furong by night", duration:"5 nights, 6 days",
      image:'furong-evening', imageFile:'/assets/notebook/9d02b65ee233/photos/furong-riverside-evening.jpg', alt:"Evening lights coming on along Furong’s river", caption:"Furong · start the evening while daylight still colours the riverside",
      heading:"After the mountains by day,<br>the village stays with you at night.",
      story:"The day after the peaks, explore Huangshizhai and rest at the hotel. After Tianmen Mountain, day five brings Furong in both daylight and after dark.",
      reason:"A hotel afternoon after Huangshizhai and a free morning before Furong. Six days with separate time to rest between mountain views and the evening visit.",
      tradeoff:"No Golden Whip Stream walk or overnight stay in Furong. Return to Zhangjiajie after the night views; the final day includes Huanglong Cave and the Grand Canyon.",
      scope:"Forest park / Huangshizhai & hotel rest / Tianmen Mountain / Furong / Huanglong Cave & Grand Canyon",
      condition:"Based on late arrival and a late flight home. Consider Furong’s steps, stone paths and the drive back after dark too.",
      included:"5 downtown hotel nights, 15 meals, Korean-speaking guide, private vehicle, scheduled admission and transport, return Furong transfer, one show and an 80-minute massage",
      days:["Airport pickup, hotel check-in and rest.", "Tianzi Mountain, Yuanjiajie, Bailong Elevator and Ten-Mile Gallery. Charming Xiangxi in the evening.", "Huangshizhai round-trip cable car and viewpoints. Hotel rest after lunch.", "Downtown supermarket and coffee time, Tianmen Mountain, then dinner and massage.", "Free morning. Furong in the afternoon; dinner, waterfall and night views, then back to Zhangjiajie.", "Check out, visit Huanglong Cave and the Grand Canyon, then dinner before a late flight home."],
      detail:'zhangjiajie-6days.html', note:"5 nights in the same downtown hotel. Coffee and snacks are extra. The walking and rest pattern differs from the 5-day forest-walk trip."
    }
  };
  const concerns = ["We’re travelling with parents. How much walking and how many steps?", "We’re uncomfortable with heights.", "What is the total local trip cost for our group?", "We’d like to see the hotel and rooms first."];
  const key = 'ltc-zjj-selection-preview-v1';
  const empty = () => ({ route: '', filter: 'all', moments: {}, concerns: [], fields: {} });
  function read() { try { const s={...empty(), ...JSON.parse(sessionStorage.getItem(key) || '{}')};s.concerns=(s.concerns||[]).map(window.Notebook.translate);for(const k of Object.keys(s.moments||{}))s.moments[k]=s.moments[k].map(window.Notebook.translate);if(s.fields?.pace)s.fields.pace=window.Notebook.translate(s.fields.pace);return s; } catch { return empty(); } }
  function save(state) { try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {} }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const answers = (id) => [
    id === 'experience45' ? "Huangshizhai uses a round-trip cable car, but you still walk at viewpoints, Golden Whip Stream and the cave. Tell us your usual walking ability so we can discuss sections and rest stops." : id === 'regular56' ? "Furong has steps and stone paths, as do the forest park and Tianmen Mountain. More days does not automatically mean less walking. We start with your group’s usual pace." : "Your usual walking distance and comfort with steps matter more than age alone. Tianmen and the forest park still involve walking; we’ll discuss any adjustments you need.",
    "Tell us if Tianmen’s cliff paths or the Grand Canyon glass bridge concern you. Before booking tickets, we check possible routes and whether sections can be omitted or replaced.",
    "Check the selected trip’s base rate and group total. Before booking, we confirm the dates, flights, ages, hotel and room conditions. Guide and driver costs for the basic itinerary are included.",
    "Your quote names the actual hotel branch, room and bed setup, not just a hotel brand. Tell us about preferred rooms or accommodation you’ve already booked."
  ];
  window.Journey = {routes, concerns, answers, read, save, escape};
})();
