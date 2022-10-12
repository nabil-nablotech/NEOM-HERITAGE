"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
