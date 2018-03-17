## Project structure guide ##
```
mbc-backoffice-app/
 ├──config/                        * our configurations for development, production mode.
 ├──dist/                          * our source files that will be compiled
 ├──src/                           * our source files that will be compiled to javascript
 |   ├──vendor.ts                  * import all vendor source.
 │   │
 |   ├──main.ts                    * place to put main application
 │   │
 |   ├──index.html                 * Index.html: where we generate our index page
 │   │
 |   ├──polyfills.ts               * our polyfills file
 │   │
 │   ├──app/                       * main directory contain almost our code 
 │   │   ├──components             * directory that contains all *common* components using for whole project.
 │   │   ├──core                   * directory that contains **state**, commons libraries, contants, configs, providers, services, models...
 │   │   └──data                   * directory that contains all dummy data with json format.
 │   │   └──features               * directory that contains source code for all features, each *feature* is big module with lazy-load.
 │   │   └──guards                 * directory that contains all guards using for whole project.
 │   │   └──pipes                  * directory that contains all common pipes using for whole project.
 │   │   └──sass                   * directory that contains config styles, common styles using for whole project.
 │   │   └──app.module.ts          * **root** module.
 │   │   └──app.routes.ts          * root route module.
 │   │   └──bootstrap.component.ts * component that bootstrap app.
 │   │
 │   └──assets/                    * static assets
 │       ├──images/                * all images that using in project was provided by theme.
 │       ├──img                    * all images that using in project was provided by theme.
 │       ├──styles                 * styles was provided by theme.
 │
 │
 ├──tsconfig.json                  * typescript config used outside webpack
 ├──tsconfig-aot.json              * config that webpack uses for typescript
 ├──package.json                   * what npm uses to manage it's dependencies
 └──webpack.config.js              * webpack main configuration file

```

## Symlinks ##
Configure in webpack & tsconfig.json
- **webpack**: set 'alias' in 'resolve' object
- **tsconfig.json**: set 'paths' in *compilerOptions* object

## Styling guilde ##
- Style will be written by SASS.
- All variables, commons about style was stored in *sass* directory
_src/app/sass_

Usage:
```
@import '~sass/path-you-need';
```
Follow guide for styling component at:

https://angular.io/docs/ts/latest/guide/component-styles.html
https://angular.io/styleguide

## Application State Management ##
> To manage application state, we're using ng2-redux.

And an important thing that you alway should keep in mind:
> Use `Immutable`

Just note that:
- It returns `Observable` object thus please use async pipe in template.
- Using `@select` pattern to get data from store.

## In out Project ##

The source code for management state will put in: 
*src/app/core/state* directory.

See more about naming conventions for this section at CONVENTIONS.md file. 

More at:
https://github.com/angular-redux/store

## Working with Web Storage. ##

> For all static data that stored in server & reused for whole application, 
it ALWAYS loads at first time then store in storage for next time

To work with LocalStorage & SessionStorage, we're using:

```ngx-webstorage```

Ref & Usage:
https://github.com/PillowPillow/ng2-webstorage
 
