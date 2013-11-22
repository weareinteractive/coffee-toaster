class ArrayUtil

  # -----------------------------------------------------------------------------------------------
  # ~ Public static methods
  # -----------------------------------------------------------------------------------------------

  ###
  @param {Array} source
  @param {Object} search
  @param {String} by_property
  @return {Boolean}
  ###
  @has: (source, search, by_property) ->
    return ArrayUtil.find(source, search, by_property)?

  ###
  @param {Array} source
  @param {Object} search
  @param {String} by_property
  @return {Object}
  ###
  @find: (source, search, by_property) ->
    if !by_property
      for v, k in source
        return {item: v, index: k} if v == search
    else
      by_property = [].concat by_property
      for v, k in source
        for p in by_property
          return {item: v, index: k} if search == v[p]
    return null

  ###
  @param {Array} source
  @param {Object} search
  @param {String} by_property
  @param {Boolean} regexp
  @param {Boolean} unique
  @return {Object}
  ###
  @find_all: (source, search, by_property, regexp, unique) ->
    _output = []
    _unique = {}

    if by_property is null

      for v, k in source
        if regexp
          item = {item: v, index: k} if search.test v
        else
          item = {item: v, index: k} if search == v

        _output.push item if item
    else

      by_property = [].concat by_property
      for v, k in source

        for p in by_property
          item = null

          if regexp
            if search.test v[p]
              if unique && !_unique[k]
                item = {item: v, index: k}
              else if unique is not true
                item = {item: v, index: k}
          else
            if search == v[p]
              item = {item: v, index: k}

          if item
            _unique[k] = true
            _output.push item

    return _output
