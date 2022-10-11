export default {
  routes: [
    {
     method: 'GET',
     path: '/search',
     handler: 'search.searchCount',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
