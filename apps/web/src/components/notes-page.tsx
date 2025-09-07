"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { NoteForm } from "./note-form";
import { NotesList } from "./notes-list";

export function NotesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              Create, edit, and organize your notes
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
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

      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <NoteForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
            submitLabel="Create Note"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
