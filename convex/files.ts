import { ConvexError, v } from 'convex/values';
import { MutationCtx, QueryCtx, mutation, query } from './_generated/server';
import { getUser } from './users';

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

export const createFile = mutation({
	args: {
		name: v.string(),
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

		await ctx.db.insert('files', {
			name: args.name,
			orgId: args.orgId,
		});
	},
});

export const getFiles = query({
	args: {
		orgId: v.string(),
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

		return ctx.db
			.query('files')
			.withIndex('by_orgId', (query) => query.eq('orgId', args.orgId))
			.collect();
	},
});
