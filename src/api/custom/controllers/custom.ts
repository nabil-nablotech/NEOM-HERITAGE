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
            field_code: true,
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
      fielOptions.map((x, i) => {
        x.value =
          (x.translation.locale.length > 0 && x.translation.locale[0]?.value) ||
          "";
        x.label =
          (x.translation.locale.length > 0 && x.translation.locale[0]?.value) ||
          "";
        return x;
      });

      let searchOption = {};
      fieldCodes.map((x) => {
        searchOption[x.name] = fielOptions.filter(
          (y) => y.field_code.name === x.name
        );
        return searchOption;
      });

      ctx.body = searchOption;
      return ctx.body;
    } catch (err) {
      console.log("error in redine search options-------------", err);
      ctx.body = err;
    }
  },

  placeDetails: async (ctx, next) => {
    try {
      const place = await strapi.query("api::place.place").findOne({
        populate: {
          media_associates: {
            populate: {
              media_unique_id: {
                populate: {
                  object: true,
                  media_type: true,
                },
              },
            },
          },
          visit_associates: {
            populate: {
              visit_unique_id: {
                populate: {
                  media_associates: {
                    populate: {
                      media_unique_id: {
                        populate: {
                          object: true
                        }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
        },
      });
      const libraryItems = place.media_associates.filter(
        (x) => x.media_unique_id.media_type[0].categoryCode === "LIBRARY"
      );
      place.libraryItems = libraryItems;
      ctx.body = place;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },

  eventDetails: async (ctx, next) => {
    try {
      const data = await strapi.query("api::visit.visit").findOne({
        populate: {
          media_associates: {
            populate: {
              media_unique_id: {
                populate: {
                  object: true,
                  media_type: true,
                },
              },
            },
          },
          visit_associate: {
            populate: {
              place_unique_id: true
            }
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
        },
      });
      const libraryItems = data.media_associates.filter(
        (x) => x.media_unique_id.media_type[0].categoryCode === "LIBRARY"
      );
      const mediaGallery = data.media_associates.filter(
        (x) => x.media_unique_id.media_type[0].categoryCode === "MEDIA"
      );
      data.libraryItems = libraryItems;
      data.mediaGallery = mediaGallery;

      ctx.body = data;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },

  mediaDetails: async (ctx, next) => {
    try {
      const data = await strapi.query("api::media.media").findOne({
        populate: {
          object: true,
          media_type: true,
          media_associates: {
            populate: {
              place_unique_id: true
            },
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
          media_type: {
            categoryCode: {
              $contains: "MEDIA",
            },
          },
        },
      });

      ctx.body = data;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },
};
