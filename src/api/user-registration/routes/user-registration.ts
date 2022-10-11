export default {
  routes: [
    {
      method: 'PUT',
      path: '/change-password/:id',
      handler: 'user-registration.changePassword',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};

