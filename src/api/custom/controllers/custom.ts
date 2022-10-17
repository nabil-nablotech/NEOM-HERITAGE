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
      // custom query
      fetchPLaces((err, data) => {
        // console.log("error-",err,"--data--",data)
      });

      const placeCount = await strapi
        .query("api::place.place")
        .count({ where: {} });
      const visitCount = await strapi
        .query("api::visit.visit")
        .count({ where: {} });
      const mediaCount = await strapi.query("api::media.media").findMany({
        populate: {
          mediaType: {
            where: {
              $or: [
                {
                  categoryCode: {
                    $eq: "IMAGE",
                  },
                },
                {
                  categoryCode: {
                    $eq: "VIDEO",
                  },
                },
                {
                  categoryCode: {
                    $eq: "3DMODEL",
                  },
                },
              ],
            },
          },
        },
      });
      const libraryCount = await strapi.query("api::media.media").findMany({
        populate: {
          mediaType: {
            where: {
              $or: [
                {
                  categoryCode: {
                    $eq: "DOCUMENT",
                  },
                },
                {
                  categoryCode: {
                    $eq: "REFERENCEURL",
                  },
                },
                {
                  categoryCode: {
                    $eq: "INLINE",
                  },
                },
              ],
            },
          },
        },
      });

      ctx.body = {
        places: placeCount,
        events: visitCount,
        library: libraryCount.length,
        media: mediaCount.length,
      };
      return ctx.body;
    } catch (err) {
      console.error("error on search-------------", err);
      ctx.body = err;
    }
  },
};
