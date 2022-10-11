/**
 * A set of functions called "actions" for `search`
 */

export default {
  searchCount: async (ctx, next) => {
    try {
      ctx.body = {
        places: 2000,
        events: 1500,
        library: 2455,
        media: 3000
      };
    } catch (err) {
      ctx.body = err;
    }
  }
};
