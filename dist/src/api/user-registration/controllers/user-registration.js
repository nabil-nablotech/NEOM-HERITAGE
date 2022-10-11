"use strict";
/**
 * A set of functions called "actions" for `user-registration`
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    changePassword: async (ctx, next) => {
        console.log(ctx, ctx.params, ctx.query);
        try {
            // let data= await strapi.service("api::user-registration.user-registration").changePassword(ctx.params.id,ctx.query.password);
            let data = await strapi.entityService.update('plugin::users-permissions.user', ctx.params.id, {
                data: {
                    password: ctx.query.password,
                    blocked: false,
                    confirmed: true
                }
            });
            ctx.body = data;
        }
        catch (err) {
            console.log(err);
            ctx.badRequest("controller error", { moreDetails: err });
        }
    }
};
