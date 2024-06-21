import { ConvexError, v } from 'convex/values';
import {
	MutationCtx,
	QueryCtx,
	internalMutation,
	query,
} from './_generated/server';

export const getOrganization = async (
	ctx: QueryCtx | MutationCtx,
	orgId: string
) => {
	const organization = await ctx.db
		.query('organizations')
		.withIndex('by_orgId', (query) => query.eq('orgId', orgId))
		.first();

	if (!organization) {
		throw new ConvexError('expected organization to be defined');
	}

	return organization;
};

export const getOrganizationImage = async (
	ctx: QueryCtx | MutationCtx,
	orgId: string
) => {
	const organization = await getOrganization(ctx, orgId);

	return organization.image;
};

export const createOrganization = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		orgId: v.string(),
		name: v.string(),
		image: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('organizations', {
			orgId: args.orgId,
			name: args.name,
			image: args.image,
			userIds: [],
		});
	},
});

export const updateOrganization = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		orgId: v.string(),
		name: v.string(),
		image: v.string(),
	},
	handler: async (ctx, args) => {
		const organization = await getOrganization(ctx, args.orgId);

		await ctx.db.patch(organization._id, {
			name: args.name,
			image: args.image,
		});
	},
});
