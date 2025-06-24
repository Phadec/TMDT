const AUTH =  '/auth';
const PRODUCT = '/products';
const PROFILE = '/profile';
const USER = '/users';
const CUSTOMER = '/customers';
const ORDER = '/orders';
const CATEGORY = '/categories';
const VNPAY = '/vnpay';

const clientUrl = {
    auth: {
        login: `${AUTH}/login`,
        register: `${AUTH}/register`,
        forget: `${AUTH}/forget`,
    },
    profile: {
        view: `${PROFILE}/view`,
    },
    seller: {
        dashboard: {
            overview: `/seller/dashboard/overview`,
            activities: `/seller/activities`,
        },
        products: `/seller/products`,
        orders: `/seller/orders`,
    },
    order: {
        create: `${ORDER}`,
        getAll: `${ORDER}`,
        detail: (id) => `${ORDER}/${id}`,
    }
};

const adminUrl = {
    auth: {
        login: `${AUTH}/login`,
        register: `${AUTH}/register`,
        logout: `${AUTH}/logout`,
    },
    user: {
        getAll: `${USER}`,
        detail: (id) => `${USER}/${id}`,
        updateStatus: (id) => `${USER}/${id}/status`,
        delete: (id) => `${USER}/${id}`,
    },
    customer: {
        getAll: `${CUSTOMER}`,
        detail: (id) => `${CUSTOMER}/${id}`,
        updateStatus: (id) => `${CUSTOMER}/${id}/status`,
        delete: (id) => `${CUSTOMER}/${id}`,
        registerAsSeller: (id) => `${CUSTOMER}/${id}/register-seller`,
    },
    product: {
        getAll: `${PRODUCT}`,
        create: `${PRODUCT}`,
        createMany: `${PRODUCT}/create-products`,
        detail: (id) => `${PRODUCT}/${id}`,
        update: (id) => `${PRODUCT}/${id}`,
        delete: (id) => `${PRODUCT}/${id}`,
    },
    order: {
        getAll: `${ORDER}`,
        getByStatus: `${ORDER}/get-orders-by-status`,
        updateStatus: `${ORDER}/update-status`,
        detail: (id) => `${ORDER}/${id}`,
    },
    analytics: {
        overview: `/analytics/overview`,
        financial: `/analytics/financial`,
        revenue: `/analytics/revenue`,
        transactions: `/analytics/transactions`,
    },
    dashboard: {
        stats: `/dashboard/stats`,
        activities: `/dashboard/activities`,
        newUsers: `/dashboard/new-users`,
        recentPosts: `/dashboard/recent-posts`,
    },
    category: {
        getAll: `${CATEGORY}`,
        getParents: `${CATEGORY}/parents`,
        getChildren: (parentId) => `${CATEGORY}/children/${parentId}`,
        detail: (id) => `${CATEGORY}/${id}`,
        create: `${CATEGORY}`,
        update: (id) => `${CATEGORY}/${id}`,
        delete: (id) => `${CATEGORY}/${id}`,
        search: (keyword) => `${CATEGORY}/search?keyword=${keyword}`,
        getByStatus: (isActive) => `${CATEGORY}/status/${isActive}`,
    },
};

const commonUrl = {
    auth: {
        logout: `${AUTH}/logout`,
    },
    product: {
        getAll: `${PRODUCT}`,
        detail: (id) => `${PRODUCT}/${id}`,
        similar: (id) => `${PRODUCT}/${id}/similar`,
        reviews: (id) => `${PRODUCT}/${id}/reviews`,
        upload: `${PRODUCT}/upload`,
    },
    category: {
        getAll: `${CATEGORY}/all`,
    },
    order: {
        create: `${ORDER}`,
        getAll: `${ORDER}`,
        detail: (id) => `${ORDER}/${id}`,
        updateStatus: (id) => `${ORDER}/${id}/status`,
    },
     home: {
        banner: `/home/banner`,
        todayRecommendations: `/home/today-recommendations`,
    },
    imageProxy: {
        getImage: (encodedUrl) => `/common/image-proxy/image?url=${encodedUrl}`,
    }
};

export { clientUrl, adminUrl, commonUrl };