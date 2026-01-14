// ひらがな → ローマ字変換テーブル
// 複数の入力パターンに対応
const ROMAJI_MAP: Record<string, string[]> = {
  // 基本
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  // か行
  か: ["ka", "ca"],
  き: ["ki"],
  く: ["ku", "cu", "qu"],
  け: ["ke"],
  こ: ["ko", "co"],
  // さ行
  さ: ["sa"],
  し: ["si", "shi", "ci"],
  す: ["su"],
  せ: ["se", "ce"],
  そ: ["so"],
  // た行
  た: ["ta"],
  ち: ["ti", "chi"],
  つ: ["tu", "tsu"],
  て: ["te"],
  と: ["to"],
  // な行
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  // は行
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["hu", "fu"],
  へ: ["he"],
  ほ: ["ho"],
  // ま行
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  // や行
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  // ら行
  ら: ["ra", "la"],
  り: ["ri", "li"],
  る: ["ru", "lu"],
  れ: ["re", "le"],
  ろ: ["ro", "lo"],
  // わ行
  わ: ["wa"],
  を: ["wo"],
  ん: ["n", "nn", "xn"],
  // 濁音
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["zi", "ji"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["di"],
  づ: ["du", "dzu"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  // 半濁音
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
  // 拗音
  きゃ: ["kya"],
  きゅ: ["kyu"],
  きょ: ["kyo"],
  しゃ: ["sya", "sha"],
  しゅ: ["syu", "shu"],
  しょ: ["syo", "sho"],
  ちゃ: ["tya", "cha", "cya"],
  ちゅ: ["tyu", "chu", "cyu"],
  ちょ: ["tyo", "cho", "cyo"],
  にゃ: ["nya"],
  にゅ: ["nyu"],
  にょ: ["nyo"],
  ひゃ: ["hya"],
  ひゅ: ["hyu"],
  ひょ: ["hyo"],
  みゃ: ["mya"],
  みゅ: ["myu"],
  みょ: ["myo"],
  りゃ: ["rya", "lya"],
  りゅ: ["ryu", "lyu"],
  りょ: ["ryo", "lyo"],
  ぎゃ: ["gya"],
  ぎゅ: ["gyu"],
  ぎょ: ["gyo"],
  じゃ: ["ja", "zya", "jya"],
  じゅ: ["ju", "zyu", "jyu"],
  じょ: ["jo", "zyo", "jyo"],
  びゃ: ["bya"],
  びゅ: ["byu"],
  びょ: ["byo"],
  ぴゃ: ["pya"],
  ぴゅ: ["pyu"],
  ぴょ: ["pyo"],
  // 小文字
  ぁ: ["xa", "la"],
  ぃ: ["xi", "li"],
  ぅ: ["xu", "lu"],
  ぇ: ["xe", "le"],
  ぉ: ["xo", "lo"],
  ゃ: ["xya", "lya"],
  ゅ: ["xyu", "lyu"],
  ょ: ["xyo", "lyo"],
  っ: ["xtu", "ltu", "xtsu", "ltsu"],
  // 特殊
  ー: ["-"],
  "、": [","],
  "。": ["."],
  " ": [" "],
  "　": [" "],
};

// 促音（っ）の処理用：次の子音を重ねる
const CONSONANTS = "kstcnhmyrwgzdbpfjvlq";

/**
 * ひらがなをローマ字パターンに変換
 * 複数の入力パターンを考慮した配列を返す
 */
export function hiraganaToRomajiPatterns(hiragana: string): string[][] {
  const result: string[][] = [];
  let i = 0;

  while (i < hiragana.length) {
    // 拗音（2文字）のチェック
    if (i + 1 < hiragana.length) {
      const twoChars = hiragana.slice(i, i + 2);
      if (ROMAJI_MAP[twoChars]) {
        result.push(ROMAJI_MAP[twoChars]);
        i += 2;
        continue;
      }
    }

    // 促音（っ）の処理
    if (hiragana[i] === "っ" && i + 1 < hiragana.length) {
      const nextChar = hiragana[i + 1];
      // 次の文字の拗音チェック
      let nextPatterns: string[] | undefined;
      if (i + 2 < hiragana.length) {
        const nextTwoChars = hiragana.slice(i + 1, i + 3);
        nextPatterns = ROMAJI_MAP[nextTwoChars];
      }
      if (!nextPatterns) {
        nextPatterns = ROMAJI_MAP[nextChar];
      }

      if (nextPatterns) {
        // 子音を重ねるパターンを生成
        const sokuonPatterns = nextPatterns
          .map((pattern) => {
            const firstChar = pattern[0];
            if (CONSONANTS.includes(firstChar)) {
              return firstChar;
            }
            return null;
          })
          .filter((p): p is string => p !== null);

        // xtu/ltu パターンも追加
        const allPatterns = [
          ...new Set([...sokuonPatterns, ...ROMAJI_MAP["っ"]]),
        ];
        result.push(allPatterns);
        i += 1;
        continue;
      }
    }

    // 1文字のチェック
    const oneChar = hiragana[i];
    if (ROMAJI_MAP[oneChar]) {
      result.push(ROMAJI_MAP[oneChar]);
    } else {
      // マッピングがない場合はそのまま
      result.push([oneChar]);
    }
    i += 1;
  }

  return result;
}

/**
 * ひらがなをデフォルトのローマ字に変換
 */
export function hiraganaToRomaji(hiragana: string): string {
  const patterns = hiraganaToRomajiPatterns(hiragana);
  return patterns.map((p) => p[0]).join("");
}

/**
 * 入力されたローマ字が正しいかチェック
 * @returns 一致した文字数、または-1（不一致）
 */
export function checkRomajiInput(
  patterns: string[][],
  currentPatternIndex: number,
  currentInput: string,
  newChar: string
): { matched: boolean; advancePattern: boolean; newInput: string } {
  if (currentPatternIndex >= patterns.length) {
    return { matched: false, advancePattern: false, newInput: currentInput };
  }

  const currentPatterns = patterns[currentPatternIndex];
  const testInput = currentInput + newChar;

  // 完全一致するパターンがあるか
  for (const pattern of currentPatterns) {
    if (pattern === testInput) {
      return { matched: true, advancePattern: true, newInput: "" };
    }
    // 部分一致（入力途中）
    if (pattern.startsWith(testInput)) {
      return { matched: true, advancePattern: false, newInput: testInput };
    }
  }

  // 「ん」の特殊処理：「n」で次が母音以外なら確定
  if (currentPatterns.includes("n") && currentInput === "n") {
    const nextPatterns = patterns[currentPatternIndex + 1];
    if (nextPatterns) {
      const vowels = ["a", "i", "u", "e", "o", "y", "n"];
      const nextStartsWithVowel = nextPatterns.some((p) =>
        vowels.includes(p[0])
      );
      if (!nextStartsWithVowel) {
        // 「n」を確定して次のパターンへ
        return checkRomajiInput(patterns, currentPatternIndex + 1, "", newChar);
      }
    }
  }

  return { matched: false, advancePattern: false, newInput: currentInput };
}
