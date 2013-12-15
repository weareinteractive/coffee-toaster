class Toast

  # -----------------------------------------------------------------------------------------------
  # ~ Requirements
  # -----------------------------------------------------------------------------------------------

  # requires
  fs = require("fs")
  path = require("path")

  # -----------------------------------------------------------------------------------------------
  # ~ Variables
  # -----------------------------------------------------------------------------------------------

  # variables
  basepath: null
  builders: null

  # -----------------------------------------------------------------------------------------------
  # ~ Constructor
  # -----------------------------------------------------------------------------------------------

  constructor: (@basepath, options) ->
    @builders = []
    @_toast(item) for item in ([].concat options)

  # -----------------------------------------------------------------------------------------------
  # ~ Private methods
  # -----------------------------------------------------------------------------------------------

  _toast: (srcpath, params={})=>
    if srcpath instanceof Object
      params = srcpath
    else if (path.resolve srcpath) != srcpath
      folder = path.join @basepath, srcpath

    # validate release option
    unless params.release?
      error 'Release path not informed in config.'
      return process.exit()

    # validate release folder
    dir = path.join(@basepath, path.dirname(params.release))
    unless fs.existsSync(dir)
      error "Release folder does not exist:\n\t#{dir.yellow}"
      return process.exit()

    config =
      # RUNNING BUILDERS
      is_building: false

      # BASEPATH
      basepath: @basepath

      # SRC FOLDERS
      src_folders: []

      # FILES CONTRAINER ARRAY
      files: []

      # VENDORS
      vendors: params.vendors ? []

      # OPTIONS
      exclude: params.exclude ? []
      bare: params.bare ? false
      packaging: params.packaging ? true
      expose: params.expose ? null
      minify: params.minify ? true
      callback: params.callback ? null

      # HTTP FOLDER / RELEASE
      release: path.join(@basepath, params.release)

    # compute vendors full path
    for v, i in config.vendors
      vpath = config.vendors[i] = (path.resolve v)
      if (path.resolve vpath) isnt vpath
        config.vendors[i] = path.join @basepath, v

    unless srcpath instanceof Object
      srcpath = path.resolve( path.join @basepath, srcpath )
      config.src_folders.push
        path: srcpath
        alias: params.alias || null

    if params.folders?
      for folder, alias of params.folders
        if (path.resolve folder) != folder
          folder = path.join @basepath, folder
        config.src_folders.push {path: folder, alias: alias}

    for item in config.src_folders
      unless fs.existsSync item.path
        error "Source folder doens't exist:\n\t#{item.path.red}\n" +
            "Check your #{'toaster.coffee'.yellow} and try again." +
            "\n\t" + (path.join @basepath, "toaster.coffee" ).yellow
        return process.exit()

    builder = new Builder(@basepath, config)
    @builders.push(builder)
