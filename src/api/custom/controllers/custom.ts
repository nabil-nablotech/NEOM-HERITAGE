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
  updateMe: async (ctx, next) => {
    try {
      const { id } = ctx.state.user;
      let data = await strapi.entityService.update(
        "plugin::users-permissions.user",
        id,
        { data: {} }
      );
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },
  searchCount: async (ctx, next) => {
    try {
      const placeCount = await strapi
        .query("api::place.place")
        .count({ where: {} });
      const visitCount = await strapi
        .query("api::visit.visit")
        .count({ where: {} });

      const mediaCount = await strapi.query("api::media.media").findMany({
        where: {
          media_type: {
            $or: [
              {
                typeCode: {
                  $contains: "IMAGE",
                },
              },
              {
                typeCode: {
                  $contains: "VIDEO",
                },
              },
              {
                typeCode: {
                  $contains: "3DMODEL",
                },
              },
            ],
          },
        },
      });
      const libraryCount = await strapi.query("api::media.media").findMany({
        where: {
          media_type: {
            $or: [
              {
                typeCode: {
                  $contains: "DOCUMENT",
                },
              },
              {
                typeCode: {
                  $contains: "REFERENCEURL",
                },
              },
              {
                typeCode: {
                  $contains: "INLINE",
                },
              },
            ],
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
      console.log("error on search-------------", err);
      ctx.body = err;
    }
  },

  refinedSearchOptions: async (ctx, next) => {
    try {
      const fielOptions = await strapi
        .query("api::field-option.field-option")
        .findMany({
          populate: {
            field_codes: true,
            translation: {
              populate: {
                locale: {
                  populate: {
                    languages: true,
                  },
                  where: {
                    languages: {
                      name: {
                        $contains: ctx.header.language,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      const fieldCodes = await strapi
        .query("api::field-code.field-code")
        .findMany({});
      fielOptions.map((x) => {
        x.value = x.translation.locale.length > 0 && x.translation.locale[0].value;
        x.label = x.translation.locale.length > 0 && x.translation.locale[0].value;
        return x;
      });

      let searchOption = {};
      fieldCodes.map((x) => {
        searchOption[x.name] = fielOptions.filter(
          (y) => y.field_codes[0].name === x.name
        );
        return searchOption;
      });

      ctx.body = searchOption;
      return ctx.body;
    } catch (err) {
      console.log("error on search-------------", err);
      ctx.body = err;
    }
  },

  placeDetails: async (ctx, next) => {
    console.log('ctx', ctx.params.uniqueId)
    try {
      
      const place = await strapi
          .query("api::place.place")
          .count({ where: {
            uniqueId: ctx.params.uniqueId
          } });
        ctx.body = place;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  }
};
