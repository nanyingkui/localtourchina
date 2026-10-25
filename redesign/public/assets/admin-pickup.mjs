const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=[['arrival_time','到达时间（中国时间）','time',5],['flight','航班号','text',8],['hotel','酒店名称','text',200],['hotel_address','酒店地址','text',300],['adults','成人数','number',50],['children','儿童数','number',49],['luggage','大件行李数','number',50],['meeting_point','集合地点（韩语）','text',500],['driver_name','司机称呼','text',500],['driver_contact','司机联系方式','text',500],['vehicle_info','车辆／车牌说明','text',500],['notes','客人原需求','text',1000]];
export function pickupEditor(row){
 if(!row.pickup_details)return '';
 const p=row.pickup_details;
 return `<details class="admin-optional" open><summary>游客 App · 接机安排</summary><p class="admin-section-help">沿用当前申请，保存后同步到游客的日期、接机和预约详情。游客进度链接打开 App，需由客人使用原账号登录。时间统一使用中国时间。填入司机与集合地点不等于确认预约；仍需核实供应商并更新客人可见状态。</p><div class="form-grid"><label>到达日期<input id="fPickupDate" type="date" required value="${escape(row.travel_date)}"></label><label>酒店区域<select id="fPickupRegion"><option value="city" ${p.region==='city'?'selected':''}>张家界市区</option><option value="wulingyuan" ${p.region==='wulingyuan'?'selected':''}>武陵源</option></select></label>${fields.map(([key,label,type,max])=>`<label>${label}<input id="pickup-${key}" type="${type}" ${type==='number'?`min="${key==='adults'?1:0}" max="${max}" step="1"`:`maxlength="${max}"`} value="${escape(p[key])}" ${['arrival_time','flight','hotel','adults','children','luggage'].includes(key)?'required':''}></label>`).join('')}</div></details>`;
}
export function readPickup(row,q){
 if(!row.pickup_details)return null;
 const p={...row.pickup_details,region:q('fPickupRegion').value};
 for(const [key,,type]of fields){const value=q('pickup-'+key).value.trim();p[key]=type==='number'?Number(value):value;}
 p.flight=p.flight.toUpperCase().replaceAll(' ','');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.arrival_time)||!/^[A-Z0-9]{2,3}[0-9]{1,4}[A-Z]?$/.test(p.flight)||p.hotel.length<2)throw Error('请核对接机时间、航班和酒店。');
 if(!Number.isInteger(p.adults)||!Number.isInteger(p.children)||!Number.isInteger(p.luggage)||p.adults<1||p.children<0||p.adults+p.children>50||p.luggage<0||p.luggage>50)throw Error('请核对接机人数和行李数量。');
 const date=q('fPickupDate').value;if(!/^20\d{2}-\d{2}-\d{2}$/.test(date))throw Error('请填写接机到达日期。');
 return {travel_date:date,pickup_details:p};
}
