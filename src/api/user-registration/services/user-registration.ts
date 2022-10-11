/**
 * user-registration service
 */

module.exports = {
  userRegistration: async (props) => {
    try {
      let userData = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        props.id,
        // {
        //   fields: ["id", "firstName", "lastName", "email"],
        // }
      );
      if (userData && Array.isArray(userData)) {
        userData = userData.reduce((acc, item) => {
          acc = acc || [];
          acc.push({
            id: item.id,
            firstName: item.firstName || "",
            lastName: item.lastName || "",
            email: item.email || "",
          });
          return acc;
        }, []);
      }
      return userData;
    } catch (err) {
      return err;
    }
  },
  changePassword: async (id,password) => {
    try{
        const entry = await strapi.entityService.update('plugin::users-permissions.user',id,{
            data: {
              password
            }
          });
          return entry;
    }catch (err) {
        return err;
    }
  }
};
