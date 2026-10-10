// Planning preferences are requests, never transport inventory or confirmed bookings.
export const preparationGroups=[
 {id:'arrival',tasks:['entry','transport','transfer']},
 {id:'stay',tasks:['hotel','itinerary','guide']},
 {id:'essentials',tasks:['connection','payment','protection']}
];
export const statusChoices=['ready','help','unsure'];
export const transportChoices=['flight','rail','road'];
export const roadChoices=['private','bus','taxi'];
export const dayRoutes={zhangjiajie:['forest','tianmen','canyon'],sanya:['sanya-monkey','sanya-binglang','sanya-best']};
export function validIsoDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
export function tripDays(start,end){if(!validIsoDate(start)||!validIsoDate(end))return null;const a=Date.parse(start+'T00:00:00Z'),b=Date.parse(end+'T00:00:00Z');if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)return null;return Math.round((b-a)/86400000)+1;}
export function packageFits(product,plan){const duration=tripDays(plan.date,plan.endDate);return (!plan.destination||plan.destination==='zhangjiajie')&&(!duration||product.days===duration);}
export function suggestedTransport(plan){if(plan.transport==='road')return roadChoices;return transportChoices;}
export function dayChoices(plan,day){const duration=tripDays(plan.date,plan.endDate);if(day===0||duration&&day===duration-1)return ['transfer','self','confirm'];return (dayRoutes[plan.destination]||[]).slice(0,3);}
export function detectConflicts(plan,product){const issues=[];if(product&&plan.destination&&plan.destination!=='zhangjiajie')issues.push('package-destination');const duration=tripDays(plan.date,plan.endDate);if(product&&duration&&duration!==product.days)issues.push('package-duration');if(product?.people&&+product.people!==+plan.people)issues.push('party-mismatch');if(product&&['hotel','transfer','guide'].some(key=>plan.tasks?.[key]==='ready'))issues.push('already-arranged');for(const routes of Object.values(plan.days||{}))if(Array.isArray(routes)&&routes.length>1)issues.push('two-full-day-tours');return [...new Set(issues)];}
export function packageChanged(adjustments){return Object.values(adjustments?.components||{}).some(x=>x!=='keep')||Object.values(adjustments?.days||{}).some(x=>x.mode!=='keep');}
export function preparationProgress(plan,product){const tasks=preparationGroups.flatMap(x=>x.tasks);const covered=product?['hotel','transfer','guide','itinerary']:[];return {total:tasks.length,decided:tasks.filter(key=>plan.tasks?.[key]&&plan.tasks[key]!=='unsure'||covered.includes(key)).length};}
