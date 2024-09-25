import { NODE_ENV } from '$env/static/private';
import kuromoji from 'kuromoji';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

const EXCLUDE_WORDS = [
  "こと", "これ", "それ", "そう", "どこ", 
  "さん", "ちゃん", "くん", "自分", "おれ", "やつ", 
  "よう", "みたい", 
  "はず", 
  "今日", "明日", "本日", "あした", "きょう",
  "ここ", "ところ",
  "www", "com", "https", 
  "あなた", "彼", "彼女", "俺", "僕", "私", "私達", "私たち", "あなたたち", "彼ら", "誰", "何", "何か", "どれ", "どちら", // 人称代名詞
  "今", "昨日", "昨日", "明後日", "先日", "先週", "来週", "今年", "去年", "日", "年", "月", "時間", "時", "分", "秒", "いつ", "前", "後", "前日", "毎日", "毎年", "毎月", "昨日", "先ほど", "そこ", // 時間場所
  "もの", "事", "事柄", "場合", "人", "方", "人々", "方々", "者", "方", "事", "所", "物", "部分", "箇所", // 一般的な言葉
  "全て", "すべて", "みんな", "全部", "他", "他人", "誰か",
  "ところ", "くらい", "ぐらい", "けど", "けれども", "ただ", "ため", "どう", "何故", "なぜ", "どんな", "どの", "だれ", "これ", "それ", "あれ", "ここ", "そこ", "あそこ",
  "http", "www", "html", "php", "net", "org", "ftp", "co", "io", "jp", "www", "mailto", // インターネット
  "bsky", "social", // Bluesky
  "to", "the", "of", "you", "be", "in", "is", "it", "for", "that", "on" // 英語
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kuromoji tokenizerのビルダー
const dicPath = "node_modules/kuromoji/dict";
const tokenizerBuilder = kuromoji.builder({ dicPath: dicPath });

/**
 * テキストの配列から名詞の頻出TOP3を返す関数
 */
export async function getNounFrequencies(posts) {
  return new Promise((resolve, reject) => {
    tokenizerBuilder.build((err, tokenizer) => {
      if (err) {
        return reject(err);
      }

      const freqMap = {};
      const freqMapToday = {};

      posts.forEach(post => {
        let text = post.value.text;

        // textがnull, undefined, 空文字でないことを確認
        if (typeof text !== 'string' || text.trim() === '') {
          return; // 空の場合は処理をスキップ
        }

        // ヌル文字を空文字に置換
        text = text.replace(/\0/g, '');

        // 日本語ポストであることを確認
        if (post.value.langs && post.value.langs.includes("ja")) {   
        
          try {
            const tokens = tokenizer.tokenize(text);
            const nouns = tokens.filter(token => 
              token.pos === '名詞' &&
              !/^[\d]+$/.test(token.surface_form) && // 数値の除外
              !/^[^\p{L}]+$/u.test(token.surface_form) && // 記号の除外
              !/^[ぁ-ん]{1}$/.test(token.surface_form) && // ひらがな一文字の除外
              token.surface_form.length !== 1 && // 1文字のみの単語を除外
              !/ー{2,}/.test(token.surface_form) && // 伸ばし棒2文字以上の単語を除外
              !EXCLUDE_WORDS.includes(token.surface_form) // EXCLUDE_WORDSに含まれていない
            );
            nouns.forEach(noun => {
              const surfaceForm = noun.surface_form;
              freqMap[surfaceForm] = (freqMap[surfaceForm] || 0) + 1;
            });

            // 24h以内のポストは別に集計
            const createdAt = new Date(post.value.createdAt);
            const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)); // 現在時刻から24h前
            if (createdAt > yesterday) {
              nouns.forEach(noun => {
                const surfaceForm = noun.surface_form;
                freqMapToday[surfaceForm] = (freqMapToday[surfaceForm] || 0) + 1;
              });
            }
          } catch (err) {
            console.warn(`[WARN] word analyze error occur: ${post}`);
          }
          
        } else {
          // 日本語でないポストの場合、現状何もしない
          return;
        }
      });      

      const sortedData = Object.entries(freqMap).sort((a, b) => b[1] - a[1]); // スコアでソート
      const sortedDataToday = Object.entries(freqMapToday).sort((a, b) => b[1] - a[1]);
      const sortedNouns = sortedData.map(([noun]) => noun).slice(0, 3); // 名詞の配列TOP3
      
      resolve({ sortedNouns, sortedData, sortedDataToday });
    });
  });
}
