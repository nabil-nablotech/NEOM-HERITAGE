/**
 *  remark-header controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::remark-header.remark-header",
  ({ strapi }) => ({
    async create(ctx) {
      Object.assign(ctx.request.body.data, {
        users_permissions_user: ctx.state.user.id,
      });
      const response = await super.create(ctx);
      return response;
    },
  })
);
