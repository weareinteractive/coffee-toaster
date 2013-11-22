module.exports = class Toaster

  # -----------------------------------------------------------------------------------------------
  # ~ Requirements
  # -----------------------------------------------------------------------------------------------

  path = require("path")

  # -----------------------------------------------------------------------------------------------
  # ~ Variables
  # -----------------------------------------------------------------------------------------------

  ###
  @var {Cli}
  ###
  options: null
  ###
  @var {Object} before filter container
  ###
  before_build: null

  # -----------------------------------------------------------------------------------------------
  # ~ Constructor
  # -----------------------------------------------------------------------------------------------

  constructor: (basedir, options) ->
    @toast = new Toast(path.resolve(basedir), options)

  # -----------------------------------------------------------------------------------------------
  # ~ Public methods
  # -----------------------------------------------------------------------------------------------

  # can be called by apps using toaster as lib, build the project with options
  # to inject header and footer code which must to be in coffee as well and
  # will be compiled together the app.
  build: (header_code="", footer_code="") ->
    builder.build(header_code, footer_code) for builder in @toast.builders

# -------------------------------------------------------------------------------------------------
# ~ Helper
# -------------------------------------------------------------------------------------------------

# LOGGING METHODS
log = (msg) ->
  console.log msg
  return msg

error = (msg) ->
  msg = log "ERROR ".bold.red + msg
  return msg

warn = (msg) ->
  msg = log "WARNING ".bold.yellow + msg
  return msg
