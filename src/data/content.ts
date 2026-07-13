// 本地内容数据源
// 改造:不再依赖 LunaTV 后端,影片元数据内置在 app 内
// 视频源使用公开 HLS 测试流(可在原生端 Lynx + @sigx/lynx-video 直接播放)
// 海报使用 picsum.photos 占位图(用标题做种子保证稳定)

export type LocalType = 'movie' | 'tv' | 'anime' | 'variety' | 'short';

export interface LocalEpisode {
  title: string;
  url: string;
}

export interface LocalItem {
  id: string;
  title: string;
  poster: string; // 直接 URL
  year: string;
  rate: string;
  type: LocalType;
  source: string; // 固定 'local'
  source_name: string; // 固定 '本地资源'
  desc: string;
  director?: string;
  cast?: string[];
  area?: string; // 地区
  douban_id?: number;
  class?: string;
  type_name?: string;
  remarks?: string; // 如 "更新至12集" / "HD"
  episodes: LocalEpisode[];
}

// 公开 HLS 测试流(无需鉴权,稳定可用)
const HLS_SOURCES = {
  muxBBB:
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Big Buck Bunny
  muxTears:
    'https://test-streams.mux.dev/test_001/stream.m3u8',
  appleBipBop:
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
  appleBipBopAdv:
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
  appleAdvanced:
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8',
} as const;

// 海报:用 picsum.photos 配合种子生成(基于标题稳定)
function poster(title: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(title)}/300/450`;
}

// 多集:把同一个 HLS 源当作 N 集(本地演示用,真实环境每集应有独立 m3u8)
function multiEpisodes(
  base: string,
  titles: string[],
): LocalEpisode[] {
  return titles.map((t) => ({ title: t, url: base }));
}

export const LOCAL_ITEMS: LocalItem[] = [
  // ============ 电影 ============
  {
    id: 'm-001',
    title: '大雄的奇幻冒险',
    poster: poster('m-001'),
    year: '2024',
    rate: '8.6',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '青山刚昌',
    cast: ['哆啦A梦', '大雄', '静香'],
    area: '日本',
    douban_id: 36041459,
    class: '动画',
    type_name: '动画电影',
    remarks: 'HD',
    desc: '哆啦A梦与大雄踏上全新的时空冒险,寻找传说中的神秘道具,一路笑料不断又温情满满。',
    episodes: [{ title: '正片', url: HLS_SOURCES.muxBBB }],
  },
  {
    id: 'm-002',
    title: '星际穿越:重生',
    poster: poster('m-002'),
    year: '2023',
    rate: '9.1',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '诺兰',
    cast: ['马修·麦康纳', '安妮·海瑟薇'],
    area: '美国',
    douban_id: 1889243,
    class: '科幻',
    type_name: '科幻电影',
    remarks: 'HD',
    desc: '在不远的未来,地球环境恶化,一群探险家穿越虫洞寻找人类新家园的壮丽史诗。',
    episodes: [{ title: '正片', url: HLS_SOURCES.appleBipBopAdv }],
  },
  {
    id: 'm-003',
    title: '山巅之城',
    poster: poster('m-003'),
    year: '2024',
    rate: '7.9',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '王家卫',
    cast: ['梁朝伟', '章子怡'],
    area: '香港',
    douban_id: 35465232,
    class: '剧情',
    type_name: '剧情电影',
    remarks: 'HD',
    desc: '一段跨越三十年的都市情感群像,在光影流转中讲述命运与选择的纠缠。',
    episodes: [{ title: '正片', url: HLS_SOURCES.muxTears }],
  },
  {
    id: 'm-004',
    title: '夜行者',
    poster: poster('m-004'),
    year: '2025',
    rate: '8.3',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '丹尼斯·维伦纽瓦',
    cast: ['奥斯卡·伊萨克'],
    area: '美国',
    douban_id: 30058772,
    class: '悬疑',
    type_name: '悬疑电影',
    remarks: 'HD',
    desc: '在霓虹灯永不熄灭的都市,一名战地摄影师卷入一场危险的阴谋。',
    episodes: [{ title: '正片', url: HLS_SOURCES.appleAdvanced }],
  },
  {
    id: 'm-005',
    title: '岁月神偷',
    poster: poster('m-005'),
    year: '2010',
    rate: '8.7',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '罗启锐',
    cast: ['任达华', '吴君如'],
    area: '香港',
    douban_id: 3792799,
    class: '家庭',
    type_name: '家庭电影',
    remarks: 'HD',
    desc: '六十年代的香港深水埗,一家人面对风雨人生,笑中带泪的经典港片。',
    episodes: [{ title: '正片', url: HLS_SOURCES.muxBBB }],
  },
  {
    id: 'm-006',
    title: '千与千寻',
    poster: poster('m-006'),
    year: '2001',
    rate: '9.4',
    type: 'movie',
    source: 'local',
    source_name: '本地资源',
    director: '宫崎骏',
    cast: ['柊瑠美', '入野自由'],
    area: '日本',
    douban_id: 1291561,
    class: '动画',
    type_name: '动画电影',
    remarks: 'HD',
    desc: '千寻在神秘的汤屋里经历成长与勇气,宫崎骏的传世经典。',
    episodes: [{ title: '正片', url: HLS_SOURCES.appleBipBop }],
  },

  // ============ 剧集 ============
  {
    id: 't-001',
    title: '漫长的季节',
    poster: poster('t-001'),
    year: '2023',
    rate: '9.4',
    type: 'tv',
    source: 'local',
    source_name: '本地资源',
    director: '辛爽',
    cast: ['范伟', '秦昊', '陈明昊'],
    area: '中国大陆',
    douban_id: 35465232,
    class: '悬疑',
    type_name: '国产剧',
    remarks: '全12集',
    desc: '东北小城二十年悬案,三个中年男人在秋日里追凶,也与自己的人生和解。',
    episodes: multiEpisodes(HLS_SOURCES.muxBBB, [
      '第1集 命运的开场',
      '第2集 旧火车',
      '第3集 关键证人',
      '第4集 碎片',
      '第5集 回归',
      '第6集 旧工厂',
      '第7集 另一条线',
      '第8集 真相一角',
      '第9集 危机',
      '第10集 寻找',
      '第11集 回响',
      '第12集 漫长的季节',
    ]),
  },
  {
    id: 't-002',
    title: '繁城之下',
    poster: poster('t-002'),
    year: '2023',
    rate: '8.5',
    type: 'tv',
    source: 'local',
    source_name: '本地资源',
    director: '王铮',
    cast: ['白宇帆', '宁理'],
    area: '中国大陆',
    douban_id: 35769027,
    class: '古装',
    type_name: '国产剧',
    remarks: '全12集',
    desc: '明代江南小城连环命案,小捕快在权力漩涡中抽丝剥茧。',
    episodes: multiEpisodes(HLS_SOURCES.appleBipBopAdv, [
      '第1集',
      '第2集',
      '第3集',
      '第4集',
      '第5集',
      '第6集',
      '第7集',
      '第8集',
      '第9集',
      '第10集',
      '第11集',
      '第12集',
    ]),
  },
  {
    id: 't-003',
    title: 'Breaking Horizons',
    poster: poster('t-003'),
    year: '2024',
    rate: '8.8',
    type: 'tv',
    source: 'local',
    source_name: '本地资源',
    director: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul'],
    area: '美国',
    douban_id: 2373190,
    class: '犯罪',
    type_name: '美剧',
    remarks: '更新至8集',
    desc: '一位高中化学老师在确诊癌症后,走上制毒之路的黑色故事。',
    episodes: multiEpisodes(HLS_SOURCES.muxTears, [
      'S01E01 Pilot',
      'S01E02 ...and the Bag\'s in the River',
      'S01E03 ...and the Sky\'s the Limit',
      'S01E04 Cancer Man',
      'S01E05 Gray Matter',
      'S01E06 Crazy Handful of Nothin\'',
      'S01E07 A No-Rough-Stuff-Type Deal',
      'S01E08 Seven Thirty-Seven',
    ]),
  },
  {
    id: 't-004',
    title: 'The Office Chronicles',
    poster: poster('t-004'),
    year: '2022',
    rate: '9.0',
    type: 'tv',
    source: 'local',
    source_name: '本地资源',
    director: 'Greg Daniels',
    cast: ['Steve Carell', 'John Krasinski'],
    area: '美国',
    douban_id: 3882298,
    class: '喜剧',
    type_name: '美剧',
    remarks: '全9集',
    desc: '一家纸张公司日常里的荒诞与温情,办公室里的众生相。',
    episodes: multiEpisodes(HLS_SOURCES.appleAdvanced, [
      'S01E01',
      'S01E02',
      'S01E03',
      'S01E04',
      'S01E05',
      'S01E06',
      'S01E07',
      'S01E08',
      'S01E09',
    ]),
  },

  // ============ 动漫 ============
  {
    id: 'a-001',
    title: '进击的巨人 最终季',
    poster: poster('a-001'),
    year: '2023',
    rate: '9.0',
    type: 'anime',
    source: 'local',
    source_name: '本地资源',
    director: '林祐一郎',
    cast: ['梶裕贵', '石川由依'],
    area: '日本',
    douban_id: 30424374,
    class: '热血',
    type_name: '日本动漫',
    remarks: '更新至12集',
    desc: '墙外世界的真相揭晓,艾伦与同伴们迎来终局。',
    episodes: multiEpisodes(HLS_SOURCES.muxBBB, [
      '第1集',
      '第2集',
      '第3集',
      '第4集',
      '第5集',
      '第6集',
      '第7集',
      '第8集',
      '第9集',
      '第10集',
      '第11集',
      '第12集',
    ]),
  },
  {
    id: 'a-002',
    title: '葬送的芙莉莲',
    poster: poster('a-002'),
    year: '2023',
    rate: '9.3',
    type: 'anime',
    source: 'local',
    source_name: '本地资源',
    director: '斋藤圭一郎',
    cast: ['种崎敦美', '冈本信彦'],
    area: '日本',
    douban_id: 36210598,
    class: '奇幻',
    type_name: '日本动漫',
    remarks: '全28集',
    desc: '千年精灵魔法使在勇者死后踏上理解人类的旅程,治愈神作。',
    episodes: multiEpisodes(HLS_SOURCES.appleBipBopAdv, [
      '第1集 送别的花',
      '第2集 法师芙莉莲',
      '第3集 蓝色的大陆',
      '第4集 旅伴',
      '第5集 幻影之城',
      '第6集 战士测试',
      '第7集 像她那样的魔法使',
      '第8集 上级的魔法',
    ]),
  },
  {
    id: 'a-003',
    title: '咒术回战 第二季',
    poster: poster('a-003'),
    year: '2023',
    rate: '8.2',
    type: 'anime',
    source: 'local',
    source_name: '本地资源',
    director: '御所园翔太',
    cast: ['榎木淳弥', '中村悠一'],
    area: '日本',
    douban_id: 35465232,
    class: '热血',
    type_name: '日本动漫',
    remarks: '全23集',
    desc: '涩谷事变篇开启,咒术师们面对前所未有的强敌。',
    episodes: multiEpisodes(HLS_SOURCES.muxTears, [
      '第1集',
      '第2集',
      '第3集',
      '第4集',
      '第5集',
      '第6集',
      '第7集',
      '第8集',
      '第9集',
      '第10集',
    ]),
  },

  // ============ 综艺 ============
  {
    id: 'v-001',
    title: '奔跑吧 第七季',
    poster: poster('v-001'),
    year: '2024',
    rate: '7.5',
    type: 'variety',
    source: 'local',
    source_name: '本地资源',
    director: '浙江卫视',
    cast: ['李晨', '郑恺', 'Angelababy'],
    area: '中国大陆',
    douban_id: 35712643,
    class: '真人秀',
    type_name: '大陆综艺',
    remarks: '更新至8期',
    desc: '兄弟团奔跑不停歇,新一季笑点密集,游戏全面升级。',
    episodes: multiEpisodes(HLS_SOURCES.appleBipBop, [
      '第1期',
      '第2期',
      '第3期',
      '第4期',
      '第5期',
      '第6期',
      '第7期',
      '第8期',
    ]),
  },
  {
    id: 'v-002',
    title: '向往的生活 第七季',
    poster: poster('v-002'),
    year: '2024',
    rate: '8.0',
    type: 'variety',
    source: 'local',
    source_name: '本地资源',
    director: '湖南卫视',
    cast: ['何炅', '黄磊', '张艺兴'],
    area: '中国大陆',
    douban_id: 35465232,
    class: '生活',
    type_name: '大陆综艺',
    remarks: '全12期',
    desc: '蘑菇屋里的慢生活,三五好友,一蔬一饭,岁月静好。',
    episodes: multiEpisodes(HLS_SOURCES.muxBBB, [
      '第1期',
      '第2期',
      '第3期',
      '第4期',
      '第5期',
      '第6期',
    ]),
  },

  // ============ 短剧 ============
  {
    id: 's-001',
    title: '逆袭人生',
    poster: poster('s-001'),
    year: '2024',
    rate: '7.2',
    type: 'short',
    source: 'local',
    source_name: '本地资源',
    director: '横店剧组',
    cast: ['张三', '李四'],
    area: '中国大陆',
    class: '逆袭',
    type_name: '都市短剧',
    remarks: '更新至30集',
    desc: '小人物逆袭上流社会的爽剧,每集独立小高潮。',
    episodes: multiEpisodes(HLS_SOURCES.appleAdvanced, [
      '第1集 命运的转盘',
      '第2集 初入豪门',
      '第3集 风波',
      '第4集 反击',
      '第5集 真相',
      '第6集 转折',
    ]),
  },
  {
    id: 's-002',
    title: '重生之我在古代当厨神',
    poster: poster('s-002'),
    year: '2024',
    rate: '7.8',
    type: 'short',
    source: 'local',
    source_name: '本地资源',
    director: '某剧组',
    cast: ['小厨', '王爷'],
    area: '中国大陆',
    class: '穿越',
    type_name: '古风短剧',
    remarks: '全40集',
    desc: '现代厨师穿越古代,以一道道创意菜征服王公贵族的爆款短剧。',
    episodes: multiEpisodes(HLS_SOURCES.muxTears, [
      '第1集 魂穿',
      '第2集 第一道菜',
      '第3集 遇王爷',
      '第4集 御膳房',
      '第5集 名声大振',
      '第6集 危机',
    ]),
  },
];

// 按类型分桶
export function listByType(type: LocalType | 'all'): LocalItem[] {
  if (type === 'all') return LOCAL_ITEMS;
  return LOCAL_ITEMS.filter((it) => it.type === type);
}

// 模糊搜索(标题 / 演员 / 简介)
export function localSearch(keyword: string): LocalItem[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  return LOCAL_ITEMS.filter((it) => {
    return (
      it.title.toLowerCase().includes(q) ||
      (it.desc || '').toLowerCase().includes(q) ||
      (it.cast || []).some((c) => c.toLowerCase().includes(q)) ||
      (it.director || '').toLowerCase().includes(q)
    );
  });
}

export function getById(id: string): LocalItem | undefined {
  return LOCAL_ITEMS.find((it) => it.id === id);
}
