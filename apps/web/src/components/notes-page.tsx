"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { NoteForm } from "./note-form";
import { NotesList } from "./notes-list";

export function NotesPage() {

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              Create, edit, and organize your notes
            </p>
          </div>
        </div>

        <Separator />

        {/* Quick Create Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Create</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteForm 
              onSuccess={() => {}} // No need to do anything special for inline form
              submitLabel="Add Note"
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Notes List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
          <NotesList />
        </div>
      </div>

    </div>
  );
}
