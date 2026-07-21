/**
 * 知识库聚合入口
 * 合并所有领域知识，对外提供统一的操作接口
 *
 * 新增领域：在此文件 import 对应模块并加入 ALL_CHUNKS 数组即可
 */

import { UNIAPP_CHUNKS } from "./uni-app.js";

// 所有领域知识在此聚合
const ALL_CHUNKS = [...UNIAPP_CHUNKS];

/**
 * 添加用户自定义知识条目
 * @param {Object} chunk - { title, content, keywords }
 */
export function addUserChunk(chunk) {
  const id = "user-" + Date.now();
  ALL_CHUNKS.push({
    id,
    category: "user-code",
    keywords: [],
    ...chunk,
  });
  return id;
}

/**
 * 移除用户自定义知识条目
 */
export function removeUserChunk(id) {
  const idx = ALL_CHUNKS.findIndex((c) => c.id === id);
  if (idx !== -1) ALL_CHUNKS.splice(idx, 1);
}

/**
 * 获取所有知识条目
 */
export function getAllChunks() {
  return ALL_CHUNKS;
}

/**
 * 按分类获取知识条目
 */
export function getChunksByCategory(category) {
  return ALL_CHUNKS.filter((c) => c.category === category);
}
