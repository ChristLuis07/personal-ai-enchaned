import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const InsertSelectedAssistants = mutation({
  args: {
    records: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        title: v.string(),
        image: v.string(),
        instruction: v.string(),
        userInstruction: v.string(),
        sampleQuestions: v.array(v.string()),
      })
    ),
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Validate that we have at least one assistant
    if (args.records.length === 0) {
      throw new Error('At least one assistant must be selected');
    }

    // First, delete all existing assistants for this user
    const existingAssistants = await ctx.db
      .query('userAiAssistants')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .collect();

    await Promise.all(
      existingAssistants.map(async (assistant) => {
        await ctx.db.delete(assistant._id);
      })
    );

    // Then insert the new assistants, ensuring no duplicates
    const uniqueAssistants = args.records.filter(
      (assistant, index, self) =>
        index === self.findIndex((a) => a.id === assistant.id)
    );

    const insertedIds = await Promise.all(
      uniqueAssistants.map(async (record) => {
        return await ctx.db.insert('userAiAssistants', {
          ...record,
          uid: args.uid,
          isActive: false, // Set all as inactive initially
        });
      })
    );

    return insertedIds;
  },
});

export const GetAllUserAssistants = query({
  args: {
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('userAiAssistants')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .collect();

    return result;
  },
});

// New function to get only the active assistant
export const GetActiveAssistant = query({
  args: {
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('userAiAssistants')
      .filter((q) =>
        q.and(q.eq(q.field('uid'), args.uid), q.eq(q.field('isActive'), true))
      )
      .collect();

    return result;
  },
});

// New function to set an assistant as active
export const SetActiveAssistant = mutation({
  args: {
    uid: v.id('users'),
    assistantId: v.id('userAiAssistants'),
  },
  handler: async (ctx, args) => {
    // First, set all assistants for this user as inactive
    const allAssistants = await ctx.db
      .query('userAiAssistants')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .collect();

    await Promise.all(
      allAssistants.map(async (assistant) => {
        await ctx.db.patch(assistant._id, { isActive: false });
      })
    );

    // Then set the selected assistant as active
    await ctx.db.patch(args.assistantId, { isActive: true });

    return 'Assistant activated successfully';
  },
});
