# AxisPhilly App Template
A somewhat barebones template for apps without back-ends. Inpsired by the NPR Apps [app template](https://github.com/nprapps/app-template)

### Directory Structure

`sass` - .scss files go here
`www` - The compiled app and associated files
`data` - Raw data used in the app, i.e. CSVs
`scripts` -  Miscellaneous scripts used for data processing, etc.

### Dependencies
For asset management, templating and testing, we use Node.js and [Grunt](http://www.gruntjs.com)

First, you need [Grunt](https://github.com/gruntjs/grunt-cli) command line tool:
`$ npm install -g grunt-cli`
Then, install the dev depencies:
`$ npm install`

### Compile SASS when developing
`$ sass --watch sass/*:www/css/*`

### Grunt Tasks

Check JS files for errors
`$ grunt jshint:all`

Compile SASS into CSS
`$ grunt compass`

Build assets for deployment
`$ grunt deploy`

