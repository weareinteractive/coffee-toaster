# coffee-toaster-api
[![Build Status](https://travis-ci.org/weareinteractive/node-coffee-toaster-api.png?branch=master)](https://travis-ci.org/weareinteractive/node-coffee-toaster-api)
[![Coverage Status](https://coveralls.io/repos/weareinteractive/node-coffee-toaster-api/badge.png?branch=master)](https://coveralls.io/r/weareinteractive/node-coffee-toaster-api?branch=master)
[![Dependency Status](https://gemnasium.com/weareinteractive/node-coffee-toaster-api.png)](https://gemnasium.com/weareinteractive/node-coffee-toaster-api)

> Minimalist build system for CoffeeScript.
>
> This is based on [Coffee Toaster](https://github.com/serpentem/coffee-toaster).

## Getting Started

Install the module with:

```
$ npm install coffee-toaster-api --save
```

## Options

```
options:
  vendors: []
  exclude: []
  bare: false
  packaging: true
  expose: null
  minify: true
  callback: null
  release: null
```

### vendors
Type `Array`
Default `[]`

An ordered array of all your vendor's paths. These files must be purely javascript, preferably minified ones -- Toaster will not compile or minify them, only concatenate everything.

### exclude
Type `Array`
Default `[]`

Let's you excplicity exclude some folder, file or file type from Toaster search/process mechanism. The string you use here will effectively turn into a RegExp like that:

```
new RegExp '.DS_store'
new RegExp '.swp'
new RegExp 'my/folder/to/be/excluded'
```

### bare
Type `Boolean`
Default `false`

If `true`, compile your CoffeeScript files without the top-level function safety wrapper.

### packaging
Type `Boolean`
Default `false`

If `true`, Toaster will rewrite all your `class` declarations.

If you have a file in src/app/models/user.coffee with this contents:

```
class User
```

Toaster will rewrite your declaration prepending a namespace to it, based on the folder the class is located, resulting -- in this example -- into this:

```
class app.models.User
```

This rewriting process is saved directly into your file. In case you move this class to another folder, the prepended namespace will be rewrited again, always following your folder structure.

In other words, your don't need to worry about hardcoded namespaces in your files, because Toaster will handle all the dirty for you.

### expose
Type `String`
Default `null`

If informed, list all you packages of classes in the given scope. If you use window as your expose scope, your classes will be available also in the window object -- or whatever scope you inform, suck as exports if you're building for NodeJS.

In the end you'll be able to access your files throught this scope where your classes was exposed.

```
new window.app.models.User
new exports.app.models.User
```

### minify
Type `Boolean` `Object`
Default `null`

If `true`, minify your release file using UglifyJS.

If `object`, it will be passed directly to UglifyJS.

```
options:
  minify:
    output:
      beautify: true
      indent_level: 2
```

### callback
Type `Function`
Default `null`

Lets you modify the generated contents.

```
options:
  callback: (contents, minified) ->
    contents.replace('foo', 'bar')
```

### release
Type `String`
Default `null`

The file path to your release file.

## Usage Examples

Build the sources from the `src` folder, prepend the `example.js` vendor and compile it to `lib/app.js`

```
var Toaster = require("coffee-toaster-api");

options = {
  bare: false,
  minify: false,
  vendors: ["vendor/example.js"],
  folders: "src/app":"app",
  release: "lib/app.js"
}

var toaster = new Toasty(process.cwd(), options);
toaster.build();
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## License
Copyright (c) 2013 We Are Interactive under the MIT license.

