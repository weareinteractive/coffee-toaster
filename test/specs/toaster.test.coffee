"use strict"

fs = require('fs-extra')
chai = require('chai')
grunt = require('grunt')
toasty = require("../../")

assert = chai.assert
chai.Assertion.includeStack = true

# See http://visionmedia.github.io/mocha/ for Mocha tests.
# See http://chaijs.com/api/assert/ for Chai assertion types.

baseDir = process.cwd()
tmpDir = "#{baseDir}/test/tmp"

module.exports =
  "Test #toasty":
    before: ->
      fs.removeSync(tmpDir) if fs.existsSync(tmpDir)
      fs.mkdirSync(tmpDir)
    "default": () ->
      options = {
        bare: false
        minify: false
        vendors: ["test/fixtures/vendor.js"]
        folders: "test/fixtures":"fixtures"
        release: "test/tmp/default.js"
      }
      new toasty(baseDir, options).build()
      assert.isTrue grunt.file.exists('test/tmp/default.js')
      assert.equal grunt.file.read('test/tmp/default.js'), grunt.file.read('test/expected/default.js')
    "beautified": () ->
      options = {
        bare: false
        minify:
          output:
            beautify: true
            indent_level: 2
        vendors: ["test/fixtures/vendor.js"]
        folders: "test/fixtures":"fixtures"
        release: "test/tmp/beautified.js"
      }
      new toasty(baseDir, options).build()
      assert.isTrue grunt.file.exists('test/tmp/beautified.js')
      assert.equal grunt.file.read('test/tmp/beautified.js'), grunt.file.read('test/expected/beautified.js')
    "minified": () ->
      options = {
        bare: false
        minify:
          output:
            semicolons: true
        callback: (contents, minified) ->
          contents = contents.replace(/}(?!catch|finally)(?=\w)/g, '};')
        vendors: ["test/fixtures/vendor.js"]
        folders: "test/fixtures":"fixtures"
        release: "test/tmp/minified.js"
      }
      new toasty(baseDir, options).build()
      assert.isTrue grunt.file.exists('test/tmp/minified.js')
      assert.equal grunt.file.read('test/tmp/minified.js'), grunt.file.read('test/expected/minified.js')
