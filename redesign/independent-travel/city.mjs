import {esc} from '../brand-upgrade/home.mjs';

export const cityCopy = {
  zh:{title:'张家界市区吃住指南', intro:'按菜类挑餐厅，或按住宿需求挑酒店。地图链接直达对应门店。', link:'查看张家界市区指南', back:'全部自由行资料', category:'品类',locationPending:'新门店地址与高德店名待核对', all:'全部', address:'地址', mapName:'高德显示名称', names:'中韩英名称', checked:'核对日期', photo:'门店照片',dishPhoto:'菜品参考图',rating:'高德评分',reviews:count=>`${count} 条评价`, zhName:'中文名', koName:'韩文参考名',enName:'英文参考名', map:'到高德查看门店与相册', details:'门店资料', reference:'资料来源', foodTitle:'餐厅与酒店', tiers:'住宿类型', empty:'该品类的门店资料还在核对。', count:'家', types:{hotpot:'火锅',barbecue:'烧烤',grill:'烤肉',korean:'韩餐',local:'湘西本地菜',sanxiaguo:'三下锅',hotel:'酒店'}},
  ko:{title:'장가계 시내 식당과 호텔', intro:'먹고 싶은 음식과 필요한 숙소를 골라보세요. 지도에서 해당 지점을 바로 확인할 수 있어요.', link:'장가계 시내 가이드',back:'자유여행 정보 전체',category:'종류',locationPending:'새 매장 주소와 지도 상호 확인 중',all:'전체',address:'주소',mapName:'가오더 지도 상호',names:'중국어·한국어·영어 명칭',checked:'확인 날짜',photo:'매장 사진',dishPhoto:'메뉴 참고 사진',rating:'가오더 평점',reviews:count=>`후기 ${count}개`,zhName:'중국어 이름',koName:'한국어 이름',enName:'영어 이름',map:'가오더 지도에서 매장과 사진 보기',details:'매장 정보',reference:'자료 출처',foodTitle:'식당과 호텔',tiers:'숙소 유형',empty:'이 종류의 장소는 확인 중이에요.',count:'곳',types:{hotpot:'훠궈',barbecue:'꼬치구이',grill:'고기구이',korean:'한식',local:'샹시 향토 요리',sanxiaguo:'싼샤궈',hotel:'호텔'}},
  en:{title:'Where to eat and stay in Zhangjiajie city',intro:'Browse restaurants by cuisine, or find a hotel that fits your trip. Each map link opens the listed branch.',link:'Browse Zhangjiajie city',back:'All independent travel guides',category:'Category',locationPending:'New address and map listing pending verification',all:'All',address:'Address',mapName:'Name on Amap',names:'Chinese, Korean and English names',checked:'Checked',photo:'Photos of this location',dishPhoto:'Reference dish photos',rating:'Amap rating',reviews:count=>`${count} ${count===1?"review":"reviews"}`,zhName:'Chinese name',koName:'Korean name',enName:'English name',map:'View this location and its photos on Amap',details:'Location details',reference:'Source',foodTitle:'Restaurants and hotels',tiers:'Type of stay',empty:'Listings in this category are still being checked.',count:'places',types:{hotpot:'Hot pot',barbecue:'Barbecue',grill:'Tabletop grilling',korean:'Korean food',local:'Local Xiangxi food',sanxiaguo:'Sanxiaguo',hotel:'Hotels'}},
};

export function renderCityCard(record,lang) {
  const t=cityCopy[lang];
  const name=record.title[lang];
  const images=record.photos??[];
  const cover=images[0];
  const photoLabel=record.pendingLocation?t.dishPhoto:t.photo;
  const reviews=Number.isInteger(record.reviews)?t.reviews(record.reviews):'';
  const fields=[
    [t.address,record.pendingLocation?t.locationPending:`<span lang="zh">${esc(record.address)}</span>`],
    [t.mapName,record.pendingLocation?t.locationPending:`<span lang="zh">${esc(record.mapName??record.name)}</span>`],
    [t.zhName,`<span lang="zh">${esc(record.name)}</span>`],
    [t.koName,`<span lang="ko">${esc(record.title.ko)}</span>`],
    [t.enName,`<span lang="en">${esc(record.title.en)}</span>`],
  ];
  return `<article class="ind-card ind-city-card" data-ind-place data-area="city" data-type="${esc(record.cuisine)}">
    ${cover?`<div class="ind-photo"><img src="${esc(cover.src)}" alt="${esc(cover.alt)}" width="600" height="400" loading="lazy" decoding="async"></div>`:''}
    <div class="ind-card-body"><p class="ind-meta">${t.types[record.cuisine]??''}${record.tier?.[lang]?' · '+esc(record.tier[lang]):''}${record.rating?' · '+t.rating+' '+esc(record.rating):''}${reviews?' · '+esc(reviews):''}</p>
      <h3>${esc(name)}</h3><p>${esc(record.tip?.[lang])}</p>
      <p class="ind-city-address"${record.pendingLocation?'':' lang="zh"'}>${record.pendingLocation?t.locationPending:esc(record.address)}</p>
      <p class="ind-city-checked">${t.checked} <time datetime="${esc(record.checked)}">${esc(record.checked)}</time></p>
      <details class="ind-city-details"><summary>${t.details}${images.length?` · ${photoLabel} (${images.length})`:''}</summary>
        <dl>${fields.map(([label,value])=>`<dt>${label}</dt><dd>${value}</dd>`).join('')}</dl>
        ${images.length?`<div class="ind-city-photos" aria-label="${photoLabel}">${images.map(image=>`<a href="${esc(image.src)}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" width="200" height="130" loading="lazy" decoding="async"></a>`).join('')}</div>`:''}
      </details>
      <div class="ind-card-links">${record.url?`<a href="${esc(record.url)}">${t.map} ↗</a>`:''}${record.source&&record.source!==record.url?`<a href="${esc(record.source)}">${t.reference} ↗</a>`:''}</div>
    </div></article>`;
}
