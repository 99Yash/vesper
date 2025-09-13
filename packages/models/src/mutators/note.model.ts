import { CreateNoteType, DeleteNoteType, UpdateNoteType } from "../validators/note.validator";
import { Mutator, MutatorTypes } from "./mutator.model";

export type NoteMutators<Type = MutatorTypes> = {
	createNote: Mutator<Type, CreateNoteType>;
	updateNote: Mutator<Type, UpdateNoteType>;
	deleteNote: Mutator<Type, DeleteNoteType>;
}