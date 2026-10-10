// A Cafe article link or a generic city photograph is not proof of a shop photo.
// Publish only image-specific, exact-place verification; fail closed on new records.
export function isVerifiedFoodImage(image, verification) {
  return Boolean(image && verification?.status === 'verified' &&
    verification.matchedImage === image && verification.sourceUrl?.startsWith('https://') &&
    /^\d{4}-\d{2}-\d{2}$/.test(verification.checkedAt || '') && verification.evidence?.trim());
}
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderFoodPhoto(item, label, locale = 'ko') {
  const verified = isVerifiedFoodImage(item.image, item.imageVerification);
  const text = locale === 'zh' ? '暂无经核实的门店照片' : '확인된 매장 사진 준비 중';
  const source = locale === 'zh' ? item.image?.replace(/^assets\//, '../assets/') : item.image;
  const alt = locale === 'zh' ? item.chinese : item.name;
  return verified
    ? `<div class="food-photo"><img src="${escape(source)}" alt="${escape(alt)}" loading="lazy" referrerpolicy="no-referrer"><span>${escape(label)}</span></div>`
    : `<div class="food-photo-unavailable"><span class="food-kind-label">${escape(label)}</span><p>${text}</p></div>`;
}
