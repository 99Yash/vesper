"use client";

import type { Note } from "@vesper/models/db/schema";
import { formatDistanceToNow } from "date-fns";
import { Clock, Edit, FileText, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Modal } from "~/components/ui/modal";
import { useNotes } from "~/hooks/use-notes";
import { NoteForm } from "./note-form";

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const { deleteNote } = useNotes();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteNote({ id: note.id });
    setIsDeleteDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown time";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 dark:from-gray-900 dark:to-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(note.updatedAt?.toISOString() || note.createdAt?.toISOString())}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8 p-0 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 relative">
          <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-pretty">
            {note.content?.length > 200 ? note.content.substring(0, 200) + "..." : note.content}
          </div>
        </CardContent>

        {note.files && note.files.length > 0 && (
          <CardFooter className="pt-0 pb-4 relative">
            <Badge
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              <FileText className="mr-1 h-3 w-3" />
              {note.files.length} file{note.files.length !== 1 ? "s" : ""}
            </Badge>
          </CardFooter>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>

      {/* Edit Modal */}
      <Modal
        showModal={isEditDialogOpen}
        setShowModal={setIsEditDialogOpen}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Edit Note</h2>
          </div>
          <NoteForm
            note={note}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel="Save Changes"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
