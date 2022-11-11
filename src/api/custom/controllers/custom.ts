/**
 * A set of functions called "actions" for `custom`
 */
import qs from "qs";
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
          deleted: false
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
          deleted: false
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
  getPlaces: async (ctx, next) => {
    try {
      const data = await strapi.query("api::place.place").findMany({
        populate: true,
        where: qs.parse(ctx.query?.filter),
        orderBy: { id: 'asc' },
      });

      ctx.body = data;
    } catch (err) {
      console.log("error in getEvents", err);
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
                          media_type: true
                        },
                      },
                    },
                  },
                  asset_config_id: true
                },
              },
            },
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
          deleted: false
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
  getEvents: async (ctx, next) => {
    try {
      const data = await strapi.query("api::visit.visit").findMany({
        populate: true,
        where: qs.parse(ctx.query?.filter),
        orderBy: { id: 'asc' },
      });

      ctx.body = data;
    } catch (err) {
      console.log("error in getEvents", err);
      ctx.body = err;
    }
  },

  eventDetails: async (ctx, next) => {
    try {
      const data = await strapi.query("api::visit.visit").findOne({
        populate: {
          media_associates: {
            where: {
              media_unique_id: {
                deleted: false,
              }
            },
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
          deleted: false
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
  getMedias: async (ctx, next) => {
    try {
      const data = await strapi.query("api::media.media").findMany({
        populate: true,
        where: qs.parse(ctx.query?.filter),
        orderBy: { id: 'asc' },
      });

      ctx.body = data;
    } catch (err) {
      console.log("error in getMedias", err);
      ctx.body = err;
    }
  },

  mediaDetails: async (ctx, next) => {
    try {
      const data = await strapi.query("api::media.media").findOne({
        populate: {
          object: true,
          media_type: true,
          media_associate: {
            populate: {
              place_unique_ids: true,
              visit_unique_ids: {
                populate: {
                  visit_associate: {
                    populate: {
                      place_unique_id: true,
                    },
                  }
                }
              },
            },
          },
        },
        where: {
          uniqueId: ctx.params.uniqueId,
          deleted: false
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
      const data = await strapi
        .query("api::remark-header.remark-header")
        .findMany({
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
            delete: false
          },
          populate: {
            remark_details: {
              populate: {
                users_permissions_user: true
              }
            },
          },
        });

      let remark_details_group = {
        id: null,
        description: null,
        remark_header_id: null,
        createdAt: null,
        updatedAt: null,
        users_permissions_user: {},
        child: []
      };
      for (let item of data) {
        if (item.remark_details[0].delete === false) {
          item.remark_details.forEach((remark_detail, index) => {
            if (remark_detail.delete === false) {
              if (index == 0) {
                remark_details_group.id = remark_detail.id;
                remark_details_group.description = remark_detail.description;
                remark_details_group.remark_header_id = remark_detail.remark_header_id;
                remark_details_group.createdAt = remark_detail.createdAt;
                remark_details_group.updatedAt = remark_detail.updatedAt;
                remark_details_group.users_permissions_user = remark_detail.users_permissions_user;
              } else {
                remark_details_group.child.push(remark_detail);
              }
            }
          })
        }
        item.remark_details = remark_details_group;
        remark_details_group = {
          id: null,
          description: null,
          remark_header_id: null,
          createdAt: null,
          updatedAt: null,
          users_permissions_user: {},
          child: []
        };
      }
      ctx.body = data;
    } catch (err) {
      console.log("Error in fetching remarks", err);
      ctx.body = err;
    }
  },

  addRemarks: async (ctx, next) => {
    try {
      const user = ctx.state.user;
      let response: { id?: Number, detail?: { id?: Number } } = { id: null, detail: { id: null } };
      let { id, type, description, remark_header_id } = ctx.request.body;
      if (!remark_header_id) {
        let addData: {
          place_unique_id?: { id: Number };
          visit_unique_id?: { id: Number };
          users_permissions_user?: Number;
        };
        if (type.toLowerCase() === "place") {
          addData = {
            place_unique_id: id,
          };
        } else if (type.toLowerCase() === "visit") {
          addData = {
            visit_unique_id: id,
          };
        }
        addData.users_permissions_user = user.id;
        response = await strapi
          .query("api::remark-header.remark-header")
          .create({
            data: addData,
          });
        remark_header_id = response.id;
      }
      response.detail = await strapi.query("api::remark-detail.remark-detail").create({ data: { remark_header_id: remark_header_id, description: description, users_permissions_user: user.id } });
      ctx.body = response;
    } catch (err) {
      console.log("error", err);
      ctx.badRequest("controller error", { moreDetails: err });
    }
  },

  updateRemarks: async (ctx, next) => {
    try {
      const user = ctx.state.user;
      const remark = await strapi
        .query("api::remark-detail.remark-detail")
        .findOne({
          where: {
            id: ctx.params.id,
          },
          populate: {
            users_permissions_user: true
          }
        });

      if (user.id === remark.users_permissions_user.id) {
        let data = await strapi.entityService.update(
          "api::remark-detail.remark-detail",
          ctx.params.id,
          {
            data: ctx.request.body.data,
          }
        );
        ctx.body = data;
      } else {
        ctx.badRequest("Not authorized", { msg: "User is not authorized" })
      }
    } catch (err) {
      console.log("error", err);
      ctx.badRequest("controller error in updateRemarks", { moreDetails: err });
    }
  },

  getKeywords: async (ctx, next) => {
    try {
      let tabName = ctx.params.tab_name;
      const assetsConfig = await strapi.query("api::asset-config.asset-config").findOne({ where: { categoryCode: tabName.toUpperCase() } });
      let queryWhere: any = {
        asset_config: {
          id: assetsConfig.id,
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
      let keywords = [];
      if (data.length > 0) {
        data.map(x => keywords.push(x.keywords));
        keywords = keywords.flatMap(x => x);
      }

      ctx.body = keywords;
    } catch (err) {
      console.log("error in place details-------------", err);
      ctx.body = err;
    }
  },
  addKeywords: async (ctx, next) => {
    try {

      let reqBody = ctx.request.body.keywords;
      let tabName = ctx.params.tab_name;
      let data;
      const assetsConfig = await strapi.query("api::asset-config.asset-config").findOne({ where: { categoryCode: tabName.toUpperCase() } });

      const keywords = await strapi.query("api::keyword.keyword").findOne({
        where: {
          asset_config: {
            id: assetsConfig.id,
          }
        }
      });
      if (keywords) {
        reqBody.map((keyword: string) => {
          if (keywords.keywords.indexOf(keyword) === -1) {
            keywords.keywords.push(keyword);
          }
        })
        data = await strapi.entityService.update(
          "api::keyword.keyword",
          keywords.id,
          {
            data: { keywords: keywords.keywords },
          }
        );
      } else {
        const addData = {
          asset_config: `${assetsConfig.id}`,
          keywords: reqBody
        }
        data = await strapi.query("api::keyword.keyword").create({
          data: addData,
        });
      }
      ctx.body = data;
      // for (let i = 0; i < reqBody.length; i++) {

      //   const keywords = await strapi.query("api::keyword.keyword").findMany({
      //     where: {
      //       asset_config: {
      //         id: assetsConfig.id,
      //       },
      //       keywords: {
      //         $contains: reqBody[i]
      //       }
      //     }
      //   });
      //   if (keywords.length > 0) {
      //     reqBody = reqBody.filter(x => x !== reqBody[i]);
      //   }
      // }
      // const addData = {
      //   asset_config: `${assetsConfig.id}`,
      //   keywords: reqBody
      // }
      // if (reqBody.length > 0) {
      //   const data = await strapi.query("api::keyword.keyword").create({
      //     data: addData,
      //   });
      //   ctx.body = data;
      // } else {
      //   ctx.body = {};
      // }

    } catch (err) {
      console.log("error in keywords add-------------", err);
      ctx.body = err;
    }
  },
  deleteType: async (ctx, next) => {
    try {
      let { tab_name, id } = ctx.params;
      // let { visit_associates_id, media_associates_id, remark_headers_id, visit } = ctx.request.body;
      let data;

      // if (visit_associates_id && visit_associates_id.length > 0) {
      //   visit_associates_id.map(async (id: number) => {
      //     await strapi.entityService.update(
      //       "api::visit-associate.visit-associate",
      //       id,
      //       {
      //         data: { deleted: true },
      //       }
      //     );
      //   })
      // }

      // if (media_associates_id && media_associates_id.length > 0) {
      //   media_associates_id.map(async (id: number) => {
      //     await strapi.entityService.update(
      //       "api::media-associate.media-associate",
      //       id,
      //       {
      //         data: { deleted: true },
      //       }
      //     );
      //   })
      // }

      // if (remark_headers_id && remark_headers_id.length > 0) {
      //   remark_headers_id.map(async (id: number) => {
      //     await strapi.entityService.update(
      //       "api::remark-header.remark-header",
      //       id,
      //       {
      //         data: { delete: true },
      //       }
      //     );
      //   })
      // }

      // if ((visit && visit.length > 0) || tab_name.toLowerCase() === "event") {
      //   visit.map(async (id: number) => {
      //     data = await strapi.entityService.update(
      //       "api::visit.visit",
      //       id,
      //       {
      //         data: { deleted: true },
      //       }
      //     );
      //   })
      // }

      if (tab_name.toLowerCase() === "event") {
        const visit = await strapi.query("api::visit.visit").findOne({
          populate: {
            media_associates: true,
            visit_associate: true,
            remark_headers: true
          },
          where: {
            id: id
          },
        });
        console.log(visit)
        let visit_associates = [visit.visit_associate];
        let media_associates = visit.media_associates;
        let remark_headers = visit.remark_headers;

        console.log("visit_associates", visit_associates)
        if (remark_headers && remark_headers.length > 0) {
          remark_headers.map(async (remark_header: any) => {
            await strapi.entityService.update(
              "api::remark-header.remark-header",
              remark_header.id,
              {
                data: { delete: true },
              }
            );
          })
        }

        if (media_associates && media_associates.length > 0) {
          media_associates.map(async (media_associate: any) => {
            await strapi.entityService.update(
              "api::media-associate.media-associate",
              media_associate.id,
              {
                data: { deleted: true },
              }
            );
          })
        }

        if (visit_associates && visit_associates.length > 0) {
          visit_associates.map(async (visit_associate: any) => {
            await strapi.entityService.update(
              "api::visit-associate.visit-associate",
              visit_associate.id,
              {
                data: { deleted: true },
              }
            );
          })
        }

        data = await strapi.entityService.update(
          "api::visit.visit",
          id,
          {
            data: { deleted: true },
          }
        );

      }

      if (tab_name.toLowerCase() === "place") {

        const place = await strapi.query("api::place.place").findOne({
          populate: {
            media_associates: true,
            visit_associates: {
              populate: {
                visit_unique_id: true,
              },
            },
            remark_headers: true
          },
          where: {
            id: id
          },
        });
        console.log(place)
        let visit_associates = place.visit_associates;
        let media_associates = place.media_associates;
        let remark_headers = place.remark_headers;

        if (remark_headers && remark_headers.length > 0) {
          remark_headers.map(async (remark_header: any) => {
            await strapi.entityService.update(
              "api::remark-header.remark-header",
              remark_header.id,
              {
                data: { delete: true },
              }
            );
          })
        }

        if (visit_associates && visit_associates.length > 0) {
          visit_associates.map(async (visit_associate: any) => {
            await strapi.entityService.update(
              "api::visit.visit",
              visit_associate.visit_unique_id.id,
              {
                data: { deleted: true },
              }
            );

            await strapi.entityService.update(
              "api::visit-associate.visit-associate",
              visit_associate.id,
              {
                data: { deleted: true },
              }
            );
          })
        }

        if (media_associates && media_associates.length > 0) {
          media_associates.map(async (media_associate: any) => {
            await strapi.entityService.update(
              "api::media-associate.media-associate",
              media_associate.id,
              {
                data: { deleted: true },
              }
            );
          })
        }
        data = await strapi.entityService.update(
          "api::place.place",
          id,
          {
            data: { deleted: true },
          }
        );
      }

      if (tab_name.toLowerCase() === "media") {
        const media = await strapi.query("api::media.media").findOne({
          populate: {
            media_associate: {
              populate: {
                place_unique_ids: true,
                visit_unique_ids: {
                  populate: {
                    visit_associate: {
                      populate: {
                        place_unique_id: true,
                      },
                    }
                  }
                },
              },
            },
          },
          where: {
            id: id,
          },
        });

        let media_associate_id = media.media_associate.id;
        // let place_data = media.media_associate.place_unique_ids;
        // let visit_data = media.media_associate.visit_unique_ids;
        await strapi.entityService.update(
          "api::media-associate.media-associate",
          media_associate_id,
          {
            data: { deleted: true },
          }
        );
        // if (place_data && place_data.length > 0) {
        //   place_data.map(async place => {
        //     await strapi.entityService.update(
        //       "api::place.place",
        //       place.id,
        //       {
        //         data: { deleted: true },
        //       }
        //     );
        //   })
        // }

        // if (visit_data && visit_data.length > 0) {
        //   visit_data.map(async visit => {
        //     await strapi.entityService.update(
        //       "api::place.place",
        //       visit.id,
        //       {
        //         data: { deleted: true },
        //       }
        //     );
        //   })
        // }
        data = await strapi.entityService.update(
          "api::media.media",
          id,
          {
            data: { deleted: true },
          }
        );
      }
      if (data) {
        let response = { id: data.id, msg: "Data deleted Successfully.", success: true }
        ctx.body = response;
      }
    } catch (err) {
      console.log("error", err);
      ctx.badRequest("controller error in updateRemarks", { moreDetails: err });
    }
  }
};
