(function() {
  var ArrayUtil, Builder, Script, Toast, Toaster, error, log, warn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Toast = (function() {
    var fs, path;

    fs = require("fs");

    path = require("path");

    Toast.prototype.basepath = null;

    Toast.prototype.builders = null;

    function Toast(basepath, options) {
      var item, _i, _len, _ref;
      this.basepath = basepath;
      this._toast = __bind(this._toast, this);
      this.builders = [];
      _ref = [].concat(options);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this._toast(item);
      }
    }

    Toast.prototype._toast = function(srcpath, params) {
      var alias, builder, config, dir, folder, i, item, v, vpath, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (params == null) {
        params = {};
      }
      if (srcpath instanceof Object) {
        params = srcpath;
      } else if ((path.resolve(srcpath)) !== srcpath) {
        folder = path.join(this.basepath, srcpath);
      }
      if (params.release == null) {
        error('Release path not informed in config.');
        return process.exit();
      }
      dir = path.join(this.basepath, path.dirname(params.release));
      if (!fs.existsSync(dir)) {
        error("Release folder does not exist:\n\t" + dir.yellow);
        return process.exit();
      }
      config = {
        is_building: false,
        basepath: this.basepath,
        src_folders: [],
        files: [],
        vendors: (_ref = params.vendors) != null ? _ref : [],
        exclude: (_ref1 = params.exclude) != null ? _ref1 : [],
        bare: (_ref2 = params.bare) != null ? _ref2 : false,
        packaging: (_ref3 = params.packaging) != null ? _ref3 : true,
        expose: (_ref4 = params.expose) != null ? _ref4 : null,
        minify: (_ref5 = params.minify) != null ? _ref5 : true,
        callback: (_ref6 = params.callback) != null ? _ref6 : null,
        release: path.join(this.basepath, params.release)
      };
      _ref7 = config.vendors;
      for (i = _i = 0, _len = _ref7.length; _i < _len; i = ++_i) {
        v = _ref7[i];
        vpath = config.vendors[i] = path.resolve(v);
        if ((path.resolve(vpath)) !== vpath) {
          config.vendors[i] = path.join(this.basepath, v);
        }
      }
      if (!(srcpath instanceof Object)) {
        srcpath = path.resolve(path.join(this.basepath, srcpath));
        config.src_folders.push({
          path: srcpath,
          alias: params.alias || null
        });
      }
      if (params.folders != null) {
        _ref8 = params.folders;
        for (folder in _ref8) {
          alias = _ref8[folder];
          if ((path.resolve(folder)) !== folder) {
            folder = path.join(this.basepath, folder);
          }
          config.src_folders.push({
            path: folder,
            alias: alias
          });
        }
      }
      _ref9 = config.src_folders;
      for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
        item = _ref9[_j];
        if (!fs.existsSync(item.path)) {
          error(("Source folder doens't exist:\n\t" + item.path.red + "\n") + ("Check your " + 'toaster.coffee'.yellow + " and try again.") + "\n\t" + (path.join(this.basepath, "toaster.coffee")).yellow);
          return process.exit();
        }
      }
      builder = new Builder(this.basepath, config);
      return this.builders.push(builder);
    };

    return Toast;

  })();

  ArrayUtil = (function() {
    function ArrayUtil() {}


    /*
    @param {Array} source
    @param {Object} search
    @param {String} by_property
    @return {Boolean}
     */

    ArrayUtil.has = function(source, search, by_property) {
      return ArrayUtil.find(source, search, by_property) != null;
    };


    /*
    @param {Array} source
    @param {Object} search
    @param {String} by_property
    @return {Object}
     */

    ArrayUtil.find = function(source, search, by_property) {
      var k, p, v, _i, _j, _k, _len, _len1, _len2;
      if (!by_property) {
        for (k = _i = 0, _len = source.length; _i < _len; k = ++_i) {
          v = source[k];
          if (v === search) {
            return {
              item: v,
              index: k
            };
          }
        }
      } else {
        by_property = [].concat(by_property);
        for (k = _j = 0, _len1 = source.length; _j < _len1; k = ++_j) {
          v = source[k];
          for (_k = 0, _len2 = by_property.length; _k < _len2; _k++) {
            p = by_property[_k];
            if (search === v[p]) {
              return {
                item: v,
                index: k
              };
            }
          }
        }
      }
      return null;
    };


    /*
    @param {Array} source
    @param {Object} search
    @param {String} by_property
    @param {Boolean} regexp
    @param {Boolean} unique
    @return {Object}
     */

    ArrayUtil.find_all = function(source, search, by_property, regexp, unique) {
      var item, k, p, v, _i, _j, _k, _len, _len1, _len2, _output, _unique;
      _output = [];
      _unique = {};
      if (by_property === null) {
        for (k = _i = 0, _len = source.length; _i < _len; k = ++_i) {
          v = source[k];
          if (regexp) {
            if (search.test(v)) {
              item = {
                item: v,
                index: k
              };
            }
          } else {
            if (search === v) {
              item = {
                item: v,
                index: k
              };
            }
          }
          if (item) {
            _output.push(item);
          }
        }
      } else {
        by_property = [].concat(by_property);
        for (k = _j = 0, _len1 = source.length; _j < _len1; k = ++_j) {
          v = source[k];
          for (_k = 0, _len2 = by_property.length; _k < _len2; _k++) {
            p = by_property[_k];
            item = null;
            if (regexp) {
              if (search.test(v[p])) {
                if (unique && !_unique[k]) {
                  item = {
                    item: v,
                    index: k
                  };
                } else if (unique === !true) {
                  item = {
                    item: v,
                    index: k
                  };
                }
              }
            } else {
              if (search === v[p]) {
                item = {
                  item: v,
                  index: k
                };
              }
            }
            if (item) {
              _unique[k] = true;
              _output.push(item);
            }
          }
        }
      }
      return _output;
    };

    return ArrayUtil;

  })();

  Script = (function() {
    var cs, fs, path;

    fs = require("fs");

    path = require("path");

    cs = require("coffee-script");

    Script.prototype.builder = null;

    Script.prototype.folderpath = null;

    Script.prototype.realpath = null;

    Script.prototype.alias = null;

    Script.prototype.opts = null;

    Script.prototype.dependencies_collapsed = null;

    Script.prototype.raw = null;

    Script.prototype.baseclasses = null;

    Script.prototype.filepath = null;

    Script.prototype.filename = null;

    Script.prototype.filefolder = null;

    Script.prototype.namespace = null;

    function Script(builder, folderpath, realpath, alias) {
      this.builder = builder;
      this.folderpath = folderpath;
      this.realpath = realpath;
      this.alias = alias;
      this._getinfo();
    }


    /*
    @return {Array}
     */

    Script.prototype.expand_dependencies = function() {
      var dependency, expanded, files, found, index, reg, _i, _j, _len, _len1, _ref;
      files = this.builder.files;
      this.dependencies = [];
      _ref = this.dependencies_collapsed;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        dependency = _ref[index];
        if ((dependency.substr(0, 1)) === path.sep) {
          dependency = dependency.substr(1);
        }
        if (dependency.substr(-1) !== "*") {
          this.dependencies.push("" + path.sep + dependency + ".coffee");
          continue;
        }
        reg = new RegExp(dependency.replace(/(\/|\\)/g, "\\$1"));
        found = ArrayUtil.find_all(files, reg, "filepath", true, true);
        if (found.length <= 0) {
          warn(("Nothing found inside " + ("'" + dependency).white + "'").yellow);
          continue;
        }
        for (_j = 0, _len1 = found.length; _j < _len1; _j++) {
          expanded = found[_j];
          if (expanded.item.filepath !== this.filepath) {
            this.dependencies.push(expanded.item.filepath);
          }
        }
      }
      return this.dependencies;
    };


    /*
    @param {Boolean} declare_ns
     */

    Script.prototype._getinfo = function(declare_ns) {
      var baseclass, decl, extending, item, klass, name, repl, requirements, rgx, rgx_ext, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      if (declare_ns == null) {
        declare_ns = true;
      }
      this.raw = fs.readFileSync(this.realpath, "utf-8");
      this.dependencies_collapsed = [];
      this.baseclasses = [];
      this.filepath = this.realpath.replace(this.folderpath, '');
      if (this.alias != null) {
        this.filepath = path.join(path.sep, this.alias, this.filepath);
      }
      this.filename = path.basename(this.filepath);
      this.filefolder = path.dirname(this.filepath);
      this.namespace = "";
      if (this.filepath.indexOf(path.sep) === -1) {
        this.filefolder = "";
      }
      this.namespace = this.filefolder.replace(new RegExp("\\" + path.sep, "g"), ".");
      this.namespace = this.namespace.replace(/^\.?(.*)\.?$/g, "$1");
      rgx = /^(class)+\s+([^\s]+)+(\s(extends)\s+([\w.]+))?/mg;
      rgx_ext = /(^|=\s*)(class)\s(\w+)\s(extends)\s(\\w+)\s*$/gm;
      if (this.raw.match(rgx) != null) {
        if (this.namespace !== "" && this.builder.packaging) {
          _ref = [].concat(this.raw.match(rgx));
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            decl = _ref[_i];
            name = decl.match(/class\s([^\s]+)/);
            name = (name[1].split('.')).pop();
            extending = decl.match(/(\sextends\s[^\s]+$)/m);
            if (extending) {
              extending = extending[0];
            }
            extending || (extending = "");
            repl = "class " + this.namespace + "." + name + extending;
            if (decl !== repl) {
              this.raw = this.raw.replace(decl, repl);
              fs.writeFileSync(this.realpath, this.raw);
            }
          }
          this.classpath = "" + this.namespace + "." + this.classname;
        }
        this.classname = this.raw.match(rgx)[3];
        _ref2 = (_ref1 = this.raw.match(rgx_ext)) != null ? _ref1 : [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          klass = _ref2[_j];
          baseclass = klass.match(rgx_ext)[5];
          this.baseclasses.push(baseclass);
        }
      }
      if (/(#<<\s)(.*)/g.test(this.raw)) {
        requirements = this.raw.match(/(#<<\s)(.*)/g);
        _results = [];
        for (_k = 0, _len2 = requirements.length; _k < _len2; _k++) {
          item = requirements[_k];
          item = /(#<<\s)(.*)/.exec(item)[2];
          item = item.replace(/\s/g, "");
          if (path.sep === "\\") {
            item = item.replace(/(\/)/g, "\\");
          }
          _results.push(this.dependencies_collapsed = this.dependencies_collapsed.concat(item));
        }
        return _results;
      }
    };

    return Script;

  })();

  Builder = (function() {
    var cs, fs, fsu, path, uglify;

    fs = require('fs');

    path = require('path');

    fsu = require('fs-util');

    cs = require("coffee-script");

    uglify = require("uglify-js");

    Builder.prototype.missing = {};

    function Builder(basepath, config) {
      var falias, file, folder, fpath, include, item, result, s, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      this.basepath = basepath;
      this.config = config;
      this.exclude = [].concat(this.config.exclude);
      this.files = this.config.files;
      _ref = this.config.src_folders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        folder = _ref[_i];
        result = fsu.find(folder.path, /.coffee$/m);
        fpath = folder.path;
        falias = folder.alias;
        for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
          file = result[_j];
          include = true;
          _ref1 = this.exclude;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            item = _ref1[_k];
            include &= !(new RegExp(item).test(file));
          }
          if (include) {
            s = new Script(this, fpath, file, falias);
            this.files.push(s);
          }
        }
      }
    }

    Builder.prototype.build = function(header_code, footer_code) {
      var contents, namespaces, options, vendors;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      namespaces = this._build_namespaces();
      vendors = this._merge_vendors();
      contents = [];
      if (this.config.packaging) {
        contents.push(namespaces);
      }
      if (header_code !== "") {
        contents.push(header_code);
      }
      contents.push(this._compile());
      if (header_code !== "") {
        contents.push(footer_code);
      }
      contents = contents.join('\n');
      if (this.config.minify !== false) {
        if (this.config.minify === true) {
          options = {};
        } else {
          options = this.config.minify;
        }
        options.fromString = true;
        contents = uglify.minify(contents, options).code;
      }
      if (this.config.callback != null) {
        contents = this.config.callback.apply(this, [contents, this.config.minify !== false]);
      }
      if (vendors !== "") {
        contents = vendors + '\n' + contents;
      }
      return fs.writeFileSync(this.config.release, contents);
    };


    /*
    @return {String}
     */

    Builder.prototype._merge_vendors = function() {
      var buffer, vendor, _i, _len, _ref;
      buffer = [];
      _ref = this.config.vendors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vendor = _ref[_i];
        if (fs.existsSync(vendor)) {
          buffer.push(fs.readFileSync(vendor, 'utf-8'));
        } else {
          warn("Vendor not found at ".white + vendor.yellow.bold);
        }
      }
      return buffer.join("\n");
    };


    /*
    Creates a NS holder for all folders
     */

    Builder.prototype._build_namespaces = function() {
      var buffer, folder, name, scope, t, tree, _i, _len, _ref;
      tree = {};
      _ref = this.config.src_folders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        folder = _ref[_i];
        if (folder.alias != null) {
          t = (tree[folder.alias] = {});
        }
        this._build_ns_tree(t || tree, folder.path);
      }
      buffer = "";
      for (name in tree) {
        scope = tree[name];
        buffer += "var " + name + " = ";
        if (this.config.expose != null) {
          buffer += "" + this.config.expose + "." + name + " = ";
        }
        buffer += (JSON.stringify(scope, null, '')).replace(/\"/g, "'");
        buffer += ";\n";
      }
      return buffer;
    };


    /*
    Walk some folderpath and lists all its subfolders
     */

    Builder.prototype._build_ns_tree = function(tree, folderpath) {
      var file, include, item, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!fs.lstatSync(folderpath).isDirectory()) {
        return;
      }
      _ref = fsu.ls(folderpath);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (!fs.lstatSync(file).isDirectory()) {
          continue;
        }
        include = true;
        _ref1 = this.exclude;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          include &= !(new RegExp(item).test(file));
        }
        if (include) {
          _results.push(this._build_ns_tree((tree[file.match(/[^\/\\]+$/m)] = {}), file));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };


    /*
    @return {String}
     */

    Builder.prototype._compile = function() {
      var err, file, msg, output, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        try {
          cs.compile(file.raw);
        } catch (_error) {
          err = _error;
          msg = err.message.replace('"', '\\"');
          msg = ("" + msg.white + " at file: ") + ("" + file.filepath).bold.red;
          error(msg);
          return null;
        }
      }
      _ref1 = this.files;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        file = _ref1[_j];
        file.expand_dependencies();
      }
      this._reorder();
      output = ((function() {
        var _k, _len2, _ref2, _results;
        _ref2 = this.files;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          file = _ref2[_k];
          _results.push(file.raw);
        }
        return _results;
      }).call(this)).join("\n");
      return output = cs.compile(output, {
        bare: this.config.bare
      });
    };


    /*
    @param {Boolean} cycling
     */

    Builder.prototype._reorder = function(cycling) {
      var bc, dependency, dependency_index, file, file_index, filepath, found, i, index, not_found, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (cycling == null) {
        cycling = false;
      }
      if (cycling === false) {
        this.missing = {};
      }
      _ref = this.files;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        file = _ref[i];
        if (!file.dependencies.length && !file.baseclasses.length) {
          continue;
        }
        _ref1 = file.dependencies;
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          filepath = _ref1[index];
          dependency = ArrayUtil.find(this.files, filepath, "filepath");
          if (dependency != null) {
            dependency_index = dependency.index;
          }
          if (dependency_index < i && (dependency != null)) {
            continue;
          }
          if (dependency != null) {
            if (ArrayUtil.has(dependency.item.dependencies, file.filepath)) {
              file.dependencies.splice(index, 1);
              warn("Circular dependency found between ".yellow + filepath.grey.bold + " and ".yellow + file.filepath.grey.bold);
              continue;
            } else {
              this.files.splice(index, 0, dependency.item);
              this.files.splice(dependency.index + 1, 1);
              this._reorder(true);
              break;
            }
          } else if (this.missing[filepath] !== true) {
            this.missing[filepath] = true;
            file.dependencies.push(filepath);
            file.dependencies.splice(index, 1);
            warn("" + 'Dependency'.yellow + " " + filepath.bold.grey + " " + 'not found for file'.yellow + " " + file.filepath.grey.bold);
          }
        }
        file_index = ArrayUtil.find(this.files, file.filepath, "filepath");
        file_index = file_index.index;
        _results.push((function() {
          var _k, _len2, _ref2, _results1;
          _ref2 = file.baseclasses;
          _results1 = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            bc = _ref2[_k];
            found = ArrayUtil.find(this.files, bc, "classname");
            not_found = (found === null) || (found.index > file_index);
            if (not_found && !this.missing[bc]) {
              this.missing[bc] = true;
              _results1.push(warn("Base class ".yellow + ("" + bc + " ").bold.grey + "not found for class ".yellow + ("" + file.classname + " ").bold.grey + "in file ".yellow + file.filepath.bold.grey));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return Builder;

  })();

  module.exports = Toaster = (function() {
    var path;

    path = require("path");


    /*
    @var {Cli}
     */

    Toaster.prototype.options = null;


    /*
    @var {Object} before filter container
     */

    Toaster.prototype.before_build = null;

    function Toaster(basedir, options) {
      this.toast = new Toast(path.resolve(basedir), options);
    }

    Toaster.prototype.build = function(header_code, footer_code) {
      var builder, _i, _len, _ref, _results;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      _ref = this.toast.builders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builder = _ref[_i];
        _results.push(builder.build(header_code, footer_code));
      }
      return _results;
    };

    return Toaster;

  })();

  log = function(msg) {
    console.log(msg);
    return msg;
  };

  error = function(msg) {
    msg = log("ERROR ".bold.red + msg);
    return msg;
  };

  warn = function(msg) {
    msg = log("WARNING ".bold.yellow + msg);
    return msg;
  };

}).call(this);
