import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';

export const fileTypes = {
	'image/png': 'image',
	'image/jpeg': 'image',
	'application/pdf': 'pdf',
	'text/csv': 'csv',
} as Record<string, Doc<'files'>['type']>;

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
		orgId: v.string(),
		url: v.string(),
		createByIdentifier: v.string(),
	}).index('by_orgId', ['orgId']),

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
			})
		),
	}).index('by_tokenIdentifier', ['tokenIdentifier']),
});
