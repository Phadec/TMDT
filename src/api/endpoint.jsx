const AUTH =  '/auth';
const PRODUCT = '/products';

const clientUrl = {
    auth: {
        login: `${AUTH}/login`,
        register: `${AUTH}/register`,
        forget: `${AUTH}/forget`,
    }
};

const adminUrl = {};

const commonUrl = {
    auth: {
        logout: `${AUTH}/logout`,
    },
    product: {
        getAll: `${PRODUCT}`,
        detail: (id) => `${PRODUCT}/${id}`,
    }
};

export { clientUrl, adminUrl, commonUrl };