/**
 * A set of functions called "actions" for `custom`
 */

export default {
  changePassword: async (ctx, next) => {
    try {
      let data = await strapi.entityService.update(
        "plugin::users-permissions.user",
        ctx.params.id,
        {
          data: {
            password: ctx.query.password,
            blocked: false,
            confirmed: true,
            recoveryToken: "",
          },
        }
      );
      ctx.body = data;
    } catch (err) {
      console.log(err);
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },
  searchCount: async (ctx, next) => {
    try {
      const placeCount = await strapi.query("api::place.place").count({ where: {} });
      const visitCount = await strapi.query("api::visit.visit").count({ where: {} });
      const media = await strapi.query("api::media.media").findMany({
        populate: {
          assetConfig: true,
        },
      });
      const libraryCount = media.filter(x => x.assetConfig[0].categoryCode === 'DOCUMENT' || x.assetConfig[0].categoryCode === 'REFERENCEURL' || x.assetConfig[0].categoryCode === 'INLINE');
      const mediaCount = media.filter(x => x.assetConfig[0].categoryCode === 'IMAGE' || x.assetConfig[0].categoryCode === 'VIDEO' || x.assetConfig[0].categoryCode === '3DMODEL');
      ctx.body = {
        places: placeCount,
        events: visitCount,
        library: libraryCount.length,
        media: mediaCount.length,
      };
      return ctx.body;
    } catch (err) {
      ctx.body = err;
    }
  },
};
