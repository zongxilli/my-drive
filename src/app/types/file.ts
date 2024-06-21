// value of FileType should keep consistent to fileTypes & schemaFileTypes in convex/schema.ts

export enum FileType {
	pdf = 'pdf',
	image = 'image',
	csv = 'csv',
}

export type FileTypeUnion = (typeof FileType)[keyof typeof FileType];
