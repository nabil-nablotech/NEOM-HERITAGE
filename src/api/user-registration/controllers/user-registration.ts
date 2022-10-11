/**
 * A set of functions called "actions" for `user-registration`
 */

export default {
  userRegistration: async (ctx,next) => {
    console.log(ctx);
    try {
      // let data= await strapi.service("api::user-registration.user-registration").userRegistration(ctx.params);
      let data = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        ctx.params.id,
        // {
        //   fields: ["id", "firstName", "lastName", "email"],
        // }
      );
      ctx.body = data;
    } catch (err) {
      console.log(err)
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },
  changePassword: async (ctx,next) => {
    console.log(ctx, ctx.params,ctx.query);
    try {
      // let data= await strapi.service("api::user-registration.user-registration").changePassword(ctx.params.id,ctx.query.password);
      let data = await strapi.entityService.update('plugin::users-permissions.user',ctx.params.id,{
        data: {
          password: ctx.query.password,
          blocked: false,
          confirmed: true
        }
      });
      ctx.body = data;
    } catch (err) {
      console.log(err)
      ctx.badRequest("controller error", { moreDetails: err });
    }
  }
};
