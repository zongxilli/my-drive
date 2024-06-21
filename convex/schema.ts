import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';

// value of fileTypes should keep consistent to enum[FileType] in types/file.ts
export const fileTypes = {
	'image/png': 'image',
	'image/jpeg': 'image',
	'application/pdf': 'pdf',
	'text/csv': 'csv',
} as Record<string, Doc<'files'>['type']>;

// type of schemaFileTypes should keep consistent to enum[FileType] in types/file.ts
export const schemaFileTypes = v.union(
	v.literal('image'),
	v.literal('csv'),
	v.literal('pdf')
);

export const userRoles = v.union(v.literal('admin'), v.literal('member'));

export default defineSchema({
	files: defineTable({
		name: v.string(),
		type: schemaFileTypes,
		fileId: v.id('_storage'),
		userId: v.id('users'),
		orgId: v.string(),
		url: v.string(),
		movedToTrash: v.boolean(),
	})
		.index('by_orgId', ['orgId'])
		.index('by_movedToTrash', ['movedToTrash']),

	starredFiles: defineTable({
		fileId: v.id('files'),
		orgId: v.string(),
		userId: v.id('users'),
	}).index('by_userId_orgId_fileId', ['userId', 'orgId', 'fileId']),

	users: defineTable({
		tokenIdentifier: v.string(),
		identifier: v.string(),
		orgIds: v.array(
			v.object({
				orgId: v.string(),
				role: userRoles,
				name: v.string(),
			})
		),
		name: v.optional(v.string()),
		image: v.optional(v.string()),
	}).index('by_tokenIdentifier', ['tokenIdentifier']),

	organizations: defineTable({
		orgId: v.string(),
		name: v.string(),
		image: v.string(),
		userIds: v.array(v.id('users')),
	}).index('by_orgId', ['orgId']),
});
