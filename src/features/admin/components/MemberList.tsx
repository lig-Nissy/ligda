"use client";

import { Member } from "@/types";

interface MemberListProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export function MemberList({ members, onEdit, onDelete }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        メンバーが登録されていません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
            <img
              src={member.photoData}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="font-bold text-zinc-800 dark:text-zinc-100">
              {member.name}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {member.nameReading}
            </div>
            {member.nickname && (
              <div className="text-sm text-orange-500 mt-1">
                {member.nickname}
                {member.nicknameReading && (
                  <span className="text-zinc-400 ml-1">({member.nicknameReading})</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(member)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              編集
            </button>
            <button
              onClick={() => {
                if (confirm(`「${member.name}」を削除しますか？`)) {
                  onDelete(member.id);
                }
              }}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
