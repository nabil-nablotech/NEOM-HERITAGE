/**
 * A set of functions called "actions" for `custom`
 */
import { fetchPLaces } from "../../../config/connection";

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
      fetchPLaces((err, data) => {
        // console.log("error-",err,"--data--",data)
      });

      const placeCount = await strapi
        .query("api::place.place")
        .count({ where: {} });
      const visitCount = await strapi
        .query("api::visit.visit")
        .count({ where: {} });
      const media = await strapi.query("api::media.media").findMany({
        populate: {
          mediaType: true,
        }
      });

      const libraryCount = media.filter(
        (x) =>
          x.mediaType[0].categoryCode === "DOCUMENT" ||
          x.mediaType[0].categoryCode === "REFERENCEURL" ||
          x.mediaType[0].categoryCode === "INLINE"
      );
      const mediaCount = media.filter(
        (x) =>
          x.mediaType[0].categoryCode === "IMAGE" ||
          x.mediaType[0].categoryCode === "VIDEO" ||
          x.mediaType[0].categoryCode === "3DMODEL"
      );
      ctx.body = {
        places: placeCount,
        events: visitCount,
        library: libraryCount.length,
        media: mediaCount.length,
      };
      return ctx.body;
    } catch (err) {
      console.log("error on search-------------", err);
      ctx.body = err;
    }
  },
};
