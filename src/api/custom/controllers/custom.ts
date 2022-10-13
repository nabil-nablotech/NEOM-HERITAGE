/**
 * A set of functions called "actions" for `custom`
 */

export default {
  changePassword: async (ctx,next) => {
    console.log(ctx, ctx.params,ctx.query);
    try {
      let data = await strapi.entityService.update('plugin::custom.user',ctx.params.id,{
        data: {
          password: ctx.query.password,
          blocked: false,
          confirmed: true,
          recoveryToken: ''
        }
      });
      ctx.body = data;
    } catch (err) {
      console.log(err)
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },
  searchCount: async (ctx, next) => {
    try {
      ctx.body = {
        places: 2010,
        events: 1500,
        library: 2455,
        media: 3000
      };
    } catch (err) {
      ctx.body = err;
    }
  }
};
