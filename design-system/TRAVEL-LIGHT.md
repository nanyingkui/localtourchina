# LocalTourChina Travel Light · 设计语言 v1.0

2026-10-14。中文为维护说明，韩文为对外文案。新的主页、服务页面和旅行工具共享这套语言。后续设计先读本文件和 tokens.json，再复用已有组件；避免重建一套样式。

## 视觉方向

旅行风景承载情绪，白色与浅灰页面承载操作。深绿表示推荐与准备进度，橙色保留品牌识别，不把所有按钮涂橙。延续 Heavn 的大标题、留白和同构图昼夜光线变化；不改动真实报价、预约条件和咨询逻辑。

## 排版和间距

采用现有韩文与中英文字体栈，正文16px/1.75，辅助文字14px/1.7，图片来源12px。手机H1约34px，H2约26px，H3约21px。长文本按内容自然换行；标题用 keep-all 并提供 overflow-wrap 回退。间距依4、8、12、16、24、32、48、64px阶梯选取。

## 控件

常规按钮与输入框最小高度46px；紧凑导航和图景按钮44px。输入字号16px避免手机自动放大。文本框默认至少112px并允许纵向调整。使用真实label，不用placeholder代替标题。键盘焦点3px蓝色边框，独立风景暗背景用黄色焦点。禁用状态降低透明度并保留含义；选中状态除颜色之外需ARIA或文字。返回、关闭、撤销、删除的名字和位置保持一致。实际按钮颜色遵循角色，而非所有元素套同一背景。

## 风景交互

React复用 src/ScenicHero.jsx + scenic-hero.css。旅行工具复用 experience.js、visual-controls.css。昼夜两层相同 object-fit/object-position；新景点先解码两张图，成功后一起替换，加载失败保留上一张，避免空白。进度映射hour8–22；night=smoothstep((hour-15)/6)。滑块和按钮进入手动模式，点击滚动联动恢复。提供浅显韩文提示：스크롤하면 빛이 달라져요 · 시간 바를 직접 움직여도 좋아요。

固定风景外层使用overflow:clip，不使用overflow:hidden创建额外滚动容器。主页和旅行工具的锚点／风景固定位置由实际导航尺寸测量；桌面145px、手机128px仅为初始回退值；短屏将控制区放到图片下面，保持可操作。减少动态效果用户默认手动，禁用不必要自动动画。AI图片与夜间光线模拟要标注；不表示实际夜间开放或实时天气。

## 图表与进度

准备进度使用原生progress与相邻的“已完成/总数”文字；不得以颜色作为唯一含义。深绿为主要确认进度，灰绿为建议，赭橙为目的地准备。数值用tabular-nums。保留真实数据，零值有文字，未输入费用显示未输入。不得把填写完成等同于实际预约或入境许可。当前页面图表主要为准备条、阶段进度、时间线和费用摘要；不加入虚构统计。

## 橙帽人物

原Logo文件保持字节不变。所有衍生插画保持橙帽、深蓝头发、圆形棕色眼镜、固定深蓝翻领上衣、米色直筒长裤、白鞋；只改变动作、表情和道具。头部相对肩宽和全身高度、肩宽、身形及四肢长度固定，以welcome全身标准图为所有后续生成的参考。不能因为不同场景使用不同头身比或Q版化；半身图只裁取标准人物的取景范围。原图只有上半身，裤鞋作为新增固定标准。禁止因为酒店/车辆/导游场景更换制服。插画是品牌角色，不是真实导游肖像。

动作库：welcome欢迎、guide指路、route看地图、tickets门票、pickup接送、hotel住宿、checklist清单、weather雨伞、support倾听、success完成、photo拍照、reminder提醒。资源路径 assets/mascot-v1/。全身小插画通常使用64×96、80×120或96×144px槽位，图像用object-fit:contain保持比例；咨询辅助插画可使用130px槽位；不挡文字或按钮，不做跟随鼠标的大面积动画。不承担独立信息时alt为空。

## 维护入口

共享设计变量与控件：redesign/public/assets/travel-design.css。
主页React样式引用该文件；子页面由apply-journal-theme.mjs最后注入并以内容哈希更新缓存。
旅行工具维护于redesign/public/travel-planner，根travel-planner由标准build产生。

发布前检查390×844、320×568、横屏及桌面；遍历12处景点；验证手动/滚动往返、图片加载错误、编辑/撤销/保存/备份、控件焦点和菜单。任何真实咨询提交或付款不属于无副作用检查。

## 点击标识 / 클릭 표시 v1
- 有操作的模块用描边、明确动作文字和可见键盘焦点；文字链接使用下划线。
- 展开项统一使用 + / −，选中项同时使用底色和描边，不只依赖颜色。
- 行程图片、标题、简介共享修改入口，其他删除/换地点按钮独立；纯数据和说明不伪装成按钮。
- 手机普通操作目标至少44px；disabled不可用时降低透明度并保持实际disabled语义。
- 天气控件按真实时间步长展示；MET Norway不提供此地能见度，不从湿度推算；本地fixture是带更新时间的真实API预览，生产实时获取。

## 导航与按钮 v1.1 / 이용 목적과 버튼
首页明确区分免费行程工具、免费旅行情报和可选付费服务。不购买也可规划与查资料；产品服务按需推荐。规划和天气放主视觉后、产品前，保留昼夜渐变。详情先读具体说明，选项进入配置，不能用同一句简介充当详情。主操作用#3f5c36白字、次操作白底细边；10px按钮圆角、46px高度，不混用下划线与胶囊。阅读链接保留下划线，说明卡片16px圆角、无厚阴影。

## V2: prepare first, book only when needed

The primary navigation has three destinations: free travel information, optional paid service configuration, and the independent free itinerary tool. Keep a Home link alongside them.

The homepage primary action opens itinerary preparation. Its secondary action opens booking. Do not put product shelves, package prices, booking forms or full guides on the homepage. Preserve old deep links for compatibility.

Show a current-hour weather summary on the homepage. One click opens the full ten-day/hourly panel. The information page has a directly addressable weather disclosure and does not display product-category navigation. Keep unavailable visibility explicitly missing.

Prioritize native Korean UI fonts (Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR). Mobile headline 29px; body 14-15px. Keep day/night scenery as a supporting experience below the useful navigation. Preserve the mascot outfit and proportions. Existing quote calculations and validations remain authoritative.
