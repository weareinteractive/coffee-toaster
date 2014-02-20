// some vendor code
var fixtures = {'foo':{}};

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fixtures.foo.Si = (function() {
    function Si() {}

    Si.prototype.bye = function(name) {
      return "bye " + name;
    };

    return Si;

  })();

  fixtures.foo.Bar = (function(_super) {
    __extends(Bar, _super);

    function Bar() {
      return Bar.__super__.constructor.apply(this, arguments);
    }

    Bar.prototype.bye = function(name) {
      var error;
      try {
        return Bar.__super__.bye.apply(this, arguments).bye(name);
      } catch (_error) {
        error = _error;
        return "ups";
      }
    };

    return Bar;

  })(app.foo.Si);

  fixtures.Foo = (function() {
    function Foo() {}

    Foo.prototype.hello = function(name) {
      return "hello " + name;
    };

    return Foo;

  })();

}).call(this);
