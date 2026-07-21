/**
 * RAG 检索模块
 * 基于关键词匹配 + 文本相似度的轻量级检索（无需额外嵌入模型）
 *
 * 策略：
 * 1. 关键词匹配：user query 中的词命中 chunk.keywords 越多，分数越高
 * 2. 文本重叠度：query 与 chunk.content 的字符级 n-gram 重叠率
 * 3. 加权汇总后返回 top-k 个最相关 chunk
 */

import { getAllChunks } from "./knowledge-base.js";

/** 返回检索到的 top-k 块 */
const TOP_K = 3;
/** 关键词匹配权重（高于文本重叠度） */
const KEYWORD_WEIGHT = 2.0;
/** 文本重叠度权重 */
const OVERLAP_WEIGHT = 1.0;

/**
 * 剥离无意义的范围限定词（用户常在问题前加 "uniapp" 但这不是搜索关键词）
 */
const NOISE_WORDS =
  /^(uniapp|uni-app|uni app|uniapp的|uni-app的|请问|我想问|问一下|如何|怎么|怎样)\s*/i;

function stripNoise(text) {
  return text.replace(NOISE_WORDS, "").trim();
}

/**
 * 将中文文本简单切分为有意义的片段（按标点、空格、常见虚词切分）
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[\s,，。！？、；：""''（）\(\)\[\]【】\{\}]+/)
    .filter((t) => t.length > 0);
}

/**
 * 字符级 bigram 集合
 */
function charBigrams(text) {
  const s = text.toLowerCase().replace(/\s+/g, "");
  const grams = new Set();
  for (let i = 0; i < s.length - 1; i++) {
    grams.add(s.slice(i, i + 2));
  }
  return grams;
}

/**
 * Jaccard 相似度：两个 bigram 集合的交集/并集
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

/**
 * 关键词命中得分（0~1）
 */
function keywordScore(queryTokens, keywords) {
  if (!keywords || keywords.length === 0) return 0;
  let hits = 0;
  for (const kw of keywords) {
    for (const token of queryTokens) {
      if (
        kw.toLowerCase().includes(token) ||
        token.includes(kw.toLowerCase())
      ) {
        hits++;
        break;
      }
    }
  }
  return hits / keywords.length;
}

/**
 * 检索：根据用户查询返回最相关的知识条目
 * @param {string} query - 用户输入
 * @param {number} topK - 返回条数
 * @returns {Array<{chunk, score}>}
 */
export function retrieve(query, topK = TOP_K) {
  const chunks = getAllChunks();
  const queryTokens = tokenize(query);
  // 剥离范围限定词后用于 bigram 匹配（避免 "uniapp" 干扰）
  const cleanQuery = stripNoise(query) || query;
  const queryBigrams = charBigrams(cleanQuery);

  const scored = chunks.map((chunk) => {
    // 1. 关键词匹配（用原始 query 的 tokens）
    const kwScore = keywordScore(queryTokens, chunk.keywords);

    // 2. 文本重叠度：剥离噪音词后 max(title, content) 的 bigram 重叠率
    const cleanTitle = stripNoise(chunk.title) || chunk.title;
    const titleOverlap = jaccardSimilarity(
      queryBigrams,
      charBigrams(cleanTitle),
    );
    const contentOverlap = jaccardSimilarity(
      queryBigrams,
      charBigrams(chunk.content),
    );
    const overlapScore = Math.max(titleOverlap, contentOverlap);

    // 加权总分
    const score = kwScore * KEYWORD_WEIGHT + overlapScore * OVERLAP_WEIGHT;

    return { chunk, score };
  });

  // 按分数降序，取 topK
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((s) => s.score > 0);
}

/**
 * 将检索结果格式化为可注入 prompt 的文本
 * @param {Array} results - retrieve() 返回的结果
 * @returns {string} 格式化的知识上下文文本
 */
export function formatContext(results) {
  if (results.length === 0) return "";

  let context = "【参考知识】（请优先据此回答）\n";
  results.forEach((r, i) => {
    context += `\n--- 参考${i + 1}：${r.chunk.title} ---\n`;
    context += r.chunk.content + "\n";
  });
  return context;
}
