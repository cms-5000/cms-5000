(function(){;
var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }
  
  var registry = {}, seen = {}, state = {};
  var FAILED = false;

  define = function(name, deps, callback) {
  
    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }
  
    registry[name] = {
      deps: deps,
      callback: callback
    };
  };

  function reify(deps, name, seen) {
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    var exports;

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        exports = reified[i] = seen;
      } else {
        reified[i] = require(resolve(dep, name));
      }
    }

    return {
      deps: reified,
      exports: exports
    };
  }

  requirejs = require = requireModule = function(name) {
    if (state[name] !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    if (!registry[name]) {
      throw new Error('Could not find module ' + name);
    }

    var mod = registry[name];
    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    try {
      reified = reify(mod.deps, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    } finally {
      if (!loaded) {
        state[name] = FAILED;
      }
    }

    return reified.exports ? seen[name] : (seen[name] = module);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase;

    if (nameParts.length === 1) {
      parentBase = nameParts;
    } else {
      parentBase = nameParts.slice(0, -1);
    }

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') { parentBase.pop(); }
      else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

;define("liquid-fire/index", 
  ["liquid-fire/transitions","liquid-fire/animate","liquid-fire/promise","liquid-fire/initialize","liquid-fire/mutation-observer","liquid-fire/curry","liquid-fire/router-dsl-ext","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var Transitions = __dependency1__["default"];
    var animate = __dependency2__.animate;
    var stop = __dependency2__.stop;
    var isAnimating = __dependency2__.isAnimating;
    var timeSpent = __dependency2__.timeSpent;
    var timeRemaining = __dependency2__.timeRemaining;
    var finish = __dependency2__.finish;
    var Promise = __dependency3__["default"];
    var initialize = __dependency4__.initialize;
    var MutationObserver = __dependency5__["default"];
    var curryTransition = __dependency6__["default"];
    __exports__.Transitions = Transitions;
    __exports__.animate = animate;
    __exports__.stop = stop;
    __exports__.isAnimating = isAnimating;
    __exports__.timeSpent = timeSpent;
    __exports__.timeRemaining = timeRemaining;
    __exports__.finish = finish;
    __exports__.Promise = Promise;
    __exports__.initialize = initialize;
    __exports__.MutationObserver = MutationObserver;
    __exports__.curryTransition = curryTransition;
  });
;define("liquid-fire/transitions", 
  ["liquid-fire/transition","liquid-fire/dsl","ember","liquid-fire/internal-rules","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Transition = __dependency1__["default"];
    var DSL = __dependency2__["default"];
    var Ember = __dependency3__["default"];
    var rules = __dependency4__["default"];

    var Transitions = Ember.Object.extend({
      init: function() {
        var config, container;
        this.activeCount = 0;
        this._map = {};
        this.map(rules);
        container = this.get('container');
        if (container) {
          config = container.lookupFactory('transitions:main');
        }
        if (config) {
          this.map(config);
        }
        if (Ember.testing) {
          this._registerWaiter();
        }
      },

      runningTransitions: function() {
        return this.activeCount;
      },

      lookup: function(transitionName) {
        var handler = this.container.lookupFactory('transition:' + transitionName);
        if (!handler) {
          throw new Error("unknown transition name: " + transitionName);
        }
        return handler;
      },

      transitionFor: function(parentView, oldView, newContent, use, firstTime) {
        var handler, args;
        // "use" matches any transition *except* the initial render
        if (use && !firstTime) {
          handler = this.lookup(use);
        } else {
          var key = this.match(firstTime, parentView, oldView, newContent);
          if (key) {
            args = key.args;
            if (typeof(key.method) === 'function') {
              handler = key.method;
            } else {
              handler = this.lookup(key.method);
            }
          }
        }

        // If we are not animating, but one of our ancestors is animating
        // us away, we should wait for the ancestor to finish before
        // letting our content be destroyed.
        if (!handler && oldView && !newContent) {
          var ancestorTransition = slatedForDestruction(oldView);
          if (ancestorTransition) {
            handler = waitForTransition;
            args = [ancestorTransition];
          }
        }

        return new Transition(parentView, oldView, newContent, handler, args, this);
      },

      map: function(handler) {
        if (handler){
          handler.apply(new DSL(this));
        }
        return this;
      },

      register: function(routes, contexts, parent, action) {
        this._register(this._map, [routes.from, routes.to, parent, contexts.from, contexts.to], action);
      },

      _register: function(ctxt, remaining, payload) {
        var first = remaining[0];
        for (var i = 0; i < first.length; i++) {
          var elt = first[i];
          if (typeof(elt) === 'function') {
            if (!ctxt.__functions) {
              ctxt.__functions = [];
            }
            if (remaining.length === 1) {
              ctxt.__functions.push([elt, payload]);
            } else {
              var c = {};
              this._register(c, remaining.slice(1), payload);
              ctxt.__functions.push([elt, c]);
            }
          } else {
            if (remaining.length === 1) {
              ctxt[elt] = payload;
            } else {
              if (!ctxt[elt]) {
                ctxt[elt] = {};
              }
              this._register(ctxt[elt], remaining.slice(1), payload);
            }
          }
        }
      },

      _viewProperties: function(view, childProp) {
        if (view && childProp) {
          view = view.get(childProp);
        }

        if (!view) {
          return {};
        }

        return {
          route: view.get('renderedName'),
          context: view.get('liquidContext')
        };
      },

      _ancestorsRenderedName: function(view) {
        while (view && !view.get('renderedName')){
          view = view.get('_parentView');
        }
        if (view) {
          return view.get('renderedName');
        }
      },

      match: function(firstTime, parentView, oldView, newContent) {
        var change = {
          leaving: this._viewProperties(oldView, 'currentView'),
          entering: this._viewProperties(newContent),
          parentView: parentView,
          initialRender: firstTime
        };

        // If the old/new views themselves are not part of a route
        // transition, provide route properties from our surrounding
        // context.
        if (oldView && !change.leaving.route) {
          change.leaving.route = this._ancestorsRenderedName(parentView);
        }
        if (newContent && !change.entering.route) {
          change.entering.route = change.leaving.route || this._ancestorsRenderedName(parentView);
        }

        return this._match(change, this._map, 0);
      },

      _match: function(change, ctxt, depth) {
        var index = 0,
            candidate, nextContext, answer,
            predicateArgs = this._predicateArgs(change, depth),
            candidates = this._candidatesFor(change, ctxt, predicateArgs[0], depth);

        for (index = 0; index < candidates.length; index++) {
          candidate = candidates[index];
          if (!candidate) { continue; }
          if (typeof(candidate[0]) === 'function'){
            if (candidate[0].apply(null, predicateArgs)) {
              nextContext = candidate[1];
            } else {
              nextContext = null;
            }
          } else {
            nextContext = ctxt[candidate];
          }
          if (nextContext) {
            if (depth === 4) {
              return nextContext;
            } else {
              answer = this._match(change, nextContext, depth + 1);
              if (answer) {
                return answer;
              }
            }
          }
        }
      },

      _predicateArgs: function(change, level) {
        switch (level) {
        case 0:
          return [change.leaving.route, change.entering.route];
        case 1:
          return [change.entering.route, change.leaving.route];
        case 2:
          return [change.parentView];
        case 3:
          return [change.leaving.context, change.entering.context];
        case 4:
          return [change.entering.context, change.leaving.context];
        }
      },

      _candidatesFor: function(change, ctxt, first, depth) {
        var candidates = [first || DSL.EMPTY].concat(ctxt.__functions);
        if (depth === 0 && change.initialRender) {
          return candidates;
        } else {
          return candidates.concat(DSL.ANY);
        }
      },

      _registerWaiter: function() {
        var self = this;
        this._waiter = function() {
          return self.runningTransitions() === 0;
        };
        Ember.Test.registerWaiter(this._waiter);
      },

      willDestroy: function() {
        if (this._waiter) {
          Ember.Test.unregisterWaiter(this._waiter);
          this._waiter = null;
        }
      }
    });


    Transitions.reopenClass({
      map: function(handler) {
        var t = Transitions.create();
        t.map(handler);
        return t;
      }
    });

    function slatedForDestruction(view) {
      var child;
      while (view._parentView) {
        child = view;
        view = view._parentView;
        if (view._runningTransition && view._runningTransition.oldView === child) {
          return view._runningTransition;
        }
      }
    }

    function waitForTransition() {
      return arguments[2].run();
    }

    __exports__["default"] = Transitions;
  });
;define("liquid-fire/transition", 
  ["liquid-fire/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    function Transition(parentView, oldView, newContent, animation, animationArgs, transitionMap) {
      this.parentView = parentView;
      this.oldView = oldView;
      this.newContent = newContent;
      this.animation = animation;
      this.animationArgs = animationArgs;
      this.transitionMap = transitionMap;
    }

    Transition.prototype = {
      run: function() {
        if (this._ran) {
          return this._ran;
        }
        if (!this.animation) {
          this.maybeDestroyOldView();
          return this._ran = this._insertNewView().then(revealView);
        }
        var self = this;
        self.transitionMap.activeCount += 1;
        return this._ran = this._invokeAnimation().then(function(){
          self.maybeDestroyOldView();
        }, function(err){
          return self.cleanupAfterError().then(function(){
            throw err;
          });
        })["finally"](function(){
          self.transitionMap.activeCount -= 1;
        });
      },

      _insertNewView: function() {
        if (this.inserted) {
          return this.inserted;
        }
        return this.inserted = this.parentView._pushNewView(this.newContent);
      },

      _invokeAnimation: function() {
        var self = this,
            animation = this.animation,
            inserter = function(){
              var contained = !self.parentView.get('containerless');
              if (contained) {
                self.parentView.cacheSize();
                goAbsolute(self.oldView);
              }
              return self._insertNewView().then(function(newView){
                if (!newView) {
                  if (contained){
                    self.parentView.adaptSize();
                  }
                } else {
                  newView.$().show();
                  if (contained){
                    // Measure newView size before parentView sets an explicit size.
                    var size = getSize(newView);
                    self.parentView.adaptSize();
                    goAbsolute(newView, size);
                  }
                  return self.newView = newView;
                }
              });
            },
            args = [this.oldView, inserter].concat(this.animationArgs);

        // The extra Promise means we will trap an exception thrown
        // immediately by the animation implementation.
        return new Promise(function(resolve, reject){
          animation.apply(self, args).then(resolve, reject);
        }).then(function(){
          if (!self.interruptedLate) {
            goStatic(self.newView);
            self.parentView.unlockSize();
          }
        });
      },

      maybeDestroyOldView: function() {
        if (!this.interruptedEarly && this.oldView) {
          this.oldView.destroy();
        }
      },

      // If the animation blew up, do what we can to leave the DOM in a
      // sane state before re-propagating the error.
      cleanupAfterError: function() {
        this.maybeDestroyOldView();
        return this._insertNewView().then(revealView);
      },

      interrupt: function(){
        // If we haven't yet inserted the new view, don't. And tell the
        // old view not to destroy when our animation stops, because the
        // next transition is going to take over and keep using it.
        if (!this.inserted) {
          this.inserted = Promise.resolve(null);
          this.interruptedEarly = true;
        } else {
          this.interruptedLate = true;
        }
      },

      // Lets you compose your transitions out of other named transitions.
      lookup: function(transitionName) {
        return this.transitionMap.lookup(transitionName);
      }
    };

    function revealView(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.show().css({visibility: ''});
      }
    }

    function getSize(view) {
      var elt;
      if (view && (elt = view.$())) {
        return {
          width: elt.width(),
          height: elt.height()
        };
      }
    }

    function goAbsolute(view, size) {
      var elt;
      if (view && (elt = view.$())) {
        if (!size) {
          size = getSize(view);
        }
        elt.width(size.width);
        elt.height(size.height);
        elt.css({position: 'absolute'});
      }
    }

    function goStatic(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.css({width: '', height: '', position: ''});
      }
    }



    __exports__["default"] = Transition;
  });
;define("liquid-fire/promise", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Ember is already polyfilling Promise as needed, so just use that.
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.RSVP.Promise;
  });
;define("liquid-fire/dsl", 
  ["ember","liquid-fire/animate","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var setDefaults = __dependency2__.setDefaults;

    function DSL(map) {
      this.map = map;
    }

    DSL.prototype = {
      setDefault: function(props) {
        setDefaults(props);
      },

      define: function() {
        throw new Error("calling 'define' from within the transition map is deprecated");
      },

      _withEmpty: function(elt){
        return elt || DSL.EMPTY;
      },

      _combineMatchers: function(matchers) {
        return [matchers.reduce(function(a,b){
          if (typeof(a) !== "function" || typeof(b) !== "function") {
            throw new Error("cannot combine empty model matcher with any other constraints");
          }

          return function(){
            return a.apply(this, arguments) && b.apply(this, arguments);
          };
        })];
      },

      transition: function() {
        var action, reverseAction,
            parent = [],
            routes = {},
            contexts = {},
            args = Array.prototype.slice.apply(arguments).reduce(function(a,b){
              return a.concat(b);
            }, []);


        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          if (arg.type === 'action') {
            if (action) {
              throw new Error("each transition definition must contain exactly one 'use' statement");
            }
            action = { method: arg.payload, args: arg.args };
          } else if (arg.type === 'reverseAction') {
            if (reverseAction) {
              throw new Error("each transition definition may contain at most one 'reverse' statement");
            }
            reverseAction = { method: arg.payload, args: arg.args };
          } else if (arg.type === 'route') {
            if (routes[arg.side]) {
              throw new Error("A transition definition contains multiple constraints on " + arg.side + "Route");
            }
            routes[arg.side] = arg.payload.map(this._withEmpty);
          } else if (arg.type === 'parent') {
            parent.push(arg.payload);
          } else {
            if (!contexts[arg.side]){
              contexts[arg.side] = [];
            }
            contexts[arg.side].push(arg.payload);
          }
        }

        if (!action) {
          throw new Error("a transition definition contains no 'use' statement");
        }
        if (!routes.from) {
          routes.from = [DSL.ANY];
        }
        if (!routes.to) {
          routes.to = [DSL.ANY];
        }
        if (parent.length === 0) {
          parent.push(DSL.ANY);
        }
        if (!contexts.from) {
          contexts.from = [DSL.ANY];
        }
        if (!contexts.to) {
          contexts.to = [DSL.ANY];
        }

        parent = this._combineMatchers(parent);
        contexts.from = this._combineMatchers(contexts.from);
        contexts.to = this._combineMatchers(contexts.to);

        this.map.register(routes, contexts, parent, action);
        if (reverseAction) {
          routes = { from: routes.to, to: routes.from };
          contexts = { from: contexts.to, to: contexts.from };
          this.map.register(routes, contexts, parent, reverseAction);
        }
      },

      fromRoute: function() {
        return {
          side: 'from',
          type: 'route',
          payload: Array.prototype.slice.apply(arguments)
        };
      },

      toRoute: function() {
        return {
          side: 'to',
          type: 'route',
          payload: Array.prototype.slice.apply(arguments)
        };
      },

      withinRoute: function() {
        return [
          this.fromRoute.apply(this, arguments),
          this.toRoute.apply(this, arguments)
        ];
      },

      fromModel: function(matcher) {
        return {
          side: 'from',
          type: 'context',
          payload: contextMatcher(matcher)
        };
      },

      toModel: function(matcher) {
        return {
          side: 'to',
          type: 'context',
          payload: contextMatcher(matcher)
        };
      },

      betweenModels: function(matcher) {
        return [
          this.fromModel(matcher),
          this.toModel(matcher)
        ];
      },

      hasClass: function(name) {
        return {
          type: 'parent',
          payload: function(parentView) {
            return parentView && parentView.get('classNames').indexOf(name) !== -1;
          }
        };
      },

      childOf: function(selector) {
        return {
          type: 'parent',
          payload: function(parentView) {
            var elt;
            return parentView &&
              (parentView._morph && Ember.$(parentView._morph.start.parentElement).is(selector)) ||
              (parentView.morph  && Ember.$('#' + parentView.morph.start).parent().is(selector)) ||
              ((elt=parentView.$()) && elt.parent().is(selector));
          }
        };
      },

      fromNonEmptyModel: function(){
        return this.fromModel(function(context){
          return typeof(context) !== 'undefined';
        });
      },

      toNonEmptyModel: function(){
        return this.toModel(function(context){
          return typeof(context) !== 'undefined';
        });
      },

      betweenNonEmptyModels: function(){
        return this.betweenModels(function(context){
          return typeof(context) !== 'undefined';
        });
      },

      use: function(nameOrHandler) {
        return {
          type: 'action',
          payload: nameOrHandler,
          args: Array.prototype.slice.apply(arguments, [1])
        };
      },

      reverse: function(nameOrHandler) {
        return {
          type: 'reverseAction',
          payload: nameOrHandler,
          args: Array.prototype.slice.apply(arguments, [1])
        };
      }
    };

    DSL.ANY = '__liquid-fire-ANY';
    DSL.EMPTY = '__liquid-fire-EMPTY';

    function contextMatcher(matcher) {
      if (!matcher) {
        return DSL.EMPTY;
      }

      if (typeof(matcher) === 'function') {
        return matcher;
      }
      if (matcher.instanceOf) {
        return function(context) {
          return (context instanceof matcher.instanceOf) || (context && context.get && context.get('model') && context.get('model') instanceof matcher.instanceOf);
        };
      }
      if (typeof(matcher) === 'boolean') {
        return function(context) {
          if (matcher) {
            return !!context;
          } else {
            return !context;
          }
        };
      }

      throw new Error("unknown context matcher: " + JSON.stringify(matcher));
    }

    __exports__["default"] = DSL;
  });
;define("liquid-fire/animate", 
  ["liquid-fire/promise","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    var Velocity = Ember.$.Velocity;

    // Make sure Velocity always has promise support by injecting our own
    // RSVP-based implementation if it doesn't already have one.
    if (!Velocity.Promise) {
      Velocity.Promise = Promise;
    }

    function animate(view, props, opts, label) {
      // These numbers are just sane defaults in the probably-impossible
      // case where somebody tries to read our state before the first
      // 'progress' callback has fired.
      var state = { percentComplete: 0, timeRemaining: 100, timeSpent: 0 },
          elt;

      if (!view || !(elt = view.$()) || !elt[0]) {
        return Promise.resolve();
      }

      if (!opts) {
        opts = {};
      } else {
        opts = Ember.copy(opts);
      }

      // By default, we ask velocity to clear the element's `display`
      // and `visibility` properties at the start of animation. Our
      // animated divs are all initially rendered with `display:none`
      // and `visibility:hidden` to prevent a flash of before-animated
      // content.
      if (typeof(opts.display) === 'undefined') {
        opts.display = '';
      }
      if (typeof(opts.visibility) === 'undefined') {
        opts.visibility = 'visible';
      }

      if (opts.progress) {
        throw new Error("liquid-fire's 'animate' function reserves the use of Velocity's 'progress' option for its own nefarious purposes.");
      }

      opts.progress = function(){
        state.percentComplete = arguments[1];
        state.timeRemaining = arguments[2];
        state.timeSpent = state.timeRemaining / (1/state.percentComplete - 1);
      };

      state.promise = Promise.resolve(Velocity.animate(elt[0], props, opts));

      if (label) {
        state.promise = state.promise.then(function(){
          clearLabel(view, label);
        }, function(err) {
          clearLabel(view, label);
          throw err;
        });
        applyLabel(view, label, state);
      }

      return state.promise;
    }

    __exports__.animate = animate;
    function stop(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.velocity('stop', true);
      }
    }

    __exports__.stop = stop;
    function setDefaults(props) {
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          if (key === 'progress') {
            throw new Error("liquid-fire's 'animate' function reserves the use of Velocity's '" + key + "' option for its own nefarious purposes.");
          }
          Velocity.defaults[key] = props[key];
        }
      }
    }

    __exports__.setDefaults = setDefaults;
    function isAnimating(view, animationLabel) {
      return view && view._lfTags && view._lfTags[animationLabel];
    }

    __exports__.isAnimating = isAnimating;
    function finish(view, animationLabel) {
      return stateForLabel(view, animationLabel).promise;
    }

    __exports__.finish = finish;
    function timeSpent(view, animationLabel) {
      return stateForLabel(view, animationLabel).timeSpent;
    }

    __exports__.timeSpent = timeSpent;
    function timeRemaining(view, animationLabel) {
      return stateForLabel(view, animationLabel).timeRemaining;
    }

    __exports__.timeRemaining = timeRemaining;
    function stateForLabel(view, label) {
      var state = isAnimating(view, label);
      if (!state) {
        throw new Error("no animation labeled " + label + " is in progress");
      }
      return state;
    }

    function applyLabel(view, label, state) {
      if (!view){ return; }
      if (!view._lfTags) {
        view._lfTags = {};
      }
      view._lfTags[label] = state;
    }

    function clearLabel(view, label) {
      if (view && view._lfTags) {
        delete view._lfTags[label];
      }
    }
  });
;define("liquid-fire/internal-rules", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = function() {
      this.setDefault({duration: 250});

      this.transition(
        this.hasClass('lm-with'),
        this.use('modal-popup')
      );
    }
  });
;define("liquid-fire/initialize", 
  ["liquid-fire/transitions","liquid-fire/modals","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Transitions = __dependency1__["default"];
    var Modals = __dependency2__["default"];

    function initialize(container) {
      container.register('transitions:map', Transitions);

      ['outlet', 'with', 'if'].forEach(function(viewName) {
        container.injection('view:liquid-' + viewName, 'transitions', 'transitions:map');
      });

      container.register('liquid-modals:main', Modals);
      container.injection('component:liquid-modal', 'owner', 'liquid-modals:main');


      var lwTemplate = container.lookup('template:liquid-with');
      if (lwTemplate) {
        // This is a hack to make outlets work inside liquid-with.
        lwTemplate.isTop = false;
      }
    }

    __exports__.initialize = initialize;
  });
;define("liquid-fire/modals", 
  ["ember","liquid-fire/modal","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Modal = __dependency2__["default"];

    __exports__["default"] = Ember.Controller.extend({
      needs: ['application'],

      setup: Ember.on('init', function() {

        this.set('modalContexts', Ember.A());
        this.set('modals', Ember.A());

        var modalConfigs = this.container.lookup('router:main').router.modals;
        if (modalConfigs && modalConfigs.length > 0) {
          var self = this;
          modalConfigs.forEach(function(m){ self.registerModal(m); });
        }
      }),

      registerModal: function(config) {
        var ext = {
          modals: this,
          container: this.container
        };

        for (var param in config.options.withParams) {
          ext[param + "Observer"] = observerForParam(param);
        }

        this.get('modals').pushObject(
          Modal.extend(ext).create(config)
        );
      },

      currentRoute: Ember.computed.alias('controllers.application.currentRouteName'),

      activeRouteNames: Ember.computed('currentRoute', function() {
        var infos = this.container.lookup('router:main').router.currentHandlerInfos;
        if (infos) {
          return infos.map(function(h){  return h.name;  });
        } else {
          return [];
        }
      })

    });

    function observerForParam(param) {
      return Ember.observer('controller.' + param, function() { this.update(); });
    }
  });
;define("liquid-fire/modal", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var get = Ember.get;


    __exports__["default"] = Ember.Object.extend({

      enabled: Ember.computed('modals.activeRouteNames', function() {
        return get(this, 'modals.activeRouteNames').indexOf(get(this, 'route')) >= 0;
      }),

      controller: Ember.computed('enabled', function() {
        if (!get(this, 'enabled')) { return; }
        var container = get(this, 'container');
        var name = get(this, 'options.controller') || get(this, 'route');
        return container.lookup('controller:' + name);
      }),

      update: Ember.observer('controller', Ember.on('init', function() {
        var name = get(this, 'name');
        var context = this.makeContext();
        var activeContexts = get(this, 'modals.modalContexts');
        var matchingContext = activeContexts.find(function(c){ return get(c, 'name') === name; });

        if (context) {
          if (matchingContext) {
            activeContexts.replace(activeContexts.indexOf(matchingContext), 1, [context]);
          } else {
            activeContexts.pushObject(context);
          }
        } else {
          if (matchingContext) {
            activeContexts.removeObject(matchingContext);
          }
        }
      })),

      makeContext: function() {
        var params,
            controller = get(this, 'controller');

        if (!controller) { return; }

        params = currentParams(controller, get(this, 'options.withParams'));
        if (params) {
          return Ember.Object.create({
            source: controller,
            name: get(this, 'name'),
            options: get(this, 'options'),
            params: params
          });
        }
      }

    });

    function currentParams(controller, paramMap) {
      var params = {};
      var proto = controller.constructor.proto();
      var foundNonDefault = false;
      var to, from, value;

      for (from in paramMap) {
        to = paramMap[from];
        value = controller.get(from);
        params[to] = value;
        if (value !== proto[from]) {
          foundNonDefault = true;
        }
      }

      if (foundNonDefault) {
        return params;
      }
    }
  });
;define("liquid-fire/mutation-observer", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function MutationPoller(callback){
      this.callback = callback;
    }

    MutationPoller.prototype = {
      observe: function(){
        this.interval = setInterval(this.callback, 100);
      },
      disconnect: function() {
        clearInterval(this.interval);
      }
    };

    var M = (window.MutationObserver || window.WebkitMutationObserver || MutationPoller);

    __exports__["default"] = M;
  });
;define("liquid-fire/curry", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = function curry(animationName) {
      var curriedArgs= Array.prototype.slice.apply(arguments, [1]);
      return function() {
        var innerHandler = this.lookup(animationName),
            args = Array.prototype.slice.apply(arguments);
        args.splice.apply(args, [2, 0].concat(curriedArgs));
        return innerHandler.apply(this, args);
      };
    }
  });
;define("liquid-fire/router-dsl-ext", 
  ["ember"],
  function(__dependency1__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Router = Ember.Router;
    var proto = Ember.RouterDSL.prototype;

    var currentMap = null;

    proto.modal = function(componentName, opts) {

      Ember.assert('modal("' + componentName + '",...) needs a `withParams` argument', opts && opts.withParams);

      opts = Ember.copy(opts);

      opts.withParams  = expandParamOptions(opts.withParams);
      opts.otherParams = expandParamOptions(opts.otherParams);

      if (typeof(opts.dismissWithOutsideClick) === 'undefined') {
        opts.dismissWithOutsideClick = true;
      }

      if (typeof(opts.dismissWithEscape) === 'undefined') {
        opts.dismissWithEscape = true;
      }

      currentMap.push({
        route: this.parent,
        name: componentName,
        options: opts
      });
    };

    // 1.10 and above
    Router.reopen({
      _initRouterJs: function() {
        currentMap = [];
        this._super();
        this.router.modals = currentMap;
      }
    });

    // 1.9 and below
    var origMap = Router.map;
    Router.reopenClass({
      map: function() {
        currentMap = [];
        var output = origMap.apply(this, arguments);
        if (this.router) {
          this.router.modals = currentMap;
        }
        return output;
      }
    });


    // takes string, array of strings, object, or array of objects and strings
    // and turns them into one object to map withParams/otherParams from context to modal
    //
    // "foo"                   => { foo: "foo" }
    // ["foo"]                 => { foo: "foo" }
    // { foo: "bar" }          => { foo: "bar" }
    // ["foo", { bar: "baz" }] => { foo: "foo", bar: "baz" }
    //
    function expandParamOptions(options) {
      if (!options) { return {}; }

        if (!Ember.isArray(options)) {
          options = [options];
        }

        var params = {};
        var option, i, key;

        for (i = 0; i < options.length; i++) {
          option = options[i];
          if (typeof option === "object") {
            for (key in option) {
              params[key] = option[key];
            }
          } else {
            params[option] = option;
          }
        }

        return params;
      }
  });
;define("app/components/lf-overlay", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Component.extend({
      tagName: 'span',
      classNames: ['lf-overlay'],
      didInsertElement: function() {
        Ember.$('body').addClass('lf-modal-open');
      },
      willDestroy: function() {
        Ember.$('body').removeClass('lf-modal-open');
      },
      click: function() {
        this.sendAction('clickAway');
      }
    });
  });
;define("app/components/liquid-measured", 
  ["liquid-fire/mutation-observer","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var MutationObserver = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend({

      didInsertElement: function() {
        var self = this;

        // This prevents margin collapse
        this.$().css({
          border: '1px solid transparent',
          margin: '-1px'
        });

        this.didMutate();

        this.observer = new MutationObserver(function(mutations) { self.didMutate(mutations); });
        this.observer.observe(this.get('element'), {
          attributes: true,
          subtree: true,
          childList: true
        });
        this.$().bind('webkitTransitionEnd', function() { self.didMutate(); });
        // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
        window.addEventListener('unload', function(){ self.willDestroyElement(); });
      },

      willDestroyElement: function() {
        if (this.observer) {
          this.observer.disconnect();
        }
      },

      didMutate: function() {
        Ember.run.next(this, function() { this._didMutate(); });
      },

      _didMutate: function() {
        var elt = this.$();
        if (!elt || !elt[0]) { return; }

        // if jQuery sees a zero dimension, it will temporarily modify the
        // element's css to try to make its size measurable. But that's bad
        // for us here, because we'll get an infinite recursion of mutation
        // events. So we trap the zero case without hitting jQuery.

        if (elt[0].offsetWidth === 0) {
          this.set('width', 0);
        } else {
          this.set('width', elt.outerWidth());
        }
        if (elt[0].offsetHeight === 0) {
          this.set('height', 0);
        } else {
          this.set('height', elt.outerHeight());
        }
      }  

    });
  });
;define("app/components/liquid-modal", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Component.extend({
      classNames: ['liquid-modal'],
      currentContext: Ember.computed.oneWay('owner.modalContexts.lastObject'),

      owner: null, // set by injection

      innerView: Ember.computed('currentContext', function() {
        var self = this,
            current = this.get('currentContext'),
            name = current.get('name'),
            container = this.get('container'),
            component = container.lookup('component-lookup:main').lookupFactory(name);
        Ember.assert("Tried to render a modal using component '" + name + "', but couldn't find it.", !!component);

        var args = Ember.copy(current.get('params'));

        args.registerMyself = Ember.on('init', function() {
          self.set('innerViewInstance', this);
        });

        // set source so we can bind other params to it
        args._source = Ember.computed(function() {
          return current.get("source");
        });

        var otherParams = current.get("options.otherParams");
        var from, to;
        for (from in otherParams) {
          to = otherParams[from];
          args[to] = Ember.computed.alias("_source."+from);
        }

        var actions = current.get("options.actions") || {};

        // Override sendAction in the modal component so we can intercept and
        // dynamically dispatch to the controller as expected
        args.sendAction = function(name) {
          var actionName = actions[name];
          if (!actionName) {
            this._super.apply(this, Array.prototype.slice.call(arguments));
            return;
          }

          var controller = current.get("source");
          var args = Array.prototype.slice.call(arguments, 1);
          args.unshift(actionName);
          controller.send.apply(controller, args);
        };

        return component.extend(args);
      }),

      actions: {
        outsideClick: function() {
          if (this.get('currentContext.options.dismissWithOutsideClick')) {
            this.send('dismiss');
          } else {
            proxyToInnerInstance(this, 'outsideClick');
          }
        },
        escape: function() {
          if (this.get('currentContext.options.dismissWithEscape')) {
            this.send('dismiss');
          } else {
            proxyToInnerInstance(this, 'escape');
          }
        },
        dismiss: function() {
          var source = this.get('currentContext.source'),
              proto = source.constructor.proto(),
              params = this.get('currentContext.options.withParams'),
              clearThem = {};

          for (var key in params) {
            clearThem[key] = proto[key];
          }
          source.setProperties(clearThem);
        }
      }
    });

    function proxyToInnerInstance(self, message) {
      var vi = self.get('innerViewInstance');
      if (vi) {
        vi.send(message);
      }
    }
  });
;define("app/components/liquid-spacer", 
  ["ember","liquid-fire/promise","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Promise = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend({
      growDuration: 250,
      growPixelsPerSecond: 200,
      growEasing: 'slide',
      enabled: true,
      
      didInsertElement: function() {
        var child = this.$('> div');
        this.$().css({
          overflow: 'hidden',
          width: child.width(),
          height: child.height()
        });
      },

      sizeChange: Ember.observer('width', 'height', function() {
        var elt = this.$();
        if (!this.get('enabled')) {
          elt.width(this.get('width'));
          elt.height(this.get('height'));
          return Promise.resolve();
        }
        return Promise.all([
          this.adaptDimension(elt, 'width'),
          this.adaptDimension(elt, 'height')
        ]);
      }),

      adaptDimension: function(elt, dimension) {
        var have = elt[dimension]();
        var want = this.get(dimension);
        var target = {};
        target[dimension] = want;

        return Ember.$.Velocity(elt[0], target, {
          duration: this.durationFor(have, want),
          queue: false,
          easing: this.get('growEasing')      
        });
      },

      durationFor: function(before, after) {
        return Math.min(this.get('growDuration'), 1000*Math.abs(before - after)/this.get('growPixelsPerSecond'));
      },

      
    });
  });
;define("app/components/lm-container", 
  ["ember","liquid-fire/tabbable","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*
       Parts of this file were adapted from ic-modal

       https://github.com/instructure/ic-modal
       Released under The MIT License (MIT)
       Copyright (c) 2014 Instructure, Inc.
    */

    var Ember = __dependency1__["default"];

    /**
     * If you do something to move focus outside of the browser (like
     * command+l to go to the address bar) and then tab back into the
     * window, capture it and focus the first tabbable element in an active
     * modal.
     */
    var lastOpenedModal = null;
    Ember.$(document).on('focusin', handleTabIntoBrowser);

    function handleTabIntoBrowser() {
      if (lastOpenedModal) {
        lastOpenedModal.focus();
      }
    }


    __exports__["default"] = Ember.Component.extend({
      classNames: ['lm-container'],
      attributeBindings: ['tabindex'],
      tabindex: 0,

      keyUp: function(event) {
        // Escape key
        if (event.keyCode === 27) {
          this.sendAction();
        }
      },

      keyDown: function(event) {
        // Tab key
        if (event.keyCode === 9) {
          this.constrainTabNavigation(event);
        }
      },

      didInsertElement: function() {
        this.focus();
        lastOpenedModal = this;
      },

      willDestroy: function() {
        lastOpenedModal = null;
      },

      focus: function() {
        if (this.get('element').contains(document.activeElement)) {
          // just let it be if we already contain the activeElement
          return;
        }
        var target = this.$('[autofocus]');
        if (!target.length) {
          target = this.$(':tabbable');
        }

        if (!target.length) {
          target = this.$();
        }

        target[0].focus();
      },

      constrainTabNavigation: function(event) {
        var tabbable = this.$(':tabbable');
        var finalTabbable = tabbable[event.shiftKey ? 'first' : 'last']()[0];
        var leavingFinalTabbable = (
          finalTabbable === document.activeElement ||
            // handle immediate shift+tab after opening with mouse
            this.get('element') === document.activeElement
        );
        if (!leavingFinalTabbable) { return; }
        event.preventDefault();
        tabbable[event.shiftKey ? 'last' : 'first']()[0].focus();
      }
    });
  });
;define("liquid-fire/tabbable", 
  ["ember"],
  function(__dependency1__) {
    "use strict";
    /*!
     * Adapted from jQuery UI core
     *
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/category/ui-core/
     */

    var Ember = __dependency1__["default"];

    var $ = Ember.$;

    function focusable( element, isTabIndexNotNaN ) {
      var nodeName = element.nodeName.toLowerCase();
      return ( /input|select|textarea|button|object/.test( nodeName ) ?
        !element.disabled :
        "a" === nodeName ?
          element.href || isTabIndexNotNaN :
          isTabIndexNotNaN) && visible( element );
    }

    function visible(element) {
      var $el = $(element);
      return $.expr.filters.visible(element) &&
        !$($el, $el.parents()).filter(function() {
          return $.css( this, "visibility" ) === "hidden";
        }).length;
    }

    if (!$.expr[':'].tabbable) {
      $.expr[':'].tabbable = function( element ) {
        var tabIndex = $.attr( element, "tabindex" ),
          isTabIndexNaN = isNaN( tabIndex );
        return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
      };
    }
  });
;define("app/helpers/liquid-bind", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* liquid-bind is really just liquid-with with a pre-provided block
       that just says {{this}} */

    var isHTMLBars = !!Ember.HTMLBars;

    function liquidBindHelperFunc() {
      var options, container;

      if (isHTMLBars) {
        options = arguments[2];
        container = this.container;
      } else {
        options = arguments[arguments.length - 1];
        container = options.data.view.container;
      }

      var liquidWithSelf = container.lookupFactory('template:liquid-with-self');
      var liquidWith = container.lookupFactory('helper:liquid-with');

      if (isHTMLBars) {
        options.template = liquidWithSelf;
      } else {
        options.fn = liquidWithSelf;
      }

      if (isHTMLBars) {
        liquidWith.helperFunction.apply(this, arguments);
      } else {
        return liquidWith.apply(this, arguments);
      }
    }

    var liquidBindHelper = liquidBindHelperFunc;
    if (Ember.HTMLBars) {
      liquidBindHelper = {
        isHTMLBars: true,
        helperFunction: liquidBindHelperFunc,
        preprocessArguments: function() { }
      };
    }

    __exports__["default"] = liquidBindHelper;
  });
;define("app/helpers/liquid-if", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var isHTMLBars = !!Ember.HTMLBars;

    function factory(invert) {
      function helperFunc() {
        var property, hash, options, env, container;

        if (isHTMLBars) {
          property = arguments[0][0];
          hash = arguments[1];
          options = arguments[2];
          env = arguments[3];
          container = this.container;
        } else {
          property = arguments[0];
          options = arguments[1];
          hash = options.hash;
          container = options.data.view.container;
        }
        var View = container.lookupFactory('view:liquid-if');

        var templates = [options.fn || options.template, options.inverse];
        if (invert) {
          templates.reverse();
        }
        delete options.fn;
        delete options.template;
        delete options.inverse;

        if (hash.containerless) {
          View = View.extend(Ember._Metamorph);
        }

        hash.templates = templates;

        if (isHTMLBars) {
          hash.showFirst = property;
          env.helpers.view.helperFunction.call(this, [View], hash, options, env);
        } else {
          hash.showFirstBinding = property;
          return Ember.Handlebars.helpers.view.call(this, View, options);
        }
      }

      if (Ember.HTMLBars) {
        return {
          isHTMLBars: true,
          helperFunction: helperFunc,
          preprocessArguments: function() { }
        };
      } else {
        return helperFunc;
      }
    }

    __exports__.factory = factory;
    __exports__["default"] = factory(false);
  });
;define("app/helpers/liquid-measure", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = function(){
      Ember.assert("liquid-measure is deprecated, see CHANGELOG.md", false);
    }
  });
;define("app/helpers/liquid-outlet", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var isHTMLBars = !!Ember.HTMLBars;

    function liquidOutletHelperFunc(property, options) {
      var property, options, container, hash, env;

      if (isHTMLBars) {
        property = arguments[0][0]; // params[0]
        hash = arguments[1];
        options = arguments[2];
        env = arguments[3];
        container = this.container;

        if (!property) {
          property = 'main';
          options.paramTypes = ['string'];
        }
      } else {
        property = arguments[0];

        if (property && property.data && property.data.isRenderData) {
          options = property;
          property = 'main';
          options.types.push('STRING');
        }

        container = options.data.view.container;
        hash = options.hash;
      }

      var View = container.lookupFactory('view:liquid-outlet');
      if (hash.containerless) {
        View = View.extend(Ember._Metamorph);
      }
      hash.viewClass = View;

      if (isHTMLBars) {
        env.helpers.outlet.helperFunction.call(this, [property], hash, options, env);
      } else {
        return Ember.Handlebars.helpers.outlet.call(this, property, options);
      }
    }

    var liquidOutletHelper = liquidOutletHelperFunc;
    if (Ember.HTMLBars) {
      liquidOutletHelper = {
        isHTMLBars: true,
        helperFunction: liquidOutletHelperFunc,
        preprocessArguments: function() { }
      };
    }

    __exports__["default"] = liquidOutletHelper;
  });
;define("app/helpers/liquid-unless", 
  ["app/helpers/liquid-if","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var factory = __dependency1__.factory;
    __exports__["default"] = factory(true);
  });
;define("app/helpers/liquid-with", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var isHTMLBars = !!Ember.HTMLBars;

    function liquidWithHelperFunc() {
      var params, context, options, container, innerOptions, data, hash, env;

      var innerOptions = {
        hashTypes: {}
      };

      var innerHash = {};

      if (isHTMLBars) {
        params = arguments[0]
        hash = arguments[1];
        options = arguments[2];
        env = arguments[3];
        context = params[0];
        container = this.container;
        data = arguments[3].data;
        innerOptions.morph = options.morph;

        if (params.length === 3) {
          hash.keywordName = params[2]._label;
          params = [context];
        }
      } else {
        params = Array.prototype.slice.apply(arguments, [0, -1]);
        context = arguments[0];
        options = arguments[arguments.length-1];
        data = options.data;
        hash = options.hash;
        container = data.view.container;
        innerOptions.data = data;
        innerOptions.hash = innerHash;
      }

      var View = container.lookupFactory('view:liquid-with');

      View = View.extend({
        originalArgs: params,
        originalHash: hash,
        originalHashTypes: options.hashTypes,
        innerTemplate: options.fn || options.template
      });

      if (hash.containerless) {
        View = View.extend(Ember._Metamorph);
      }

      innerHash.boundContextBinding = context;

      [
        'class',
        'classNames',
        'classNameBindings',
        'use',
        'id',
        'growDuration',
        'growPixelsPerSecond',
        'growEasing',
        'enableGrowth',
        'containerless'
      ].forEach(function(field){
        if (hash.hasOwnProperty(field)) {
          innerHash[field] = hash[field];
          innerOptions.hashTypes[field] = options.hashTypes ? options.hashTypes[field] : undefined;
        }
      });


      if (isHTMLBars) {
        env.helpers.view.helperFunction.call(this, [View], innerHash, innerOptions, env);
      } else {
        return Ember.Handlebars.helpers.view.call(this, View, innerOptions);
      }
    }

    var liquidWithHelper = liquidWithHelperFunc;
    if (isHTMLBars) {
      liquidWithHelper = {
        isHTMLBars: true,
        helperFunction: liquidWithHelperFunc,
        preprocessArguments: function() { }
      };
    }

    __exports__["default"] = liquidWithHelper;
  });
;define("app/helpers/with-apply", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var isHTMLBars = !!Ember.HTMLBars;

    // This helper is internal to liquid-with.
    function withApplyHelperFunc() {
      var hash, options, env, view;

      if (isHTMLBars) {
        hash = arguments[1];
        options = arguments[2];
        env = arguments[3];
        view = this;
      } else {
        options = arguments[0];
        hash = options.hash;
        view = options.data.view;
      }

      var parent = view.get('liquidWithParent');
      var withArgs = parent.get('originalArgs').slice();

      withArgs[0] = 'lwith-view.boundContext';
      options = Ember.copy(options);

      // This works to inject our keyword in Ember >= 1.9
      if (!view._keywords) {
        view._keywords = {};
      }
      view._keywords['lwith-view'] = view;

      // This works to inject our keyword in Ember < 1.9
      if (!isHTMLBars) {
        if (!options.data.keywords) {
          options.data.keywords = {};
        }
        options.data.keywords['lwith-view'] = view;
      }

      if (isHTMLBars) {
        options.template = parent.get('innerTemplate');
      } else {
        options.fn = parent.get('innerTemplate');
      }

      hash = parent.get('originalHash');
      options.hashTypes = parent.get('originalHashTypes');

      if (isHTMLBars) {
        env.helpers["with"].helperFunction.call(this, [view.getStream(withArgs[0])], hash, options, env);
      } else {
        options.hash = hash;
        withArgs.push(options);
        return Ember.Handlebars.helpers["with"].apply(this, withArgs);
      }
    }

    var withApplyHelper = withApplyHelperFunc;
    if (Ember.HTMLBars) {
      withApplyHelper = {
        isHTMLBars: true,
        helperFunction: withApplyHelperFunc,
        preprocessArguments: function() { }
      };
    }

    __exports__["default"] = withApplyHelper;
  });
;define("app/initializers/liquid-fire", 
  ["liquid-fire","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var initialize = __dependency1__.initialize;
    var Ember = __dependency2__["default"];

    __exports__["default"] = {
      name: 'liquid-fire',

      initialize: function(container) {
        if (!Ember.$.Velocity) {
          Ember.warn("Velocity.js is missing");
        } else {
          var version = Ember.$.Velocity.version;
          var recommended = [0, 11, 8];
          if (Ember.compare(recommended, [version.major, version.minor, version.patch]) === 1) {
            Ember.warn("You should probably upgrade Velocity.js, recommended minimum is " + recommended.join('.'));
          }
        }

        initialize(container);
      }
    };
  });
;define("app/templates/components/liquid-measured", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "yield");
          return fragment;
        }
      };
    }()));
  });
;define("app/templates/components/liquid-modal", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("    ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"role","dialog");
              var el2 = dom.createTextNode("\n      ");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n    ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n    ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              var morph0 = dom.createMorphAt(element0,0,1);
              var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
              element(env, element0, context, "bind-attr", [], {"class": ":lf-dialog cc.options.dialogClass"});
              element(env, element0, context, "bind-attr", [], {"aria-labelledby": "cc.options.ariaLabelledBy", "aria-label": "cc.options.ariaLabel"});
              inline(env, morph0, context, "view", [get(env, context, "innerView")], {"dismiss": "dismiss"});
              inline(env, morph1, context, "lf-overlay", [], {"clickAway": "outsideClick"});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "lm-container", [], {"action": "escape"}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "liquid-with", [get(env, context, "currentContext"), get(env, context, "as"), get(env, context, "cc")], {"class": "lm-with", "containerless": true}, child0, null);
          return fragment;
        }
      };
    }()));
  });
;define("app/templates/components/liquid-spacer", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            content(env, morph0, context, "yield");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "liquid-measured", [], {"width": get(env, context, "width"), "height": get(env, context, "height")}, child0, null);
          return fragment;
        }
      };
    }()));
  });
;define("app/templates/liquid-with-self", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "this");
          return fragment;
        }
      };
    }()));
  });
;define("app/templates/liquid-with", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "with-apply");
          return fragment;
        }
      };
    }()));
  });
;define("app/transitions/cross-fade", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // BEGIN-SNIPPET cross-fade-definition
    var animate = __dependency1__.animate;
    var stop = __dependency1__.stop;
    var Promise = __dependency1__.Promise;
    __exports__["default"] = function crossFade(oldView, insertNewView, opts) {
      stop(oldView);
      return insertNewView().then(function(newView) {
        return Promise.all([
          animate(oldView, {opacity: 0}, opts),
          animate(newView, {opacity: [1, 0]}, opts)
        ]);
      });
    }
    // END-SNIPPET
  });
;define("app/transitions/fade", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // BEGIN-SNIPPET fade-definition
    var isAnimating = __dependency1__.isAnimating;
    var finish = __dependency1__.finish;
    var timeSpent = __dependency1__.timeSpent;
    var animate = __dependency1__.animate;
    var stop = __dependency1__.stop;
    __exports__["default"] = function fade(oldView, insertNewView, opts) {
      var firstStep,
          outOpts = opts;

      if (isAnimating(oldView, 'fade-out')) {
        // if the old view is already fading out, let it finish.
        firstStep = finish(oldView, 'fade-out');
      } else {
        if (isAnimating(oldView, 'fade-in')) {
          // if the old view is partially faded in, scale its fade-out
          // duration appropriately.
          outOpts = { duration: timeSpent(oldView, 'fade-in') };
        }
        stop(oldView);
        firstStep = animate(oldView, {opacity: 0}, outOpts, 'fade-out');
      }

      return firstStep.then(insertNewView).then(function(newView){
        return animate(newView, {opacity: [1, 0]}, opts, 'fade-in');
      });
    }
    // END-SNIPPET
  });
;define("app/transitions/flex-grow", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var animate = __dependency1__.animate;
    var stop = __dependency1__.stop;
    var Promise = __dependency1__.Promise;
    __exports__["default"] = function flexGrow(oldView, insertNewView, opts) {
      stop(oldView);
      return insertNewView().then(function(newView) {
        return Promise.all([
          animate(oldView, {'flex-grow': 0}, opts),
          animate(newView, {'flex-grow': [1, 0]}, opts)
        ]);
      });
    }
  });
;define("app/transitions/modal-popup", 
  ["ember","liquid-fire","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Promise = __dependency2__.Promise;
    var Velocity = Ember.$.Velocity;

    function hideModal(oldView) {
      var box, obscure;
      if (!oldView ||
          !(box = oldView.$('.lm-container > div')) ||
          !(box = box[0]) ||
          !(obscure = oldView.$('.lf-overlay')) ||
          !(obscure = obscure[0])) {
        return Promise.resolve();
      }

      return Promise.all([
        Velocity.animate(obscure, {opacity: [0, 0.5]}, {duration: 250}),
        Velocity.animate(box, {scale: [0, 1]}, {duration: 250})
      ]);
    }

    function revealModal(insertNewView) {
      return insertNewView().then(function(newView){
        var box, obscure;
        if (!newView ||
            !(box = newView.$('.lm-container > div')[0]) ||
            !(obscure = newView.$('.lf-overlay')[0])) {
          return;
        }

        // we're not going to animate the whole view, rather we're going
        // to animate two pieces of it separately. So we move the view
        // properties down onto the individual elements, so that the
        // animate function can reveal them at precisely the right time.
        Ember.$(box).css({
          display: 'none'
        });

        Ember.$(obscure).css({
          display: 'none'
        });
        newView.$().css({
          display: '',
          visibility: ''
        });

        return Promise.all([
          Velocity.animate(obscure, {opacity: [0.5, 0]}, {duration: 250, display: ''}),
          Velocity.animate(box, {scale: [1, 0]}, {duration: 250, display: ''})
        ]);
      });
    }

    __exports__["default"] = function modalPopup(oldView, insertNewView) {
      return hideModal(oldView).then(function() {
        return revealModal(insertNewView);
      });
    }
  });
;define("app/transitions/move-over", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var stop = __dependency1__.stop;
    var animate = __dependency1__.animate;
    var Promise = __dependency1__.Promise;
    var isAnimating = __dependency1__.isAnimating;
    var finish = __dependency1__.finish;

    __exports__["default"] = function moveOver(oldView, insertNewView, dimension, direction, opts) {
      var oldParams = {},
          newParams = {},
          firstStep,
          property,
          measure;

      if (dimension.toLowerCase() === 'x') {
        property = 'translateX';
        measure = 'width';
      } else {
        property = 'translateY';
        measure = 'height';
      }

      if (isAnimating(oldView, 'moving-in')) {
        firstStep = finish(oldView, 'moving-in');
      } else {
        stop(oldView);
        firstStep = Promise.resolve();
      }


      return firstStep.then(insertNewView).then(function(newView){
        if (newView && newView.$() && oldView && oldView.$()) {
          var sizes = [parseInt(newView.$().css(measure), 10),
                       parseInt(oldView.$().css(measure), 10)];
          var bigger = Math.max.apply(null, sizes);
          oldParams[property] = (bigger * direction) + 'px';
          newParams[property] = ["0px", (-1 * bigger * direction) + 'px'];
        } else {
          oldParams[property] = (100 * direction) + '%';
          newParams[property] = ["0%", (-100 * direction) + '%'];
        }

        return Promise.all([
          animate(oldView, oldParams, opts),
          animate(newView, newParams, opts, 'moving-in')
        ]);
      });
    }
  });
;define("app/transitions/scroll-then", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = function() {
      Ember.assert(
        "You must provide a transition name as the first argument to scrollThen. Example: this.use('scrollThen', 'toLeft')",
        'string' === typeof arguments[2]
      );

      var el = document.getElementsByTagName('html'),
          transitionArgs = Array.prototype.slice.call(arguments, 0, 2),
          nextTransition = this.lookup(arguments[2]),
          self = this,
          options = arguments[3] || {};

      Ember.assert(
        "The second argument to scrollThen is passed to Velocity's scroll function and must be an object",
        'object' === typeof options
      );

      // set scroll options via: this.use('scrollThen', 'ToLeft', {easing: 'spring'})
      options = Ember.merge({duration: 500, offset: 0}, options);

      // additional args can be passed through after the scroll options object
      // like so: this.use('scrollThen', 'moveOver', {duration: 100}, 'x', -1);
      transitionArgs.push.apply(transitionArgs, Array.prototype.slice.call(arguments, 4));

      return window.$.Velocity(el, 'scroll', options).then(function() {
        nextTransition.apply(self, transitionArgs);
      });
    }
  });
;define("app/transitions/to-down", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'y', 1);
  });
;define("app/transitions/to-left", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'x', -1);
  });
;define("app/transitions/to-right", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'x', 1);
  });
;define("app/transitions/to-up", 
  ["liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'y', -1);
  });
;define("app/views/liquid-child", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.ContainerView.extend({
      classNames: ['liquid-child'],
      resolveInsertionPromise: Ember.on('didInsertElement', function(){
        // Children start out hidden and invisible.
        // Measurement will `show` them and Velocity will make them visible.
        // This prevents a flash of pre-animated content.
        this.$().css({visibility: 'hidden'}).hide();
        if (this._resolveInsertion) {
          this._resolveInsertion(this);
        }
      })
    });
  });
;define("app/views/liquid-if", 
  ["app/views/liquid-outlet","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var LiquidOutlet = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    var isHTMLBars = !!Ember.HTMLBars;

    __exports__["default"] = LiquidOutlet.extend({
      liquidUpdate: Ember.on('init', Ember.observer('showFirst', function(){
        var template = this.get('templates')[this.get('showFirst') ? 0 : 1];
        if (!template || !isHTMLBars && template === Ember.Handlebars.VM.noop) {
          this.set('currentView', null);
          return;
        }
        var view = Ember._MetamorphView.create({
          container: this.container,
          template: template,
          liquidParent: this,
          contextBinding: 'liquidParent.context',
          liquidContext: this.get("showFirst"),
          hasLiquidContext: true
        });
        this.set('currentView', view);
      }))

    });
  });
;define("app/views/liquid-outlet", 
  ["ember","liquid-fire","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Promise = __dependency2__.Promise;
    var animate = __dependency2__.animate;
    var stop = __dependency2__.stop;
    var capitalize = Ember.String.capitalize;

    __exports__["default"] = Ember.ContainerView.extend({
      classNames: ['liquid-container'],
      growDuration: 250,
      growPixelsPerSecond: 200,
      growEasing: 'slide',
      enableGrowth: true,

      init: function(){
        // The ContainerView constructor normally sticks our "currentView"
        // directly into _childViews, but we want to leave that up to
        // _currentViewDidChange so we have the opportunity to launch a
        // transition.
        this._super();
        Ember.A(this._childViews).clear();

        if (this.get('containerless')) {
          // This prevents Ember from throwing an assertion when we try to
          // render as a virtual view.
          this.set('innerClassNameBindings', this.get('classNameBindings'));
          this.set('classNameBindings', Ember.A());
        }
      },

      // Deliberately overriding a private method from
      // Ember.ContainerView!
      //
      // We need to stop it from destroying our outgoing child view
      // prematurely.
      _currentViewWillChange: Ember.beforeObserver('currentView', function() {}),

      // Deliberately overriding a private method from
      // Ember.ContainerView!
      _currentViewDidChange: Ember.on('init', Ember.observer('currentView', function() {
        // Normally there is only one child (the view we're
        // replacing). But sometimes there may be two children (because a
        // transition is already in progress). In any case, we tell all of
        // them to start heading for the exits now.

        var oldView = this.get('childViews.lastObject'),
            newView = this.get('currentView'),
            firstTime;

        // For the convenience of the transition rules, we explicitly
        // track our first transition, which happens at initial render.
        firstTime = !this._hasTransitioned;
        this._hasTransitioned = true;

        // Idempotence
        if ((!oldView && !newView) ||
            (oldView && oldView.get('currentView') === newView) ||
            (this._runningTransition &&
             this._runningTransition.oldView === oldView &&
             this._runningTransition.newContent === newView
            )) {
          return;
        }

        // `transitions` comes from dependency injection, see the
        // liquid-fire app initializer.
        var transition = this.get('transitions').transitionFor(this, oldView, newView, this.get('use'), firstTime);

        if (this._runningTransition) {
          this._runningTransition.interrupt();
        }

        this._runningTransition = transition;
        transition.run()["catch"](function(err){
          // Force any errors through to the RSVP error handler, because
          // of https://github.com/tildeio/rsvp.js/pull/278.  The fix got
          // into Ember 1.7, so we can drop this once we decide 1.6 is
          // EOL.
          Ember.RSVP.Promise.resolve()._onerror(err);
        });
      })),

      _liquidChildFor: function(content) {
        if (content && !content.get('hasLiquidContext')){
          content.set('liquidContext', content.get('context'));
        }
        var LiquidChild = this.container.lookupFactory('view:liquid-child');
        var childProperties = {
          currentView: content
        };
        if (this.get('containerless')) {
          childProperties.classNames = this.get('classNames').without('liquid-container');
          childProperties.classNameBindings = this.get('innerClassNameBindings');
        }
        return LiquidChild.create(childProperties);
      },

      _pushNewView: function(newView) {
        if (!newView) {
          return Promise.resolve();
        }
        var child = this._liquidChildFor(newView),
            promise = new Promise(function(resolve) {
              child._resolveInsertion = resolve;
            });
        this.pushObject(child);
        return promise;
      },

      cacheSize: function() {
        var elt = this.$();
        if (elt) {
          // Measure original size.
          this._cachedSize = getSize(elt);
        }
      },

      unlockSize: function() {
        var self = this;
        function doUnlock(){
          var elt = self.$();
          if (elt) {
            elt.css({width: '', height: ''});
          }
        }
        if (this._scaling) {
          this._scaling.then(doUnlock);
        } else {
          doUnlock();
        }
      },

      _durationFor: function(before, after) {
        return Math.min(this.get('growDuration'), 1000*Math.abs(before - after)/this.get('growPixelsPerSecond'));
      },

      _adaptDimension: function(dimension, before, after) {
        if (before[dimension] === after[dimension] || !this.get('enableGrowth')) {
          var elt = this.$();
          if (elt) {
            elt[dimension](after[dimension]);
          }
          return Promise.resolve();
        } else {
          // Velocity deals in literal width/height, whereas jQuery deals
          // in box-sizing-dependent measurements.
          var target = {};
          target[dimension] = [
            after['literal'+capitalize(dimension)],
            before['literal'+capitalize(dimension)],
          ];
          return animate(this, target, {
            duration: this._durationFor(before[dimension], after[dimension]),
            queue: false,
            easing: this.get('growEasing')
          });
        }
      },

      adaptSize: function() {
        stop(this);

        var elt = this.$();
        if (!elt) { return; }

        // Measure new size.
        var newSize = getSize(elt);
        if (typeof(this._cachedSize) === 'undefined') {
          this._cachedSize = newSize;
        }

        // Now that measurements have been taken, lock the size
        // before the invoking the scaling transition.
        elt.width(this._cachedSize.width);
        elt.height(this._cachedSize.height);

        this._scaling = Promise.all([
          this._adaptDimension('width', this._cachedSize, newSize),
          this._adaptDimension('height', this._cachedSize, newSize),
        ]);
      }

    });

    // We're tracking both jQuery's box-sizing dependent measurements and
    // the literal CSS properties, because it's nice to get/set dimensions
    // with jQuery and not worry about boz-sizing *but* Velocity needs the
    // raw values.
    function getSize(elt) {
      return {
        width: elt.width(),
        literalWidth: parseInt(elt.css('width'),10),
        height: elt.height(),
        literalHeight: parseInt(elt.css('height'),10)
      };
    }
  });
;define("app/views/liquid-with", 
  ["app/views/liquid-outlet","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var LiquidOutlet = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    __exports__["default"] = LiquidOutlet.extend({
      liquidUpdate: Ember.on('init', Ember.observer('boundContext', function(){
        var context = this.get('boundContext');
        if (Ember.isEmpty(context)) {
          this.set('currentView', null);
          return;
        }
        var view = Ember._MetamorphView.create({
          container: this.container,
          templateName: 'liquid-with',
          boundContext: context,
          liquidWithParent: this,
          liquidContext: context,
          hasLiquidContext: true,
        });
        this.set('currentView', view);
      }))

    });
  });
;define('liquid-fire-shim', ["exports"], function(__exports__) {__exports__.initialize = function(container){
container.register('component:lf-overlay', require('app/components/lf-overlay')['default']);
container.register('component:lf-overlay'.camelize(), require('app/components/lf-overlay')['default']);
container.register('component:liquid-measured', require('app/components/liquid-measured')['default']);
container.register('component:liquid-measured'.camelize(), require('app/components/liquid-measured')['default']);
container.register('component:liquid-modal', require('app/components/liquid-modal')['default']);
container.register('component:liquid-modal'.camelize(), require('app/components/liquid-modal')['default']);
container.register('component:liquid-spacer', require('app/components/liquid-spacer')['default']);
container.register('component:liquid-spacer'.camelize(), require('app/components/liquid-spacer')['default']);
container.register('component:lm-container', require('app/components/lm-container')['default']);
container.register('component:lm-container'.camelize(), require('app/components/lm-container')['default']);
container.register('helper:liquid-bind', require('app/helpers/liquid-bind')['default']);
container.register('helper:liquid-bind'.camelize(), require('app/helpers/liquid-bind')['default']);
container.register('helper:liquid-if', require('app/helpers/liquid-if')['default']);
container.register('helper:liquid-if'.camelize(), require('app/helpers/liquid-if')['default']);
container.register('helper:liquid-measure', require('app/helpers/liquid-measure')['default']);
container.register('helper:liquid-measure'.camelize(), require('app/helpers/liquid-measure')['default']);
container.register('helper:liquid-outlet', require('app/helpers/liquid-outlet')['default']);
container.register('helper:liquid-outlet'.camelize(), require('app/helpers/liquid-outlet')['default']);
container.register('helper:liquid-unless', require('app/helpers/liquid-unless')['default']);
container.register('helper:liquid-unless'.camelize(), require('app/helpers/liquid-unless')['default']);
container.register('helper:liquid-with', require('app/helpers/liquid-with')['default']);
container.register('helper:liquid-with'.camelize(), require('app/helpers/liquid-with')['default']);
container.register('helper:with-apply', require('app/helpers/with-apply')['default']);
container.register('helper:with-apply'.camelize(), require('app/helpers/with-apply')['default']);
container.register('template:components/liquid-measured', require('app/templates/components/liquid-measured')['default']);
container.register('template:components/liquid-measured'.camelize(), require('app/templates/components/liquid-measured')['default']);
container.register('template:components/liquid-modal', require('app/templates/components/liquid-modal')['default']);
container.register('template:components/liquid-modal'.camelize(), require('app/templates/components/liquid-modal')['default']);
container.register('template:components/liquid-spacer', require('app/templates/components/liquid-spacer')['default']);
container.register('template:components/liquid-spacer'.camelize(), require('app/templates/components/liquid-spacer')['default']);
container.register('template:liquid-with-self', require('app/templates/liquid-with-self')['default']);
container.register('template:liquid-with-self'.camelize(), require('app/templates/liquid-with-self')['default']);
container.register('template:liquid-with', require('app/templates/liquid-with')['default']);
container.register('template:liquid-with'.camelize(), require('app/templates/liquid-with')['default']);
container.register('transition:cross-fade', require('app/transitions/cross-fade')['default']);
container.register('transition:cross-fade'.camelize(), require('app/transitions/cross-fade')['default']);
container.register('transition:fade', require('app/transitions/fade')['default']);
container.register('transition:fade'.camelize(), require('app/transitions/fade')['default']);
container.register('transition:flex-grow', require('app/transitions/flex-grow')['default']);
container.register('transition:flex-grow'.camelize(), require('app/transitions/flex-grow')['default']);
container.register('transition:modal-popup', require('app/transitions/modal-popup')['default']);
container.register('transition:modal-popup'.camelize(), require('app/transitions/modal-popup')['default']);
container.register('transition:move-over', require('app/transitions/move-over')['default']);
container.register('transition:move-over'.camelize(), require('app/transitions/move-over')['default']);
container.register('transition:scroll-then', require('app/transitions/scroll-then')['default']);
container.register('transition:scroll-then'.camelize(), require('app/transitions/scroll-then')['default']);
container.register('transition:to-down', require('app/transitions/to-down')['default']);
container.register('transition:to-down'.camelize(), require('app/transitions/to-down')['default']);
container.register('transition:to-left', require('app/transitions/to-left')['default']);
container.register('transition:to-left'.camelize(), require('app/transitions/to-left')['default']);
container.register('transition:to-right', require('app/transitions/to-right')['default']);
container.register('transition:to-right'.camelize(), require('app/transitions/to-right')['default']);
container.register('transition:to-up', require('app/transitions/to-up')['default']);
container.register('transition:to-up'.camelize(), require('app/transitions/to-up')['default']);
container.register('view:liquid-child', require('app/views/liquid-child')['default']);
container.register('view:liquid-child'.camelize(), require('app/views/liquid-child')['default']);
container.register('view:liquid-if', require('app/views/liquid-if')['default']);
container.register('view:liquid-if'.camelize(), require('app/views/liquid-if')['default']);
container.register('view:liquid-outlet', require('app/views/liquid-outlet')['default']);
container.register('view:liquid-outlet'.camelize(), require('app/views/liquid-outlet')['default']);
container.register('view:liquid-with', require('app/views/liquid-with')['default']);
container.register('view:liquid-with'.camelize(), require('app/views/liquid-with')['default']);
};});
;/* global define, require */

define('ember', ["exports"], function(__exports__) {
  __exports__['default'] = window.Ember;
});
define('liquid-fire', ["exports"], function(__exports__) {
  var lf = require('liquid-fire/index');
  Object.keys(lf).forEach(function(key) {
    __exports__[key] = lf[key];
  });
});

window.LiquidFire = require('liquid-fire/index');
window.LiquidFire._deferredMaps = [];
window.LiquidFire._deferredDefines = [];

window.LiquidFire.map = function(handler) {
  window.LiquidFire._deferredMaps.push(handler);
};

window.LiquidFire.defineTransition = function(name, implementation) {
  window.LiquidFire._deferredDefines.push([name, implementation]);
};

window.Ember.Application.initializer({
  name: 'liquid-fire-standalone',
  initialize: function(container) {
    require('liquid-fire-shim').initialize(container);
    require('liquid-fire/index').initialize(container);

    window.LiquidFire._deferredDefines.forEach(function(pair){
      container.register('transition:' + pair[0], pair[1]);
    });

    container.register('transitions:main', function() {
      var self = this;
      window.LiquidFire._deferredMaps.forEach(function(m){
        m.apply(self);
      });
    });

  }
});
})();