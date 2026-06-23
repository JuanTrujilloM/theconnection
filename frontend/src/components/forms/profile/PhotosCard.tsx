'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import type { ProfilePhoto } from '@/types/profile';
import { MAX_PHOTOS } from '@/lib/constants/profile';
import { Card } from '@/components/ui/Card';

// HU-02 — photo upload (1–5) with preview thumbnails and drag-to-reorder.
// The first photo is the primary one.
export function PhotosCard({ form }: { form: UseFormReturn<ProfileValues> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const error = form.formState.errors.photos?.message;

  return (
    <Card
      title="Tus fotos"
      description={`Agrega de 1 a ${MAX_PHOTOS} fotos. La primera es tu foto principal.`}
    >
      <Controller
        control={form.control}
        name="photos"
        render={({ field }) => {
          const photos = field.value;

          const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
            const incoming = Array.from(event.target.files ?? []);
            const room = MAX_PHOTOS - photos.length;
            const next: ProfilePhoto[] = incoming.slice(0, room).map((file) => ({
              id: crypto.randomUUID(),
              url: URL.createObjectURL(file),
              file,
            }));
            field.onChange([...photos, ...next]);
            // Reset so selecting the same file again still fires onChange.
            event.target.value = '';
          };

          const removeAt = (index: number) => {
            const target = photos[index];
            // Only newly-added photos hold an object URL worth releasing;
            // existing (server) photos use a remote URL.
            if (target.file) URL.revokeObjectURL(target.url);
            field.onChange(photos.filter((_, i) => i !== index));
          };

          const reorder = (from: number, to: number) => {
            const next = [...photos];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            field.onChange(next);
          };

          return (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== index) {
                        reorder(dragIndex, index);
                      }
                      setDragIndex(null);
                    }}
                    className="group border-white/10 relative aspect-square cursor-grab overflow-hidden rounded-xl border active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="bg-gold text-navy-deep absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      aria-label="Quitar foto"
                      className="bg-navy-deep/80 text-cream absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs opacity-0 transition group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="border-white/15 text-slate hover:border-cyan/40 hover:text-cyan flex aspect-square items-center justify-center rounded-xl border border-dashed text-2xl transition"
                  >
                    +
                  </button>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={addFiles}
              />

              {error && <p className="text-blush text-xs">{error}</p>}
            </div>
          );
        }}
      />
    </Card>
  );
}
