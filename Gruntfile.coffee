###
coffee-toaster-api
https://github.com/weareinteractive/node-coffee-toaster-api

Copyright (c) 2013 We Are Interactive
Licensed under the MIT license.
###

"use strict"

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    coffeelint:
      files: ["Gruntfile.coffee", "src/**/*.coffee", "test/**/*.coffee"]
      options:
        max_line_length:
          value: 200
          level: "error"

    coffee:
      lib:
        options:
          join: true
        files:
          "lib/toaster.js": [
            "src/toaster/toast.coffee"
            "src/toaster/utils/array-util.coffee"
            "src/toaster/core/script.coffee"
            "src/toaster/core/builder.coffee"
            "src/toaster.coffee"
          ]

    # Unit tests.
    mochacov:
      options:
        bail: true
        ui: 'exports'
        timeout: 10000
        require: 'coffee-script'
        compilers: ['coffee:coffee-script/register']
        files: 'test/specs/**/*.coffee'
      all:
        options:
          reporter: 'spec'
      coverage:
        options:
          coveralls:
            serviceName: 'travis-ci'
      htmlcoverage:
        options:
          reporter: 'html-cov'
          output: 'test/coverage.html'

    # Deployment
    bumper:
      options:
        push: false
        createTag: false
        tasks: ["default"]
        files: ["package.json"]
        updateConfigs: ["pkg"]


  # Load npm tasks.
  grunt.loadNpmTasks "grunt-mocha-cov"
  grunt.loadNpmTasks "grunt-coffeelint"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-bumper"

  # Default task.
  grunt.registerTask "default", ["coffeelint", "coffee"]
  grunt.registerTask "test", ["default", "mochacov:all", "mochacov:htmlcoverage"]
  grunt.registerTask "test:travis", ["default", "mochacov:all", "mochacov:coverage"]

