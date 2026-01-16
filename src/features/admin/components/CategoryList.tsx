"use client";

import { Category } from "@/types";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
        >
          <div>
            <div className="font-medium text-zinc-800 dark:text-zinc-100">
              {category.name}
            </div>
            {category.description && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {category.description}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(category)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              編集
            </button>
            {category.id !== "default" && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `「${category.name}」を削除しますか？\nこのカテゴリのワードは「一般」に移動されます。`
                    )
                  ) {
                    onDelete(category.id);
                  }
                }}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                削除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
