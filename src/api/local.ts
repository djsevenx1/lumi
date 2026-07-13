// 本地数据适配层
// 替换原 src/api/endpoints.ts + client.ts 中的网络请求
// 全部从 src/data/content.ts 读取,模拟异步以保持页面 loading 体验

import {
  LOCAL_ITEMS,
  localSearch as dataSearch,
  getById as dataGetById,
  listByType as dataListByType,
  type LocalItem,
  type LocalType,
} from '../data/content';
import type {
  SearchResult,
  DetailItem,
  DoubanItem,
  DoubanResponse,
} from './types';

// 把 LocalItem 映射成 SearchResult(供 SearchPage / HomePage 列表渲染)
function toSearchResult(it: LocalItem): SearchResult {
  return {
    id: it.id,
    title: it.title,
    poster: it.poster,
    source: it.source,
    source_name: it.source_name,
    class: it.class,
    year: it.year,
    desc: it.desc,
    type_name: it.type_name,
    douban_id: it.douban_id,
    remarks: it.remarks,
  };
}

function toDoubanItem(it: LocalItem): DoubanItem {
  return {
    id: it.id,
    title: it.title,
    poster: it.poster,
    rate: it.rate,
    year: it.year,
  };
}

function toDetail(it: LocalItem): DetailItem {
  return {
    id: it.id,
    title: it.title,
    poster: it.poster,
    episodes: it.episodes.map((e) => e.url),
    episodes_titles: it.episodes.map((e) => e.title),
    source: it.source,
    source_name: it.source_name,
    class: it.class,
    year: it.year,
    desc: it.desc,
    type_name: it.type_name,
    douban_id: it.douban_id,
    remarks: it.remarks,
  };
}

// 模拟一点网络延迟,让 loading 状态可见
function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ====== 搜索 ======
export function search(keyword: string) {
  const list = dataSearch(keyword).map(toSearchResult);
  return delay({ results: list });
}

// ====== 详情 ======
// 入参用 id(LocalItem.id),source 在本地无意义但保留签名以减少上层改动
export function detail(_source: string, id: string) {
  const it = dataGetById(id);
  if (!it) {
    return delay(null as unknown as DetailItem);
  }
  return delay(toDetail(it));
}

// ====== 豆瓣热门(改为本地热门) ======
export function doubanHot(
  type: 'movie' | 'tv',
  _tag: string = '热门',
  pageSize: number = 12,
) {
  // 豆瓣热门在这里映射为"按类型排序的本地列表"
  // movie -> movie, 其它 -> tv (anime/variety/short 都归到 tv 这一桶)
  const localType: LocalType = type === 'movie' ? 'movie' : 'tv';
  const list = dataListByType(localType)
    .slice(0, pageSize)
    .map(toDoubanItem);
  return delay<DoubanResponse>({
    code: 200,
    message: 'ok',
    list,
  });
}

// 综合分类:type 仍然接受 movie/tv/anime/variety/short/all
export function listByCategory(
  type: LocalType | 'all',
  pageSize: number = 50,
) {
  const list = dataListByType(type)
    .slice(0, pageSize)
    .map(toSearchResult);
  return delay({ results: list });
}

// 全部数据(供"全部"分类)
export function allItems() {
  return delay({
    results: LOCAL_ITEMS.map(toSearchResult),
  });
}
