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
  ],
};
