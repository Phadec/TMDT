const AUTH =  '/auth'

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
    }
};

export { clientUrl, adminUrl, commonUrl };