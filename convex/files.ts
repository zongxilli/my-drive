import { ConvexError, v } from 'convex/values';
import { MutationCtx, QueryCtx, mutation, query } from './_generated/server';
import { getUser } from './users';
import { schemaFileTypes } from './schema';
import { Id } from './_generated/dataModel';

export const generateUploadUrl = mutation(async (ctx) => {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new ConvexError('you must be logged in to upload a file');
	}

	return await ctx.storage.generateUploadUrl();
});

export const hasAccessToOrg = async (
	ctx: QueryCtx | MutationCtx,
	orgId: string,
	tokenIdentifier: string
) => {
	const user = await getUser(ctx, tokenIdentifier);

	const hasAccess =
		user.orgIds.some((id) => id === orgId) ||
		user.tokenIdentifier.includes(orgId);

	return hasAccess;

	// const identity = await ctx.auth.getUserIdentity();

	// if (!identity) {
	// 	return null;
	// }

	// const user = await getUser(ctx, identity.tokenIdentifier);

	// const hasAccess =
	// 	user.orgIds.some((id) => id === orgId) ||
	// 	user.tokenIdentifier.includes(orgId);

	// if (!hasAccess) {
	// 	throw new ConvexError('you do not have access to this organization');
	// }

	// return user;
};

const hasAccessToFile = async (
	ctx: QueryCtx | MutationCtx,
	fileId: Id<'files'>
) => {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return null;
	}

	const file = await ctx.db.get(fileId);
	if (!file) {
		return null;
	}

	const hasAccess = await hasAccessToOrg(
		ctx,
		file.orgId,
		identity.tokenIdentifier
	);
	if (!hasAccess) {
		return null;
	}

	const user = await getUser(ctx, identity.tokenIdentifier);

	return {
		user,
		file,
	};
};

export const createFile = mutation({
	args: {
		name: v.string(),
		type: schemaFileTypes,
		fileId: v.id('_storage'),
		orgId: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError('you must be logged in to upload a file');
		}

		const hasAccess = await hasAccessToOrg(
			ctx,
			args.orgId,
			identity.tokenIdentifier
		);
		if (!hasAccess) {
			throw new ConvexError(
				'you do not have access to this organization'
			);
		}

		const user = await getUser(ctx, identity.tokenIdentifier);
		if (
			!user.orgIds.includes(args.orgId) &&
			user.tokenIdentifier !== identity.tokenIdentifier
		) {
			throw new ConvexError(
				'you do not have access to this organization'
			);
		}

		const url = await ctx.storage.getUrl(args.fileId);

		if (!url) {
			throw new ConvexError('XXX');
		}

		await ctx.db.insert('files', {
			name: args.name,
			type: args.type,
			fileId: args.fileId,
			orgId: args.orgId,
			url: url,
		});
	},
});

export const getFiles = query({
	args: {
		orgId: v.string(),
		starred: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const hasAccess = await hasAccessToOrg(
			ctx,
			args.orgId,
			identity.tokenIdentifier
		);
		if (!hasAccess) {
			return [];
		}

		if (args.starred) {
			const user = await getUser(ctx, identity.tokenIdentifier);

			const starredFiles = await ctx.db
				.query('starredFiles')
				.withIndex('by_userId_orgId_fileId', (query) =>
					query.eq('userId', user._id).eq('orgId', args.orgId)
				)
				.collect();

			const files = await ctx.db
				.query('files')
				.withIndex('by_orgId', (query) => query.eq('orgId', args.orgId))
				.collect();

			return files.filter((file) =>
				starredFiles.some((starred) => starred.fileId === file._id)
			);
		}

		return ctx.db
			.query('files')
			.withIndex('by_orgId', (query) => query.eq('orgId', args.orgId))
			.collect();
	},
});

export const deleteFile = mutation({
	args: {
		fileId: v.id('files'),
	},
	handler: async (ctx, args) => {
		const access = await hasAccessToFile(ctx, args.fileId);

		if (!access) {
			throw new ConvexError('you do not have access to file');
		}

		await ctx.db.delete(args.fileId);
	},
});

export const toggleStar = mutation({
	args: {
		fileId: v.id('files'),
	},
	handler: async (ctx, args) => {
		const access = await hasAccessToFile(ctx, args.fileId);

		if (!access) {
			throw new ConvexError('you do not have access to file');
		}
		const { user, file } = access;

		const starredFile = await ctx.db
			.query('starredFiles')
			.withIndex('by_userId_orgId_fileId', (query) =>
				query
					.eq('userId', user._id)
					.eq('orgId', file.orgId)
					.eq('fileId', file._id)
			)
			.first();

		if (!starredFile) {
			await ctx.db.insert('starredFiles', {
				userId: user._id,
				orgId: file.orgId,
				fileId: file._id,
			});
		} else {
			await ctx.db.delete(starredFile._id);
		}
	},
});
