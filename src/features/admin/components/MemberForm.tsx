"use client";

import { useState, useRef } from "react";
import { Member } from "@/types";

interface MemberFormProps {
  member?: Member | null;
  onSave: (data: {
    name: string;
    nameReading: string;
    nickname: string | null;
    nicknameReading: string | null;
    photoData: string;
  }) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const [name, setName] = useState(member?.name ?? "");
  const [nameReading, setNameReading] = useState(member?.nameReading ?? "");
  const [nickname, setNickname] = useState(member?.nickname ?? "");
  const [nicknameReading, setNicknameReading] = useState(member?.nicknameReading ?? "");
  const [photoData, setPhotoData] = useState(member?.photoData ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nameReading.trim()) {
      alert("名前と名前の読みは必須です");
      return;
    }
    if (!photoData) {
      alert("写真を選択してください");
      return;
    }
    onSave({
      name: name.trim(),
      nameReading: nameReading.trim(),
      nickname: nickname.trim() || null,
      nicknameReading: nicknameReading.trim() || null,
      photoData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 写真アップロード */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          顔写真
        </label>
        <div className="flex items-center gap-4">
          {photoData ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
              <img
                src={photoData}
                alt="プレビュー"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400">
              写真
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"
            >
              {photoData ? "写真を変更" : "写真を選択"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              JPG, PNG (5MB以下)
            </p>
          </div>
        </div>
      </div>

      {/* 名前 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          名前
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 田中太郎"
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* 名前の読み */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          名前の読み（ひらがな）
        </label>
        <input
          type="text"
          value={nameReading}
          onChange={(e) => setNameReading(e.target.value)}
          placeholder="例: たなかたろう"
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          ※ひらがなで入力してください（タイピング時の正解判定に使用）
        </p>
      </div>

      {/* あだ名 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          あだ名（任意）
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例: たろさん"
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* あだ名の読み */}
      {nickname && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            あだ名の読み（ひらがな）
          </label>
          <input
            type="text"
            value={nicknameReading}
            onChange={(e) => setNicknameReading(e.target.value)}
            placeholder="例: たろさん"
            className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            ※あだ名でも正解にする場合はひらがなで入力してください
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          {member ? "更新" : "追加"}
        </button>
      </div>
    </form>
  );
}
