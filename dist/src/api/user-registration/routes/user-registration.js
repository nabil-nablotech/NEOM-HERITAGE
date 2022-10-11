"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/user-registration/:id',
            handler: 'user-registration.userRegistration',
            config: {
                policies: [],
                middlewares: [],
            },
        },
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
