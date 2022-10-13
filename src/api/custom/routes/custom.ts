export default {
  routes: [
    {
     method: 'GET',
     path: '/custom/change-password/:id',
     handler: 'custom.changePassword',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'GET',
      path: '/custom/search',
      handler: 'custom.searchCount',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};
