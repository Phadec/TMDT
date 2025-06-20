const AUTH =  '/auth';
const PRODUCT = '/products';
const PROFILE = '/profile';

const clientUrl = {
    auth: {
        login: `${AUTH}/login`,
        register: `${AUTH}/register`,
        forget: `${AUTH}/forget`,
    },
    profile: {
        view: `${PROFILE}/view`,
    }
};

const adminUrl = {
    auth: {
        login: `${AUTH}/login`,
        logout: `${AUTH}/logout`,
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
    }
};

export { clientUrl, adminUrl, commonUrl };