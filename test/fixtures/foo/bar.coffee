#<< fixtures/foo/si

class fixtures.foo.Bar extends app.foo.Si
  bye: (name) ->
    try
      return super.bye(name)
    catch error
      return "ups"