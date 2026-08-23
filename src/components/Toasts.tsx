'use client';

import React from 'react';
import { useShoppingStore } from '../store/useShoppingStore';

export default function Toasts() {
  const toasts = useShoppingStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        let bgColor = 'bg-green-500';
        if (toast.type === 'error') bgColor = 'bg-red-500';
        if (toast.type === 'info') bgColor = 'bg-blue-500';

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[250px] animate-[slideIn_0.3s_ease-out]`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
