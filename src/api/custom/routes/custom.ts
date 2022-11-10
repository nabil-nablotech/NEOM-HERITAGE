export default {
  routes: [
    {
      method: "PUT",
      path: "/custom/change-password/:id",
      handler: "custom.changePassword",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/search",
      handler: "custom.searchCount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/options",
      handler: "custom.refinedSearchOptions",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/custom/update-me",
      handler: "custom.updateMe",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/places",
      handler: "custom.getPlaces",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/place/:uniqueId",
      handler: "custom.placeDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/visits",
      handler: "custom.getEvents",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/event/:uniqueId",
      handler: "custom.eventDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/medias",
      handler: "custom.getMedias",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/media/:uniqueId",
      handler: "custom.mediaDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "GET",
      path: "/custom/remarks",
      handler: "custom.getRemarks",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/custom/remarks",
      handler: "custom.addRemarks",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/custom/remarks/:id",
      handler: "custom.updateRemarks",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/custom/keywords/:tab_name",
      handler: "custom.addKeywords",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom/keywords/:tab_name",
      handler: "custom.getKeywords",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/custom/delete/:tab_name/:id",
      handler: "custom.deleteType",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
