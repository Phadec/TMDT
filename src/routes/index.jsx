import {Home} from "~/pages/Home";

// Được phép xem dù không đăng nhập
const publicRoutes = [
    {
        path: '/',
        element: Home
    }
];

const privaetRoutes = [];

export {publicRoutes, privaetRoutes};