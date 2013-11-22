// some vendor code
var fixtures = {
  foo: {}
};

(function() {
  var t, r = {}.hasOwnProperty, o = function(t, o) {
    function n() {
      this.constructor = t;
    }
    for (var e in o) r.call(o, e) && (t[e] = o[e]);
    return n.prototype = o.prototype, t.prototype = new n(), t.__super__ = o.prototype, 
    t;
  };
  fixtures.foo.Si = function() {
    function t() {}
    return t.prototype.bye = function(t) {
      return "bye " + t;
    }, t;
  }(), fixtures.foo.Bar = function(r) {
    function n() {
      return t = n.__super__.constructor.apply(this, arguments);
    }
    return o(n, r), n.prototype.bye = function(t) {
      var r;
      try {
        return n.__super__.bye.apply(this, arguments).bye(t);
      } catch (o) {
        return r = o, "ups";
      }
    }, n;
  }(app.foo.Si), fixtures.Foo = function() {
    function t() {}
    return t.prototype.hello = function(t) {
      return "hello " + t;
    }, t;
  }();
}).call(this);