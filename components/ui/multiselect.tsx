"use client";
import React from "react";

type Option = { value: string; label: string };

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ options, value, onChange, placeholder }: MultiSelectProps) {
  function handleToggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  function handleSelectAll() {
    onChange(options.map((opt) => opt.value));
  }

  function handleClearAll() {
    onChange([]);
  }

  return (
    <div className="border rounded px-2 py-1 bg-background">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{placeholder}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
            aria-label="Selecionar todos"
            disabled={options.length === 0 || value.length === options.length}
          >
            Selecionar todos
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Limpar seleção"
            disabled={value.length === 0}
          >
            Limpar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
              className="accent-blue-600"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 