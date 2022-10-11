/**
 * A set of functions called "actions" for `user-registration`
 */

export default {
  changePassword: async (ctx,next) => {
    console.log(ctx, ctx.params,ctx.query);
    try {
      let data= await strapi.service("api::user-registration.user-registration").changePassword(ctx.params.id,ctx.query.password);
      ctx.body = data;
    } catch (err) {
      console.log(err)
      ctx.badRequest("controller error", { moreDetails: err });
    }
  }
};
