# AxisPhilly App Template
A somewhat barebones app template. Inpsired by the NPR Apps [app template](https://github.com/nprapps/app-template)

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

