import { ConvexError, v } from 'convex/values';
import {
	MutationCtx,
	QueryCtx,
	internalMutation,
	query,
} from './_generated/server';
import { userRoles } from './schema';
import { getOrganization, getOrganizationImage } from './organizations';
import { Doc } from './_generated/dataModel';

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

// NOTE: This function will also be called after each time a new organization is created
export const handleUserCreationInOrganization = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		orgId: v.string(),
		role: userRoles,
		image: v.string(),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		// add org info to user.orgIds
		const user = await getUser(ctx, args.tokenIdentifier);
		await ctx.db.patch(user._id, {
			orgIds: [
				...user.orgIds,
				{
					orgId: args.orgId,
					role: args.role,
					name: args.name,
				},
			],
		});

		// add user info to organization.userIds
		const organization = await getOrganization(ctx, args.orgId);
		await ctx.db.patch(organization._id, {
			userIds: [...organization.userIds, user._id],
		});
	},
});

export const updateRoleInOrgForUser = internalMutation({
	args: {
		tokenIdentifier: v.string(),
		orgId: v.string(),
		role: userRoles,
		image: v.string(),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx, args.tokenIdentifier);

		const org = user.orgIds.find((item) => item.orgId === args.orgId);

		if (!org) {
			throw new ConvexError(
				'expected an org on the user but was not found when updating'
			);
		}

		org.role = args.role;
		org.name = args.name;

		await ctx.db.patch(user._id, {
			orgIds: user.orgIds,
		});
	},
});

export const deleteUserFromOrganization = internalMutation({
	args: { tokenIdentifier: v.string(), orgId: v.string() },
	handler: async (ctx, args) => {
		// filter out org info from user.orgIds
		const user = await getUser(ctx, args.tokenIdentifier);
		const filteredOrgIds = [
			...user.orgIds.filter((item) => item.orgId !== args.orgId),
		];
		await ctx.db.patch(user._id, {
			orgIds: filteredOrgIds,
		});

		// add user info to organization.userIds
		const organization = await getOrganization(ctx, args.orgId);
		const filteredUserIds = [
			...organization.userIds.filter((id) => id !== user._id),
		];
		await ctx.db.patch(organization._id, {
			userIds: filteredUserIds,
		});
	},
});

export const getUserOrganizationImages = query({
	args: {},
	handler: async (
		ctx
	): Promise<Record<Doc<'organizations'>['orgId'], string>> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return {};
		}

		const user = await getUser(ctx, identity.tokenIdentifier);

		let images: Record<Doc<'organizations'>['orgId'], string> = {};
		await Promise.all(
			user.orgIds.map(async (item) => {
				const image = await getOrganizationImage(ctx, item.orgId);
				images[item.orgId] = image;
			})
		);

		return images;
	},
});

export const getUserProfile = query({
	args: { userId: v.id('users') },
	async handler(ctx, args) {
		const user = await ctx.db.get(args.userId);

		return {
			name: user?.name,
			image: user?.image,
			tokenIdentifier: user?.tokenIdentifier,
			orgIds: user?.orgIds,
		};
	},
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    if (!user) {
      return null;
    }

    return user;
  },
});