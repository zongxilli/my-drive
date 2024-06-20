import { ConvexError, v } from 'convex/values';
import { MutationCtx, QueryCtx, internalMutation } from './_generated/server';
import { userRoles } from './schema';

export const getUser = async (
	ctx: QueryCtx | MutationCtx,
	tokenIdentifier: string
) => {
	const user = await ctx.db
		.query('users')
		.withIndex('by_tokenIdentifier', (query) =>
			query.eq('tokenIdentifier', tokenIdentifier)
		)
		.first();

	if (!user) {
		throw new ConvexError('expected user to be defined');
	}

	return user;
};

export const createUser = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		identifier: v.string(),
		name: v.string(),
		image: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('users', {
			tokenIdentifier: args.tokenIdentifier,
			identifier: args.identifier,
			orgIds: [],
			name: args.name,
			image: args.image,
		});
	},
});

export const updateUser = internalMutation({
	args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
	async handler(ctx, args) {
		const user = await getUser(ctx, args.tokenIdentifier);

		if (!user) {
			throw new ConvexError('no user with this token found');
		}

		await ctx.db.patch(user._id, {
			name: args.name,
			image: args.image,
		});
	},
});

export const addOrgIdToUser = internalMutation({
	args: { tokenIdentifier: v.string(), orgId: v.string(), role: userRoles },
	handler: async (ctx, args) => {
		const user = await getUser(ctx, args.tokenIdentifier);

		await ctx.db.patch(user._id, {
			orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
		});
	},
});

export const updateRoleInOrgForUser = internalMutation({
	args: { tokenIdentifier: v.string(), orgId: v.string(), role: userRoles },
	async handler(ctx, args) {
		const user = await getUser(ctx, args.tokenIdentifier);

		const org = user.orgIds.find((item) => item.orgId === args.orgId);

		if (!org) {
			throw new ConvexError(
				'expected an org on the user but was not found when updating'
			);
		}

		org.role = args.role;

		await ctx.db.patch(user._id, {
			orgIds: user.orgIds,
		});
	},
});
