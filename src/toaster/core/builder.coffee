class Builder

  # -----------------------------------------------------------------------------------------------
  # ~ Requirements
  # -----------------------------------------------------------------------------------------------

  # requirements
  fs = require 'fs'
  path = require 'path'
  fsu = require 'fs-util'
  cs = require "coffee-script"
  uglify = require("uglify-js")

  # -----------------------------------------------------------------------------------------------
  # ~ Varables
  # -----------------------------------------------------------------------------------------------

  missing: {}

  # -----------------------------------------------------------------------------------------------
  # ~ Constructor
  # -----------------------------------------------------------------------------------------------

  constructor:(@basepath, @config)->
    @exclude = [].concat(@config.exclude)

    # initializes buffer array to keep all tracked files
    @files = @config.files
    for folder in @config.src_folders

      # search for all *.coffee files inside src folder
      result = fsu.find(folder.path, /.coffee$/m)

      # folder path and alias
      fpath = folder.path
      falias = folder.alias

      # collects every files into Script instances
      for file in result

        include = true
        for item in @exclude
          include &= !(new RegExp( item ).test file)

        if include
          s = new Script(@, fpath, file, falias)
          @files.push(s)

  # -----------------------------------------------------------------------------------------------
  # ~ Public methods
  # -----------------------------------------------------------------------------------------------

  build:( header_code = "", footer_code = "" ) ->
    # namespaces
    namespaces = @_build_namespaces()

    # prepare vendors
    vendors = @_merge_vendors()

    # prepare release contents
    contents = []
    contents.push namespaces if @config.packaging
    contents.push header_code if header_code isnt ""
    contents.push @_compile()
    contents.push footer_code if header_code isnt ""
    contents = contents.join '\n'

    # uglifying
    unless @config.minify is false
      if @config.minify is true
        options = {}
      else
        options = @config.minify

      options.fromString = true
      contents = uglify.minify(contents, options).code

    # hook to modify the contents
    contents = @config.callback.apply(@, [contents, @config.minify isnt false]) if @config.callback?

    # prepend vendors
    if vendors isnt "" then contents = vendors + '\n' + contents

    # write release file
    fs.writeFileSync @config.release, contents

  # -----------------------------------------------------------------------------------------------
  # ~ Private methods
  # -----------------------------------------------------------------------------------------------

  ###
  @return {String}
  ###
  _merge_vendors: ->
    buffer = []
    for vendor in @config.vendors
      if fs.existsSync vendor
        buffer.push(fs.readFileSync vendor, 'utf-8')
      else
        warn("Vendor not found at ".white + vendor.yellow.bold)
    return buffer.join("\n")

  ###
  Creates a NS holder for all folders
  ###
  _build_namespaces:()->
    tree = {}
    for folder in @config.src_folders
      t = (tree[folder.alias] = {}) if folder.alias?
      @_build_ns_tree(t || tree, folder.path)

    buffer = ""
    for name, scope of tree
      buffer += "var #{name} = "
      buffer += "#{@config.expose}.#{name} = " if @config.expose?
      buffer += (JSON.stringify scope, null, '').replace /\"/g, "'"
      buffer += ";\n"

    return buffer

  ###
  Walk some folderpath and lists all its subfolders
  ###
  _build_ns_tree: (tree, folderpath) ->
    return unless fs.lstatSync(folderpath).isDirectory()
    for file in fsu.ls(folderpath)
      continue unless fs.lstatSync(file).isDirectory()
      include = true
      for item in @exclude
        include &= !(new RegExp(item).test file)
      if include
        @_build_ns_tree((tree[file.match /[^\/\\]+$/m] = {}), file)

  ###
  @return {String}
  ###
  _compile: ->
    # validating syntax
    for file in @files
      try
        cs.compile file.raw
      # if there's some error
      catch err

        # catches and shows it, and abort the compilation
        msg = err.message.replace '"', '\\"'
        msg = "#{msg.white} at file: " + "#{file.filepath}".bold.red
        error msg
        return null

    # otherwise move ahead, and expands all dependencies wild-cards
    file.expand_dependencies() for file in @files

    # reordering files
    @_reorder()

    # merging everything
    output = (file.raw for file in @files).join "\n"

    # compiling
    output = cs.compile(output, {bare:@config.bare})

  ###
  @param {Boolean} cycling
  ###
  _reorder: (cycling=false) ->
    # if cycling is true or @missing is null, initializes empty array
    # for holding missing dependencies
    #
    # cycling means the redorder method is being called recursively,
    # no other methods call it with cycling = true
    @missing = {} if cycling is false

    # looping through all files
    for file, i in @files

      # if theres no dependencies, go to next file
      continue if !file.dependencies.length && !file.baseclasses.length

      # otherwise loop thourgh all file dependencies
      for filepath, index in file.dependencies

        # search for dependency
        dependency = ArrayUtil.find(@files, filepath, "filepath")
        dependency_index = dependency.index if dependency?

        # continue if the dependency was already initialized
        continue if dependency_index < i && dependency?

        # if it's found
        if dependency?

          # if there's some circular dependency loop
          if ArrayUtil.has dependency.item.dependencies, file.filepath

            # remove it from the dependencies
            file.dependencies.splice index, 1

            # then prints a warning msg and continue
            warn "Circular dependency found between ".yellow +
                 filepath.grey.bold + " and ".yellow +
                 file.filepath.grey.bold

            continue

          # otherwise if no circular dependency is found, reorder
          # the specific dependency and run reorder recursively
          # until everything is beautiful
          else
            @files.splice index, 0, dependency.item
            @files.splice dependency.index + 1, 1
            @_reorder(true)
            break

        # otherwise if the dependency is not found
        else if @missing[filepath] != true

          # then add it to the @missing hash (so it will be ignored
          # until reordering finishes)
          @missing[filepath] = true

          # move it to the end of the dependencies array (avoiding
          # it from being touched again)
          file.dependencies.push(filepath)
          file.dependencies.splice(index, 1)

          # ..and finally prints a warning msg
          warn "#{'Dependency'.yellow} #{filepath.bold.grey} #{'not found for file'.yellow} #{file.filepath.grey.bold}"

      # validate if all base classes was properly imported
      file_index = ArrayUtil.find @files, file.filepath, "filepath"
      file_index = file_index.index

      for bc in file.baseclasses
        found = ArrayUtil.find @files, bc, "classname"
        not_found = (found == null) || (found.index > file_index)

        if not_found && !@missing[bc]
          @missing[bc] = true
          warn "Base class ".yellow +
             "#{bc} ".bold.grey +
             "not found for class ".yellow +
             "#{file.classname} ".bold.grey +
             "in file ".yellow +
             file.filepath.bold.grey
