const rootPath = process.cwd();
const npmm = `${rootPath}/node_modules`;
const srcPath = `${rootPath}/src`;
const appPath = `${srcPath}/app`;
const corePath = `${appPath}/core`;
const sassPath = `${appPath}/sass`;

const globalStylePath = [
    `${npmm}/roboto-fontface/css/roboto/sass/roboto-fontface.scss`,
    `${npmm}/normalize.css/normalize.css`,
    `${npmm}/font-awesome/scss/font-awesome.scss`,
    `${npmm}/ionicons/scss/ionicons.scss`,
    `${npmm}/bootstrap/scss/bootstrap.scss`,
    `${npmm}/leaflet/dist/leaflet.css`,
    `${npmm}/chartist/dist/chartist.css`,
    `${npmm}/fullcalendar/dist/fullcalendar.css`,
    `${npmm}/handsontable/dist/handsontable.full.css`,
    `${sassPath}/theme.scss`
];

module.exports = {
    isProductionMode: () => {
        return process.env.NODE_ENV === 'production';
    },
    getRoot: () => {
        return rootPath;
    },

    getSrcPath: () => {
        return srcPath;
    },

    getAppPath: () => {
        return appPath;
    },
    getGlobalStylePath: () => {
        return globalStylePath;
    }
};