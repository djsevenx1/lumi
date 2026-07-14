// 数据类型定义
export interface VideoSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  addedAt: number;
}

export const DEFAULT_SOURCES: VideoSource[] = [];