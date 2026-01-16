"use client";

import { useState, useRef } from "react";
import { Category, InputType, DifficultyWeights, DEFAULT_WEIGHTS } from "@/types";
import { addWord } from "@/libs/storage";

interface CsvUploadProps {
  categories: Category[];
  onImportComplete: () => void;
}

interface ParsedWord {
  text: string;
  reading: string;
  inputType: InputType;
  categoryId: string;
  weights: DifficultyWeights;
  isValid: boolean;
  error?: string;
}

export function CsvUpload({ categories, onImportComplete }: CsvUploadProps) {
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "不明";
  };

  const findCategoryId = (name: string): string | null => {
    const category = categories.find(
      (c) => c.name === name || c.id === name
    );
    return category?.id || null;
  };

  const parseCSV = (content: string): ParsedWord[] => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    // ヘッダー行をスキップ（最初の行がヘッダーかどうか判定）
    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes("text") ||
      firstLine.includes("テキスト") ||
      firstLine.includes("reading") ||
      firstLine.includes("ふりがな");

    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const columns = line.split(",").map((col) => col.trim());

      // 最低限 text と reading が必要
      if (columns.length < 2) {
        return {
          text: columns[0] || "",
          reading: "",
          inputType: "hiragana" as InputType,
          categoryId: "default",
          weights: { ...DEFAULT_WEIGHTS },
          isValid: false,
          error: "テキストとふりがなは必須です",
        };
      }

      const text = columns[0];
      const reading = columns[1];
      const inputTypeRaw = columns[2]?.toLowerCase() || "hiragana";
      const categoryRaw = columns[3] || "default";
      const easyWeight = parseInt(columns[4]) || 1;
      const normalWeight = parseInt(columns[5]) || 1;
      const hardWeight = parseInt(columns[6]) || 1;

      // 入力タイプの検証
      const inputType: InputType =
        inputTypeRaw === "alphabet" || inputTypeRaw === "abc"
          ? "alphabet"
          : "hiragana";

      // カテゴリIDの検索
      const categoryId = findCategoryId(categoryRaw) || "default";

      // バリデーション
      let isValid = true;
      let error: string | undefined;

      if (!text) {
        isValid = false;
        error = "テキストは必須です";
      } else if (!reading) {
        isValid = false;
        error = "ふりがなは必須です";
      }

      return {
        text,
        reading,
        inputType,
        categoryId,
        weights: {
          easy: Math.max(0, Math.min(10, easyWeight)),
          normal: Math.max(0, Math.min(10, normalWeight)),
          hard: Math.max(0, Math.min(10, hardWeight)),
        },
        isValid,
        error,
      };
    });
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("CSVファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setParsedWords(parsed);
      setIsPreview(true);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    const validWords = parsedWords.filter((w) => w.isValid);

    for (const word of validWords) {
      addWord({
        text: word.text,
        reading: word.reading,
        inputType: word.inputType,
        categoryId: word.categoryId,
        weights: word.weights,
      });
    }

    setImporting(false);
    setParsedWords([]);
    setIsPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImportComplete();
  };

  const handleCancel = () => {
    setParsedWords([]);
    setIsPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = parsedWords.filter((w) => w.isValid).length;
  const invalidCount = parsedWords.filter((w) => !w.isValid).length;

  return (
    <div className="space-y-6">
      {/* アップロードエリア */}
      {!isPreview && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : "border-zinc-300 dark:border-zinc-600"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer block"
            >
              <div className="text-4xl mb-4">{isDragging ? "📥" : "📄"}</div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                {isDragging
                  ? "ここにドロップしてください"
                  : "CSVファイルをクリックして選択"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                または、ドラッグ＆ドロップ
              </p>
            </label>
          </div>

          {/* フォーマット説明 */}
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
              CSVフォーマット
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              カンマ区切りで以下の列を指定してください（ヘッダー行は任意）
            </p>
            <div className="bg-white dark:bg-zinc-900 rounded p-3 font-mono text-sm overflow-x-auto">
              <p className="text-zinc-500 dark:text-zinc-500">
                テキスト,ふりがな,入力タイプ,カテゴリ,易,普,難
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                寿司,すし,hiragana,一般,2,1,0
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                container,container,alphabet,IT用語,0,1,2
              </p>
            </div>
            <ul className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 space-y-1">
              <li>• 入力タイプ: hiragana または alphabet（省略時: hiragana）</li>
              <li>• カテゴリ: カテゴリ名またはID（省略時: default）</li>
              <li>• 重み: 0〜10の数値（省略時: 1）</li>
            </ul>
          </div>
        </div>
      )}

      {/* プレビュー */}
      {isPreview && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-green-600 dark:text-green-400 mr-4">
                有効: {validCount}件
              </span>
              {invalidCount > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  エラー: {invalidCount}件
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? "インポート中..." : `${validCount}件をインポート`}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">
                      状態
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">
                      テキスト
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">
                      ふりがな
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">
                      タイプ
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-zinc-500">
                      カテゴリ
                    </th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-zinc-500">
                      重み
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedWords.map((word, index) => (
                    <tr
                      key={index}
                      className={`border-b border-zinc-100 dark:border-zinc-800 ${
                        !word.isValid ? "bg-red-50 dark:bg-red-900/10" : ""
                      }`}
                    >
                      <td className="py-2 px-3">
                        {word.isValid ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span
                            className="text-red-500 cursor-help"
                            title={word.error}
                          >
                            ✗
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-zinc-800 dark:text-zinc-100">
                        {word.text || "-"}
                      </td>
                      <td className="py-2 px-3 text-sm text-zinc-600 dark:text-zinc-300">
                        {word.reading || "-"}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            word.inputType === "alphabet"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                          }`}
                        >
                          {word.inputType === "alphabet" ? "ABC" : "あ"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-zinc-600 dark:text-zinc-300">
                        {getCategoryName(word.categoryId)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex justify-center gap-1">
                          <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            {word.weights.easy}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                            {word.weights.normal}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            {word.weights.hard}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
