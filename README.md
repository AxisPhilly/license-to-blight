# AxisPhilly App Template

### Dependencies
- First, you need grunt command line tool:
    $ npm install -g grunt-cli
- Then, install the dev depencies:
    $ npm install

### Compile SASS when developing
`$ sass --watch sass/*:www/css/*`

### Grunt Tasks

- Check JS files for errors
    $ grunt jshint:all

- Compile SASS into CSS
    $ grunt compass

- Build assets for deployment
    $ grunt deploy

