import { ConvexError, v } from 'convex/values';
import { internalMutation } from './_generated/server';

export const createUser = internalMutation({
	args: { tokenIdentifier: v.string() },
	handler: async (ctx, args) => {
		await ctx.db.insert('users', {
			tokenIdentifier: args.tokenIdentifier,
			orgIds: [],
		});
	},
});

export const addOrgIdToUser = internalMutation({
	args: { tokenIdentifier: v.string(), orgId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_tokenIdentifier', (query) =>
				query.eq('tokenIdentifier', args.tokenIdentifier)
			)
			.first();

		if (!user) {
			throw new ConvexError('expected user to be defined');
		}

		await ctx.db.patch(user._id, {
			orgIds: [...user.orgIds, args.orgId],
		});
	},
});
