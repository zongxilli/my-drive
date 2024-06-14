import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createFile = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		console.log(identity);

		if (!identity) {
			throw new ConvexError('you must be logged in to upload a file');
		}

		await ctx.db.insert('files', {
			name: args.name,
		});
	},
});

export const getFiles = query({
	args: {},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		return ctx.db.query('files').collect();
	},
});
