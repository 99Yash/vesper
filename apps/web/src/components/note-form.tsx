"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Note } from "@vesper/models/db/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { useNotes } from "~/hooks/use-notes";

const noteFormSchema = z.object({
  content: z.string().min(1, {
    message: "Content is required.",
  }).max(5000, {
    message: "Content must be less than 5000 characters.",
  }),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  note?: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function NoteForm({ note, onSuccess, onCancel, submitLabel }: NoteFormProps) {
  const { createNote, updateNote } = useNotes();
  const isEditing = Boolean(note);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      content: note?.content ?? "",
    },
  });

  const onSubmit = async (values: NoteFormValues) => {
    let success = false;

    if (isEditing && note) {
      success = await updateNote({
        id: note.id,
        content: values.content,
      });
    } else {
      success = await createNote({
        content: values.content,
      });
    }

    if (success) {
      if (!isEditing) {
        form.reset();
      }
      onSuccess?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your note here..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={handleKeyDown}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write your note content here. Markdown is supported. Press Cmd+Enter to save.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : (submitLabel ?? (isEditing ? "Update Note" : "Create Note"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
