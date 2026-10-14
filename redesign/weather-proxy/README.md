# 张家界能见度接入 / 장가계 가시거리 연결

状态：服务端适配已准备；没有天气账号/API Key，因此尚未接通或启用到公开页面。

数据源：Visual Crossing Timeline API。请求固定市区、武陵源、天门山三个坐标，metric单位，days,hours,current，保留原始能见度公里值，不从湿度推算。未来10天能见度覆盖和缺失情况必须用账号真实查询确认后再启用；官方支持全球逐小时预报，但具体字段可随地点和时间变化。

1. 在 https://www.visualcrossing.com/sign-up/ 注册免费账号，完成邮箱验证；不添加信用卡，不开通付费。
2. 在网站已有Supabase项目localtourchina的Edge Function Secrets中设置 `VISUAL_CROSSING_API_KEY`。不要写入聊天、Git或网页。
   https://supabase.com/dashboard/project/znfcmancrhymrdnlowuh/functions/secrets
3. 部署index.ts、proxy.mjs及相对依赖weather-data.mjs，启用网关JWT校验；前端通过网站现有公开anon身份调用，天气私钥只留服务端。
4. 启用前需要持久共享缓存适配（proxy接受异步get/set），以合并不同Edge实例请求。默认Map仅为本地测试/单实例缓存，不保证跨实例每日额度。固定3区域，每小时一次理论基础72次/日；实际queryCost须查看API响应和账号Usage。
5. 检查三个区域当日到第10天的实际逐小时visibility；仅实际非空字段可展示，缺失显示资料 없음。记录更新时间和来源，区域能见度不能保证峰顶现场视野。
6. 配置现有 `LTC_WEATHER_PROXY_URL` 和公开调用身份，隔离旧MET浏览器缓存，再启用能见度时间变化图。当前公开页继续使用MET预报，不伪装已接通。

官方资料：
- 免费/商业/1000条每日：https://www.visualcrossing.com/resources/documentation/visual-crossing-weather-free-plan-free-weather-data-for-analysts-and-api-developers/
- Timeline字段和逐小时：https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/
- Supabase秘密存储：https://supabase.com/docs/guides/functions/secrets

对外文字：가시거리 예보 · 시간별 변화 / 지역 예보이며 산 정상의 실제 시야를 보장하지 않습니다.
