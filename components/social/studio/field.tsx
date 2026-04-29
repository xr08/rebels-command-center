"use client";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
};

export function Field({ label, value, onChange, multiline = false, type = "text", placeholder }: FieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-command-muted">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm"
        />
      )}
    </label>
  );
}
