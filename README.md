# ABOUT #

This repo contains source code for building the MBC's web Back Office application that was developed by PYCO team.

# Project Principles #

> Just *import* what you need in our project.
> Before develop please see **DOCUMENT.md** & **CONVENTIONS.md** files first.
*Add more if you think its good ;)*

# Developed Features #
- []  Configure code coverage.
- []  Configure Unit Test environment and example.
- []  Build breadcumb component.
- []  Load & render dynamic routes by json, configurations
- []  Choose & intergrate with some library, component from communities such as datetime picker,
dropdown, dropdown with multiselect, tag input... 
- []  Build common modules for reused such as advance table, form, auto suggestion, auto complete control.
- []  Apply using Translate service for multi languages.
- [x] Customize, struture project
- [x] Setting project for *development & production* mode. Not ready for *testing* mode.
- [x] Configured & customized build production mode, reduce a lot bundle size
- [x] Applied State management for the project - using ng2-redux.
- [x] Configured build *AOT* & *JIT* dynamically depend on environment.
- [x] Applied lazy-load modules 
- [x] Applied new theme from customer provided
- [x] Configured Sass

# Required

- Node: 8.1.0, npm: 5.0.3
- Angular: >4
- Webpack: >2
- Typescript: 2.3.3 

# Development

### Run *development* mode
> Take note that always run ``` npm install ``` before develop.

```
$ node server/server.js
$ npm start
``` 
> Remember that app will be run in port ``` 8088 ``` as default.

### Run build with *production* mode 
```
$ node server/server.js
$ npm run build
```
> Remember that compiled code will be generated in **dist/** directory.

## Test

```
$ npm run test
``` 
**NOT** ready at this time

## Build and deploy to AWS

```
$ npm run deploy:aws
```

**ensure** that you have permissions & configs before

See More in *package.json* file.

# Toolings #

It's better if we use `Visual Studio Code` and its extensions

List extensions i'm using:

- For Angular 
    - ext install Angular-BeastCode
    - ext install Angular2
- For Document
    - ext install docthis

# Visual Studio Code Settings. #
Our project are using Typescript version *2.3.3* thus please config Typescript version for this tool also.

* Go to [Setting](https://code.visualstudio.com/docs/getstarted/settings)
* Change ```'typescript.tsdk': 'path-to-typescript-lib'```

See [more](https://code.visualstudio.com/docs/languages/typescript#_using-newer-typescript-versions)