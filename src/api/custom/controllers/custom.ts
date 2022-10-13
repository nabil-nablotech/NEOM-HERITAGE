/**
 * A set of functions called "actions" for `custom`
 */

export default {
  changePassword: async (ctx,next) => {
    try {
      let data = await strapi.entityService.update('plugin::users-permissions.user',ctx.params.id,{
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
      const placeCount = await strapi.query('api::place.place').count({where: {}});
      const visitCount = await strapi.query('api::visit.visit').count({where: {}});
      const libraryCount = await strapi.query('api::media.media').count({where: { $or: [{mediaType: 'Documents'}, {mediaType: 'References'}, {mediaType: 'InlineText'}]}});
      const mediaCount = await strapi.query('api::media.media').count({where: { $or: [{mediaType: 'Images'}, {mediaType: 'Videos'}, {mediaType: '3Dmodel'}]}});
      ctx.body = {
        places: placeCount,
        events: visitCount,
        library: libraryCount,
        media: mediaCount
      };
      return ctx.body;
    } catch (err) {
      ctx.body = err;
    }
  }
};
