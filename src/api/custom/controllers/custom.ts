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
                          object: true,
                        },
                      },
                    },
                  },
                },
              },
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
              place_unique_id: true,
            },
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
              place_unique_id: true,
            },
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
          // media_type: {
          //   categoryCode:  "MEDIA"
          // },
        },
      });

      ctx.body = data;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },

  getRemarks: async (ctx, next) => {
    try {
      // let whereCondition: {
      //   place_unique_id?: { uniqueId: any };
      //   visit_unique_id?: { uniqueId: any };
      // };
      // if (ctx.query.type.toLowerCase() === "place") {
      //   whereCondition = {
      //     place_unique_id: {
      //       uniqueId: ctx.query.uniqueId,
      //     },
      //   };
      // } else if (ctx.query.type.toLowerCase() === "visit") {
      //   whereCondition = {
      //     visit_unique_id: {
      //       uniqueId: ctx.query.uniqueId,
      //     },
      //   };
      // }
      const data = await strapi
        .query("api::remark-header.remark-header")
        .findOne({
          where: {
            $or: [
              {
                place_unique_id: {
                  uniqueId: ctx.query.uniqueId,
                },
              },
              {
                visit_unique_id: {
                  uniqueId: ctx.query.uniqueId,
                },
              },
            ],
          },
          populate: {
            place_unique_id: true,
            visit_unique_id: true,
            users_permissions_user: true,
          },
        });
      ctx.body = data;
    } catch (err) {
      console.log("Error in fetching remarks", err);
      ctx.body = err;
    }
  },

  addRemarks: async (ctx, next) => {
    try {
      const user = ctx.state.user;
      let addData: {
        place_unique_id?: { id: Number };
        visit_unique_id?: { id: Number };
        users_permissions_user?: Number;
      };
      if (ctx.request.body.type.toLowerCase() === "place") {
        addData = {
          place_unique_id: ctx.request.body.id,
        };
      } else if (ctx.request.body.type.toLowerCase() === "visit") {
        addData = {
          visit_unique_id: ctx.request.body.id,
        };
      }
      addData.users_permissions_user = user.id;
      const data = await strapi
        .query("api::remark-header.remark-header")
        .create({
          data: addData,
        });
      ctx.body = data;
    } catch (err) {
      console.log("error", err);
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },

  getKeywords: async (ctx, next) => {
    try {
      let queryWhere: any =  {
        asset_config: {
          id: ctx.params.asset_config_id,
        },
      }
      if (ctx.query.search) {
        queryWhere.keywords = {
          $contains: ctx.query.search
        };
      }
      const data = await strapi.query("api::keyword.keyword").findMany({
        where: queryWhere,
      });
      let keywords =[];
      data.map(x => keywords.push(x.keywords));
      keywords = keywords.flatMap(x => x);

      ctx.body = keywords;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },
  addKeywords: async (ctx, next) => {
    try {
      
      let reqBody = ctx.request.body.keywords;
      for(let i = 0; i < reqBody.length; i ++) {

        const keywords = await strapi.query("api::keyword.keyword").findMany({
          where: {
            asset_config: {
              id: ctx.params.asset_config_id,
            },
            keywords: {
              $contains: reqBody[i]
            }
          }
        });
        if (keywords.length > 0) {
          reqBody = reqBody.filter(x => x !== reqBody[i]);
        }
      }
      const addData = {
        asset_config: `${ctx.params.asset_config_id}`,
        keywords: reqBody
      }
      if (reqBody.length > 0) {
        const data = await strapi.query("api::keyword.keyword").create({
          data: addData,
        });
        ctx.body = data;
      } else {
        ctx.body = {};
      }

    } catch (err) {
      console.log("error in keywords add-------------", err);
      ctx.body = err;
    }
  }
};
