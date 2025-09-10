"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useNotes } from "~/hooks/use-notes";
import { NoteItem } from "./note-item";

export function NotesList() {
  const { notes, isLoading } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    
    const query = searchQuery.toLowerCase();
    return notes.filter((note) =>
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Skeleton className="h-10 w-full pl-9" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery.trim() ? (
                <>
                  <p className="text-lg font-medium">No notes found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">No notes yet</p>
                  <p className="text-sm">Create your first note to get started</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {searchQuery.trim() && (
              <div className="text-sm text-muted-foreground">
                {filteredNotes.length} of {notes.length} notes
              </div>
            )}
            {filteredNotes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
