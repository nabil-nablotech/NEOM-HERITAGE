/**
 * user-registration service
 */

module.exports = {
  changePassword: async (id, password) => {
    try {
      const entry = await strapi.entityService.update('plugin::users-permissions.user', id, {
        data: {
          password,
          blocked: false,
          confirmed: true,
          recoveryToken: ""
        }
      });
      return entry;
    } catch (err) {
      return err;
    }
  }
};
