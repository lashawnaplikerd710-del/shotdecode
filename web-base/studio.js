var RM = Object.create;
var xS = Object.defineProperty;
var kM = Object.getOwnPropertyDescriptor;
var DM = Object.getOwnPropertyNames;
var OM = Object.getPrototypeOf, PM = Object.prototype.hasOwnProperty;
var Qo = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (a) {
    throw t = 0, a;
  }
};
var UM = (e, t, a, o) => {
  if (t && typeof t == "object" || typeof t == "function") for (let l of DM(t)) !PM.call(e, l) && l !== a && xS(e, l, { get: () => t[l], enumerable: !(o = kM(t, l)) || o.enumerable });
  return e;
};
var N = (e, t, a) => (a = e != null ? RM(OM(e)) : {}, UM(t || !e || !e.__esModule ? xS(a, "default", { value: e, enumerable: true }) : a, e));
var DS = Qo((J) => {
  "use strict";
  var yh = /* @__PURE__ */ Symbol.for("react.transitional.element"), BM = /* @__PURE__ */ Symbol.for("react.portal"), NM = /* @__PURE__ */ Symbol.for("react.fragment"), HM = /* @__PURE__ */ Symbol.for("react.strict_mode"), qM = /* @__PURE__ */ Symbol.for("react.profiler"), FM = /* @__PURE__ */ Symbol.for("react.consumer"), zM = /* @__PURE__ */ Symbol.for("react.context"), VM = /* @__PURE__ */ Symbol.for("react.forward_ref"), GM = /* @__PURE__ */ Symbol.for("react.suspense"), XM = /* @__PURE__ */ Symbol.for("react.memo"), IS = /* @__PURE__ */ Symbol.for("react.lazy"), KM = /* @__PURE__ */ Symbol.for("react.activity"), WM = /* @__PURE__ */ Symbol.for("react.view_transition"), SS = Symbol.iterator;
  function YM(e) {
    return e === null || typeof e != "object" ? null : (e = SS && e[SS] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var AS = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, TS = Object.assign, _S = {};
  function pn(e, t, a) {
    this.props = e, this.context = t, this.refs = _S, this.updater = a || AS;
  }
  pn.prototype.isReactComponent = {};
  pn.prototype.setState = function(e, t) {
    if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, e, t, "setState");
  };
  pn.prototype.forceUpdate = function(e) {
    this.updater.enqueueForceUpdate(this, e, "forceUpdate");
  };
  function wS() {
  }
  wS.prototype = pn.prototype;
  function Eh(e, t, a) {
    this.props = e, this.context = t, this.refs = _S, this.updater = a || AS;
  }
  var Ih = Eh.prototype = new wS();
  Ih.constructor = Eh;
  TS(Ih, pn.prototype);
  Ih.isPureReactComponent = true;
  var CS = Array.isArray;
  function Ch() {
  }
  var Xe = { H: null, A: null, T: null, S: null }, MS = Object.prototype.hasOwnProperty;
  function Ah(e, t, a) {
    var o = a.ref;
    return { $$typeof: yh, type: e, key: t, ref: o !== void 0 ? o : null, props: a };
  }
  function jM(e, t) {
    return Ah(e.type, t, e.props);
  }
  function Th(e) {
    return typeof e == "object" && e !== null && e.$$typeof === yh;
  }
  function QM(e) {
    var t = { "=": "=0", ":": "=2" };
    return "$" + e.replace(/[=:]/g, function(a) {
      return t[a];
    });
  }
  var yS = /\/+/g;
  function Sh(e, t) {
    return typeof e == "object" && e !== null && e.key != null ? QM("" + e.key) : t.toString(36);
  }
  function ZM(e) {
    switch (e.status) {
      case "fulfilled":
        return e.value;
      case "rejected":
        throw e.reason;
      default:
        switch (typeof e.status == "string" ? e.then(Ch, Ch) : (e.status = "pending", e.then(function(t) {
          e.status === "pending" && (e.status = "fulfilled", e.value = t);
        }, function(t) {
          e.status === "pending" && (e.status = "rejected", e.reason = t);
        })), e.status) {
          case "fulfilled":
            return e.value;
          case "rejected":
            throw e.reason;
        }
    }
    throw e;
  }
  function mn(e, t, a, o, l) {
    var r = typeof e;
    (r === "undefined" || r === "boolean") && (e = null);
    var i = false;
    if (e === null) i = true;
    else switch (r) {
      case "bigint":
      case "string":
      case "number":
        i = true;
        break;
      case "object":
        switch (e.$$typeof) {
          case yh:
          case BM:
            i = true;
            break;
          case IS:
            return i = e._init, mn(i(e._payload), t, a, o, l);
        }
    }
    if (i) return l = l(e), i = o === "" ? "." + Sh(e, 0) : o, CS(l) ? (a = "", i != null && (a = i.replace(yS, "$&/") + "/"), mn(l, t, a, "", function(d) {
      return d;
    })) : l != null && (Th(l) && (l = jM(l, a + (l.key == null || e && e.key === l.key ? "" : ("" + l.key).replace(yS, "$&/") + "/") + i)), t.push(l)), 1;
    i = 0;
    var n = o === "" ? "." : o + ":";
    if (CS(e)) for (var u = 0; u < e.length; u++) o = e[u], r = n + Sh(o, u), i += mn(o, t, a, r, l);
    else if (u = YM(e), typeof u == "function") for (e = u.call(e), u = 0; !(o = e.next()).done; ) o = o.value, r = n + Sh(o, u++), i += mn(o, t, a, r, l);
    else if (r === "object") {
      if (typeof e.then == "function") return mn(ZM(e), t, a, o, l);
      throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
    }
    return i;
  }
  function Oc(e, t, a) {
    if (e == null) return e;
    var o = [], l = 0;
    return mn(e, o, "", "", function(r) {
      return t.call(a, r, l++);
    }), o;
  }
  function JM(e) {
    if (e._status === -1) {
      var t = e._result, a = t();
      a.then(function(o) {
        (e._status === 0 || e._status === -1) && (e._status = 1, e._result = o, a.status === void 0 && (a.status = "fulfilled", a.value = o));
      }, function(o) {
        (e._status === 0 || e._status === -1) && (e._status = 2, e._result = o, a.status === void 0 && (a.status = "rejected", a.reason = o));
      }), e._status === -1 && (e._status = 0, e._result = a);
    }
    if (e._status === 1) return e._result.default;
    throw e._result;
  }
  var ES = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", { bubbles: true, cancelable: true, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  };
  function RS(e) {
    var t = Xe.T, a = {};
    a.types = t !== null ? t.types : null, Xe.T = a;
    try {
      var o = e(), l = Xe.S;
      l !== null && l(a, o), typeof o == "object" && o !== null && typeof o.then == "function" && o.then(Ch, ES);
    } catch (r) {
      ES(r);
    } finally {
      t !== null && a.types !== null && (t.types = a.types), Xe.T = t;
    }
  }
  function kS(e) {
    var t = Xe.T;
    if (t !== null) {
      var a = t.types;
      a === null ? t.types = [e] : a.indexOf(e) === -1 && a.push(e);
    } else RS(kS.bind(null, e));
  }
  var $M = { map: Oc, forEach: function(e, t, a) {
    Oc(e, function() {
      t.apply(this, arguments);
    }, a);
  }, count: function(e) {
    var t = 0;
    return Oc(e, function() {
      t++;
    }), t;
  }, toArray: function(e) {
    return Oc(e, function(t) {
      return t;
    }) || [];
  }, only: function(e) {
    if (!Th(e)) throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  } };
  J.Activity = KM;
  J.Children = $M;
  J.Component = pn;
  J.Fragment = NM;
  J.Profiler = qM;
  J.PureComponent = Eh;
  J.StrictMode = HM;
  J.Suspense = GM;
  J.ViewTransition = WM;
  J.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Xe;
  J.__COMPILER_RUNTIME = { __proto__: null, c: function(e) {
    return Xe.H.useMemoCache(e);
  } };
  J.addTransitionType = kS;
  J.cache = function(e) {
    return function() {
      return e.apply(null, arguments);
    };
  };
  J.cacheSignal = function() {
    return null;
  };
  J.cloneElement = function(e, t, a) {
    if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
    var o = TS({}, e.props), l = e.key;
    if (t != null) for (r in t.key !== void 0 && (l = "" + t.key), t) !MS.call(t, r) || r === "key" || r === "__self" || r === "__source" || r === "ref" && t.ref === void 0 || (o[r] = t[r]);
    var r = arguments.length - 2;
    if (r === 1) o.children = a;
    else if (1 < r) {
      for (var i = Array(r), n = 0; n < r; n++) i[n] = arguments[n + 2];
      o.children = i;
    }
    return Ah(e.type, l, o);
  };
  J.createContext = function(e) {
    return e = { $$typeof: zM, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null }, e.Provider = e, e.Consumer = { $$typeof: FM, _context: e }, e;
  };
  J.createElement = function(e, t, a) {
    var o, l = {}, r = null;
    if (t != null) for (o in t.key !== void 0 && (r = "" + t.key), t) MS.call(t, o) && o !== "key" && o !== "__self" && o !== "__source" && (l[o] = t[o]);
    var i = arguments.length - 2;
    if (i === 1) l.children = a;
    else if (1 < i) {
      for (var n = Array(i), u = 0; u < i; u++) n[u] = arguments[u + 2];
      l.children = n;
    }
    if (e && e.defaultProps) for (o in i = e.defaultProps, i) l[o] === void 0 && (l[o] = i[o]);
    return Ah(e, r, l);
  };
  J.createRef = function() {
    return { current: null };
  };
  J.forwardRef = function(e) {
    return { $$typeof: VM, render: e };
  };
  J.isValidElement = Th;
  J.lazy = function(e) {
    return { $$typeof: IS, _payload: { _status: -1, _result: e }, _init: JM };
  };
  J.memo = function(e, t) {
    return { $$typeof: XM, type: e, compare: t === void 0 ? null : t };
  };
  J.startTransition = RS;
  J.unstable_useCacheRefresh = function() {
    return Xe.H.useCacheRefresh();
  };
  J.use = function(e) {
    return Xe.H.use(e);
  };
  J.useActionState = function(e, t, a) {
    return Xe.H.useActionState(e, t, a);
  };
  J.useCallback = function(e, t) {
    return Xe.H.useCallback(e, t);
  };
  J.useContext = function(e) {
    return Xe.H.useContext(e);
  };
  J.useDebugValue = function() {
  };
  J.useDeferredValue = function(e, t) {
    return Xe.H.useDeferredValue(e, t);
  };
  J.useEffect = function(e, t) {
    return Xe.H.useEffect(e, t);
  };
  J.useEffectEvent = function(e) {
    return Xe.H.useEffectEvent(e);
  };
  J.useId = function() {
    return Xe.H.useId();
  };
  J.useImperativeHandle = function(e, t, a) {
    return Xe.H.useImperativeHandle(e, t, a);
  };
  J.useInsertionEffect = function(e, t) {
    return Xe.H.useInsertionEffect(e, t);
  };
  J.useLayoutEffect = function(e, t) {
    return Xe.H.useLayoutEffect(e, t);
  };
  J.useMemo = function(e, t) {
    return Xe.H.useMemo(e, t);
  };
  J.useOptimistic = function(e, t) {
    return Xe.H.useOptimistic(e, t);
  };
  J.useReducer = function(e, t, a) {
    return Xe.H.useReducer(e, t, a);
  };
  J.useRef = function(e) {
    return Xe.H.useRef(e);
  };
  J.useState = function(e) {
    return Xe.H.useState(e);
  };
  J.useSyncExternalStore = function(e, t, a) {
    return Xe.H.useSyncExternalStore(e, t, a);
  };
  J.useTransition = function() {
    return Xe.H.useTransition();
  };
  J.version = "19.3.1";
});
var Q = Qo((_N, OS) => {
  "use strict";
  OS.exports = DS();
});
var GS = Qo(($e) => {
  "use strict";
  function Rh(e, t) {
    var a = e.length;
    e.push(t);
    e: for (; 0 < a; ) {
      var o = a - 1 >>> 1, l = e[o];
      if (0 < Pc(l, t)) e[o] = t, e[a] = l, a = o;
      else break e;
    }
  }
  function Zo(e) {
    return e.length === 0 ? null : e[0];
  }
  function Bc(e) {
    if (e.length === 0) return null;
    var t = e[0], a = e.pop();
    if (a !== t) {
      e[0] = a;
      e: for (var o = 0, l = e.length, r = l >>> 1; o < r; ) {
        var i = 2 * (o + 1) - 1, n = e[i], u = i + 1, d = e[u];
        if (0 > Pc(n, a)) u < l && 0 > Pc(d, n) ? (e[o] = d, e[u] = a, o = u) : (e[o] = n, e[i] = a, o = i);
        else if (u < l && 0 > Pc(d, a)) e[o] = d, e[u] = a, o = u;
        else break e;
      }
    }
    return t;
  }
  function Pc(e, t) {
    var a = e.sortIndex - t.sortIndex;
    return a !== 0 ? a : e.id - t.id;
  }
  $e.unstable_now = void 0;
  typeof performance == "object" && typeof performance.now == "function" ? (PS = performance, $e.unstable_now = function() {
    return PS.now();
  }) : (_h = Date, US = _h.now(), $e.unstable_now = function() {
    return _h.now() - US;
  });
  var PS, _h, US, _l = [], or = [], eR = 1, to = null, la = 3, kh = false, As = false, Ts = false, Dh = false, HS = typeof setTimeout == "function" ? setTimeout : null, qS = typeof clearTimeout == "function" ? clearTimeout : null, BS = typeof setImmediate < "u" ? setImmediate : null;
  function Uc(e) {
    for (var t = Zo(or); t !== null; ) {
      if (t.callback === null) Bc(or);
      else if (t.startTime <= e) Bc(or), t.sortIndex = t.expirationTime, Rh(_l, t);
      else break;
      t = Zo(or);
    }
  }
  function Oh(e) {
    if (Ts = false, Uc(e), !As) if (Zo(_l) !== null) As = true, gn || (gn = true, hn());
    else {
      var t = Zo(or);
      t !== null && Ph(Oh, t.startTime - e);
    }
  }
  var gn = false, _s = -1, FS = 5, zS = -1;
  function VS() {
    return Dh ? true : !($e.unstable_now() - zS < FS);
  }
  function wh() {
    if (Dh = false, gn) {
      var e = $e.unstable_now();
      zS = e;
      var t = true;
      try {
        e: {
          As = false, Ts && (Ts = false, qS(_s), _s = -1), kh = true;
          var a = la;
          try {
            t: {
              for (Uc(e), to = Zo(_l); to !== null && !(to.expirationTime > e && VS()); ) {
                var o = to.callback;
                if (typeof o == "function") {
                  to.callback = null, la = to.priorityLevel;
                  var l = o(to.expirationTime <= e);
                  if (e = $e.unstable_now(), typeof l == "function") {
                    to.callback = l, Uc(e), t = true;
                    break t;
                  }
                  to === Zo(_l) && Bc(_l), Uc(e);
                } else Bc(_l);
                to = Zo(_l);
              }
              if (to !== null) t = true;
              else {
                var r = Zo(or);
                r !== null && Ph(Oh, r.startTime - e), t = false;
              }
            }
            break e;
          } finally {
            to = null, la = a, kh = false;
          }
          t = void 0;
        }
      } finally {
        t ? hn() : gn = false;
      }
    }
  }
  var hn;
  typeof BS == "function" ? hn = function() {
    BS(wh);
  } : typeof MessageChannel < "u" ? (Mh = new MessageChannel(), NS = Mh.port2, Mh.port1.onmessage = wh, hn = function() {
    NS.postMessage(null);
  }) : hn = function() {
    HS(wh, 0);
  };
  var Mh, NS;
  function Ph(e, t) {
    _s = HS(function() {
      e($e.unstable_now());
    }, t);
  }
  $e.unstable_IdlePriority = 5;
  $e.unstable_ImmediatePriority = 1;
  $e.unstable_LowPriority = 4;
  $e.unstable_NormalPriority = 3;
  $e.unstable_Profiling = null;
  $e.unstable_UserBlockingPriority = 2;
  $e.unstable_cancelCallback = function(e) {
    e.callback = null;
  };
  $e.unstable_forceFrameRate = function(e) {
    0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : FS = 0 < e ? Math.floor(1e3 / e) : 5;
  };
  $e.unstable_getCurrentPriorityLevel = function() {
    return la;
  };
  $e.unstable_next = function(e) {
    switch (la) {
      case 1:
      case 2:
      case 3:
        var t = 3;
        break;
      default:
        t = la;
    }
    var a = la;
    la = t;
    try {
      return e();
    } finally {
      la = a;
    }
  };
  $e.unstable_requestPaint = function() {
    Dh = true;
  };
  $e.unstable_runWithPriority = function(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        e = 3;
    }
    var a = la;
    la = e;
    try {
      return t();
    } finally {
      la = a;
    }
  };
  $e.unstable_scheduleCallback = function(e, t, a) {
    var o = $e.unstable_now();
    switch (typeof a == "object" && a !== null ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, e) {
      case 1:
        var l = -1;
        break;
      case 2:
        l = 250;
        break;
      case 5:
        l = 1073741823;
        break;
      case 4:
        l = 1e4;
        break;
      default:
        l = 5e3;
    }
    return l = a + l, e = { id: eR++, callback: t, priorityLevel: e, startTime: a, expirationTime: l, sortIndex: -1 }, a > o ? (e.sortIndex = a, Rh(or, e), Zo(_l) === null && e === Zo(or) && (Ts ? (qS(_s), _s = -1) : Ts = true, Ph(Oh, a - o))) : (e.sortIndex = l, Rh(_l, e), As || kh || (As = true, gn || (gn = true, hn()))), e;
  };
  $e.unstable_shouldYield = VS;
  $e.unstable_wrapCallback = function(e) {
    var t = la;
    return function() {
      var a = la;
      la = t;
      try {
        return e.apply(this, arguments);
      } finally {
        la = a;
      }
    };
  };
});
var KS = Qo((MN, XS) => {
  "use strict";
  XS.exports = GS();
});
var jS = Qo((ra) => {
  "use strict";
  var tR = Q();
  function YS(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var a = 2; a < arguments.length; a++) t += "&args[]=" + encodeURIComponent(arguments[a]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function lr() {
  }
  var fa = { d: { f: lr, r: function() {
    throw Error(YS(522));
  }, D: lr, C: lr, L: lr, m: lr, X: lr, S: lr, M: lr }, p: 0, findDOMNode: null }, aR = /* @__PURE__ */ Symbol.for("react.portal"), oR = /* @__PURE__ */ Symbol.for("react.recoverable"), WS = /* @__PURE__ */ Symbol.for("react.optimistic_key");
  function lR(e, t, a) {
    var o = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: aR, key: o == null ? null : o === WS ? WS : "" + o, children: e, containerInfo: t, implementation: a };
  }
  var ws = tR.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function Nc(e, t) {
    if (e === "font") return "";
    if (typeof t == "string") return t === "use-credentials" ? t : "";
  }
  ra.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = fa;
  ra.browser = function(e) {
    return { $$typeof: oR, _reason: e };
  };
  ra.createPortal = function(e, t) {
    var a = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(YS(299));
    return lR(e, t, null, a);
  };
  ra.flushSync = function(e) {
    var t = ws.T, a = fa.p;
    try {
      if (ws.T = null, fa.p = 2, e) return e();
    } finally {
      ws.T = t, fa.p = a, fa.d.f();
    }
  };
  ra.preconnect = function(e, t) {
    typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, fa.d.C(e, t));
  };
  ra.prefetchDNS = function(e) {
    typeof e == "string" && fa.d.D(e);
  };
  ra.preinit = function(e, t) {
    if (typeof e == "string" && t && typeof t.as == "string") {
      var a = t.as, o = Nc(a, t.crossOrigin), l = typeof t.integrity == "string" ? t.integrity : void 0, r = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
      a === "style" ? fa.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, { crossOrigin: o, integrity: l, fetchPriority: r }) : a === "script" && fa.d.X(e, { crossOrigin: o, integrity: l, fetchPriority: r, nonce: typeof t.nonce == "string" ? t.nonce : void 0 });
    }
  };
  ra.preinitModule = function(e, t) {
    if (typeof e == "string") if (typeof t == "object" && t !== null) {
      if (t.as == null || t.as === "script") {
        var a = Nc(t.as, t.crossOrigin);
        fa.d.M(e, { crossOrigin: a, integrity: typeof t.integrity == "string" ? t.integrity : void 0, nonce: typeof t.nonce == "string" ? t.nonce : void 0, fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0 });
      }
    } else t == null && fa.d.M(e);
  };
  ra.preload = function(e, t) {
    if (typeof e == "string" && typeof t == "object" && t !== null && typeof t.as == "string") {
      var a = t.as, o = Nc(a, t.crossOrigin);
      fa.d.L(e, a, { crossOrigin: o, integrity: typeof t.integrity == "string" ? t.integrity : void 0, nonce: typeof t.nonce == "string" ? t.nonce : void 0, type: typeof t.type == "string" ? t.type : void 0, fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0, referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0, imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0, imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0, media: typeof t.media == "string" ? t.media : void 0 });
    }
  };
  ra.preloadModule = function(e, t) {
    if (typeof e == "string") if (t) {
      var a = Nc(t.as, t.crossOrigin);
      fa.d.m(e, { as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0, crossOrigin: a, integrity: typeof t.integrity == "string" ? t.integrity : void 0, nonce: typeof t.nonce == "string" ? t.nonce : void 0, fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0 });
    } else fa.d.m(e);
  };
  ra.requestFormReset = function(e) {
    fa.d.r(e);
  };
  ra.unstable_batchedUpdates = function(e, t) {
    return e(t);
  };
  ra.useFormState = function(e, t, a) {
    return ws.H.useFormState(e, t, a);
  };
  ra.useFormStatus = function() {
    return ws.H.useHostTransitionStatus();
  };
  ra.version = "19.3.1";
});
var Hc = Qo((kN, ZS) => {
  "use strict";
  function QS() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(QS);
    } catch (e) {
      console.error(e);
    }
  }
  QS(), ZS.exports = jS();
});
var BI = Qo((Sm) => {
  "use strict";
  var _t = KS(), UC = Q(), rR = Hc();
  function R(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var a = 2; a < arguments.length; a++) t += "&args[]=" + encodeURIComponent(arguments[a]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function BC(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function gd(e) {
    for (var t = e, a = t; a && !a.alternate; ) t = a, (t.flags & 4098) !== 0 && (e = t.return), a = t.return;
    for (; t.return; ) t = t.return;
    return t.tag === 3 ? e : null;
  }
  function NC(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function HC(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function JS(e) {
    if (gd(e) !== e) throw Error(R(188));
  }
  function iR(e) {
    var t = e.alternate;
    if (!t) {
      if (t = gd(e), t === null) throw Error(R(188));
      return t !== e ? null : e;
    }
    for (var a = e, o = t; ; ) {
      var l = a.return;
      if (l === null) break;
      var r = l.alternate;
      if (r === null) {
        if (o = l.return, o !== null) {
          a = o;
          continue;
        }
        break;
      }
      if (l.child === r.child) {
        for (r = l.child; r; ) {
          if (r === a) return JS(l), e;
          if (r === o) return JS(l), t;
          r = r.sibling;
        }
        throw Error(R(188));
      }
      if (a.return !== o.return) a = l, o = r;
      else {
        for (var i = false, n = l.child; n; ) {
          if (n === a) {
            i = true, a = l, o = r;
            break;
          }
          if (n === o) {
            i = true, o = l, a = r;
            break;
          }
          n = n.sibling;
        }
        if (!i) {
          for (n = r.child; n; ) {
            if (n === a) {
              i = true, a = r, o = l;
              break;
            }
            if (n === o) {
              i = true, o = r, a = l;
              break;
            }
            n = n.sibling;
          }
          if (!i) throw Error(R(189));
        }
      }
      if (a.alternate !== o) throw Error(R(190));
    }
    if (a.tag !== 3) throw Error(R(188));
    return a.stateNode.current === a ? e : t;
  }
  function qC(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = qC(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  function _a(e, t, a, o, l, r) {
    for (; e !== null; ) {
      if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && a(e, o, l, r) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && _a(e.child, t, a, o, l, r)) return true;
      e = e.sibling;
    }
    return false;
  }
  function ki(e) {
    for (e = e.return; e !== null; ) {
      if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
      e = e.return;
    }
    return null;
  }
  function $S(e) {
    var t = false;
    for (e = e.return; e !== null && (e.tag === 4 && (t = true), !(e.tag === 3 || e.tag === 5 || e.tag === 27)); ) e = e.return;
    return t;
  }
  function FC(e) {
    var t = [null, null], a = ki(e);
    return a === null || zC(t, e, a.child, { foundSelf: false }), t;
  }
  function zC(e, t, a, o) {
    for (; a !== null; ) {
      if (a === t) o.foundSelf = true;
      else if (a.tag === 5 || a.tag === 27 || a.tag === 6) {
        if (o.foundSelf) return e[1] = a, true;
        e[0] = a;
      } else if ((a.tag !== 22 || a.memoizedState === null) && zC(e, t, a.child, o)) return true;
      a = a.sibling;
    }
    return false;
  }
  function Tt(e) {
    switch (e.tag) {
      case 5:
      case 27:
      case 6:
        return e.stateNode;
      case 3:
        return e.stateNode.containerInfo;
      default:
        throw Error(R(559));
    }
  }
  var yn = null, mg = null;
  function nR(e, t, a) {
    return e === a ? true : e === t ? (yn = e, true) : false;
  }
  function uR(e, t, a) {
    return e === a ? (mg = e, false) : e === t ? (mg !== null && (yn = e), true) : false;
  }
  function e0(e) {
    if (e === null) return null;
    do
      e = e === null ? null : e.return;
    while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
    return e || null;
  }
  function pg(e, t, a) {
    for (var o = 0, l = e; l; l = a(l)) o++;
    l = 0;
    for (var r = t; r; r = a(r)) l++;
    for (; 0 < o - l; ) e = a(e), o--;
    for (; 0 < l - o; ) t = a(t), l--;
    for (; o--; ) {
      if (e === t || t !== null && e === t.alternate) return e;
      e = a(e), t = a(t);
    }
    return null;
  }
  var He = Object.assign, sR = /* @__PURE__ */ Symbol.for("react.element"), qc = /* @__PURE__ */ Symbol.for("react.transitional.element"), Us = /* @__PURE__ */ Symbol.for("react.portal"), En = /* @__PURE__ */ Symbol.for("react.fragment"), VC = /* @__PURE__ */ Symbol.for("react.strict_mode"), hg = /* @__PURE__ */ Symbol.for("react.profiler"), GC = /* @__PURE__ */ Symbol.for("react.consumer"), ol = /* @__PURE__ */ Symbol.for("react.context"), Ev = /* @__PURE__ */ Symbol.for("react.forward_ref"), gg = /* @__PURE__ */ Symbol.for("react.suspense"), vg = /* @__PURE__ */ Symbol.for("react.suspense_list"), Iv = /* @__PURE__ */ Symbol.for("react.memo"), ur = /* @__PURE__ */ Symbol.for("react.lazy"), Lg = /* @__PURE__ */ Symbol.for("react.activity"), dR = /* @__PURE__ */ Symbol.for("react.legacy_hidden"), cR = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), bg = /* @__PURE__ */ Symbol.for("react.view_transition"), fR = /* @__PURE__ */ Symbol.for("react.recoverable"), t0 = Symbol.iterator;
  function Ms(e) {
    return e === null || typeof e != "object" ? null : (e = t0 && e[t0] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var mR = /* @__PURE__ */ Symbol.for("react.client.reference");
  function xg(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.$$typeof === mR ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case En:
        return "Fragment";
      case hg:
        return "Profiler";
      case VC:
        return "StrictMode";
      case gg:
        return "Suspense";
      case vg:
        return "SuspenseList";
      case Lg:
        return "Activity";
      case bg:
        return "ViewTransition";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case Us:
        return "Portal";
      case ol:
        return e.displayName || "Context";
      case GC:
        return (e._context.displayName || "Context") + ".Consumer";
      case Ev:
        var t = e.render;
        return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case Iv:
        return t = e.displayName || null, t !== null ? t : xg(e.type) || "Memo";
      case ur:
        t = e._payload, e = e._init;
        try {
          return xg(e(t));
        } catch {
        }
    }
    return null;
  }
  var Bs = Array.isArray, Z = UC.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Ee = rR.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, bi = { pending: false, data: null, method: null, action: null }, Sg = [], In = -1;
  function dl(e) {
    return { current: e };
  }
  function jt(e) {
    0 > In || (e.current = Sg[In], Sg[In] = null, In--);
  }
  function Ye(e, t) {
    In++, Sg[In] = e.current, e.current = t;
  }
  var nl = dl(null), ed = dl(null), vr = dl(null), Tf = dl(null);
  function _f(e, t) {
    switch (Ye(vr, t), Ye(ed, e), Ye(nl, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? hC(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI) t = hC(t), e = fI(t, e);
        else switch (e) {
          case "svg":
            e = 1;
            break;
          case "math":
            e = 2;
            break;
          default:
            e = 0;
        }
    }
    jt(nl), Ye(nl, e);
  }
  function Xn() {
    jt(nl), jt(ed), jt(vr);
  }
  function Cg(e) {
    var t = e.memoizedState;
    t !== null && (tu._currentValue = t.memoizedState, Ye(Tf, e)), t = nl.current;
    var a = fI(t, e.type);
    t !== a && (Ye(ed, e), Ye(nl, a));
  }
  function wf(e) {
    ed.current === e && (jt(nl), jt(ed)), Tf.current === e && (jt(Tf), tu._currentValue = bi);
  }
  var Uh, a0;
  function ir(e) {
    if (Uh === void 0) try {
      throw Error();
    } catch (a) {
      var t = a.stack.trim().match(/\n( *(at )?)/);
      Uh = t && t[1] || "", a0 = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
    }
    return `
` + Uh + e + a0;
  }
  var Bh = false;
  function Nh(e, t) {
    if (!e || Bh) return "";
    Bh = true;
    var a = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var o = { DetermineComponentFrameRoot: function() {
        try {
          if (t) {
            var h = function() {
              throw Error();
            };
            if (Object.defineProperty(h.prototype, "props", { set: function() {
              throw Error();
            } }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(h, []);
              } catch (v) {
                var s = v;
              }
              Reflect.construct(e, [], h);
            } else {
              try {
                h.call();
              } catch (v) {
                s = v;
              }
              h = false;
              try {
                var f = Object.getOwnPropertyDescriptor(e.prototype, "props");
                Object.defineProperty(e.prototype, "props", { configurable: true, set: function() {
                  throw Error();
                } }), h = true, new e();
              } finally {
                h && (f !== void 0 ? Object.defineProperty(e.prototype, "props", f) : delete e.prototype.props);
              }
            }
          } else {
            try {
              throw Error();
            } catch (v) {
              s = v;
            }
            (h = e()) && typeof h.catch == "function" && h.catch(function() {
            });
          }
        } catch (v) {
          if (v && s && typeof v.stack == "string") return [v.stack, s.stack];
        }
        return [null, null];
      } };
      o.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var l = Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot, "name");
      l && l.configurable && Object.defineProperty(o.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
      var r = o.DetermineComponentFrameRoot(), i = r[0], n = r[1];
      if (i && n) {
        var u = i.split(`
`), d = n.split(`
`);
        for (l = o = 0; o < u.length && !u[o].includes("DetermineComponentFrameRoot"); ) o++;
        for (; l < d.length && !d[l].includes("DetermineComponentFrameRoot"); ) l++;
        if (o === u.length || l === d.length) for (o = u.length - 1, l = d.length - 1; 1 <= o && 0 <= l && u[o] !== d[l]; ) l--;
        for (; 1 <= o && 0 <= l; o--, l--) if (u[o] !== d[l]) {
          if (o !== 1 || l !== 1) do
            if (o--, l--, 0 > l || u[o] !== d[l]) {
              var c = `
` + u[o].replace(" at new ", " at ");
              return e.displayName && c.includes("<anonymous>") && (c = c.replace("<anonymous>", e.displayName)), c;
            }
          while (1 <= o && 0 <= l);
          break;
        }
      }
    } finally {
      Bh = false, Error.prepareStackTrace = a;
    }
    return (a = e ? e.displayName || e.name : "") ? ir(a) : "";
  }
  function pR(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return ir(e.type);
      case 16:
        return ir("Lazy");
      case 13:
        return e.child !== t && t !== null ? ir("Suspense Fallback") : ir("Suspense");
      case 19:
        return ir("SuspenseList");
      case 0:
      case 15:
        return Nh(e.type, false);
      case 11:
        return Nh(e.type.render, false);
      case 1:
        return Nh(e.type, true);
      case 31:
        return ir("Activity");
      case 30:
        return ir("ViewTransition");
      default:
        return "";
    }
  }
  function o0(e) {
    try {
      var t = "", a = null;
      do
        t += pR(e, a), a = e, e = e.return;
      while (e);
      return t;
    } catch (o) {
      return `
Error generating stack: ` + o.message + `
` + o.stack;
    }
  }
  var yg = Object.prototype.hasOwnProperty, Av = _t.unstable_scheduleCallback, Hh = _t.unstable_cancelCallback, hR = _t.unstable_shouldYield, gR = _t.unstable_requestPaint, Ha = _t.unstable_now, vR = _t.unstable_getCurrentPriorityLevel, XC = _t.unstable_ImmediatePriority, KC = _t.unstable_UserBlockingPriority, Mf = _t.unstable_NormalPriority, LR = _t.unstable_LowPriority, WC = _t.unstable_IdlePriority, bR = _t.log, xR = _t.unstable_setDisableYieldValue, vd = null, qa = null;
  function cr(e) {
    if (typeof bR == "function" && xR(e), qa && typeof qa.setStrictMode == "function") try {
      qa.setStrictMode(vd, e);
    } catch {
    }
  }
  var Fa = Math.clz32 ? Math.clz32 : yR, SR = Math.log, CR = Math.LN2;
  function yR(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (SR(e) / CR | 0) | 0;
  }
  var Fc = 256, zc = 262144, Vc = 4194304;
  function pi(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & -e;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function am(e, t, a) {
    var o = e.pendingLanes;
    if (o === 0) return 0;
    var l = 0, r = e.suspendedLanes, i = e.pingedLanes;
    e = e.warmLanes;
    var n = o & 134217727;
    return n !== 0 ? (o = n & ~r, o !== 0 ? l = pi(o) : (i &= n, i !== 0 ? l = pi(i) : a || (a = n & ~e, a !== 0 && (l = pi(a))))) : (n = o & ~r, n !== 0 ? l = pi(n) : i !== 0 ? l = pi(i) : a || (a = o & ~e, a !== 0 && (l = pi(a)))), l === 0 ? 0 : t !== 0 && t !== l && (t & r) === 0 && (r = l & -l, a = t & -t, r >= a || r === 32 && (a & 4194048) !== 0) ? t : l;
  }
  function Ld(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function YC(e, t) {
    (t & 8) !== 0 && (t |= t & 32);
    var a = e.entangledLanes;
    if (a !== 0) for (e = e.entanglements, a &= t; 0 < a; ) {
      var o = 31 - Fa(a), l = 1 << o;
      t |= e[o], a &= ~l;
    }
    return t;
  }
  function ER(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function jC() {
    var e = Vc;
    return Vc <<= 1, (Vc & 62914560) === 0 && (Vc = 4194304), e;
  }
  function qh(e) {
    for (var t = [], a = 0; 31 > a; a++) t.push(e);
    return t;
  }
  function bd(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function IR(e, t, a, o, l, r) {
    var i = e.pendingLanes;
    e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0;
    var n = e.entanglements, u = e.expirationTimes, d = e.hiddenUpdates;
    for (a = i & ~a; 0 < a; ) {
      var c = 31 - Fa(a), h = 1 << c;
      n[c] = 0, u[c] = -1;
      var s = d[c];
      if (s !== null) for (d[c] = null, c = 0; c < s.length; c++) {
        var f = s[c];
        f !== null && (f.lane &= -536870913);
      }
      a &= ~h;
    }
    o !== 0 && QC(e, o, 0), r !== 0 && l === 0 && e.tag !== 0 && (e.suspendedLanes |= r & ~(i & ~t));
  }
  function QC(e, t, a) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var o = 31 - Fa(t);
    e.entangledLanes |= t, e.entanglements[o] = e.entanglements[o] | 1073741824 | a & 261930;
  }
  function ZC(e, t) {
    var a = e.entangledLanes |= t;
    for (e = e.entanglements; a; ) {
      var o = 31 - Fa(a), l = 1 << o;
      l & t | e[o] & t && (e[o] |= t), a &= ~l;
    }
  }
  function JC(e, t) {
    var a = t & -t;
    return a = (a & 42) !== 0 ? 1 : Tv(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function Tv(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function _v(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function $C() {
    var e = Ee.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : OI(e.type));
  }
  function l0(e, t) {
    var a = Ee.p;
    try {
      return Ee.p = e, t();
    } finally {
      Ee.p = a;
    }
  }
  var Fl = Math.random().toString(36).slice(2), Wt = "__reactFiber$" + Fl, wa = "__reactProps$" + Fl, lu = "__reactContainer$" + Fl, r0 = "__reactEvents$" + Fl, AR = "__reactListeners$" + Fl, TR = "__reactHandles$" + Fl, i0 = "__reactResources$" + Fl, xd = "__reactMarker$" + Fl, Rf = "__reactLoad$" + Fl;
  function om(e) {
    delete e[Wt], delete e[wa], delete e[AR], delete e[TR];
  }
  function vi(e) {
    var t;
    if (t = e[Wt]) return t;
    for (var a = e.parentNode; a; ) {
      if (t = a[lu] || a[Wt]) {
        if (a = t.alternate, t.child !== null || a !== null && a.child !== null) for (e = yC(e); e !== null; ) {
          if (a = e[Wt]) return a;
          e = yC(e);
        }
        return t;
      }
      e = a, a = e.parentNode;
    }
    return null;
  }
  function ru(e) {
    if (e = e[Wt] || e[lu]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
    }
    return null;
  }
  function Ns(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(R(33));
  }
  function Pn(e) {
    var t = e[i0];
    return t || (t = e[i0] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function Ht(e) {
    e[xd] = true;
  }
  function ey(e) {
    e[Rf] = void 0;
  }
  var ty = /* @__PURE__ */ new Set(), ay = {};
  function Di(e, t) {
    Kn(e, t), Kn(e + "Capture", t);
  }
  function Kn(e, t) {
    for (ay[e] = t, e = 0; e < t.length; e++) ty.add(t[e]);
  }
  var _R = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), n0 = {}, u0 = {};
  function wR(e) {
    return yg.call(u0, e) ? true : yg.call(n0, e) ? false : _R.test(e) ? u0[e] = true : (n0[e] = true, false);
  }
  var Le = false;
  function s0() {
    var e = Le;
    return Le = false, e;
  }
  function uf(e, t, a) {
    if (wR(t)) if (a === null) e.removeAttribute(t);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
          e.removeAttribute(t);
          return;
        case "boolean":
          var o = t.toLowerCase().slice(0, 5);
          if (o !== "data-" && o !== "aria-") {
            e.removeAttribute(t);
            return;
          }
      }
      e.setAttribute(t, a);
    }
  }
  function Gc(e, t, a) {
    if (a === null) e.removeAttribute(t);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, a);
    }
  }
  function wl(e, t, a, o) {
    if (o === null) e.removeAttribute(a);
    else {
      switch (typeof o) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(a);
          return;
      }
      e.setAttributeNS(t, a, o);
    }
  }
  function Pa(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function oy(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function MR(e, t, a) {
    var o = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
    if (!e.hasOwnProperty(t) && typeof o < "u" && typeof o.get == "function" && typeof o.set == "function") {
      var l = o.get, r = o.set;
      return Object.defineProperty(e, t, { configurable: true, get: function() {
        return l.call(this);
      }, set: function(i) {
        a = "" + i, r.call(this, i);
      } }), Object.defineProperty(e, t, { enumerable: o.enumerable }), { getValue: function() {
        return a;
      }, setValue: function(i) {
        a = "" + i;
      }, stopTracking: function() {
        e._valueTracker = null, delete e[t];
      } };
    }
  }
  function Eg(e) {
    if (!e._valueTracker) {
      var t = oy(e) ? "checked" : "value";
      e._valueTracker = MR(e, t, "" + e[t]);
    }
  }
  function ly(e) {
    if (!e) return false;
    var t = e._valueTracker;
    if (!t) return true;
    var a = t.getValue(), o = "";
    return e && (o = oy(e) ? e.checked ? "true" : "false" : e.value), e = o, e !== a ? (t.setValue(e), true) : false;
  }
  var RR = /[\n"\\]/g;
  function io(e) {
    return e.replace(RR, function(t) {
      return "\\" + t.charCodeAt(0).toString(16) + " ";
    });
  }
  function Ig(e, t, a, o, l, r, i, n) {
    e.name = "", i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" ? e.type = i : e.removeAttribute("type"), t != null ? i === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Pa(t)) : e.value !== "" + Pa(t) && (e.value = "" + Pa(t)) : i !== "submit" && i !== "reset" || e.removeAttribute("value"), t != null ? i === "number" && e.value == t ? Fh(e, Pa(e.value)) : Fh(e, Pa(t)) : a != null ? Fh(e, Pa(a)) : o != null && e.removeAttribute("value"), l == null && r != null && (e.defaultChecked = !!r), l != null && (e.checked = l && typeof l != "function" && typeof l != "symbol"), n != null && typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" ? e.name = "" + Pa(n) : e.removeAttribute("name");
  }
  function ry(e, t, a, o, l, r, i, n) {
    if (r != null && typeof r != "function" && typeof r != "symbol" && typeof r != "boolean" && (e.type = r), t != null || a != null) {
      if (!(r !== "submit" && r !== "reset" || t != null)) {
        Eg(e);
        return;
      }
      a = a != null ? "" + Pa(a) : "", t = t != null ? "" + Pa(t) : a, n || t === e.value || (e.value = t), e.defaultValue = t;
    }
    o = o ?? l, o = typeof o != "function" && typeof o != "symbol" && !!o, e.checked = n ? e.checked : !!o, e.defaultChecked = !!o, i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (e.name = i), Eg(e);
  }
  function Fh(e, t) {
    e.defaultValue !== "" + t && (e.defaultValue = "" + t);
  }
  function Un(e, t, a, o) {
    if (e = e.options, t) {
      t = {};
      for (var l = 0; l < a.length; l++) t["$" + a[l]] = true;
      for (a = 0; a < e.length; a++) l = t.hasOwnProperty("$" + e[a].value), e[a].selected !== l && (e[a].selected = l), l && o && (e[a].defaultSelected = true);
    } else {
      for (a = "" + Pa(a), t = null, l = 0; l < e.length; l++) {
        if (e[l].value === a) {
          e[l].selected = true, o && (e[l].defaultSelected = true);
          return;
        }
        t !== null || e[l].disabled || (t = e[l]);
      }
      t !== null && (t.selected = true);
    }
  }
  function iy(e, t, a) {
    if (t != null && (t = "" + Pa(t), t !== e.value && (e.value = t), a == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = a != null ? "" + Pa(a) : "";
  }
  function ny(e, t, a, o) {
    if (t == null) {
      if (o != null) {
        if (a != null) throw Error(R(92));
        if (Bs(o)) {
          if (1 < o.length) throw Error(R(93));
          o = o[0];
        }
        a = o;
      }
      a == null && (a = ""), t = a;
    }
    a = Pa(t), e.defaultValue = a, o = e.textContent, o === a && o !== "" && o !== null && (e.value = o), Eg(e);
  }
  function Wn(e, t) {
    if (t) {
      var a = e.firstChild;
      if (a && a === e.lastChild && a.nodeType === 3) {
        a.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var kR = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
  function d0(e, t, a) {
    var o = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === "" ? o ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : o ? e.setProperty(t, a) : typeof a != "number" || a === 0 || kR.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px";
  }
  function uy(e, t, a) {
    if (t != null && typeof t != "object") throw Error(R(62));
    if (e = e.style, a != null) {
      for (var o in a) !a.hasOwnProperty(o) || t != null && t.hasOwnProperty(o) || (o.indexOf("--") === 0 ? e.setProperty(o, "") : o === "float" ? e.cssFloat = "" : e[o] = "", Le = true);
      for (var l in t) o = t[l], t.hasOwnProperty(l) && a[l] !== o && (d0(e, l, o), Le = true);
    } else for (var r in t) t.hasOwnProperty(r) && d0(e, r, t[r]);
  }
  function wv(e) {
    if (e.indexOf("-") === -1) return false;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var DR = /* @__PURE__ */ new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["maskType", "mask-type"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), OR = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sf(e) {
    return OR.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function ll() {
  }
  var Ag = null;
  function Mv(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var An = null, Bn = null;
  function c0(e) {
    var t = ru(e);
    if (t && (e = t.stateNode)) {
      var a = e[wa] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Ig(e, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name), t = a.name, a.type === "radio" && t != null) {
            for (a = e; a.parentNode; ) a = a.parentNode;
            for (a = a.querySelectorAll('input[name="' + io("" + t) + '"][type="radio"]'), t = 0; t < a.length; t++) {
              var o = a[t];
              if (o !== e && o.form === e.form) {
                var l = o[wa] || null;
                if (!l) throw Error(R(90));
                Ig(o, l.value, l.defaultValue, l.defaultValue, l.checked, l.defaultChecked, l.type, l.name);
              }
            }
            for (t = 0; t < a.length; t++) o = a[t], o.form === e.form && ly(o);
          }
          break e;
        case "textarea":
          iy(e, a.value, a.defaultValue);
          break e;
        case "select":
          t = a.value, t != null && Un(e, !!a.multiple, t, false);
      }
    }
  }
  var zh = false;
  function sy(e, t, a) {
    if (zh) return e(t, a);
    zh = true;
    try {
      var o = e(t);
      return o;
    } finally {
      if (zh = false, (An !== null || Bn !== null) && (vm(), An && (t = An, e = Bn, Bn = An = null, c0(t), e))) for (t = 0; t < e.length; t++) c0(e[t]);
    }
  }
  function td(e, t) {
    var a = e.stateNode;
    if (a === null) return null;
    var o = a[wa] || null;
    if (o === null) return null;
    a = o[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (o = !o.disabled) || (e = e.type, o = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !o;
        break e;
      default:
        e = false;
    }
    if (e) return null;
    if (a && typeof a != "function") throw Error(R(231, t, typeof a));
    return a;
  }
  var Pl = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Tg = false;
  if (Pl) try {
    vn = {}, Object.defineProperty(vn, "passive", { get: function() {
      Tg = true;
    } }), window.addEventListener("test", vn, vn), window.removeEventListener("test", vn, vn);
  } catch {
    Tg = false;
  }
  var vn, fr = null, Rv = null, df = null;
  function dy() {
    if (df) return df;
    var e, t = Rv, a = t.length, o, l = "value" in fr ? fr.value : fr.textContent, r = l.length;
    for (e = 0; e < a && t[e] === l[e]; e++) ;
    var i = a - e;
    for (o = 1; o <= i && t[a - o] === l[r - o]; o++) ;
    return df = l.slice(e, 1 < o ? 1 - o : void 0);
  }
  function cf(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Xc() {
    return true;
  }
  function f0() {
    return false;
  }
  function ga(e) {
    function t(a, o, l, r, i) {
      this._reactName = a, this._targetInst = l, this.type = o, this.nativeEvent = r, this.target = i, this.currentTarget = null;
      for (var n in e) e.hasOwnProperty(n) && (a = e[n], this[n] = a ? a(r) : r[n]);
      return this.isDefaultPrevented = (r.defaultPrevented != null ? r.defaultPrevented : r.returnValue === false) ? Xc : f0, this.isPropagationStopped = f0, this;
    }
    return He(t.prototype, { preventDefault: function() {
      this.defaultPrevented = true;
      var a = this.nativeEvent;
      a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = false), this.isDefaultPrevented = Xc);
    }, stopPropagation: function() {
      var a = this.nativeEvent;
      a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = true), this.isPropagationStopped = Xc);
    }, persist: function() {
    }, isPersistent: Xc }), t;
  }
  var kr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, lm = ga(kr), Sd = He({}, kr, { view: 0, detail: 0 }), PR = ga(Sd), Vh, Gh, Rs, rm = He({}, Sd, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: kv, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Rs && (Rs && e.type === "mousemove" ? (Vh = e.screenX - Rs.screenX, Gh = e.screenY - Rs.screenY) : Gh = Vh = 0, Rs = e), Vh);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : Gh;
  } }), m0 = ga(rm), UR = He({}, rm, { dataTransfer: 0 }), BR = ga(UR), NR = He({}, Sd, { relatedTarget: 0 }), Xh = ga(NR), HR = He({}, kr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), qR = ga(HR), FR = He({}, kr, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), zR = ga(FR), VR = He({}, kr, { data: 0 }), p0 = ga(VR), GR = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, XR = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, KR = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function WR(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = KR[e]) ? !!t[e] : false;
  }
  function kv() {
    return WR;
  }
  var YR = He({}, Sd, { key: function(e) {
    if (e.key) {
      var t = GR[e.key] || e.key;
      if (t !== "Unidentified") return t;
    }
    return e.type === "keypress" ? (e = cf(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? XR[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: kv, charCode: function(e) {
    return e.type === "keypress" ? cf(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? cf(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), jR = ga(YR), QR = He({}, rm, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), h0 = ga(QR), ZR = He({}, kr, { submitter: 0 }), JR = ga(ZR), $R = He({}, Sd, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: kv }), ek = ga($R), tk = He({}, kr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), ak = ga(tk), ok = He({}, rm, { deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  }, deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  }, deltaZ: 0, deltaMode: 0 }), lk = ga(ok), rk = He({}, kr, { newState: 0, oldState: 0, source: 0 }), ik = ga(rk), nk = [9, 13, 27, 32], Dv = Pl && "CompositionEvent" in window, Fs = null;
  Pl && "documentMode" in document && (Fs = document.documentMode);
  var uk = Pl && "TextEvent" in window && !Fs, cy = Pl && (!Dv || Fs && 8 < Fs && 11 >= Fs), g0 = " ", v0 = false;
  function fy(e, t) {
    switch (e) {
      case "keyup":
        return nk.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function my(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Tn = false;
  function sk(e, t) {
    switch (e) {
      case "compositionend":
        return my(t);
      case "keypress":
        return t.which !== 32 ? null : (v0 = true, g0);
      case "textInput":
        return e = t.data, e === g0 && v0 ? null : e;
      default:
        return null;
    }
  }
  function dk(e, t) {
    if (Tn) return e === "compositionend" || !Dv && fy(e, t) ? (e = dy(), df = Rv = fr = null, Tn = false, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return cy && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var ck = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
  function L0(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!ck[e.type] : t === "textarea";
  }
  function py(e, t, a, o) {
    An ? Bn ? Bn.push(o) : Bn = [o] : An = o, t = $f(t, "onChange"), 0 < t.length && (a = new lm("onChange", "change", null, a, o), e.push({ event: a, listeners: t }));
  }
  var zs = null, ad = null;
  function fk(e) {
    sI(e, 0);
  }
  function im(e) {
    var t = Ns(e);
    if (ly(t)) return e;
  }
  function b0(e, t) {
    if (e === "change") return t;
  }
  var hy = false;
  Pl && (Pl ? (Wc = "oninput" in document, Wc || (Kh = document.createElement("div"), Kh.setAttribute("oninput", "return;"), Wc = typeof Kh.oninput == "function"), Kc = Wc) : Kc = false, hy = Kc && (!document.documentMode || 9 < document.documentMode));
  var Kc, Wc, Kh;
  function x0() {
    zs && (zs.detachEvent("onpropertychange", gy), ad = zs = null);
  }
  function gy(e) {
    if (e.propertyName === "value" && im(ad)) {
      var t = [];
      py(t, ad, e, Mv(e)), sy(fk, t);
    }
  }
  function mk(e, t, a) {
    e === "focusin" ? (x0(), zs = t, ad = a, zs.attachEvent("onpropertychange", gy)) : e === "focusout" && x0();
  }
  function pk(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return im(ad);
  }
  function hk(e, t) {
    if (e === "click") return im(t);
  }
  function gk(e, t) {
    if (e === "input" || e === "change") return im(t);
  }
  function vk(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Va = typeof Object.is == "function" ? Object.is : vk;
  function od(e, t) {
    if (Va(e, t)) return true;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null) return false;
    var a = Object.keys(e), o = Object.keys(t);
    if (a.length !== o.length) return false;
    for (o = 0; o < a.length; o++) {
      var l = a[o];
      if (!yg.call(t, l) || !Va(e[l], t[l])) return false;
    }
    return true;
  }
  function _g(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function S0(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function C0(e, t) {
    var a = S0(e);
    e = 0;
    for (var o; a; ) {
      if (a.nodeType === 3) {
        if (o = e + a.textContent.length, e <= t && o >= t) return { node: a, offset: t - e };
        e = o;
      }
      e: {
        for (; a; ) {
          if (a.nextSibling) {
            a = a.nextSibling;
            break e;
          }
          a = a.parentNode;
        }
        a = void 0;
      }
      a = S0(a);
    }
  }
  function vy(e, t) {
    return e && t ? e === t ? true : e && e.nodeType === 3 ? false : t && t.nodeType === 3 ? vy(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : false : false;
  }
  function Ly(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = _g(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = false;
      }
      if (a) e = t.contentWindow;
      else break;
      t = _g(e.document);
    }
    return t;
  }
  function Ov(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var Lk = Pl && "documentMode" in document && 11 >= document.documentMode, _n = null, wg = null, Vs = null, Mg = false;
  function y0(e, t, a) {
    var o = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    Mg || _n == null || _n !== _g(o) || (o = _n, "selectionStart" in o && Ov(o) ? o = { start: o.selectionStart, end: o.selectionEnd } : (o = (o.ownerDocument && o.ownerDocument.defaultView || window).getSelection(), o = { anchorNode: o.anchorNode, anchorOffset: o.anchorOffset, focusNode: o.focusNode, focusOffset: o.focusOffset }), Vs && od(Vs, o) || (Vs = o, o = $f(wg, "onSelect"), 0 < o.length && (t = new lm("onSelect", "select", null, t, a), e.push({ event: t, listeners: o }), t.target = _n)));
  }
  function fi(e, t) {
    var a = {};
    return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
  }
  var wn = { animationend: fi("Animation", "AnimationEnd"), animationiteration: fi("Animation", "AnimationIteration"), animationstart: fi("Animation", "AnimationStart"), transitionrun: fi("Transition", "TransitionRun"), transitionstart: fi("Transition", "TransitionStart"), transitioncancel: fi("Transition", "TransitionCancel"), transitionend: fi("Transition", "TransitionEnd") }, Wh = {}, by = {};
  Pl && (by = document.createElement("div").style, "AnimationEvent" in window || (delete wn.animationend.animation, delete wn.animationiteration.animation, delete wn.animationstart.animation), "TransitionEvent" in window || delete wn.transitionend.transition);
  function Oi(e) {
    if (Wh[e]) return Wh[e];
    if (!wn[e]) return e;
    var t = wn[e], a;
    for (a in t) if (t.hasOwnProperty(a) && a in by) return Wh[e] = t[a];
    return e;
  }
  var xy = Oi("animationend"), Sy = Oi("animationiteration"), Cy = Oi("animationstart"), bk = Oi("transitionrun"), xk = Oi("transitionstart"), Sk = Oi("transitioncancel"), yy = Oi("transitionend"), Ey = /* @__PURE__ */ new Map(), Rg = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  Rg.push("scrollEnd");
  function wo(e, t) {
    Ey.set(e, t), Di(t, [e]);
  }
  var Ck = 0;
  function Ul(e, t) {
    if (e.name != null && e.name !== "auto") return e.name;
    if (t.autoName !== null) return t.autoName;
    e = _o.identifierPrefix;
    var a = Ck++;
    return e = "_" + e + "t_" + a.toString(32) + "_", t.autoName = e;
  }
  function E0(e) {
    if (e == null || typeof e == "string") return e;
    var t = null, a = Gn;
    if (a !== null) for (var o = 0; o < a.length; o++) {
      var l = e[a[o]];
      if (l != null) {
        if (l === "none") return "none";
        t = t == null ? l : t + (" " + l);
      }
    }
    return t ?? e.default;
  }
  function zl(e, t) {
    return e = E0(e), t = E0(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
  }
  var kf = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", { bubbles: true, cancelable: true, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, oo = [], Mn = 0, Pv = 0;
  function nm() {
    for (var e = Mn, t = Pv = Mn = 0; t < e; ) {
      var a = oo[t];
      oo[t++] = null;
      var o = oo[t];
      oo[t++] = null;
      var l = oo[t];
      oo[t++] = null;
      var r = oo[t];
      if (oo[t++] = null, o !== null && l !== null) {
        var i = o.pending;
        i === null ? l.next = l : (l.next = i.next, i.next = l), o.pending = l;
      }
      r !== 0 && Iy(a, l, r);
    }
  }
  function um(e, t, a, o) {
    oo[Mn++] = e, oo[Mn++] = t, oo[Mn++] = a, oo[Mn++] = o, Pv |= o, e.lanes |= o, e = e.alternate, e !== null && (e.lanes |= o);
  }
  function Uv(e, t, a, o) {
    return um(e, t, a, o), Df(e);
  }
  function Pi(e, t) {
    return um(e, null, null, t), Df(e);
  }
  function Iy(e, t, a) {
    e.lanes |= a;
    var o = e.alternate;
    o !== null && (o.lanes |= a);
    for (var l = false, r = e.return; r !== null; ) r.childLanes |= a, o = r.alternate, o !== null && (o.childLanes |= a), r.tag === 22 && (e = r.stateNode, e === null || e._visibility & 1 || (l = true)), e = r, r = r.return;
    return e.tag === 3 ? (r = e.stateNode, l && t !== null && (l = 31 - Fa(a), e = r.hiddenUpdates, o = e[l], o === null ? e[l] = [t] : o.push(t), t.lane = a | 536870912), r) : null;
  }
  function Df(e) {
    if (50 < $s) throw $s = 0, Sf = null, Error(R(185));
    for (var t = e.return; t !== null; ) e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Rn = {};
  function yk(e, t, a, o) {
    this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = o, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Aa(e, t, a, o) {
    return new yk(e, t, a, o);
  }
  function Bv(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Dl(e, t) {
    var a = e.alternate;
    return a === null ? (a = Aa(e.tag, t, e.key, e.mode), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 1206910976, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a;
  }
  function Ay(e, t) {
    e.flags &= 1206910978;
    var a = e.alternate;
    return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), e;
  }
  function ff(e, t, a, o, l, r) {
    var i = 0;
    if (o = e, typeof o == "function") Bv(o) && (i = 1);
    else if (typeof o == "string") i = jD(e, a, nl.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else e: switch (o) {
      case Lg:
        return e = Aa(31, a, t, l), e.elementType = Lg, e.lanes = r, e;
      case En:
        return xi(a.children, l, r, t);
      case VC:
        i = 8, l |= 24;
        break;
      case hg:
        return e = Aa(12, a, t, l | 2), e.elementType = hg, e.lanes = r, e;
      case gg:
        return e = Aa(13, a, t, l), e.elementType = gg, e.lanes = r, e;
      case vg:
        return e = Aa(19, a, t, l), e.elementType = vg, e.lanes = r, e;
      case dR:
      case bg:
        return e = l | 32, e = Aa(30, a, t, e), e.elementType = bg, e.lanes = r, e.stateNode = { autoName: null, paired: null, clones: null, ref: null }, e;
      default:
        if (typeof o == "object" && o !== null) switch (o.$$typeof) {
          case ol:
            i = 10;
            break e;
          case GC:
            i = 9;
            break e;
          case Ev:
            i = 11;
            break e;
          case Iv:
            i = 14;
            break e;
          case ur:
            i = 16, o = null;
            break e;
        }
        i = 29, a = Error(R(130, e === null ? "null" : typeof e, "")), o = null;
    }
    return t = Aa(i, a, t, l), t.elementType = e, t.type = o, t.lanes = r, t;
  }
  function xi(e, t, a, o) {
    return e = Aa(7, e, o, t), e.lanes = a, e;
  }
  function Yh(e, t, a) {
    return e = Aa(6, e, null, t), e.lanes = a, e;
  }
  function Ty(e) {
    var t = Aa(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function jh(e, t, a) {
    return t = Aa(4, e.children !== null ? e.children : [], e.key, t), t.lanes = a, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
  }
  var I0 = /* @__PURE__ */ new WeakMap();
  function no(e, t) {
    if (typeof e == "object" && e !== null) {
      var a = I0.get(e);
      return a !== void 0 ? a : (t = { value: e, source: t, stack: o0(t) }, I0.set(e, t), t);
    }
    return { value: e, source: t, stack: o0(t) };
  }
  var kn = [], Dn = 0, Of = null, ld = 0, lo = [], ro = 0, Tr = null, rl = 1, il = "";
  function Rl(e, t) {
    kn[Dn++] = ld, kn[Dn++] = Of, Of = e, ld = t;
  }
  function _y(e, t, a) {
    lo[ro++] = rl, lo[ro++] = il, lo[ro++] = Tr, Tr = e;
    var o = rl;
    e = il;
    var l = 32 - Fa(o) - 1;
    o &= ~(1 << l), a += 1;
    var r = 32 - Fa(t) + l;
    if (30 < r) {
      var i = l - l % 5;
      r = (o & (1 << i) - 1).toString(32), o >>= i, l -= i, rl = 1 << 32 - Fa(t) + l | a << l | o, il = r + e;
    } else rl = 1 << r | a << l | o, il = e;
  }
  function sm(e) {
    e.return !== null && (Rl(e, 1), _y(e, 1, 0));
  }
  function Nv(e) {
    for (; e === Of; ) Of = kn[--Dn], kn[Dn] = null, ld = kn[--Dn], kn[Dn] = null;
    for (; e === Tr; ) Tr = lo[--ro], lo[ro] = null, il = lo[--ro], lo[ro] = null, rl = lo[--ro], lo[ro] = null;
  }
  function wy(e, t) {
    lo[ro++] = rl, lo[ro++] = il, lo[ro++] = Tr, rl = t.id, il = t.overflow, Tr = e;
  }
  var qt = null, We = null, le = false, Lr = null, uo = false, kg = Error(R(519));
  function _r(e) {
    var t = Error(R(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""));
    throw rd(no(t, e)), kg;
  }
  function A0(e) {
    var t = e.stateNode, a = e.type, o = e.memoizedProps;
    switch (t[Wt] = e, t[wa] = o, a) {
      case "dialog":
        ue("cancel", t), ue("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        ue("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < sd.length; a++) ue(sd[a], t);
        break;
      case "source":
        ue("error", t);
        break;
      case "img":
      case "image":
      case "link":
        ue("error", t), ue("load", t);
        break;
      case "details":
        ue("toggle", t);
        break;
      case "input":
        ue("invalid", t), ry(t, o.value, o.defaultValue, o.checked, o.defaultChecked, o.type, o.name, true);
        break;
      case "select":
        ue("invalid", t);
        break;
      case "textarea":
        ue("invalid", t), ny(t, o.value, o.defaultValue, o.children);
    }
    a = o.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || o.suppressHydrationWarning === true || cI(t.textContent, a) ? (o.popover != null && (ue("beforetoggle", t), ue("toggle", t)), o.onScroll != null && ue("scroll", t), o.onScrollEnd != null && ue("scrollend", t), o.onClick != null && (t.onclick = ll), t = true) : t = false, t || _r(e, true);
  }
  function Pf(e) {
    for (qt = e.return; qt; ) switch (qt.tag) {
      case 5:
      case 31:
      case 13:
        uo = false;
        return;
      case 27:
      case 3:
        uo = true;
        return;
      default:
        qt = qt.return;
    }
  }
  function Ln(e) {
    if (e !== qt) return false;
    if (!le) return Pf(e), le = true, false;
    var t = e.tag, a;
    if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || gv(e.type, e.memoizedProps)), a = !a), a && We && _r(e), Pf(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(R(317));
      We = CC(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(R(317));
      We = CC(e);
    } else t === 27 ? (t = We, Dr(e.type) ? (e = xv, xv = null, We = e) : We = t) : We = qt ? so(e.stateNode.nextSibling) : null;
    return true;
  }
  function Ei() {
    We = qt = null, le = false;
  }
  function Qh() {
    var e = Lr;
    return e !== null && (Ea === null ? Ea = e : Ea.push.apply(Ea, e), Lr = null), e;
  }
  function rd(e) {
    Lr === null ? Lr = [e] : Lr.push(e);
  }
  var Dg = dl(null), Ui = null, kl = null;
  function mr(e, t, a) {
    Ye(Dg, t._currentValue), t._currentValue = a;
  }
  function Ol(e) {
    e._currentValue = Dg.current, jt(Dg);
  }
  function mf(e, t, a) {
    for (; e !== null; ) {
      var o = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, o !== null && (o.childLanes |= t)) : o !== null && (o.childLanes & t) !== t && (o.childLanes |= t), e === a) break;
      e = e.return;
    }
  }
  function Og(e, t, a, o) {
    var l = e.child;
    for (l !== null && (l.return = e); l !== null; ) {
      var r = l.dependencies;
      if (r !== null) {
        var i = l.child;
        r = r.firstContext;
        e: for (; r !== null; ) {
          var n = r;
          r = l;
          for (var u = 0; u < t.length; u++) if (n.context === t[u]) {
            r.lanes |= a, n = r.alternate, n !== null && (n.lanes |= a), mf(r.return, a, e), o || (i = null);
            break e;
          }
          r = n.next;
        }
      } else if (l.tag === 18) {
        if (i = l.return, i === null) throw Error(R(341));
        i.lanes |= a, r = i.alternate, r !== null && (r.lanes |= a), mf(i, a, e), i = null;
      } else l.tag === 13 && l.memoizedState !== null && l.memoizedState.dehydrated === null ? (l.lanes |= a, i = l.alternate, i !== null && (i.lanes |= a), mf(l.return, a, e), i = l.child, i = i !== null ? i.sibling : null) : i = l.child;
      if (i !== null) i.return = l;
      else for (i = l; i !== null; ) {
        if (i === e) {
          i = null;
          break;
        }
        if (l = i.sibling, l !== null) {
          l.return = i.return, i = l;
          break;
        }
        i = i.return;
      }
      l = i;
    }
  }
  function Ii(e, t, a, o) {
    e = null;
    for (var l = t, r = false; l !== null; ) {
      if (!r) {
        if ((l.flags & 524288) !== 0) r = true;
        else if ((l.flags & 262144) !== 0) break;
      }
      if (l.tag === 10) {
        var i = l.alternate;
        if (i === null) throw Error(R(387));
        if (i = i.memoizedProps, i !== null) {
          var n = l.type;
          Va(l.pendingProps.value, i.value) || (e !== null ? e.push(n) : e = [n]);
        }
      } else if (l === Tf.current) {
        if (i = l.alternate, i === null) throw Error(R(387));
        i.memoizedState.memoizedState !== l.memoizedState.memoizedState && (e !== null ? e.push(tu) : e = [tu]);
      }
      l = l.return;
    }
    return e !== null && Og(t, e, a, o), t.flags |= 262144, e !== null;
  }
  function Uf(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Va(e.context._currentValue, e.memoizedValue)) return true;
      e = e.next;
    }
    return false;
  }
  function Ai(e) {
    Ui = e, kl = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function Yt(e) {
    return My(Ui, e);
  }
  function Yc(e, t) {
    return Ui === null && Ai(e), My(e, t);
  }
  function My(e, t) {
    var a = t._currentValue;
    if (t = { context: t, memoizedValue: a, next: null }, kl === null) {
      if (e === null) throw Error(R(308));
      kl = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else kl = kl.next = t;
    return a;
  }
  var Ek = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = { aborted: false, addEventListener: function(a, o) {
      e.push(o);
    } };
    this.abort = function() {
      t.aborted = true, e.forEach(function(a) {
        return a();
      });
    };
  }, Ik = _t.unstable_scheduleCallback, Ak = _t.unstable_NormalPriority, vt = { $$typeof: ol, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
  function Hv() {
    return { controller: new Ek(), data: /* @__PURE__ */ new Map(), refCount: 0 };
  }
  function Cd(e) {
    e.refCount--, e.refCount === 0 && Ik(Ak, function() {
      e.controller.abort();
    });
  }
  function T0(e, t) {
    if ((e.pendingLanes & 4194048) !== 0) {
      var a = e.transitionTypes;
      for (a === null && (a = e.transitionTypes = []), e = 0; e < t.length; e++) {
        var o = t[e];
        a.indexOf(o) === -1 && a.push(o);
      }
    }
  }
  var Hs = null;
  function Tk(e) {
    var t = e.transitionTypes;
    return e.transitionTypes = null, t;
  }
  var Gs = null, Pg = 0, Ti = 0, Nn = null;
  function _k(e, t) {
    if (Gs === null) {
      var a = Gs = [];
      Pg = 0, Ti = mL(), Nn = { status: "pending", value: void 0, then: function(o) {
        a.push(o);
      } };
    }
    return Pg++, t.then(_0, _0), t;
  }
  function _0() {
    if (--Pg === 0 && (Hs = null, Gs !== null)) {
      Nn !== null && (Nn.status = "fulfilled");
      var e = Gs;
      Gs = null, Ti = 0, Nn = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function wk(e, t) {
    var a = [], o = { status: "pending", value: null, reason: null, then: function(l) {
      a.push(l);
    } };
    return e.then(function() {
      o.status = "fulfilled", o.value = t;
      for (var l = 0; l < a.length; l++) (0, a[l])(t);
    }, function(l) {
      for (o.status = "rejected", o.reason = l, l = 0; l < a.length; l++) (0, a[l])(void 0);
    }), o;
  }
  var w0 = Z.S;
  Z.S = function(e, t) {
    if (YE = Ha(), typeof t == "object" && t !== null && typeof t.then == "function" && _k(e, t), Hs !== null) for (var a = Jn; a !== null; ) T0(a, Hs), a = a.next;
    if (a = e.types, a !== null) {
      for (var o = Jn; o !== null; ) T0(o, a), o = o.next;
      if (Ti !== 0) {
        o = Hs, o === null && (o = Hs = []);
        for (var l = 0; l < a.length; l++) {
          var r = a[l];
          o.indexOf(r) === -1 && o.push(r);
        }
      }
    }
    w0 !== null && w0(e, t);
  };
  var Si = dl(null);
  function qv() {
    var e = Si.current;
    return e !== null ? e : Ne.pooledCache;
  }
  function pf(e, t) {
    t === null ? Ye(Si, Si.current) : Ye(Si, t.pool);
  }
  function Ry() {
    var e = qv();
    return e === null ? null : { parent: vt._currentValue, pool: e };
  }
  var iu = Error(R(460)), Fv = Error(R(474)), dm = Error(R(542)), Bf = { then: function() {
  } };
  function M0(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function ky(e, t, a) {
    switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(ll, ll), t = a), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, k0(e), e === void 0 && !("reason" in t) ? Error(R(600)) : e;
      default:
        if (typeof t.status == "string") t.then(ll, ll);
        else {
          if (e = Ne, e !== null && 100 < e.shellSuspendCounter) throw Error(R(482));
          e = t, e.status = "pending", e.then(function(o) {
            if (t.status === "pending") {
              var l = t;
              l.status = "fulfilled", l.value = o;
            }
          }, function(o) {
            if (t.status === "pending") {
              var l = t;
              l.status = "rejected", l.reason = o;
            }
          });
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, k0(e), e;
        }
        throw Ci = t, iu;
    }
  }
  function hi(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? (Ci = a, iu) : a;
    }
  }
  var Ci = null;
  function R0() {
    if (Ci === null) throw Error(R(459));
    var e = Ci;
    return Ci = null, e;
  }
  function k0(e) {
    if (e === iu || e === dm) throw Error(R(483));
  }
  var Hn = null, id = 0;
  function jc(e) {
    var t = id;
    return id += 1, Hn === null && (Hn = []), ky(Hn, e, t);
  }
  function rr(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function Qc(e, t) {
    throw t.$$typeof === sR ? Error(R(525)) : (e = Object.prototype.toString.call(t), Error(R(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
  }
  function Dy(e) {
    function t(p, m) {
      if (e) {
        var g = p.deletions;
        g === null ? (p.deletions = [m], p.flags |= 16) : g.push(m);
      }
    }
    function a(p, m) {
      if (!e) return null;
      for (; m !== null; ) t(p, m), m = m.sibling;
      return null;
    }
    function o(p) {
      for (var m = /* @__PURE__ */ new Map(); p !== null; ) p.key === null ? m.set(p.index, p) : m.set(p.key, p), p = p.sibling;
      return m;
    }
    function l(p, m) {
      return p = Dl(p, m), p.index = 0, p.sibling = null, p;
    }
    function r(p, m, g) {
      return p.index = g, e ? (g = p.alternate, g !== null ? (g = g.index, g < m ? (p.flags |= 2, m) : g) : (p.flags |= 134217730, m)) : (p.flags |= 1048576, m);
    }
    function i(p) {
      return e && p.alternate === null && (p.flags |= 134217730), p;
    }
    function n(p, m, g, S) {
      return m === null || m.tag !== 6 ? (m = Yh(g, p.mode, S), m.return = p, m) : (m = l(m, g), m.return = p, m);
    }
    function u(p, m, g, S) {
      var E = g.type;
      return E === En ? (p = c(p, m, g.props.children, S, g.key), rr(p, g), p) : m !== null && (m.elementType === E || typeof E == "object" && E !== null && E.$$typeof === ur && hi(E) === m.type) ? (m = l(m, g.props), rr(m, g), m.return = p, m) : (m = ff(g.type, g.key, g.props, null, p.mode, S), rr(m, g), m.return = p, m);
    }
    function d(p, m, g, S) {
      return m === null || m.tag !== 4 || m.stateNode.containerInfo !== g.containerInfo || m.stateNode.implementation !== g.implementation ? (m = jh(g, p.mode, S), m.return = p, m) : (m = l(m, g.children || []), m.return = p, m);
    }
    function c(p, m, g, S, E) {
      return m === null || m.tag !== 7 ? (m = xi(g, p.mode, S, E), m.return = p, m) : (m = l(m, g), m.return = p, m);
    }
    function h(p, m, g) {
      if (typeof m == "string" && m !== "" || typeof m == "number" || typeof m == "bigint") return m = Yh("" + m, p.mode, g), m.return = p, m;
      if (typeof m == "object" && m !== null) {
        switch (m.$$typeof) {
          case qc:
            return g = ff(m.type, m.key, m.props, null, p.mode, g), rr(g, m), g.return = p, g;
          case Us:
            return m = jh(m, p.mode, g), m.return = p, m;
          case ur:
            return m = hi(m), h(p, m, g);
        }
        if (Bs(m) || Ms(m)) return m = xi(m, p.mode, g, null), m.return = p, m;
        if (typeof m.then == "function") return h(p, jc(m), g);
        if (m.$$typeof === ol) return h(p, Yc(p, m), g);
        Qc(p, m);
      }
      return null;
    }
    function s(p, m, g, S) {
      var E = m !== null ? m.key : null;
      if (typeof g == "string" && g !== "" || typeof g == "number" || typeof g == "bigint") return E !== null ? null : n(p, m, "" + g, S);
      if (typeof g == "object" && g !== null) {
        switch (g.$$typeof) {
          case qc:
            return g.key === E ? u(p, m, g, S) : null;
          case Us:
            return g.key === E ? d(p, m, g, S) : null;
          case ur:
            return g = hi(g), s(p, m, g, S);
        }
        if (Bs(g) || Ms(g)) return E !== null ? null : c(p, m, g, S, null);
        if (typeof g.then == "function") return s(p, m, jc(g), S);
        if (g.$$typeof === ol) return s(p, m, Yc(p, g), S);
        Qc(p, g);
      }
      return null;
    }
    function f(p, m, g, S, E) {
      if (typeof S == "string" && S !== "" || typeof S == "number" || typeof S == "bigint") return p = p.get(g) || null, n(m, p, "" + S, E);
      if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
          case qc:
            return p = p.get(S.key === null ? g : S.key) || null, u(m, p, S, E);
          case Us:
            return p = p.get(S.key === null ? g : S.key) || null, d(m, p, S, E);
          case ur:
            return S = hi(S), f(p, m, g, S, E);
        }
        if (Bs(S) || Ms(S)) return p = p.get(g) || null, c(m, p, S, E, null);
        if (typeof S.then == "function") return f(p, m, g, jc(S), E);
        if (S.$$typeof === ol) return f(p, m, g, Yc(m, S), E);
        Qc(m, S);
      }
      return null;
    }
    function v(p, m, g, S) {
      for (var E = null, A = null, I = m, T = m = 0, w = null; I !== null && T < g.length; T++) {
        I.index > T ? (w = I, I = null) : w = I.sibling;
        var k = s(p, I, g[T], S);
        if (k === null) {
          I === null && (I = w);
          break;
        }
        e && I && k.alternate === null && t(p, I), m = r(k, m, T), A === null ? E = k : A.sibling = k, A = k, I = w;
      }
      if (T === g.length) return a(p, I), le && Rl(p, T), E;
      if (I === null) {
        for (; T < g.length; T++) I = h(p, g[T], S), I !== null && (m = r(I, m, T), A === null ? E = I : A.sibling = I, A = I);
        return le && Rl(p, T), E;
      }
      for (I = o(I); T < g.length; T++) w = f(I, p, T, g[T], S), w !== null && (e && (k = w.alternate, k !== null && I.delete(k.key === null ? T : k.key)), m = r(w, m, T), A === null ? E = w : A.sibling = w, A = w);
      return e && I.forEach(function(F) {
        return t(p, F);
      }), le && Rl(p, T), E;
    }
    function L(p, m, g, S) {
      if (g == null) throw Error(R(151));
      for (var E = null, A = null, I = m, T = m = 0, w = null, k = g.next(); I !== null && !k.done; T++, k = g.next()) {
        I.index > T ? (w = I, I = null) : w = I.sibling;
        var F = s(p, I, k.value, S);
        if (F === null) {
          I === null && (I = w);
          break;
        }
        e && I && F.alternate === null && t(p, I), m = r(F, m, T), A === null ? E = F : A.sibling = F, A = F, I = w;
      }
      if (k.done) return a(p, I), le && Rl(p, T), E;
      if (I === null) {
        for (; !k.done; T++, k = g.next()) k = h(p, k.value, S), k !== null && (m = r(k, m, T), A === null ? E = k : A.sibling = k, A = k);
        return le && Rl(p, T), E;
      }
      for (I = o(I); !k.done; T++, k = g.next()) k = f(I, p, T, k.value, S), k !== null && (e && (w = k.alternate, w !== null && I.delete(w.key === null ? T : w.key)), m = r(k, m, T), A === null ? E = k : A.sibling = k, A = k);
      return e && I.forEach(function(V) {
        return t(p, V);
      }), le && Rl(p, T), E;
    }
    function x(p, m, g, S) {
      if (typeof g == "object" && g !== null && g.type === En && g.key === null && g.props.ref === void 0 && (g = g.props.children), typeof g == "object" && g !== null) {
        switch (g.$$typeof) {
          case qc:
            e: {
              for (var E = g.key; m !== null; ) {
                if (m.key === E) {
                  if (E = g.type, E === En) {
                    if (m.tag === 7) {
                      a(p, m.sibling), S = l(m, g.props.children), rr(S, g), S.return = p, p = S;
                      break e;
                    }
                  } else if (m.elementType === E || typeof E == "object" && E !== null && E.$$typeof === ur && hi(E) === m.type) {
                    a(p, m.sibling), S = l(m, g.props), rr(S, g), S.return = p, p = S;
                    break e;
                  }
                  a(p, m);
                  break;
                } else t(p, m);
                m = m.sibling;
              }
              g.type === En ? (S = xi(g.props.children, p.mode, S, g.key), rr(S, g), S.return = p, p = S) : (S = ff(g.type, g.key, g.props, null, p.mode, S), rr(S, g), S.return = p, p = S);
            }
            return i(p);
          case Us:
            e: {
              for (E = g.key; m !== null; ) {
                if (m.key === E) if (m.tag === 4 && m.stateNode.containerInfo === g.containerInfo && m.stateNode.implementation === g.implementation) {
                  a(p, m.sibling), S = l(m, g.children || []), S.return = p, p = S;
                  break e;
                } else {
                  a(p, m);
                  break;
                }
                else t(p, m);
                m = m.sibling;
              }
              S = jh(g, p.mode, S), S.return = p, p = S;
            }
            return i(p);
          case ur:
            return g = hi(g), x(p, m, g, S);
        }
        if (Bs(g)) return v(p, m, g, S);
        if (Ms(g)) {
          if (E = Ms(g), typeof E != "function") throw Error(R(150));
          return g = E.call(g), L(p, m, g, S);
        }
        if (typeof g.then == "function") return x(p, m, jc(g), S);
        if (g.$$typeof === ol) return x(p, m, Yc(p, g), S);
        Qc(p, g);
      }
      return typeof g == "string" && g !== "" || typeof g == "number" || typeof g == "bigint" ? (g = "" + g, m !== null && m.tag === 6 ? (a(p, m.sibling), S = l(m, g), S.return = p, p = S) : (a(p, m), S = Yh(g, p.mode, S), S.return = p, p = S), i(p)) : a(p, m);
    }
    return function(p, m, g, S) {
      try {
        id = 0;
        var E = x(p, m, g, S);
        return Hn = null, E;
      } catch (I) {
        if (I === iu || I === dm) throw I;
        var A = Aa(29, I, null, p.mode);
        return A.lanes = S, A.return = p, A;
      }
    };
  }
  var _i = Dy(true), Oy = Dy(false), sr = false;
  function zv(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null };
  }
  function Ug(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, callbacks: null });
  }
  function br(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function xr(e, t, a) {
    var o = e.updateQueue;
    if (o === null) return null;
    if (o = o.shared, (ye & 2) !== 0) {
      var l = o.pending;
      return l === null ? t.next = t : (t.next = l.next, l.next = t), o.pending = t, t = Df(e), Iy(e, null, a), t;
    }
    return um(e, o, t, a), Df(e);
  }
  function Xs(e, t, a) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
      var o = t.lanes;
      o &= e.pendingLanes, a |= o, t.lanes = a, ZC(e, a);
    }
  }
  function Zh(e, t) {
    var a = e.updateQueue, o = e.alternate;
    if (o !== null && (o = o.updateQueue, a === o)) {
      var l = null, r = null;
      if (a = a.firstBaseUpdate, a !== null) {
        do {
          var i = { lane: a.lane, tag: a.tag, payload: a.payload, callback: null, next: null };
          r === null ? l = r = i : r = r.next = i, a = a.next;
        } while (a !== null);
        r === null ? l = r = t : r = r.next = t;
      } else l = r = t;
      a = { baseState: o.baseState, firstBaseUpdate: l, lastBaseUpdate: r, shared: o.shared, callbacks: o.callbacks }, e.updateQueue = a;
      return;
    }
    e = a.lastBaseUpdate, e === null ? a.firstBaseUpdate = t : e.next = t, a.lastBaseUpdate = t;
  }
  var Bg = false;
  function Ks() {
    if (Bg) {
      var e = Nn;
      if (e !== null) throw e;
    }
  }
  function Ws(e, t, a, o) {
    Bg = false;
    var l = e.updateQueue;
    sr = false;
    var r = l.firstBaseUpdate, i = l.lastBaseUpdate, n = l.shared.pending;
    if (n !== null) {
      l.shared.pending = null;
      var u = n, d = u.next;
      u.next = null, i === null ? r = d : i.next = d, i = u;
      var c = e.alternate;
      c !== null && (c = c.updateQueue, n = c.lastBaseUpdate, n !== i && (n === null ? c.firstBaseUpdate = d : n.next = d, c.lastBaseUpdate = u));
    }
    if (r !== null) {
      var h = l.baseState;
      i = 0, c = d = u = null, n = r;
      do {
        var s = n.lane & -536870913, f = s !== n.lane;
        if (f ? (de & s) === s : (o & s) === s) {
          s !== 0 && s === Ti && (Bg = true), c !== null && (c = c.next = { lane: 0, tag: n.tag, payload: n.payload, callback: null, next: null });
          e: {
            var v = e, L = n;
            s = t;
            var x = a;
            switch (L.tag) {
              case 1:
                if (v = L.payload, typeof v == "function") {
                  h = v.call(x, h, s);
                  break e;
                }
                h = v;
                break e;
              case 3:
                v.flags = v.flags & -65537 | 128;
              case 0:
                if (v = L.payload, s = typeof v == "function" ? v.call(x, h, s) : v, s == null) break e;
                h = He({}, h, s);
                break e;
              case 2:
                sr = true;
            }
          }
          s = n.callback, s !== null && (e.flags |= 64, f && (e.flags |= 8192), f = l.callbacks, f === null ? l.callbacks = [s] : f.push(s));
        } else f = { lane: s, tag: n.tag, payload: n.payload, callback: n.callback, next: null }, c === null ? (d = c = f, u = h) : c = c.next = f, i |= s;
        if (n = n.next, n === null) {
          if (n = l.shared.pending, n === null) break;
          f = n, n = f.next, f.next = null, l.lastBaseUpdate = f, l.shared.pending = null;
        }
      } while (true);
      c === null && (u = h), l.baseState = u, l.firstBaseUpdate = d, l.lastBaseUpdate = c, r === null && (l.shared.lanes = 0), Rr |= i, e.lanes = i, e.memoizedState = h;
    }
  }
  function Py(e, t) {
    if (typeof e != "function") throw Error(R(191, e));
    e.call(t);
  }
  function Uy(e, t) {
    var a = e.callbacks;
    if (a !== null) for (e.callbacks = null, e = 0; e < a.length; e++) Py(a[e], t);
  }
  var wr = dl(null), Nf = dl(0);
  function D0(e, t) {
    e = ql, Ye(Nf, e), Ye(wr, t), ql = e | t.baseLanes;
  }
  function Ng() {
    Ye(Nf, ql), Ye(wr, wr.current);
  }
  function Vv() {
    ql = Nf.current, jt(wr), jt(Nf);
  }
  var Jt = dl(null), ia = null;
  function Sr(e) {
    var t = e.alternate;
    Ye(Qt, Qt.current & 1), Ye(Jt, e), ia === null && (t === null || wr.current !== null || t.memoizedState !== null) && (ia = e);
  }
  function Hg(e) {
    Ye(Qt, Qt.current), Ye(Jt, e), ia === null && (ia = e);
  }
  function By(e) {
    e.tag === 22 ? (Ye(Qt, Qt.current), Ye(Jt, e), ia === null && (ia = e)) : Cr();
  }
  function Cr() {
    Ye(Qt, Qt.current), Ye(Jt, Jt.current);
  }
  function Ua(e) {
    jt(Jt), ia === e && (ia = null), jt(Qt);
  }
  var Qt = dl(0);
  function nd(e, t) {
    Ye(Jt, Jt.current), Ye(Qt, t);
  }
  function Gv(e) {
    jt(Qt), jt(Jt), ia === e && (ia = null);
  }
  function Hf(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && (a = a.dehydrated, a === null || bv(a) || vL(a))) return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Bl = 0, te = null, Pe = null, gt = null, qf = false, qn = false, wi = false, Ff = 0, ud = 0, Fn = null, Mk = 0;
  function nt() {
    throw Error(R(321));
  }
  function Xv(e, t) {
    if (t === null) return false;
    for (var a = 0; a < t.length && a < e.length; a++) if (!Va(e[a], t[a])) return false;
    return true;
  }
  function Kv(e, t, a, o, l, r) {
    return Bl = r, te = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Z.H = e === null || e.memoizedState === null ? pE : hE, wi = false, r = a(o, l), wi = false, qn && (r = Hy(t, a, o, l)), Ny(e), r;
  }
  function Ny(e) {
    Z.H = zf;
    var t = Pe !== null && Pe.next !== null;
    if (Bl = 0, gt = Pe = te = null, qf = false, ud = 0, Fn = null, t) throw Error(R(300));
    e === null || Lt || (e = e.dependencies, e !== null && Uf(e) && (Lt = true));
  }
  function Hy(e, t, a, o) {
    te = e;
    var l = 0;
    do {
      if (qn && (Fn = null), ud = 0, qn = false, 25 <= l) throw Error(R(301));
      if (l += 1, gt = Pe = null, e.updateQueue != null) {
        var r = e.updateQueue;
        r.lastEffect = null, r.events = null, r.stores = null, r.memoCache != null && (r.memoCache.index = 0);
      }
      Z.H = Nk, r = t(a, o);
    } while (qn);
    return r;
  }
  function Rk() {
    var e = Z.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? yd(t) : t, e = e.useState()[0], (Pe !== null ? Pe.memoizedState : null) !== e && (te.flags |= 1024), t;
  }
  function Wv() {
    var e = Ff !== 0;
    return Ff = 0, e;
  }
  function Yv(e, t, a) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a;
  }
  function jv(e) {
    if (qf) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      qf = false;
    }
    Bl = 0, gt = Pe = te = null, qn = false, ud = Ff = 0, Fn = null;
  }
  function ha() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return gt === null ? te.memoizedState = gt = e : gt = gt.next = e, gt;
  }
  function ft() {
    if (Pe === null) {
      var e = te.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Pe.next;
    var t = gt === null ? te.memoizedState : gt.next;
    if (t !== null) gt = t, Pe = e;
    else {
      if (e === null) throw te.alternate === null ? Error(R(467)) : Error(R(310));
      Pe = e, e = { memoizedState: Pe.memoizedState, baseState: Pe.baseState, baseQueue: Pe.baseQueue, queue: Pe.queue, next: null }, gt === null ? te.memoizedState = gt = e : gt = gt.next = e;
    }
    return gt;
  }
  function cm() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function yd(e) {
    var t = ud;
    return ud += 1, Fn === null && (Fn = []), e = ky(Fn, e, t), t = te, (gt === null ? t.memoizedState : gt.next) === null && (t = t.alternate, Z.H = t === null || t.memoizedState === null ? pE : hE), e;
  }
  function fm(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return yd(e);
      if (e.$$typeof === fR) return;
      if (e.$$typeof === ol) return Yt(e);
    }
    throw Error(R(438, String(e)));
  }
  function Qv(e) {
    var t = null, a = te.updateQueue;
    if (a !== null && (t = a.memoCache), t == null) {
      var o = te.alternate;
      o !== null && (o = o.updateQueue, o !== null && (o = o.memoCache, o != null && (t = { data: o.data.map(function(l) {
        return l.slice();
      }), index: 0 })));
    }
    if (t == null && (t = { data: [], index: 0 }), a === null && (a = cm(), te.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0) for (a = t.data[t.index] = Array(e), o = 0; o < e; o++) a[o] = cR;
    return t.index++, a;
  }
  function Nl(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function hf(e) {
    var t = ft();
    return Zv(t, Pe, e);
  }
  function Zv(e, t, a) {
    var o = e.queue;
    if (o === null) throw Error(R(311));
    o.lastRenderedReducer = a;
    var l = e.baseQueue, r = o.pending;
    if (r !== null) {
      if (l !== null) {
        var i = l.next;
        l.next = r.next, r.next = i;
      }
      t.baseQueue = l = r, o.pending = null;
    }
    if (r = e.baseState, l === null) e.memoizedState = r;
    else {
      t = l.next;
      var n = i = null, u = null, d = t, c = false;
      do {
        var h = d.lane & -536870913;
        if (h !== d.lane ? (de & h) === h : (Bl & h) === h) {
          var s = d.revertLane;
          if (s === 0) u !== null && (u = u.next = { lane: 0, revertLane: 0, gesture: null, action: d.action, hasEagerState: d.hasEagerState, eagerState: d.eagerState, next: null }), h === Ti && (c = true);
          else if ((Bl & s) === s) {
            d = d.next, s === Ti && (c = true);
            continue;
          } else h = { lane: 0, revertLane: d.revertLane, gesture: null, action: d.action, hasEagerState: d.hasEagerState, eagerState: d.eagerState, next: null }, u === null ? (n = u = h, i = r) : u = u.next = h, te.lanes |= s, Rr |= s;
          h = d.action, wi && a(r, h), r = d.hasEagerState ? d.eagerState : a(r, h);
        } else s = { lane: h, revertLane: d.revertLane, gesture: d.gesture, action: d.action, hasEagerState: d.hasEagerState, eagerState: d.eagerState, next: null }, u === null ? (n = u = s, i = r) : u = u.next = s, te.lanes |= h, Rr |= h;
        d = d.next;
      } while (d !== null && d !== t);
      if (u === null ? i = r : u.next = n, !Va(r, e.memoizedState) && (Lt = true, c && (a = Nn, a !== null))) throw a;
      e.memoizedState = r, e.baseState = i, e.baseQueue = u, o.lastRenderedState = r;
    }
    return l === null && (o.lanes = 0), [e.memoizedState, o.dispatch];
  }
  function Jh(e) {
    var t = ft(), a = t.queue;
    if (a === null) throw Error(R(311));
    a.lastRenderedReducer = e;
    var o = a.dispatch, l = a.pending, r = t.memoizedState;
    if (l !== null) {
      a.pending = null;
      var i = l = l.next;
      do
        r = e(r, i.action), i = i.next;
      while (i !== l);
      Va(r, t.memoizedState) || (Lt = true), t.memoizedState = r, t.baseQueue === null && (t.baseState = r), a.lastRenderedState = r;
    }
    return [r, o];
  }
  function qy(e, t, a) {
    var o = te, l = ft(), r = le;
    if (r) {
      if (a === void 0) throw Error(R(407));
      a = a();
    } else a = t();
    var i = !Va((Pe || l).memoizedState, a);
    if (i && (l.memoizedState = a, Lt = true), l = l.queue, Jv(Vy.bind(null, o, l, e), [e]), e = l.getSnapshot !== t || i || gt !== null && (gt.memoizedState.tag & 1) !== 0, Yn(e ? 9 : 8, { destroy: void 0 }, zy.bind(null, o, l, a, t), null), e) {
      if (o.flags |= 2048, Ne === null) throw Error(R(349));
      r || (Bl & 127) !== 0 || Fy(o, t, a);
    }
    return a;
  }
  function Fy(e, t, a) {
    e.flags |= 16384, e = { getSnapshot: t, value: a }, t = te.updateQueue, t === null ? (t = cm(), te.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e));
  }
  function zy(e, t, a, o) {
    t.value = a, t.getSnapshot = o, Gy(t) && Xy(e);
  }
  function Vy(e, t, a) {
    return a(function() {
      Gy(t) && Xy(e);
    });
  }
  function Gy(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var a = t();
      return !Va(e, a);
    } catch {
      return true;
    }
  }
  function Xy(e) {
    var t = Pi(e, 2);
    t !== null && Ta(t, e, 2);
  }
  function qg(e) {
    var t = ha();
    if (typeof e == "function") {
      var a = e;
      if (e = a(), wi) {
        cr(true);
        try {
          a();
        } finally {
          cr(false);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Nl, lastRenderedState: e }, t;
  }
  function Ky(e, t, a, o) {
    return e.baseState = a, Zv(e, Pe, typeof o == "function" ? o : Nl);
  }
  function kk(e, t, a, o, l) {
    if (pm(e)) throw Error(R(485));
    if (e = t.action, e !== null) {
      var r = { payload: l, action: e, next: null, isTransition: true, status: "pending", value: null, reason: null, listeners: [], then: function(i) {
        r.listeners.push(i);
      } };
      Z.T !== null ? a(true) : r.isTransition = false, o(r), a = t.pending, a === null ? (r.next = t.pending = r, Wy(t, r)) : (r.next = a.next, t.pending = a.next = r);
    }
  }
  function Wy(e, t) {
    var a = t.action, o = t.payload, l = e.state;
    if (t.isTransition) {
      var r = Z.T, i = {};
      i.types = r !== null ? r.types : null, Z.T = i;
      try {
        var n = a(l, o), u = Z.S;
        u !== null && u(i, n), O0(e, t, n);
      } catch (d) {
        Fg(e, t, d);
      } finally {
        r !== null && i.types !== null && (r.types = i.types), Z.T = r;
      }
    } else try {
      r = a(l, o), O0(e, t, r);
    } catch (d) {
      Fg(e, t, d);
    }
  }
  function O0(e, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(function(o) {
      P0(e, t, o);
    }, function(o) {
      return Fg(e, t, o);
    }) : P0(e, t, a);
  }
  function P0(e, t, a) {
    t.status = "fulfilled", t.value = a, Yy(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, Wy(e, a)));
  }
  function Fg(e, t, a) {
    var o = e.pending;
    if (e.pending = null, o !== null) {
      o = o.next;
      do
        t.status = "rejected", t.reason = a, Yy(t), t = t.next;
      while (t !== o);
    }
    e.action = null;
  }
  function Yy(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function jy(e, t) {
    return t;
  }
  function U0(e, t) {
    if (le) {
      var a = Ne.formState;
      if (a !== null) {
        e: {
          var o = te;
          if (le) {
            if (We) {
              t: {
                for (var l = We, r = uo; l.nodeType !== 8; ) {
                  if (!r) {
                    l = null;
                    break t;
                  }
                  if (l = so(l.nextSibling), l === null) {
                    l = null;
                    break t;
                  }
                }
                r = l.data, l = r === "F!" || r === "F" ? l : null;
              }
              if (l) {
                We = so(l.nextSibling), o = l.data === "F!";
                break e;
              }
            }
            _r(o);
          }
          o = false;
        }
        o && (t = a[0]);
      }
    }
    return a = ha(), a.memoizedState = a.baseState = t, o = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: jy, lastRenderedState: t }, a.queue = o, a = cE.bind(null, te, o), o.dispatch = a, o = qg(false), r = aL.bind(null, te, false, o.queue), o = ha(), l = { state: t, dispatch: null, action: e, pending: null }, o.queue = l, a = kk.bind(null, te, l, r, a), l.dispatch = a, o.memoizedState = e, [t, a, false];
  }
  function B0(e) {
    var t = ft();
    return Qy(t, Pe, e);
  }
  function Qy(e, t, a) {
    if (t = Zv(e, t, jy)[0], e = hf(Nl)[0], typeof t == "object" && t !== null && typeof t.then == "function") try {
      var o = yd(t);
    } catch (i) {
      throw i === iu ? dm : i;
    }
    else o = t;
    t = ft();
    var l = t.queue, r = l.dispatch;
    return a !== t.memoizedState && (te.flags |= 2048, Yn(9, { destroy: void 0 }, Dk.bind(null, l, a), null)), [o, r, e];
  }
  function Dk(e, t) {
    e.action = t;
  }
  function N0(e) {
    var t = ft(), a = Pe;
    if (a !== null) return Qy(t, a, e);
    ft(), t = t.memoizedState, a = ft();
    var o = a.queue.dispatch;
    return a.memoizedState = e, [t, o, false];
  }
  function Yn(e, t, a, o) {
    return e = { tag: e, create: a, deps: o, inst: t, next: null }, t = te.updateQueue, t === null && (t = cm(), te.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (o = a.next, a.next = e, e.next = o, t.lastEffect = e), e;
  }
  function Zy() {
    return ft().memoizedState;
  }
  function gf(e, t, a, o) {
    var l = ha();
    te.flags |= e, l.memoizedState = Yn(1 | t, { destroy: void 0 }, a, o === void 0 ? null : o);
  }
  function mm(e, t, a, o) {
    var l = ft();
    o = o === void 0 ? null : o;
    var r = l.memoizedState.inst;
    Pe !== null && o !== null && Xv(o, Pe.memoizedState.deps) ? l.memoizedState = Yn(t, r, a, o) : (te.flags |= e, l.memoizedState = Yn(1 | t, r, a, o));
  }
  function H0(e, t) {
    gf(8390656, 8, e, t);
  }
  function Jv(e, t) {
    mm(2048, 8, e, t);
  }
  function Ok(e) {
    te.flags |= 4;
    var t = te.updateQueue;
    if (t === null) t = cm(), te.updateQueue = t, t.events = [e];
    else {
      var a = t.events;
      a === null ? t.events = [e] : a.push(e);
    }
  }
  function Jy(e) {
    var t = ft().memoizedState;
    return Ok({ ref: t, nextImpl: e }), function() {
      if ((ye & 2) !== 0) throw Error(R(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function $y(e, t) {
    return mm(4, 2, e, t);
  }
  function eE(e, t) {
    return mm(4, 4, e, t);
  }
  function tE(e, t) {
    if (typeof t == "function") {
      e = e();
      var a = t(e);
      return function() {
        typeof a == "function" ? a() : t(null);
      };
    }
    if (t != null) return e = e(), t.current = e, function() {
      t.current = null;
    };
  }
  function aE(e, t, a) {
    a = a != null ? a.concat([e]) : null, mm(4, 4, tE.bind(null, t, e), a);
  }
  function $v() {
  }
  function oE(e, t) {
    var a = ft();
    t = t === void 0 ? null : t;
    var o = a.memoizedState;
    return t !== null && Xv(t, o[1]) ? o[0] : (a.memoizedState = [e, t], e);
  }
  function lE(e, t) {
    var a = ft();
    t = t === void 0 ? null : t;
    var o = a.memoizedState;
    if (t !== null && Xv(t, o[1])) return o[0];
    if (o = e(), wi) {
      cr(true);
      try {
        e();
      } finally {
        cr(false);
      }
    }
    return a.memoizedState = [o, t], o;
  }
  function eL(e, t, a) {
    return a === void 0 || (Bl & 1073741824) !== 0 && (de & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = QE(), te.lanes |= e, Rr |= e, a);
  }
  function rE(e, t, a, o) {
    return Va(a, t) ? a : wr.current !== null ? (e = eL(e, a, o), Va(e, t) || (Lt = true), e) : (Bl & 106) === 0 || (Bl & 1073741824) !== 0 && (de & 261930) === 0 ? (Lt = true, e.memoizedState = a) : (e = QE(), te.lanes |= e, Rr |= e, t);
  }
  function iE(e, t, a, o, l) {
    var r = Ee.p;
    Ee.p = r !== 0 && 8 > r ? r : 8;
    var i = Z.T, n = {};
    n.types = i !== null ? i.types : null, Z.T = n, aL(e, false, t, a);
    try {
      var u = l(), d = Z.S;
      if (d !== null && d(n, u), u !== null && typeof u == "object" && typeof u.then == "function") {
        var c = wk(u, o);
        Ys(e, t, c, za(e));
      } else Ys(e, t, o, za(e));
    } catch (h) {
      Ys(e, t, { then: function() {
      }, status: "rejected", reason: h }, za());
    } finally {
      Ee.p = r, i !== null && n.types !== null && (i.types = n.types), Z.T = i;
    }
  }
  function Pk() {
  }
  function zg(e, t, a, o) {
    if (e.tag !== 5) throw Error(R(476));
    var l = nE(e).queue;
    iE(e, l, t, bi, a === null ? Pk : function() {
      return uE(e), a(o);
    });
  }
  function nE(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = { memoizedState: bi, baseState: bi, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Nl, lastRenderedState: bi }, next: null };
    var a = {};
    return t.next = { memoizedState: a, baseState: a, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Nl, lastRenderedState: a }, next: null }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function uE(e) {
    var t = nE(e);
    t.next === null && (t = e.alternate.memoizedState), Ys(e, t.next.queue, {}, za());
  }
  function tL() {
    return Yt(tu);
  }
  function sE() {
    return ft().memoizedState;
  }
  function dE() {
    return ft().memoizedState;
  }
  function Uk(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = za();
          e = br(a);
          var o = xr(t, e, a);
          o !== null && (Ta(o, t, a), Xs(o, t, a)), t = { cache: Hv() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function Bk(e, t, a) {
    var o = za();
    a = { lane: o, revertLane: 0, gesture: null, action: a, hasEagerState: false, eagerState: null, next: null }, pm(e) ? fE(t, a) : (a = Uv(e, t, a, o), a !== null && (Ta(a, e, o), mE(a, t, o)));
  }
  function cE(e, t, a) {
    var o = za();
    Ys(e, t, a, o);
  }
  function Ys(e, t, a, o) {
    var l = { lane: o, revertLane: 0, gesture: null, action: a, hasEagerState: false, eagerState: null, next: null };
    if (pm(e)) fE(t, l);
    else {
      var r = e.alternate;
      if (e.lanes === 0 && (r === null || r.lanes === 0) && (r = t.lastRenderedReducer, r !== null)) try {
        var i = t.lastRenderedState, n = r(i, a);
        if (l.hasEagerState = true, l.eagerState = n, Va(n, i)) return um(e, t, l, 0), Ne === null && nm(), false;
      } catch {
      }
      if (a = Uv(e, t, l, o), a !== null) return Ta(a, e, o), mE(a, t, o), true;
    }
    return false;
  }
  function aL(e, t, a, o) {
    if (o = { lane: 2, revertLane: mL(), gesture: null, action: o, hasEagerState: false, eagerState: null, next: null }, pm(e)) {
      if (t) throw Error(R(479));
    } else t = Uv(e, a, o, 2), t !== null && Ta(t, e, 2);
  }
  function pm(e) {
    var t = e.alternate;
    return e === te || t !== null && t === te;
  }
  function fE(e, t) {
    qn = qf = true;
    var a = e.pending;
    a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
  }
  function mE(e, t, a) {
    if ((a & 4194048) !== 0) {
      var o = t.lanes;
      o &= e.pendingLanes, a |= o, t.lanes = a, ZC(e, a);
    }
  }
  var zf = { readContext: Yt, use: fm, useCallback: nt, useContext: nt, useEffect: nt, useImperativeHandle: nt, useLayoutEffect: nt, useInsertionEffect: nt, useMemo: nt, useReducer: nt, useRef: nt, useState: nt, useDebugValue: nt, useDeferredValue: nt, useTransition: nt, useSyncExternalStore: nt, useId: nt, useHostTransitionStatus: nt, useFormState: nt, useActionState: nt, useOptimistic: nt, useMemoCache: nt, useCacheRefresh: nt, useEffectEvent: nt }, pE = { readContext: Yt, use: fm, useCallback: function(e, t) {
    return ha().memoizedState = [e, t === void 0 ? null : t], e;
  }, useContext: Yt, useEffect: H0, useImperativeHandle: function(e, t, a) {
    a = a != null ? a.concat([e]) : null, gf(4194308, 4, tE.bind(null, t, e), a);
  }, useLayoutEffect: function(e, t) {
    return gf(4194308, 4, e, t);
  }, useInsertionEffect: function(e, t) {
    gf(4, 2, e, t);
  }, useMemo: function(e, t) {
    var a = ha();
    t = t === void 0 ? null : t;
    var o = e();
    if (wi) {
      cr(true);
      try {
        e();
      } finally {
        cr(false);
      }
    }
    return a.memoizedState = [o, t], o;
  }, useReducer: function(e, t, a) {
    var o = ha();
    if (a !== void 0) {
      var l = a(t);
      if (wi) {
        cr(true);
        try {
          a(t);
        } finally {
          cr(false);
        }
      }
    } else l = t;
    return o.memoizedState = o.baseState = l, e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: l }, o.queue = e, e = e.dispatch = Bk.bind(null, te, e), [o.memoizedState, e];
  }, useRef: function(e) {
    var t = ha();
    return e = { current: e }, t.memoizedState = e;
  }, useState: function(e) {
    e = qg(e);
    var t = e.queue, a = cE.bind(null, te, t);
    return t.dispatch = a, [e.memoizedState, a];
  }, useDebugValue: $v, useDeferredValue: function(e, t) {
    var a = ha();
    return eL(a, e, t);
  }, useTransition: function() {
    var e = qg(false);
    return e = iE.bind(null, te, e.queue, true, false), ha().memoizedState = e, [false, e];
  }, useSyncExternalStore: function(e, t, a) {
    var o = te, l = ha();
    if (le) {
      if (a === void 0) throw Error(R(407));
      a = a();
    } else {
      if (a = t(), Ne === null) throw Error(R(349));
      (de & 127) !== 0 || Fy(o, t, a);
    }
    l.memoizedState = a;
    var r = { value: a, getSnapshot: t };
    return l.queue = r, H0(Vy.bind(null, o, r, e), [e]), o.flags |= 2048, Yn(9, { destroy: void 0 }, zy.bind(null, o, r, a, t), null), a;
  }, useId: function() {
    var e = ha(), t = Ne.identifierPrefix;
    if (le) {
      var a = il, o = rl;
      a = (o & ~(1 << 32 - Fa(o) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = Ff++, 0 < a && (t += "H" + a.toString(32)), t += "_";
    } else a = Mk++, t = "_" + t + "r_" + a.toString(32) + "_";
    return e.memoizedState = t;
  }, useHostTransitionStatus: tL, useFormState: U0, useActionState: U0, useOptimistic: function(e) {
    var t = ha();
    t.memoizedState = t.baseState = e;
    var a = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null };
    return t.queue = a, t = aL.bind(null, te, true, a), a.dispatch = t, [e, t];
  }, useMemoCache: Qv, useCacheRefresh: function() {
    return ha().memoizedState = Uk.bind(null, te);
  }, useEffectEvent: function(e) {
    var t = ha(), a = { impl: e };
    return t.memoizedState = a, function() {
      if ((ye & 2) !== 0) throw Error(R(440));
      return a.impl.apply(void 0, arguments);
    };
  } }, hE = { readContext: Yt, use: fm, useCallback: oE, useContext: Yt, useEffect: Jv, useImperativeHandle: aE, useInsertionEffect: $y, useLayoutEffect: eE, useMemo: lE, useReducer: hf, useRef: Zy, useState: function() {
    return hf(Nl);
  }, useDebugValue: $v, useDeferredValue: function(e, t) {
    var a = ft();
    return rE(a, Pe.memoizedState, e, t);
  }, useTransition: function() {
    var e = hf(Nl)[0], t = ft().memoizedState;
    return [typeof e == "boolean" ? e : yd(e), t];
  }, useSyncExternalStore: qy, useId: sE, useHostTransitionStatus: tL, useFormState: B0, useActionState: B0, useOptimistic: function(e, t) {
    var a = ft();
    return Ky(a, Pe, e, t);
  }, useMemoCache: Qv, useCacheRefresh: dE, useEffectEvent: Jy }, Nk = { readContext: Yt, use: fm, useCallback: oE, useContext: Yt, useEffect: Jv, useImperativeHandle: aE, useInsertionEffect: $y, useLayoutEffect: eE, useMemo: lE, useReducer: Jh, useRef: Zy, useState: function() {
    return Jh(Nl);
  }, useDebugValue: $v, useDeferredValue: function(e, t) {
    var a = ft();
    return Pe === null ? eL(a, e, t) : rE(a, Pe.memoizedState, e, t);
  }, useTransition: function() {
    var e = Jh(Nl)[0], t = ft().memoizedState;
    return [typeof e == "boolean" ? e : yd(e), t];
  }, useSyncExternalStore: qy, useId: sE, useHostTransitionStatus: tL, useFormState: N0, useActionState: N0, useOptimistic: function(e, t) {
    var a = ft();
    return Pe !== null ? Ky(a, Pe, e, t) : (a.baseState = e, [e, a.queue.dispatch]);
  }, useMemoCache: Qv, useCacheRefresh: dE, useEffectEvent: Jy };
  function $h(e, t, a, o) {
    t = e.memoizedState, a = a(o, t), a = a == null ? t : He({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a);
  }
  var Vg = { enqueueSetState: function(e, t, a) {
    e = e._reactInternals;
    var o = za(), l = br(o);
    l.payload = t, a != null && (l.callback = a), t = xr(e, l, o), t !== null && (Ta(t, e, o), Xs(t, e, o));
  }, enqueueReplaceState: function(e, t, a) {
    e = e._reactInternals;
    var o = za(), l = br(o);
    l.tag = 1, l.payload = t, a != null && (l.callback = a), t = xr(e, l, o), t !== null && (Ta(t, e, o), Xs(t, e, o));
  }, enqueueForceUpdate: function(e, t) {
    e = e._reactInternals;
    var a = za(), o = br(a);
    o.tag = 2, t != null && (o.callback = t), t = xr(e, o, a), t !== null && (Ta(t, e, a), Xs(t, e, a));
  } };
  function q0(e, t, a, o, l, r, i) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(o, r, i) : t.prototype && t.prototype.isPureReactComponent ? !od(a, o) || !od(l, r) : true;
  }
  function F0(e, t, a, o) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, o), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, o), t.state !== e && Vg.enqueueReplaceState(t, t.state, null);
  }
  function Mi(e, t) {
    var a = t;
    if ("ref" in t) {
      a = {};
      for (var o in t) o !== "ref" && (a[o] = t[o]);
    }
    if (e = e.defaultProps) {
      a === t && (a = He({}, a));
      for (var l in e) a[l] === void 0 && (a[l] = e[l]);
    }
    return a;
  }
  function gE(e) {
    kf(e);
  }
  function vE(e) {
    console.error(e);
  }
  function LE(e) {
    kf(e);
  }
  function Vf(e, t) {
    try {
      var a = e.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (o) {
      setTimeout(function() {
        throw o;
      });
    }
  }
  function z0(e, t, a) {
    try {
      var o = e.onCaughtError;
      o(a.value, { componentStack: a.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Gg(e, t, a) {
    return a = br(a), a.tag = 3, a.payload = { element: null }, a.callback = function() {
      Vf(e, t);
    }, a;
  }
  function bE(e) {
    return e = br(e), e.tag = 3, e;
  }
  function xE(e, t, a, o) {
    var l = a.type.getDerivedStateFromError;
    if (typeof l == "function") {
      var r = o.value;
      e.payload = function() {
        return l(r);
      }, e.callback = function() {
        z0(t, a, o);
      };
    }
    var i = a.stateNode;
    i !== null && typeof i.componentDidCatch == "function" && (e.callback = function() {
      z0(t, a, o), typeof l != "function" && (yr === null ? yr = /* @__PURE__ */ new Set([this]) : yr.add(this));
      var n = o.stack;
      this.componentDidCatch(o.value, { componentStack: n !== null ? n : "" });
    });
  }
  function Hk(e, t, a, o, l) {
    if (a.flags |= 32768, o !== null && typeof o == "object" && typeof o.then == "function") {
      if (t = a.alternate, t !== null && Ii(t, a, l, true), a = Jt.current, a !== null) {
        switch (a.tag) {
          case 31:
          case 13:
          case 19:
            return ia === null ? Zf() : a.alternate === null && ut === 0 && (ut = 3), a.flags &= -257, a.flags |= 65536, a.lanes = l, o === Bf ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = /* @__PURE__ */ new Set([o]) : t.add(o), ig(e, o, l)), false;
          case 22:
            return a.flags |= 65536, o === Bf ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = { transitions: null, markerInstances: null, retryQueue: /* @__PURE__ */ new Set([o]) }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = /* @__PURE__ */ new Set([o]) : a.add(o)), ig(e, o, l)), false;
        }
        throw Error(R(435, a.tag));
      }
      return ig(e, o, l), Zf(), false;
    }
    if (le) return t = Jt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = l, o !== kg && (e = Error(R(422), { cause: o }), rd(no(e, a)))) : (o !== kg && (t = Error(R(423), { cause: o }), rd(no(t, a))), e = e.current.alternate, e.flags |= 65536, l &= -l, e.lanes |= l, o = no(o, a), l = Gg(e.stateNode, o, l), Zh(e, l), ut !== 4 && (ut = 2)), false;
    var r = Error(R(520), { cause: o });
    if (r = no(r, a), Js === null ? Js = [r] : Js.push(r), ut !== 4 && (ut = 2), t === null) return true;
    o = no(o, a), a = t;
    do {
      switch (a.tag) {
        case 3:
          return a.flags |= 65536, e = l & -l, a.lanes |= e, e = Gg(a.stateNode, o, e), Zh(a, e), false;
        case 1:
          if (t = a.type, r = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || r !== null && typeof r.componentDidCatch == "function" && (yr === null || !yr.has(r)))) return a.flags |= 65536, l &= -l, a.lanes |= l, l = bE(l), xE(l, e, a, o), Zh(a, l), false;
          break;
        case 22:
          if (a.memoizedState !== null) return a.flags |= 65536, false;
      }
      a = a.return;
    } while (a !== null);
    return false;
  }
  var oL = Error(R(461)), Lt = false;
  function At(e, t, a, o) {
    t.child = e === null ? Oy(t, null, a, o) : _i(t, e.child, a, o);
  }
  function V0(e, t, a, o, l) {
    a = a.render;
    var r = t.ref;
    if ("ref" in o) {
      var i = {};
      for (var n in o) n !== "ref" && (i[n] = o[n]);
    } else i = o;
    return Ai(t), o = Kv(e, t, a, i, r, l), n = Wv(), e !== null && !Lt ? (Yv(e, t, l), Hl(e, t, l)) : (le && n && sm(t), t.flags |= 1, At(e, t, o, l), t.child);
  }
  function G0(e, t, a, o, l) {
    if (e === null) {
      var r = a.type;
      return typeof r == "function" && !Bv(r) && r.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = r, SE(e, t, r, o, l)) : (e = ff(a.type, null, o, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (r = e.child, !rL(e, l)) {
      var i = r.memoizedProps;
      if (a = a.compare, a = a !== null ? a : od, a(i, o) && e.ref === t.ref) return Hl(e, t, l);
    }
    return t.flags |= 1, e = Dl(r, o), e.ref = t.ref, e.return = t, t.child = e;
  }
  function SE(e, t, a, o, l) {
    if (e !== null) {
      var r = e.memoizedProps;
      if (od(r, o) && e.ref === t.ref) if (Lt = false, t.pendingProps = o = r, rL(e, l)) (e.flags & 131072) !== 0 && (Lt = true);
      else return t.lanes = e.lanes, Hl(e, t, l);
    }
    return Xg(e, t, a, o, l);
  }
  function CE(e, t, a, o) {
    var l = o.children, r = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), o.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (r = r !== null ? r.baseLanes | a : a, e !== null) {
          for (o = t.child = e.child, l = 0; o !== null; ) l = l | o.lanes | o.childLanes, o = o.sibling;
          o = l & ~r;
        } else o = 0, t.child = null;
        return X0(e, t, r, a, o);
      }
      if ((a & 536870912) !== 0) t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && pf(t, r !== null ? r.cachePool : null), r !== null ? D0(t, r) : Ng(), By(t);
      else return o = t.lanes = 536870912, X0(e, t, r !== null ? r.baseLanes | a : a, a, o);
    } else r !== null ? (pf(t, r.cachePool), D0(t, r), Cr(), t.memoizedState = null) : (e !== null && pf(t, null), Ng(), Cr());
    return At(e, t, l, a), t.child;
  }
  function js(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), t.sibling;
  }
  function X0(e, t, a, o, l) {
    var r = qv();
    return r = r === null ? null : { parent: vt._currentValue, pool: r }, t.memoizedState = { baseLanes: a, cachePool: r }, e !== null && pf(t, null), Ng(), By(t), e !== null && Ii(e, t, o, true), t.childLanes = l, null;
  }
  function vf(e, t) {
    return t = hm({ mode: t.mode, children: t.children }, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function K0(e, t, a) {
    return _i(t, e.child, null, a), e = vf(t, t.pendingProps), e.flags |= 2, Ua(t), t.memoizedState = null, e;
  }
  function qk(e, t, a) {
    var o = t.pendingProps, l = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (le) {
        if (o.mode === "hidden") return e = vf(t, o), t.lanes = 536870912, e.memoizedState = { baseLanes: 0, cachePool: null }, js(null, e);
        if (Hg(t), (e = We) ? (e = CI(e, uo), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Tr !== null ? { id: rl, overflow: il } : null, retryLane: 536870912, hydrationErrors: null }, a = Ty(e), a.return = t, t.child = a, qt = t, We = null)) : e = null, e === null) throw _r(t);
        return t.lanes = 536870912, null;
      }
      return vf(t, o);
    }
    var r = e.memoizedState;
    if (r !== null) {
      var i = r.dehydrated;
      if (Hg(t), l) if (t.flags & 256) t.flags &= -257, t = K0(e, t, a);
      else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
      else throw Error(R(558));
      else if (Lt || Ii(e, t, a, false), l = (a & e.childLanes) !== 0, Lt || l) {
        if (wr.current === null) {
          if (o = Ne, o !== null && (i = JC(o, a), i !== 0 && i !== r.retryLane)) throw r.retryLane = i, Pi(e, i), Ta(o, e, i), oL;
          Zf();
        }
        t = K0(e, t, a);
      } else e = r.treeContext, We = so(i.nextSibling), qt = t, le = true, Lr = null, uo = false, e !== null && wy(t, e), t = vf(t, o), t.flags |= 134221824;
      return t;
    }
    return e = Dl(e.child, { mode: o.mode, children: o.children }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function xn(e, t) {
    var a = t.ref;
    if (a === null) e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object") throw Error(R(284));
      (e === null || e.ref !== a) && (t.flags |= 4194816);
    }
  }
  function Xg(e, t, a, o, l) {
    return Ai(t), a = Kv(e, t, a, o, void 0, l), o = Wv(), e !== null && !Lt ? (Yv(e, t, l), Hl(e, t, l)) : (le && o && sm(t), t.flags |= 1, At(e, t, a, l), t.child);
  }
  function W0(e, t, a, o, l, r) {
    return Ai(t), t.updateQueue = null, a = Hy(t, o, a, l), Ny(e), o = Wv(), e !== null && !Lt ? (Yv(e, t, r), Hl(e, t, r)) : (le && o && sm(t), t.flags |= 1, At(e, t, a, r), t.child);
  }
  function Y0(e, t, a, o, l) {
    if (Ai(t), t.stateNode === null) {
      var r = Rn, i = a.contextType;
      typeof i == "object" && i !== null && (r = Yt(i)), r = new a(o, r), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = Vg, t.stateNode = r, r._reactInternals = t, r = t.stateNode, r.props = o, r.state = t.memoizedState, r.refs = {}, zv(t), i = a.contextType, r.context = typeof i == "object" && i !== null ? Yt(i) : Rn, r.state = t.memoizedState, i = a.getDerivedStateFromProps, typeof i == "function" && ($h(t, a, i, o), r.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof r.getSnapshotBeforeUpdate == "function" || typeof r.UNSAFE_componentWillMount != "function" && typeof r.componentWillMount != "function" || (i = r.state, typeof r.componentWillMount == "function" && r.componentWillMount(), typeof r.UNSAFE_componentWillMount == "function" && r.UNSAFE_componentWillMount(), i !== r.state && Vg.enqueueReplaceState(r, r.state, null), Ws(t, o, r, l), Ks(), r.state = t.memoizedState), typeof r.componentDidMount == "function" && (t.flags |= 4194308), o = true;
    } else if (e === null) {
      r = t.stateNode;
      var n = t.memoizedProps, u = Mi(a, n);
      r.props = u;
      var d = r.context, c = a.contextType;
      i = Rn, typeof c == "object" && c !== null && (i = Yt(c));
      var h = a.getDerivedStateFromProps;
      c = typeof h == "function" || typeof r.getSnapshotBeforeUpdate == "function", n = t.pendingProps !== n, c || typeof r.UNSAFE_componentWillReceiveProps != "function" && typeof r.componentWillReceiveProps != "function" || (n || d !== i) && F0(t, r, o, i), sr = false;
      var s = t.memoizedState;
      r.state = s, Ws(t, o, r, l), Ks(), d = t.memoizedState, n || s !== d || sr ? (typeof h == "function" && ($h(t, a, h, o), d = t.memoizedState), (u = sr || q0(t, a, u, o, s, d, i)) ? (c || typeof r.UNSAFE_componentWillMount != "function" && typeof r.componentWillMount != "function" || (typeof r.componentWillMount == "function" && r.componentWillMount(), typeof r.UNSAFE_componentWillMount == "function" && r.UNSAFE_componentWillMount()), typeof r.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof r.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = o, t.memoizedState = d), r.props = o, r.state = d, r.context = i, o = u) : (typeof r.componentDidMount == "function" && (t.flags |= 4194308), o = false);
    } else {
      r = t.stateNode, Ug(e, t), i = t.memoizedProps, c = Mi(a, i), r.props = c, h = t.pendingProps, s = r.context, d = a.contextType, u = Rn, typeof d == "object" && d !== null && (u = Yt(d)), n = a.getDerivedStateFromProps, (d = typeof n == "function" || typeof r.getSnapshotBeforeUpdate == "function") || typeof r.UNSAFE_componentWillReceiveProps != "function" && typeof r.componentWillReceiveProps != "function" || (i !== h || s !== u) && F0(t, r, o, u), sr = false, s = t.memoizedState, r.state = s, Ws(t, o, r, l), Ks();
      var f = t.memoizedState;
      i !== h || s !== f || sr || e !== null && e.dependencies !== null && Uf(e.dependencies) ? (typeof n == "function" && ($h(t, a, n, o), f = t.memoizedState), (c = sr || q0(t, a, c, o, s, f, u) || e !== null && e.dependencies !== null && Uf(e.dependencies)) ? (d || typeof r.UNSAFE_componentWillUpdate != "function" && typeof r.componentWillUpdate != "function" || (typeof r.componentWillUpdate == "function" && r.componentWillUpdate(o, f, u), typeof r.UNSAFE_componentWillUpdate == "function" && r.UNSAFE_componentWillUpdate(o, f, u)), typeof r.componentDidUpdate == "function" && (t.flags |= 4), typeof r.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof r.componentDidUpdate != "function" || i === e.memoizedProps && s === e.memoizedState || (t.flags |= 4), typeof r.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && s === e.memoizedState || (t.flags |= 1024), t.memoizedProps = o, t.memoizedState = f), r.props = o, r.state = f, r.context = u, o = c) : (typeof r.componentDidUpdate != "function" || i === e.memoizedProps && s === e.memoizedState || (t.flags |= 4), typeof r.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && s === e.memoizedState || (t.flags |= 1024), o = false);
    }
    return r = o, xn(e, t), o = (t.flags & 128) !== 0, r || o ? (r = t.stateNode, a = o && typeof a.getDerivedStateFromError != "function" ? null : r.render(), t.flags |= 1, e !== null && o ? (t.child = _i(t, e.child, null, l), t.child = _i(t, null, a, l)) : At(e, t, a, l), t.memoizedState = r.state, e = t.child) : e = Hl(e, t, l), e;
  }
  function j0(e, t, a, o) {
    return Ei(), t.flags |= 256, At(e, t, a, o), t.child;
  }
  var Kg = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
  function Wg(e) {
    return { baseLanes: e, cachePool: Ry() };
  }
  function Yg(e, t, a) {
    return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Na), e;
  }
  function yE(e, t, a) {
    var o = t.pendingProps, l = false, r = (t.flags & 128) !== 0, i;
    if ((i = r) || (i = e !== null && e.memoizedState === null ? false : (Qt.current & 2) !== 0), i && (l = true, t.flags &= -129), i = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (le) {
        if (l ? Sr(t) : Cr(), (e = We) ? (e = CI(e, uo), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = { dehydrated: e, treeContext: Tr !== null ? { id: rl, overflow: il } : null, retryLane: 536870912, hydrationErrors: null }, a = Ty(e), a.return = t, t.child = a, qt = t, We = null)) : e = null, e === null) throw _r(t);
        return vL(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      return r = o.children, o = o.fallback, l ? (Cr(), l = t.mode, r = hm({ mode: "hidden", children: r }, l), o = xi(o, l, a, null), r.return = t, o.return = t, r.sibling = o, t.child = r, o = t.child, o.memoizedState = Wg(a), o.childLanes = Yg(e, i, a), t.memoizedState = Kg, js(null, o)) : (Sr(t), lL(t, r));
    }
    var n = e.memoizedState;
    if (n !== null) {
      var u = n.dehydrated;
      if (u !== null) return Fk(e, t, r, i, o, u, n, a);
    }
    return l ? (Cr(), l = o.fallback, r = t.mode, n = e.child, u = n.sibling, o = Dl(n, { mode: "hidden", children: o.children }), o.subtreeFlags = n.subtreeFlags & 1206910976, u !== null ? l = Dl(u, l) : (l = xi(l, r, a, null), l.flags |= 2), l.return = t, o.return = t, o.sibling = l, t.child = o, js(null, o), o = t.child, l = e.child.memoizedState, l === null ? l = Wg(a) : (r = l.cachePool, r !== null ? (n = vt._currentValue, r = r.parent !== n ? { parent: n, pool: n } : r) : r = Ry(), l = { baseLanes: l.baseLanes | a, cachePool: r }), o.memoizedState = l, o.childLanes = Yg(e, i, a), t.memoizedState = Kg, js(e.child, o)) : (Sr(t), a = e.child, e = a.sibling, a = Dl(a, { mode: "visible", children: o.children }), a.return = t, a.sibling = null, e !== null && (i = t.deletions, i === null ? (t.deletions = [e], t.flags |= 16) : i.push(e)), t.child = a, t.memoizedState = null, a);
  }
  function lL(e, t) {
    return t = hm({ mode: "visible", children: t }, e.mode), t.return = e, e.child = t;
  }
  function hm(e, t) {
    return e = Aa(22, e, null, t), e.lanes = 0, e;
  }
  function Zc(e, t, a) {
    return _i(t, e.child, null, a), e = lL(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
  }
  function Fk(e, t, a, o, l, r, i, n) {
    if (a) return t.flags & 256 ? (Sr(t), t.flags &= -257, Zc(e, t, n)) : t.memoizedState !== null ? (Cr(), t.child = e.child, t.flags |= 128, null) : (Cr(), r = l.fallback, i = t.mode, l = hm({ mode: "visible", children: l.children }, i), r = xi(r, i, n, null), r.flags |= 2, l.return = t, r.return = t, l.sibling = r, t.child = l, _i(t, e.child, null, n), l = t.child, l.memoizedState = Wg(n), l.childLanes = Yg(e, o, n), t.memoizedState = Kg, js(null, l));
    if (Sr(t), vL(r)) {
      if (o = r.nextSibling && r.nextSibling.dataset, o) var u = o.dgst;
      return o = u, o !== "" && (l = Error(R(419)), l.stack = "", l.digest = o, rd({ value: l, source: null, stack: null })), Zc(e, t, n);
    }
    if (Lt || Ii(e, t, n, false), o = (n & e.childLanes) !== 0, Lt || o) {
      if (wr.current !== null) return Zc(e, t, n);
      if (o = Ne, o !== null && (l = JC(o, n), l !== 0 && l !== i.retryLane)) throw i.retryLane = l, Pi(e, l), Ta(o, e, l), oL;
      return bv(r) || Zf(), Zc(e, t, n);
    }
    return bv(r) ? (t.flags |= 192, t.child = e.child, null) : (e = i.treeContext, We = so(r.nextSibling), qt = t, le = true, Lr = null, uo = false, e !== null && wy(t, e), t = lL(t, l.children), t.flags |= 134221824, t);
  }
  function Q0(e, t, a) {
    e.lanes |= t;
    var o = e.alternate;
    o !== null && (o.lanes |= t), mf(e.return, t, a);
  }
  function Z0(e) {
    for (var t = null; e !== null; ) {
      var a = e.alternate;
      a !== null && Hf(a) === null && (t = e), e = e.sibling;
    }
    return t;
  }
  function Jc(e, t, a, o, l, r) {
    var i = e.memoizedState;
    i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: o, tail: a, tailMode: l, treeForkCount: r } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = o, i.tail = a, i.tailMode = l, i.treeForkCount = r);
  }
  function eg(e) {
    var t = e.child;
    for (e.child = null; t !== null; ) {
      var a = t.sibling;
      t.sibling = e.child, e.child = t, t = a;
    }
  }
  function jg(e, t, a) {
    var o = t.pendingProps, l = o.revealOrder, r = o.tail;
    o = o.children;
    var i = Qt.current;
    if (t.flags & 128) return nd(t, i), null;
    var n = (i & 2) !== 0;
    if (n ? (i = i & 1 | 2, t.flags |= 128) : i &= 1, nd(t, i), l === "backwards" && e !== null ? (eg(e), At(e, t, o, a), eg(e)) : At(e, t, o, a), o = le ? ld : 0, !n && e !== null && (e.flags & 128) !== 0) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Q0(e, a, t);
      else if (e.tag === 19) Q0(e, a, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    switch (l) {
      case "backwards":
        a = Z0(t.child), a === null ? (l = t.child, t.child = null) : (l = a.sibling, a.sibling = null, eg(t)), Jc(t, true, l, null, r, o);
        break;
      case "unstable_legacy-backwards":
        for (a = null, l = t.child, t.child = null; l !== null; ) {
          if (e = l.alternate, e !== null && Hf(e) === null) {
            t.child = l;
            break;
          }
          e = l.sibling, l.sibling = a, a = l, l = e;
        }
        Jc(t, true, a, null, r, o);
        break;
      case "together":
        Jc(t, false, null, null, void 0, o);
        break;
      case "independent":
        t.memoizedState = null;
        break;
      default:
        a = Z0(t.child), a === null ? (l = t.child, t.child = null) : (l = a.sibling, a.sibling = null), Jc(t, false, l, a, r, o);
    }
    return t.child;
  }
  function J0(e, t, a) {
    var o = t.pendingProps;
    return mr(t, t.type, o.value), At(e, t, o.children, a), t.child;
  }
  function Hl(e, t, a) {
    if (e !== null && (t.dependencies = e.dependencies), Rr |= t.lanes, (a & t.childLanes) === 0) if (e !== null) {
      if (Ii(e, t, a, false), (a & t.childLanes) === 0) return null;
    } else return null;
    if (e !== null && t.child !== e.child) throw Error(R(153));
    if (t.child !== null) {
      for (e = t.child, a = Dl(e, e.pendingProps), t.child = a, a.return = t; e.sibling !== null; ) e = e.sibling, a = a.sibling = Dl(e, e.pendingProps), a.return = t;
      a.sibling = null;
    }
    return t.child;
  }
  function rL(e, t) {
    return (e.lanes & t) !== 0 ? true : (e = e.dependencies, !!(e !== null && Uf(e)));
  }
  function zk(e, t, a) {
    switch (t.tag) {
      case 3:
        _f(t, t.stateNode.containerInfo), mr(t, vt, e.memoizedState.cache), Ei();
        break;
      case 27:
      case 5:
        Cg(t);
        break;
      case 4:
        _f(t, t.stateNode.containerInfo);
        break;
      case 10:
        mr(t, t.type, t.memoizedProps.value);
        break;
      case 31:
        if (t.memoizedState !== null) return t.flags |= 128, Hg(t), null;
        break;
      case 13:
        var o = t.memoizedState;
        if (o !== null) {
          if (o.dehydrated !== null) return Sr(t), t.flags |= 128, null;
          o = Ii(e, t, a, false);
          var l = t.child.childLanes;
          return o || (a & l) !== 0 ? yE(e, t, a) : (Sr(t), e = Hl(e, t, a), e !== null ? e.sibling : null);
        }
        Sr(t);
        break;
      case 19:
        if (t.flags & 128) return jg(e, t, a);
        if (l = (e.flags & 128) !== 0, o = (a & t.childLanes) !== 0, o || (Ii(e, t, a, false), o = (a & t.childLanes) !== 0), l) {
          if (o) return jg(e, t, a);
          t.flags |= 128;
        }
        if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), nd(t, Qt.current), o) break;
        return null;
      case 22:
        return t.lanes = 0, CE(e, t, a, t.pendingProps);
      case 24:
        mr(t, vt, e.memoizedState.cache);
    }
    return Hl(e, t, a);
  }
  function EE(e, t, a) {
    if (e !== null) if (e.memoizedProps !== t.pendingProps) Lt = true;
    else {
      if (!rL(e, a) && (t.flags & 128) === 0) return Lt = false, zk(e, t, a);
      Lt = (e.flags & 131072) !== 0;
    }
    else Lt = false, le && (t.flags & 1048576) !== 0 && _y(t, ld, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var o = t.pendingProps;
          if (e = hi(t.elementType), t.type = e, typeof e == "function") Bv(e) ? (o = Mi(e, o), t.tag = 1, t = Y0(null, t, e, o, a)) : (t.tag = 0, t = Xg(null, t, e, o, a));
          else {
            if (e != null) {
              var l = e.$$typeof;
              if (l === Ev) {
                t.tag = 11, t = V0(null, t, e, o, a);
                break e;
              } else if (l === Iv) {
                t.tag = 14, t = G0(null, t, e, o, a);
                break e;
              } else if (l === ol) {
                t.tag = 10, t.type = e, t = J0(null, t, a);
                break e;
              }
            }
            throw t = xg(e) || e, Error(R(306, t, ""));
          }
        }
        return t;
      case 0:
        return Xg(e, t, t.type, t.pendingProps, a);
      case 1:
        return o = t.type, l = Mi(o, t.pendingProps), Y0(e, t, o, l, a);
      case 3:
        e: {
          if (_f(t, t.stateNode.containerInfo), e === null) throw Error(R(387));
          o = t.pendingProps;
          var r = t.memoizedState;
          l = r.element, Ug(e, t), Ws(t, o, null, a);
          var i = t.memoizedState;
          if (o = i.cache, mr(t, vt, o), o !== r.cache && Og(t, [vt], a, true), Ks(), o = i.element, r.isDehydrated) if (r = { element: o, isDehydrated: false, cache: i.cache }, t.updateQueue.baseState = r, t.memoizedState = r, t.flags & 256) {
            t = j0(e, t, o, a);
            break e;
          } else if (o !== l) {
            l = no(Error(R(424)), t), rd(l), t = j0(e, t, o, a);
            break e;
          } else for (e = t.stateNode.containerInfo, e.nodeType === 9 ? e = e.body : e = e.nodeName === "HTML" ? e.ownerDocument.body : e, We = so(e.firstChild), qt = t, le = true, Lr = null, uo = true, a = Oy(t, null, o, a), t.child = a; a; ) a.flags = a.flags & -3 | 134221824, a = a.sibling;
          else {
            if (Ei(), o === l) {
              t = Hl(e, t, a);
              break e;
            }
            At(e, t, o, a);
          }
          t = t.child;
        }
        return t;
      case 26:
        return xn(e, t), e === null ? (a = IC(t.type, null, t.pendingProps, null)) ? t.memoizedState = a : le || (t.stateNode = mI(t.type, t.pendingProps, vr.current, t)) : t.memoizedState = IC(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
      case 27:
        return Cg(t), e === null && le && (o = t.stateNode = yI(t.type, t.pendingProps, vr.current), qt = t, uo = true, l = We, Dr(t.type) ? (xv = l, We = so(o.firstChild)) : We = l), At(e, t, t.pendingProps.children, a), xn(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && le && ((l = o = We) && (o = OD(o, t.type, t.pendingProps, uo), o !== null ? (t.stateNode = o, qt = t, We = so(o.firstChild), uo = false, l = true) : l = false), l || _r(t)), Cg(t), l = t.type, r = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = r.children, gv(l, r) ? o = null : i !== null && gv(l, i) && (t.flags |= 32), t.memoizedState !== null && (l = Kv(e, t, Rk, null, null, a), tu._currentValue = l), xn(e, t), At(e, t, o, a), t.child;
      case 6:
        return e === null && le && ((e = a = We) && (a = PD(a, t.pendingProps, uo), a !== null ? (t.stateNode = a, qt = t, We = null, e = true) : e = false), e || _r(t)), null;
      case 13:
        return yE(e, t, a);
      case 4:
        return _f(t, t.stateNode.containerInfo), o = t.pendingProps, e === null ? t.child = _i(t, null, o, a) : At(e, t, o, a), t.child;
      case 11:
        return V0(e, t, t.type, t.pendingProps, a);
      case 7:
        return o = t.pendingProps, xn(e, t), At(e, t, o, a), t.child;
      case 8:
        return At(e, t, t.pendingProps.children, a), t.child;
      case 12:
        return At(e, t, t.pendingProps.children, a), t.child;
      case 10:
        return J0(e, t, a);
      case 9:
        return l = t.type._context, o = t.pendingProps.children, Ai(t), l = Yt(l), o = o(l), t.flags |= 1, At(e, t, o, a), t.child;
      case 14:
        return G0(e, t, t.type, t.pendingProps, a);
      case 15:
        return SE(e, t, t.type, t.pendingProps, a);
      case 19:
        return jg(e, t, a);
      case 31:
        return qk(e, t, a);
      case 22:
        return CE(e, t, a, t.pendingProps);
      case 24:
        return Ai(t), o = Yt(vt), e === null ? (l = qv(), l === null && (l = Ne, r = Hv(), l.pooledCache = r, r.refCount++, r !== null && (l.pooledCacheLanes |= a), l = r), t.memoizedState = { parent: o, cache: l }, zv(t), mr(t, vt, l)) : ((e.lanes & a) !== 0 && (Ug(e, t), Ws(t, null, null, a), Ks()), l = e.memoizedState, r = t.memoizedState, l.parent !== o ? (l = { parent: o, cache: o }, t.memoizedState = l, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = l), mr(t, vt, o)) : (o = r.cache, mr(t, vt, o), o !== l.cache && Og(t, [vt], a, true))), At(e, t, t.pendingProps.children, a), t.child;
      case 30:
        return t.stateNode === null && (t.stateNode = { autoName: null, paired: null, clones: null, ref: null }), o = t.pendingProps, o.name != null && o.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : le && sm(t), e !== null && e.memoizedProps.name !== o.name ? t.flags |= 4194816 : xn(e, t), At(e, t, o.children, a), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(R(156, t.tag));
  }
  function Ml(e) {
    e.flags |= 4;
  }
  function tg(e, t, a, o, l) {
    var r;
    if ((r = (e.mode & 32) !== 0) && (r = a === null ? _C(t, o) : _C(t, o) && (o.src !== a.src || o.srcSet !== a.srcSet)), r) {
      if (e.flags |= 16777216, (l & 335544128) === l) if (e.stateNode.complete) e.flags |= 8192;
      else if ($E()) e.flags |= 8192;
      else throw Ci = Bf, Fv;
    } else e.flags &= -16777217;
  }
  function $0(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0) e.flags &= -16777217;
    else if (e.flags |= 16777216, !TI(t)) if ($E()) e.flags |= 8192;
    else throw Ci = Bf, Fv;
  }
  function $c(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? jC() : 536870912, e.lanes |= t, jn |= t);
  }
  function ks(e, t) {
    if (!le) switch (e.tailMode) {
      case "visible":
        break;
      case "collapsed":
        for (var a = e.tail, o = null; a !== null; ) a.alternate !== null && (o = a), a = a.sibling;
        o === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : o.sibling = null;
        break;
      default:
        for (t = e.tail, a = null; t !== null; ) t.alternate !== null && (a = t), t = t.sibling;
        a === null ? e.tail = null : a.sibling = null;
    }
  }
  function Ke(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, a = 0, o = 0;
    if (t) for (var l = e.child; l !== null; ) a |= l.lanes | l.childLanes, o |= l.subtreeFlags & 1206910976, o |= l.flags & 1206910976, l.return = e, l = l.sibling;
    else for (l = e.child; l !== null; ) a |= l.lanes | l.childLanes, o |= l.subtreeFlags, o |= l.flags, l.return = e, l = l.sibling;
    return e.subtreeFlags |= o, e.childLanes = a, t;
  }
  function Vk(e, t, a) {
    var o = t.pendingProps;
    switch (Nv(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Ke(t), null;
      case 1:
        return Ke(t), null;
      case 3:
        return a = t.stateNode, o = null, e !== null && (o = e.memoizedState.cache), t.memoizedState.cache !== o && (t.flags |= 2048), Ol(vt), Xn(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (Ln(t) ? Ml(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Qh())), Ke(t), null;
      case 26:
        var l = t.type, r = t.memoizedState;
        return e === null ? (Ml(t), r !== null ? (Ke(t), $0(t, r)) : (Ke(t), tg(t, l, null, o, a))) : r ? r !== e.memoizedState ? (Ml(t), Ke(t), $0(t, r)) : (Ke(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== o && Ml(t), Ke(t), tg(t, l, e, o, a)), null;
      case 27:
        if (wf(t), a = vr.current, l = t.type, e !== null && t.stateNode != null) e.memoizedProps !== o && Ml(t);
        else {
          if (!o) {
            if (t.stateNode === null) throw Error(R(166));
            return Ke(t), t.subtreeFlags &= -33554433, null;
          }
          e = nl.current, Ln(t) ? A0(t, e) : (e = yI(l, o, a), t.stateNode = e, Ml(t));
        }
        return Ke(t), t.subtreeFlags &= -33554433, null;
      case 5:
        if (wf(t), l = t.type, e !== null && t.stateNode != null) e.memoizedProps !== o && Ml(t);
        else {
          if (!o) {
            if (t.stateNode === null) throw Error(R(166));
            return Ke(t), t.subtreeFlags &= -33554433, null;
          }
          if (r = nl.current, Ln(t)) A0(t, r);
          else {
            var i = cd(vr.current);
            switch (r) {
              case 1:
                r = i.createElementNS("http://www.w3.org/2000/svg", l);
                break;
              case 2:
                r = i.createElementNS("http://www.w3.org/1998/Math/MathML", l);
                break;
              default:
                switch (l) {
                  case "svg":
                    r = i.createElementNS("http://www.w3.org/2000/svg", l);
                    break;
                  case "math":
                    r = i.createElementNS("http://www.w3.org/1998/Math/MathML", l);
                    break;
                  case "script":
                    r = i.createElement("div"), r.innerHTML = "<script><\/script>", r = r.removeChild(r.firstChild);
                    break;
                  case "select":
                    r = typeof o.is == "string" ? i.createElement("select", { is: o.is }) : i.createElement("select"), o.multiple ? r.multiple = true : o.size && (r.size = o.size);
                    break;
                  default:
                    r = typeof o.is == "string" ? i.createElement(l, { is: o.is }) : i.createElement(l);
                }
            }
            r[Wt] = t, r[wa] = o;
            e: for (i = t.child; i !== null; ) {
              if (i.tag === 5 || i.tag === 6) r.appendChild(i.stateNode);
              else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                i.child.return = i, i = i.child;
                continue;
              }
              if (i === t) break e;
              for (; i.sibling === null; ) {
                if (i.return === null || i.return === t) break e;
                i = i.return;
              }
              i.sibling.return = i.return, i = i.sibling;
            }
            t.stateNode = r;
            e: switch (Zt(r, l, o), l) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                o = !!o.autoFocus;
                break e;
              case "img":
                o = true;
                break e;
              default:
                o = false;
            }
            o && Ml(t);
          }
        }
        return Ke(t), t.subtreeFlags &= -33554433, tg(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, a), null;
      case 6:
        if (e && t.stateNode != null) e.memoizedProps !== o && Ml(t);
        else {
          if (typeof o != "string" && t.stateNode === null) throw Error(R(166));
          if (e = vr.current, Ln(t)) {
            if (e = t.stateNode, a = t.memoizedProps, o = null, l = qt, l !== null) switch (l.tag) {
              case 27:
              case 5:
                o = l.memoizedProps;
            }
            e[Wt] = t, e = !!(e.nodeValue === a || o !== null && o.suppressHydrationWarning === true || cI(e.nodeValue, a)), e || _r(t, true);
          } else e = cd(e).createTextNode(o), e[Wt] = t, t.stateNode = e;
        }
        return Ke(t), null;
      case 31:
        if (a = t.memoizedState, e === null || e.memoizedState !== null) {
          if (o = Ln(t), a !== null) {
            if (e === null) {
              if (!o) throw Error(R(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(R(557));
              e[Wt] = t;
            } else Ei(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ke(t), e = false;
          } else a = Qh(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = true;
          if (!e) return t.flags & 256 ? (Ua(t), t) : (Ua(t), null);
          if ((t.flags & 128) !== 0) throw Error(R(558));
        }
        return Ke(t), null;
      case 13:
        if (o = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (l = Ln(t), o !== null && o.dehydrated !== null) {
            if (e === null) {
              if (!l) throw Error(R(318));
              if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(R(317));
              l[Wt] = t;
            } else Ei(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ke(t), l = false;
          } else l = Qh(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = l), l = true;
          if (!l) return t.flags & 256 ? (Ua(t), t) : (Ua(t), null);
        }
        return Ua(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = o !== null, e = e !== null && e.memoizedState !== null, a && (o = t.child, l = null, o.alternate !== null && o.alternate.memoizedState !== null && o.alternate.memoizedState.cachePool !== null && (l = o.alternate.memoizedState.cachePool.pool), r = null, o.memoizedState !== null && o.memoizedState.cachePool !== null && (r = o.memoizedState.cachePool.pool), r !== l && (o.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), $c(t, t.updateQueue), Ke(t), null);
      case 4:
        return Xn(), e === null && pL(t.stateNode.containerInfo), t.flags |= 67108864, Ke(t), null;
      case 10:
        return Ol(t.type), Ke(t), null;
      case 19:
        if (Gv(t), o = t.memoizedState, o === null) return Ke(t), null;
        if (l = (t.flags & 128) !== 0, r = o.rendering, r === null) if (l) ks(o, false);
        else {
          if (ut !== 0 || e !== null && (e.flags & 128) !== 0) for (e = t.child; e !== null; ) {
            if (r = Hf(e), r !== null) {
              for (t.flags |= 128, ks(o, false), e = r.updateQueue, t.updateQueue = e, $c(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null; ) Ay(a, e), a = a.sibling;
              return nd(t, Qt.current & 1 | 2), le && Rl(t, o.treeForkCount), t.child;
            }
            e = e.sibling;
          }
          o.tail !== null && Ha() > jf && (t.flags |= 128, l = true, ks(o, false), t.lanes = 4194304);
        }
        else {
          if (!l) if (e = Hf(r), e !== null) {
            if (t.flags |= 128, l = true, e = e.updateQueue, t.updateQueue = e, $c(t, e), ks(o, true), o.tail === null && o.tailMode !== "collapsed" && o.tailMode !== "visible" && !r.alternate && !le) return Ke(t), null;
          } else 2 * Ha() - o.renderingStartTime > jf && a !== 536870912 && (t.flags |= 128, l = true, ks(o, false), t.lanes = 4194304);
          o.isBackwards ? (r.sibling = t.child, t.child = r) : (e = o.last, e !== null ? e.sibling = r : t.child = r, o.last = r);
        }
        if (o.tail !== null) {
          e = o.tail;
          e: {
            for (a = e; a !== null; ) {
              if (a.alternate !== null) {
                a = false;
                break e;
              }
              a = a.sibling;
            }
            a = true;
          }
          return o.rendering = e, o.tail = e.sibling, o.renderingStartTime = Ha(), e.sibling = null, r = Qt.current, r = l ? r & 1 | 2 : r & 1, o.tailMode === "visible" || o.tailMode === "collapsed" || !a || le ? nd(t, r) : (a = r, Ye(Jt, t), Ye(Qt, a), ia === null && (ia = t)), le && Rl(t, o.treeForkCount), e;
        }
        return Ke(t), null;
      case 22:
      case 23:
        return Ua(t), Vv(), o = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== o && (t.flags |= 8192) : o && (t.flags |= 8192), o ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Ke(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Ke(t), a = t.updateQueue, a !== null && $c(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), o = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (o = t.memoizedState.cachePool.pool), o !== a && (t.flags |= 2048), e !== null && jt(Si), null;
      case 24:
        return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), Ol(vt), Ke(t), null;
      case 25:
        return null;
      case 30:
        return t.flags |= 33554432, Ke(t), null;
    }
    throw Error(R(156, t.tag));
  }
  function Gk(e, t) {
    switch (Nv(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return Ol(vt), Xn(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return wf(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Ua(t), t.alternate === null) throw Error(R(340));
          Ei();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Ua(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null) throw Error(R(340));
          Ei();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return Gv(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
      case 4:
        return Xn(), null;
      case 10:
        return Ol(t.type), null;
      case 22:
      case 23:
        return Ua(t), Vv(), e !== null && jt(Si), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return Ol(vt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function IE(e, t) {
    switch (Nv(t), t.tag) {
      case 3:
        Ol(vt), Xn();
        break;
      case 26:
      case 27:
      case 5:
        wf(t);
        break;
      case 4:
        Xn();
        break;
      case 31:
        t.memoizedState !== null && Ua(t);
        break;
      case 13:
        Ua(t);
        break;
      case 19:
        Gv(t);
        break;
      case 10:
        Ol(t.type);
        break;
      case 22:
      case 23:
        Ua(t), Vv(), e !== null && jt(Si);
        break;
      case 24:
        Ol(vt);
    }
  }
  function Ed(e, t) {
    try {
      var a = t.updateQueue, o = a !== null ? a.lastEffect : null;
      if (o !== null) {
        var l = o.next;
        a = l;
        do {
          if ((a.tag & e) === e) {
            o = void 0;
            var r = a.create, i = a.inst;
            o = r(), i.destroy = o;
          }
          a = a.next;
        } while (a !== l);
      }
    } catch (n) {
      ke(t, t.return, n);
    }
  }
  function Mr(e, t, a) {
    try {
      var o = t.updateQueue, l = o !== null ? o.lastEffect : null;
      if (l !== null) {
        var r = l.next;
        o = r;
        do {
          if ((o.tag & e) === e) {
            var i = o.inst, n = i.destroy;
            if (n !== void 0) {
              i.destroy = void 0, l = t;
              var u = a, d = n;
              try {
                d();
              } catch (c) {
                ke(l, u, c);
              }
            }
          }
          o = o.next;
        } while (o !== r);
      }
    } catch (c) {
      ke(t, t.return, c);
    }
  }
  function AE(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var a = e.stateNode;
      try {
        Uy(t, a);
      } catch (o) {
        ke(e, e.return, o);
      }
    }
  }
  function TE(e, t, a) {
    a.props = Mi(e.type, e.memoizedProps), a.state = e.memoizedState;
    try {
      a.componentWillUnmount();
    } catch (o) {
      ke(e, t, o);
    }
  }
  function tl(e, t) {
    try {
      var a = e.ref;
      if (a !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var o = e.stateNode;
            break;
          case 30:
            var l = e.stateNode, r = Ul(e.memoizedProps, l);
            (l.ref === null || l.ref.name !== r) && (l.ref = vI(r)), o = l.ref;
            break;
          case 7:
            if (e.stateNode === null) {
              var i = new Ga(e);
              _a(e.child, false, kD, i, void 0, void 0), e.stateNode = i;
            }
            o = e.stateNode;
            break;
          default:
            o = e.stateNode;
        }
        typeof a == "function" ? e.refCleanup = a(o) : a.current = o;
      }
    } catch (n) {
      ke(e, t, n);
    }
  }
  function Kt(e, t) {
    var a = e.ref, o = e.refCleanup;
    if (a !== null) if (typeof o == "function") try {
      o();
    } catch (l) {
      ke(e, t, l);
    } finally {
      e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
    }
    else if (typeof a == "function") try {
      a(null);
    } catch (l) {
      ke(e, t, l);
    }
    else a.current = null;
  }
  function Gf(e, t) {
    if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var a = 0; a < t.length; a++) SI(e.stateNode, t[a]);
  }
  function eC(e) {
    for (var t = e.return; t !== null && (nL(t) && SI(e.stateNode, t.stateNode), !iL(t)); ) t = t.return;
  }
  function Qs(e) {
    for (var t = e.return; t !== null && (nL(t) && DD(e.stateNode, t.stateNode), !iL(t)); ) t = t.return;
  }
  function iL(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 27;
  }
  function nL(e) {
    return e && e.tag === 7 && e.stateNode !== null;
  }
  function Qg(e) {
    var t = e.type, a = e.memoizedProps, o = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && o.focus();
          break e;
        case "img":
          a.src ? o.src = a.src : a.srcSet && (o.srcset = a.srcSet);
      }
    } catch (l) {
      ke(e, e.return, l);
    }
  }
  function ag(e, t, a) {
    try {
      var o = e.stateNode;
      pD(o, e.type, a, t), o[wa] = t;
    } catch (l) {
      ke(e, e.return, l);
    }
  }
  function _E(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Dr(e.type) || e.tag === 4;
  }
  function og(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || _E(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && Dr(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Zg(e, t, a, o) {
    var l = e.tag;
    if (l === 5 || l === 6) l = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(l, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(l), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = ll)), Gf(e, o), Le = true;
    else if (l !== 4 && (l === 27 && (Gf(e, o), o = null, Dr(e.type) && (a = e.stateNode, t = null)), e = e.child, e !== null)) for (Zg(e, t, a, o), e = e.sibling; e !== null; ) Zg(e, t, a, o), e = e.sibling;
  }
  function Xf(e, t, a, o) {
    var l = e.tag;
    if (l === 5 || l === 6) l = e.stateNode, t ? a.insertBefore(l, t) : a.appendChild(l), Gf(e, o), Le = true;
    else if (l !== 4 && (l === 27 && (Gf(e, o), o = null, Dr(e.type) && (a = e.stateNode)), e = e.child, e !== null)) for (Xf(e, t, a, o), e = e.sibling; e !== null; ) Xf(e, t, a, o), e = e.sibling;
  }
  function wE(e) {
    var t = e.stateNode, a = e.memoizedProps;
    try {
      for (var o = e.type, l = t.attributes; l.length; ) t.removeAttributeNode(l[0]);
      Zt(t, o, a), t[Wt] = e, t[wa] = a;
    } catch (r) {
      ke(e, e.return, r);
    }
  }
  var Kf = false, Ba = null;
  function tC(e) {
    (e.tag === 30 || (e.subtreeFlags & 33554432) !== 0) && (Kf = true);
  }
  var al = null;
  function aC() {
    var e = al;
    return al = null, e;
  }
  var Ia = 0;
  function nu(e, t, a, o, l) {
    return Ia = 0, ME(e.child, t, a, o, l);
  }
  function ME(e, t, a, o, l) {
    for (var r = false; e !== null; ) {
      if (e.tag === 5) {
        var i = e.stateNode;
        if (o !== null) {
          var n = vv(i);
          o.push(n), n.view && (r = true);
        } else r || vv(i).view && (r = true);
        Kf = true, pI(i, Ia === 0 ? t : t + "_" + Ia, a), Ia++;
      } else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && l || ME(e.child, t, a, o, l) && (r = true));
      e = e.sibling;
    }
    return r;
  }
  function sl(e, t) {
    for (; e !== null; ) e.tag === 5 ? hI(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || sl(e.child, t)), e = e.sibling;
  }
  function Lf(e) {
    if ((e.subtreeFlags & 18874368) !== 0) for (e = e.child; e !== null; ) {
      if ((e.tag !== 22 || e.memoizedState === null) && (Lf(e), e.tag === 30 && (e.flags & 18874368) !== 0 && e.stateNode.paired)) {
        var t = e.memoizedProps;
        if (t.name == null || t.name === "auto") throw Error(R(544));
        var a = t.name;
        t = zl(t.default, t.share), t !== "none" && (nu(e, a, t, null, false) || sl(e.child, false));
      }
      e = e.sibling;
    }
  }
  function Jg(e, t) {
    if (e.tag === 30) {
      var a = e.stateNode, o = e.memoizedProps, l = Ul(o, a), r = zl(o.default, a.paired ? o.share : o.enter);
      r !== "none" ? nu(e, l, r, null, false) ? (Lf(e), a.paired || t || Qn(e, o.onEnter)) : sl(e.child, false) : Lf(e);
    } else if ((e.subtreeFlags & 33554432) !== 0) for (e = e.child; e !== null; ) Jg(e, t), e = e.sibling;
    else Lf(e);
  }
  function $g(e) {
    if (Ba !== null && Ba.size !== 0) {
      var t = Ba;
      if ((e.subtreeFlags & 18874368) !== 0) for (e = e.child; e !== null; ) {
        if (e.tag !== 22 || e.memoizedState === null) {
          if (e.tag === 30 && (e.flags & 18874368) !== 0) {
            var a = e.memoizedProps, o = a.name;
            if (o != null && o !== "auto") {
              var l = t.get(o);
              if (l !== void 0) {
                var r = zl(a.default, a.share);
                if (r !== "none" && (nu(e, o, r, null, false) ? (r = e.stateNode, l.paired = r, r.paired = l, Qn(e, a.onShare)) : sl(e.child, false)), t.delete(o), t.size === 0) break;
              }
            }
          }
          $g(e);
        }
        e = e.sibling;
      }
    }
  }
  function ev(e) {
    if (e.tag === 30) {
      var t = e.memoizedProps, a = Ul(t, e.stateNode), o = Ba !== null ? Ba.get(a) : void 0, l = zl(t.default, o !== void 0 ? t.share : t.exit);
      l !== "none" && (nu(e, a, l, null, false) ? o !== void 0 ? (l = e.stateNode, o.paired = l, l.paired = o, Ba.delete(a), Qn(e, t.onShare)) : Qn(e, t.onExit) : sl(e.child, false)), Ba !== null && $g(e);
    } else if ((e.subtreeFlags & 33554432) !== 0) for (e = e.child; e !== null; ) ev(e), e = e.sibling;
    else Ba !== null && $g(e);
  }
  function RE(e) {
    for (e = e.child; e !== null; ) {
      if (e.tag === 30) {
        var t = e.memoizedProps, a = Ul(t, e.stateNode);
        t = zl(t.default, t.update), e.flags &= -5, t !== "none" && nu(e, a, t, e.memoizedState = [], false);
      } else (e.subtreeFlags & 33554432) !== 0 && RE(e);
      e = e.sibling;
    }
  }
  function tv(e) {
    if ((e.subtreeFlags & 18874368) !== 0) for (e = e.child; e !== null; ) {
      if (e.tag !== 22 || e.memoizedState === null) {
        if (e.tag === 30 && (e.flags & 18874368) !== 0) {
          var t = e.stateNode;
          t.paired !== null && (t.paired = null, sl(e.child, false));
        }
        tv(e);
      }
      e = e.sibling;
    }
  }
  function bf(e) {
    if (e.tag === 30) e.stateNode.paired = null, sl(e.child, false), tv(e);
    else if ((e.subtreeFlags & 33554432) !== 0) for (e = e.child; e !== null; ) bf(e), e = e.sibling;
    else tv(e);
  }
  function kE(e) {
    for (e = e.child; e !== null; ) e.tag === 30 ? sl(e.child, false) : (e.subtreeFlags & 33554432) !== 0 && kE(e), e = e.sibling;
  }
  function uL(e, t, a, o, l, r, i) {
    for (var n = false; t !== null; ) {
      if (t.tag === 5) {
        var u = t.stateNode;
        if (r !== null && Ia < r.length) {
          var d = r[Ia], c = vv(u);
          (d.view || c.view) && (n = true);
          var h;
          if (h = (e.flags & 4) === 0) if (c.clip) h = true;
          else {
            h = d.rect;
            var s = c.rect;
            h = h.y !== s.y || h.x !== s.x || h.height !== s.height || h.width !== s.width;
          }
          h && (e.flags |= 4), c.abs ? c = !d.abs : (d = d.rect, c = c.rect, c = d.height !== c.height || d.width !== c.width), c && (e.flags |= 32);
        } else e.flags |= 32;
        (e.flags & 4) !== 0 && pI(u, Ia === 0 ? a : a + "_" + Ia, l), n && (e.flags & 4) !== 0 || (al === null && (al = []), al.push(u, Ia === 0 ? o : o + "_" + Ia, t.memoizedProps)), Ia++;
      } else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && i ? e.flags |= t.flags & 32 : uL(e, t.child, a, o, l, r, i) && (n = true));
      t = t.sibling;
    }
    return n;
  }
  function DE(e, t) {
    for (e = e.child; e !== null; ) {
      if (e.tag === 30) {
        var a = e.memoizedProps, o = e.stateNode, l = Ul(a, o), r = zl(a.default, a.update);
        if (t) {
          o = o.clones;
          var i = o === null ? null : o.map(xD);
        } else i = e.memoizedState, e.memoizedState = null;
        o = e;
        var n = e.child;
        Ia = 0, l = uL(o, n, l, l, r, i, false), (e.flags & 4) !== 0 && l && (t || Qn(e, a.onUpdate));
      } else (e.subtreeFlags & 33554432) !== 0 && DE(e, t);
      e = e.sibling;
    }
  }
  var Bt = false, Ae = false, Jo = false, lg = false, oC = typeof WeakSet == "function" ? WeakSet : Set, Nt = null, $o = false, qs = false, Wf = false, av = false;
  function Xk(e, t, a) {
    if (e = e.containerInfo, pv = au, e = Ly(e), Ov(e)) {
      if ("selectionStart" in e) var o = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        o = (o = e.ownerDocument) && o.defaultView || window;
        var l = o.getSelection && o.getSelection();
        if (l && l.rangeCount !== 0) {
          o = l.anchorNode;
          var r = l.anchorOffset, i = l.focusNode;
          l = l.focusOffset;
          try {
            o.nodeType, i.nodeType;
          } catch {
            o = null;
            break e;
          }
          var n = 0, u = -1, d = -1, c = 0, h = 0, s = e, f = null;
          t: for (; ; ) {
            for (var v; s !== o || r !== 0 && s.nodeType !== 3 || (u = n + r), s !== i || l !== 0 && s.nodeType !== 3 || (d = n + l), s.nodeType === 3 && (n += s.nodeValue.length), (v = s.firstChild) !== null; ) f = s, s = v;
            for (; ; ) {
              if (s === e) break t;
              if (f === o && ++c === r && (u = n), f === i && ++h === l && (d = n), (v = s.nextSibling) !== null) break;
              s = f, f = s.parentNode;
            }
            s = v;
          }
          o = u === -1 || d === -1 ? null : { start: u, end: d };
        } else o = null;
      }
      o = o || { start: 0, end: 0 };
    } else o = null;
    for (hv = { focusedElem: e, selectionRange: o }, au = false, a = (a & 335544064) === a, Nt = t, t = a ? 9270 : 1024; Nt !== null; ) {
      if (e = Nt, a && (o = e.deletions, o !== null)) for (r = 0; r < o.length; r++) a && ev(o[r]);
      if (e.alternate === null && (e.flags & 2) !== 0) a && tC(e), ef(a);
      else {
        if (e.tag === 22) {
          if (o = e.alternate, e.memoizedState !== null) {
            o !== null && o.memoizedState === null && a && ev(o), ef(a);
            continue;
          } else if (o !== null && o.memoizedState !== null) {
            a && tC(e), ef(a);
            continue;
          }
        }
        o = e.child, (e.subtreeFlags & t) !== 0 && o !== null ? (o.return = e, Nt = o) : (a && RE(e), ef(a));
      }
    }
    Ba = null;
  }
  function ef(e) {
    for (; Nt !== null; ) {
      var t = Nt, a = e, o = t.alternate, l = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if ((l & 1024) !== 0 && o !== null) {
            a = void 0, l = o.memoizedProps, o = o.memoizedState;
            var r = t.stateNode;
            try {
              var i = Mi(t.type, l);
              a = r.getSnapshotBeforeUpdate(i, o), r.__reactInternalSnapshotBeforeUpdate = a;
            } catch (n) {
              ke(t, t.return, n);
            }
          }
          break;
        case 3:
          if ((l & 1024) !== 0) {
            if (o = t.stateNode.containerInfo, a = o.nodeType, a === 9) Lv(o);
            else if (a === 1) switch (o.nodeName) {
              case "HEAD":
              case "HTML":
              case "BODY":
                Lv(o);
                break;
              default:
                o.textContent = "";
            }
          }
          break;
        case 5:
        case 26:
        case 27:
        case 6:
        case 4:
        case 17:
          break;
        case 30:
          a && o !== null && (a = Ul(o.memoizedProps, o.stateNode), l = t.memoizedProps, l = zl(l.default, l.update), l !== "none" && nu(o, a, l, o.memoizedState = [], true));
          break;
        default:
          if ((l & 1024) !== 0) throw Error(R(163));
      }
      if (o = t.sibling, o !== null) {
        o.return = t.return, Nt = o;
        break;
      }
      Nt = t.return;
    }
  }
  function OE(e, t, a) {
    var o = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        el(e, a), o & 4 && Ed(5, a);
        break;
      case 1:
        if (el(e, a), o & 4) if (e = a.stateNode, t === null) try {
          e.componentDidMount();
        } catch (i) {
          ke(a, a.return, i);
        }
        else {
          var l = Mi(a.type, t.memoizedProps);
          t = t.memoizedState;
          try {
            e.componentDidUpdate(l, t, e.__reactInternalSnapshotBeforeUpdate);
          } catch (i) {
            ke(a, a.return, i);
          }
        }
        o & 64 && AE(a), o & 512 && tl(a, a.return);
        break;
      case 3:
        if (el(e, a), o & 64 && (e = a.updateQueue, e !== null)) {
          if (t = null, a.child !== null) switch (a.child.tag) {
            case 27:
            case 5:
              t = a.child.stateNode;
              break;
            case 1:
              t = a.child.stateNode;
          }
          try {
            Uy(e, t);
          } catch (i) {
            ke(a, a.return, i);
          }
        }
        break;
      case 27:
        t === null && o & 4 && wE(a);
      case 26:
      case 5:
        el(e, a), t === null && o & 4 && Qg(a), o & 512 && tl(a, a.return);
        break;
      case 12:
        el(e, a);
        break;
      case 31:
        el(e, a), o & 4 && NE(e, a);
        break;
      case 13:
        el(e, a), o & 4 && HE(e, a), o & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = oD.bind(null, a), UD(e, a))));
        break;
      case 22:
        if (o = a.memoizedState !== null || Bt, !o) {
          var r = t !== null && t.memoizedState !== null || Ae;
          t = Bt, l = Ae, Bt = o, (Ae = r) && !l ? (o = 2, (a.subtreeFlags & 8772) !== 0 && (o |= 1), Io(e, a, o)) : el(e, a), Bt = t, Ae = l;
        }
        break;
      case 30:
        el(e, a), o & 512 && tl(a, a.return);
        break;
      case 7:
        o & 512 && tl(a, a.return);
      default:
        el(e, a);
    }
  }
  function ov(e, t) {
    for (e = e.child; e !== null; ) PE(e, t), e = e.sibling;
  }
  function PE(e, t) {
    switch (e.tag) {
      case 5:
      case 26:
        try {
          var a = e.stateNode;
          if (t) {
            var o = a.style;
            typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none";
          } else {
            var l = e.stateNode, r = e.memoizedProps.style, i = r != null && r.hasOwnProperty("display") ? r.display : null;
            l.style.display = i == null || typeof i == "boolean" ? "" : ("" + i).trim();
          }
        } catch (u) {
          ke(e, e.return, u);
        }
        lv(e, t);
        break;
      case 6:
        try {
          e.stateNode.nodeValue = t ? "" : e.memoizedProps, Le = true;
        } catch (u) {
          ke(e, e.return, u);
        }
        break;
      case 18:
        try {
          var n = e.stateNode;
          t ? bC(n, true) : bC(e.stateNode, false);
        } catch (u) {
          ke(e, e.return, u);
        }
        break;
      case 22:
      case 23:
        e.memoizedState === null && ov(e, t);
        break;
      default:
        ov(e, t);
    }
  }
  function lv(e, t) {
    if (e.subtreeFlags & 67108864) for (e = e.child; e !== null; ) {
      e: {
        var a = e, o = t;
        switch (a.tag) {
          case 4:
            PE(a, o);
            break e;
          case 22:
            a.memoizedState === null && lv(a, o);
            break e;
          default:
            lv(a, o);
        }
      }
      e = e.sibling;
    }
  }
  function UE(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, UE(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && om(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var et = null, ya = false;
  function Eo(e, t, a) {
    for (a = a.child; a !== null; ) BE(e, t, a), a = a.sibling;
  }
  function BE(e, t, a) {
    if (qa && typeof qa.onCommitFiberUnmount == "function") try {
      qa.onCommitFiberUnmount(vd, a);
    } catch {
    }
    switch (a.tag) {
      case 26:
        Ae || Kt(a, t), Eo(e, t, a), a.memoizedState ? a.memoizedState.count-- : a.stateNode && !Ae && (a = a.stateNode, a.parentNode.removeChild(a));
        break;
      case 27:
        Ae || Kt(a, t), Qs(a);
        var o = et, l = ya;
        Dr(a.type) && (et = a.stateNode, ya = false), Eo(e, t, a), EI(a.stateNode, a.type, a.memoizedProps), et = o, ya = l;
        break;
      case 5:
        Ae || Kt(a, t), Qs(a);
      case 6:
        if (a.tag === 6 && Qs(a), o = et, l = ya, et = null, Eo(e, t, a), et = o, ya = l, et !== null) if (ya) try {
          (et.nodeType === 9 ? et.body : et.nodeName === "HTML" ? et.ownerDocument.body : et).removeChild(a.stateNode), Le = true;
        } catch (r) {
          ke(a, t, r);
        }
        else try {
          et.removeChild(a.stateNode), Le = true;
        } catch (r) {
          ke(a, t, r);
        }
        break;
      case 18:
        et !== null && (ya ? (e = et, LC(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, a.stateNode), ou(e)) : LC(et, a.stateNode));
        break;
      case 4:
        o = et, l = ya, et = a.stateNode.containerInfo, ya = true, Eo(e, t, a), et = o, ya = l;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Mr(2, a, t), Ae || Mr(4, a, t), Eo(e, t, a);
        break;
      case 1:
        Ae || (Kt(a, t), o = a.stateNode, typeof o.componentWillUnmount == "function" && TE(a, t, o)), Eo(e, t, a);
        break;
      case 21:
        Eo(e, t, a);
        break;
      case 22:
        Ae = (o = Ae) || a.memoizedState !== null, Eo(e, t, a), Ae = o;
        break;
      case 30:
        Kt(a, t), Eo(e, t, a);
        break;
      case 7:
        Ae || Kt(a, t), Eo(e, t, a);
        break;
      default:
        Eo(e, t, a);
    }
  }
  function NE(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        ou(e);
      } catch (a) {
        ke(t, t.return, a);
      }
    }
  }
  function HE(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
      ou(e);
    } catch (a) {
      ke(t, t.return, a);
    }
  }
  function Kk(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new oC()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new oC()), t;
      default:
        throw Error(R(435, e.tag));
    }
  }
  function tf(e, t) {
    var a = Kk(e);
    t.forEach(function(o) {
      if (!a.has(o)) {
        a.add(o);
        var l = lD.bind(null, e, o);
        o.then(l, l);
      }
    });
  }
  function ma(e, t, a) {
    var o = t.deletions;
    if (o !== null) for (var l = 0; l < o.length; l++) {
      var r = o[l], i = e, n = t, u = n;
      e: for (; u !== null; ) {
        switch (u.tag) {
          case 27:
            if (Dr(u.type)) {
              et = u.stateNode, ya = false;
              break e;
            }
            break;
          case 5:
            et = u.stateNode, ya = false;
            break e;
          case 3:
          case 4:
            et = u.stateNode.containerInfo, ya = true;
            break e;
        }
        u = u.return;
      }
      if (et === null) throw Error(R(160));
      BE(i, n, r), et = null, ya = false, i = r.alternate, i !== null && (i.return = null), r.return = null;
    }
    if (t.subtreeFlags & 13886) for (t = t.child; t !== null; ) qE(t, e, a), t = t.sibling;
  }
  var Ao = null;
  function qE(e, t, a) {
    var o = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (l & 4 && (o = e.updateQueue, o = o !== null ? o.events : null, o !== null)) for (var r = 0; r < o.length; r++) {
          var i = o[r];
          i.ref.impl = i.nextImpl;
        }
        ma(t, e, a), pa(e), l & 4 && (Mr(3, e, e.return), Ed(3, e), Mr(5, e, e.return));
        break;
      case 1:
        ma(t, e, a), pa(e), l & 512 && (Ae || o === null || Kt(o, o.return)), l & 64 && Bt && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? t : a.concat(t))));
        break;
      case 26:
        if (r = Ao, ma(t, e, a), pa(e), l & 512 && (Ae || o === null || Kt(o, o.return)), l & 4) if (l = o !== null ? o.memoizedState : null, a = e.memoizedState, o === null) if (a === null) if (e.stateNode === null) if (Bt) e.stateNode = mI(e.type, e.memoizedProps, t.containerInfo, e);
        else {
          e: {
            t = e.type, a = e.memoizedProps, l = r.ownerDocument || r;
            t: switch (t) {
              case "title":
                o = l.getElementsByTagName("title")[0], (!o || o[xd] || o[Wt] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = l.createElement(t), l.head.insertBefore(o, l.querySelector("head > title"))), Zt(o, t, a), o[Wt] = e, Ht(o), t = o;
                break e;
              case "link":
                if (r = TC("link", "href", l).get(t + (a.href || ""))) {
                  for (i = 0; i < r.length; i++) if (o = r[i], o.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && o.getAttribute("rel") === (a.rel == null ? null : a.rel) && o.getAttribute("title") === (a.title == null ? null : a.title) && o.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                    r.splice(i, 1);
                    break t;
                  }
                }
                o = l.createElement(t), Zt(o, t, a), l.head.appendChild(o);
                break;
              case "meta":
                if (r = TC("meta", "content", l).get(t + (a.content || ""))) {
                  for (i = 0; i < r.length; i++) if (o = r[i], o.getAttribute("content") === (a.content == null ? null : "" + a.content) && o.getAttribute("name") === (a.name == null ? null : a.name) && o.getAttribute("property") === (a.property == null ? null : a.property) && o.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && o.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                    r.splice(i, 1);
                    break t;
                  }
                }
                o = l.createElement(t), Zt(o, t, a), l.head.appendChild(o);
                break;
              default:
                throw Error(R(468, t));
            }
            o[Wt] = e, Ht(o), t = o;
          }
          e.stateNode = t;
        }
        else Bt || Sv(r, e.type, e.stateNode);
        else e.stateNode = AC(r, a, e.memoizedProps);
        else l !== a ? (l === null ? (t = o.stateNode, t === null || Ae || t.parentNode.removeChild(t)) : l.count--, a === null ? Bt || Sv(r, e.type, e.stateNode) : AC(r, a, e.memoizedProps)) : a === null && e.stateNode !== null && ag(e, e.memoizedProps, o.memoizedProps);
        break;
      case 27:
        ma(t, e, a), pa(e), l & 512 && (Ae || o === null || Kt(o, o.return)), o !== null && l & 4 && ag(e, e.memoizedProps, o.memoizedProps);
        break;
      case 5:
        if (r = Jo, Jo = false, ma(t, e, a), Jo = r, pa(e), l & 512 && (Ae || o === null || Kt(o, o.return)), e.flags & 32) {
          t = e.stateNode;
          try {
            Wn(t, ""), Le = true;
          } catch (c) {
            ke(e, e.return, c);
          }
        }
        l & 4 && e.stateNode != null && (t = e.memoizedProps, ag(e, t, o !== null ? o.memoizedProps : t)), l & 1024 && (lg = true);
        break;
      case 6:
        if (ma(t, e, a), pa(e), l & 4) {
          if (e.stateNode === null) throw Error(R(162));
          t = e.memoizedProps, a = e.stateNode;
          try {
            a.nodeValue = t, Le = true;
          } catch (c) {
            ke(e, e.return, c);
          }
        }
        break;
      case 3:
        if (Le = false, yf = null, r = Ao, Ao = fd(t.containerInfo), ma(t, e, a), Ao = r, pa(e), l & 4 && o !== null && o.memoizedState.isDehydrated) try {
          ou(t.containerInfo);
        } catch (c) {
          ke(e, e.return, c);
        }
        lg && (lg = false, FE(e)), Le = false;
        break;
      case 4:
        l = Jo, Jo = Bt, o = s0(), r = Ao, Ao = fd(e.stateNode.containerInfo), ma(t, e, a), pa(e), Ao = r, Le && qs && (Wf = true), Le = o, Jo = l;
        break;
      case 12:
        ma(t, e, a), pa(e);
        break;
      case 31:
        ma(t, e, a), pa(e), l & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, tf(e, t)));
        break;
      case 13:
        ma(t, e, a), pa(e), e.child.flags & 8192 && e.memoizedState !== null != (o !== null && o.memoizedState !== null) && (gm = Ha()), l & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, tf(e, t)));
        break;
      case 22:
        r = e.memoizedState !== null, i = o !== null && o.memoizedState !== null;
        var n = Bt, u = Ae, d = Jo;
        Bt = n || r, Jo = d || r, Ae = u || i, ma(t, e, a), Ae = u, Jo = d, Bt = n, pa(e), l & 8192 && (t = e.stateNode, t._visibility = r ? t._visibility & -2 : t._visibility | 1, !r || o === null || i || Bt || Ae || (t = i || Ae, a = Bt, o = Ae, Bt = r || Bt, Ae = t, nr(e, 2), Bt = a, Ae = o), !r && Jo || ov(e, r)), l & 4 && (t = e.updateQueue, t !== null && (a = t.retryQueue, a !== null && (t.retryQueue = null, tf(e, a))));
        break;
      case 19:
        ma(t, e, a), pa(e), l & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, tf(e, t)));
        break;
      case 30:
        l & 512 && (Ae || o === null || Kt(o, o.return)), l = s0(), r = qs, i = (a & 335544064) === a, n = e.memoizedProps, qs = i && zl(n.default, n.update) !== "none", ma(t, e, a), pa(e), i && o !== null && Le && (e.flags |= 4), qs = r, Le = l;
        break;
      case 21:
        break;
      case 7:
        l & 512 && (Ae || o === null || Kt(o, o.return)), o && o.stateNode !== null && (o.stateNode._fragmentFiber = e);
      default:
        ma(t, e, a), pa(e);
    }
  }
  function pa(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var a, o = e.return; o !== null; ) {
          if (_E(o)) {
            a = o;
            break;
          }
          o = o.return;
        }
        o = null;
        for (var l = e.return; l !== null; ) {
          if (nL(l)) {
            var r = l.stateNode;
            o === null ? o = [r] : o.push(r);
          }
          if (iL(l)) break;
          l = l.return;
        }
        var i = o;
        if (a == null) throw Error(R(160));
        switch (a.tag) {
          case 27:
            var n = a.stateNode, u = og(e);
            Xf(e, u, n, i);
            break;
          case 5:
            var d = a.stateNode;
            a.flags & 32 && (Wn(d, ""), a.flags &= -33);
            var c = og(e);
            Xf(e, c, d, i);
            break;
          case 3:
          case 4:
            var h = a.stateNode.containerInfo, s = og(e);
            Zg(e, s, h, i);
            break;
          default:
            throw Error(R(161));
        }
      } catch (f) {
        ke(e, e.return, f);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function FE(e) {
    if (e.subtreeFlags & 1024) for (e = e.child; e !== null; ) {
      var t = e;
      FE(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, au = true, t.reset(), au = false), e = e.sibling;
    }
  }
  function bn(e, t) {
    if (t.subtreeFlags & 9270) for (t = t.child; t !== null; ) zE(t, e), t = t.sibling;
    else DE(t, false);
  }
  function zE(e, t) {
    var a = e.alternate;
    if (a === null) Jg(e, false);
    else switch (e.tag) {
      case 3:
        if (av = $o = false, aC(), bn(t, e), !$o && !Wf) {
          if (e = al, e !== null) for (var o = 0; o < e.length; o += 3) {
            a = e[o];
            var l = e[o + 1];
            hI(a, e[o + 2]), a = a.ownerDocument.documentElement, a !== null && a.animate({ opacity: [0, 0], pointerEvents: ["none", "none"] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition-group(" + l + ")" });
          }
          e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({ opacity: [0, 0], pointerEvents: ["none", "none"] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition-group(root)" }), e.animate({ width: [0, 0], height: [0, 0] }, { duration: 0, fill: "forwards", pseudoElement: "::view-transition" })), av = true;
        }
        al = null;
        break;
      case 5:
        bn(t, e);
        break;
      case 4:
        o = $o, $o = false, bn(t, e), $o && (Wf = true), $o = o;
        break;
      case 22:
        e.memoizedState === null && (a.memoizedState !== null ? Jg(e, false) : bn(t, e));
        break;
      case 30:
        o = $o, l = aC(), $o = false, bn(t, e), $o && (e.flags |= 4);
        var r = e.memoizedProps, i = e.stateNode;
        t = Ul(r, i), i = Ul(a.memoizedProps, i);
        var n = zl(r.default, r.update);
        n === "none" ? t = false : (r = a.memoizedState, a.memoizedState = null, a = e.child, Ia = 0, t = uL(e, a, t, i, n, r, true), Ia !== (r === null ? 0 : r.length) && (e.flags |= 32)), (e.flags & 4) !== 0 && t ? (Qn(e, e.memoizedProps.onUpdate), al = l) : l !== null && (l.push.apply(l, al), al = l), $o = (e.flags & 32) !== 0 ? true : o;
        break;
      default:
        bn(t, e);
    }
  }
  function el(e, t) {
    if (t.subtreeFlags & 8772) for (t = t.child; t !== null; ) OE(e, t.alternate, t), t = t.sibling;
  }
  function nr(e, t) {
    for (e = e.child; e !== null; ) {
      var a = e, o = t;
      switch (a.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Mr(4, a, a.return), nr(a, o);
          break;
        case 1:
          Kt(a, a.return);
          var l = a.stateNode;
          typeof l.componentWillUnmount == "function" && TE(a, a.return, l), nr(a, o);
          break;
        case 27:
          (o & 2) !== 0 && EI(a.stateNode, a.type, a.memoizedProps);
        case 5:
          Kt(a, a.return), a.tag !== 5 && a.tag !== 27 || Qs(a), nr(a, o);
          break;
        case 6:
          Qs(a);
          break;
        case 26:
          Kt(a, a.return), l = a.stateNode, a.memoizedState !== null || l === null || Ae || l.parentNode.removeChild(l), nr(a, o);
          break;
        case 22:
          a.memoizedState === null && nr(a, o);
          break;
        case 30:
          Kt(a, a.return), nr(a, o);
          break;
        case 7:
          Kt(a, a.return);
        default:
          nr(a, o);
      }
      e = e.sibling;
    }
  }
  function Io(e, t, a) {
    for (a = (t.subtreeFlags & 8772) !== 0 ? a : a & -2, t = t.child; t !== null; ) {
      var o = t.alternate, l = e, r = t, i = r.flags, n = (a & 1) !== 0;
      switch (r.tag) {
        case 0:
        case 11:
        case 15:
          Io(l, r, a), Ed(4, r);
          break;
        case 1:
          if (Io(l, r, a), o = r, l = o.stateNode, typeof l.componentDidMount == "function") try {
            l.componentDidMount();
          } catch (c) {
            ke(o, o.return, c);
          }
          if (o = r, l = o.updateQueue, l !== null) {
            var u = o.stateNode;
            try {
              var d = l.shared.hiddenCallbacks;
              if (d !== null) for (l.shared.hiddenCallbacks = null, l = 0; l < d.length; l++) Py(d[l], u);
            } catch (c) {
              ke(o, o.return, c);
            }
          }
          n && i & 64 && AE(r), tl(r, r.return);
          break;
        case 27:
          (a & 2) !== 0 && wE(r);
        case 5:
          r.tag !== 5 && r.tag !== 27 || eC(r), Io(l, r, a), n && o === null && i & 4 && Qg(r), tl(r, r.return);
          break;
        case 6:
          eC(r);
          break;
        case 26:
          u = r.stateNode, r.memoizedState !== null || u === null || Bt || Sv(fd(u.ownerDocument), r.type, u), Io(l, r, a), n && o === null && i & 4 && Qg(r), tl(r, r.return);
          break;
        case 12:
          Io(l, r, a);
          break;
        case 31:
          Io(l, r, a), n && i & 4 && NE(l, r);
          break;
        case 13:
          Io(l, r, a), n && i & 4 && HE(l, r);
          break;
        case 22:
          r.memoizedState === null && Io(l, r, a), tl(r, r.return);
          break;
        case 30:
          Io(l, r, a), tl(r, r.return);
          break;
        case 7:
          tl(r, r.return);
        default:
          Io(l, r, a);
      }
      t = t.sibling;
    }
  }
  function sL(e, t) {
    var a = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && Cd(a));
  }
  function dL(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Cd(e));
  }
  function ao(e, t, a, o) {
    var l = (a & 335544064) === a;
    if (t.subtreeFlags & (l ? 10262 : 10256)) for (t = t.child; t !== null; ) VE(e, t, a, o), t = t.sibling;
    else l && kE(t);
  }
  function VE(e, t, a, o) {
    var l = (a & 335544064) === a;
    l && t.alternate === null && t.return !== null && t.return.alternate !== null && bf(t);
    var r = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        ao(e, t, a, o), r & 2048 && Ed(9, t);
        break;
      case 1:
        ao(e, t, a, o);
        break;
      case 3:
        ao(e, t, a, o), l && av && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), r & 2048 && (r = null, t.alternate !== null && (r = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== r && (t.refCount++, r != null && Cd(r)));
        break;
      case 12:
        if (r & 2048) {
          ao(e, t, a, o), r = t.stateNode;
          try {
            var i = t.memoizedProps, n = i.id, u = i.onPostCommit;
            typeof u == "function" && u(n, t.alternate === null ? "mount" : "update", r.passiveEffectDuration, -0);
          } catch (d) {
            ke(t, t.return, d);
          }
        } else ao(e, t, a, o);
        break;
      case 31:
        ao(e, t, a, o);
        break;
      case 13:
        ao(e, t, a, o);
        break;
      case 23:
        break;
      case 22:
        i = t.stateNode, n = t.alternate, t.memoizedState !== null ? (l && n !== null && n.memoizedState === null && bf(n), i._visibility & 2 ? ao(e, t, a, o) : Zs(e, t)) : (l && n !== null && n.memoizedState !== null && bf(t), i._visibility & 2 ? ao(e, t, a, o) : (i._visibility |= 2, Sn(e, t, a, o, (t.subtreeFlags & 10256) !== 0 || false))), r & 2048 && sL(n, t);
        break;
      case 24:
        ao(e, t, a, o), r & 2048 && dL(t.alternate, t);
        break;
      case 30:
        l && (r = t.alternate, r !== null && (sl(r.child, true), sl(t.child, true))), ao(e, t, a, o);
        break;
      default:
        ao(e, t, a, o);
    }
  }
  function Sn(e, t, a, o, l) {
    for (l = l && ((t.subtreeFlags & 10256) !== 0 || false), t = t.child; t !== null; ) {
      var r = e, i = t, n = a, u = o, d = i.flags;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          Sn(r, i, n, u, l), Ed(8, i);
          break;
        case 23:
          break;
        case 22:
          var c = i.stateNode;
          i.memoizedState !== null ? c._visibility & 2 ? Sn(r, i, n, u, l) : Zs(r, i) : (c._visibility |= 2, Sn(r, i, n, u, l)), l && d & 2048 && sL(i.alternate, i);
          break;
        case 24:
          Sn(r, i, n, u, l), l && d & 2048 && dL(i.alternate, i);
          break;
        default:
          Sn(r, i, n, u, l);
      }
      t = t.sibling;
    }
  }
  function Zs(e, t) {
    if (t.subtreeFlags & 10256) for (t = t.child; t !== null; ) {
      var a = e, o = t, l = o.flags;
      switch (o.tag) {
        case 22:
          Zs(a, o), l & 2048 && sL(o.alternate, o);
          break;
        case 24:
          Zs(a, o), l & 2048 && dL(o.alternate, o);
          break;
        default:
          Zs(a, o);
      }
      t = t.sibling;
    }
  }
  var gi = 8192;
  function mi(e, t, a) {
    if (e.subtreeFlags & gi) for (e = e.child; e !== null; ) GE(e, t, a), e = e.sibling;
  }
  function GE(e, t, a) {
    switch (e.tag) {
      case 26:
        mi(e, t, a), e.flags & gi && (e.memoizedState !== null ? QD(a, Ao, e.memoizedState, e.memoizedProps) : (e = e.stateNode, (t & 335544128) === t && wC(a, e)));
        break;
      case 5:
        mi(e, t, a), e.flags & gi && (e = e.stateNode, (t & 335544128) === t && wC(a, e));
        break;
      case 3:
      case 4:
        var o = Ao;
        Ao = fd(e.stateNode.containerInfo), mi(e, t, a), Ao = o;
        break;
      case 22:
        e.memoizedState === null && (o = e.alternate, o !== null && o.memoizedState !== null ? (o = gi, gi = 16777216, mi(e, t, a), gi = o) : mi(e, t, a));
        break;
      case 30:
        if ((e.flags & gi) !== 0 && (o = e.memoizedProps.name, o != null && o !== "auto")) {
          var l = e.stateNode;
          l.paired = null, Ba === null && (Ba = /* @__PURE__ */ new Map()), Ba.set(o, l);
        }
        mi(e, t, a);
        break;
      default:
        mi(e, t, a);
    }
  }
  function XE(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function Ds(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null) for (var a = 0; a < t.length; a++) {
        var o = t[a];
        Nt = o, WE(o, e);
      }
      XE(e);
    }
    if (e.subtreeFlags & 10256) for (e = e.child; e !== null; ) KE(e), e = e.sibling;
  }
  function KE(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        Ds(e), e.flags & 2048 && Mr(9, e, e.return);
        break;
      case 3:
        Ds(e);
        break;
      case 12:
        Ds(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, xf(e)) : Ds(e);
        break;
      default:
        Ds(e);
    }
  }
  function xf(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null) for (var a = 0; a < t.length; a++) {
        var o = t[a];
        Nt = o, WE(o, e);
      }
      XE(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Mr(8, t, t.return), xf(t);
          break;
        case 22:
          a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, xf(t));
          break;
        default:
          xf(t);
      }
      e = e.sibling;
    }
  }
  function WE(e, t) {
    for (; Nt !== null; ) {
      var a = Nt;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          Mr(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var o = a.memoizedState.cachePool.pool;
            o != null && o.refCount++;
          }
          break;
        case 24:
          Cd(a.memoizedState.cache);
      }
      if (o = a.child, o !== null) o.return = a, Nt = o;
      else e: for (a = e; Nt !== null; ) {
        o = Nt;
        var l = o.sibling, r = o.return;
        if (UE(o), o === a) {
          Nt = null;
          break e;
        }
        if (l !== null) {
          l.return = r, Nt = l;
          break e;
        }
        Nt = r;
      }
    }
  }
  var Wk = { getCacheForType: function(e) {
    var t = Yt(vt), a = t.data.get(e);
    return a === void 0 && (a = e(), t.data.set(e, a)), a;
  }, cacheSignal: function() {
    return Yt(vt).controller.signal;
  } }, Yk = typeof WeakMap == "function" ? WeakMap : Map, ye = 0, Ne = null, se = null, de = 0, Me = 0, Oa = null, pr = false, uu = false, cL = false, ql = 0, ut = 0, Rr = 0, yi = 0, Yf = 0, Na = 0, jn = 0, Js = null, Ea = null, rv = false, gm = 0, YE = 0, jf = 1 / 0, Qf = null, yr = null, lt = 0, _o = null, Ri = null, ul = 0, iv = 0, nv = null, jE = null, zn = null, Vn = null, Gn = null, $s = 0, Sf = null;
  function za() {
    return (ye & 2) !== 0 && de !== 0 ? de & -de : Z.T !== null ? mL() : $C();
  }
  function QE() {
    if (Na === 0) if ((de & 536870912) === 0 || le) {
      var e = zc;
      zc <<= 1, (zc & 3932160) === 0 && (zc = 262144), Na = e;
    } else Na = 536870912;
    return e = Jt.current, e !== null && (e.flags |= 32), Na;
  }
  function Qn(e, t) {
    if (t != null) {
      var a = e.stateNode, o = a.ref;
      o === null && (o = a.ref = vI(Ul(e.memoizedProps, a))), Vn === null && (Vn = []), Vn.push(t.bind(null, o));
    }
  }
  function Ta(e, t, a) {
    (e === Ne && (Me === 2 || Me === 9) || e.cancelPendingCommit !== null) && (Zn(e, 0), hr(e, de, Na, false)), bd(e, a), ((ye & 2) === 0 || e !== Ne) && (e === Ne && ((ye & 2) === 0 && (yi |= a), ut === 4 && hr(e, de, Na, false)), cl(e));
  }
  function ZE(e, t, a) {
    if ((ye & 6) !== 0) throw Error(R(327));
    var o = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Ld(e, t), l = o ? Zk(e, t) : rg(e, t, true), r = o;
    do {
      if (l === 0) {
        uu && !o && hr(e, t, 0, false);
        break;
      } else {
        if (a = e.current.alternate, r && !jk(a)) {
          l = rg(e, t, false), r = false;
          continue;
        }
        if (l === 2) {
          if (r = t, e.errorRecoveryDisabledLanes & r) var i = 0;
          else i = e.pendingLanes & -536870913, i = i !== 0 ? i : i & 536870912 ? 536870912 : 0;
          if (i !== 0) {
            t = i;
            e: {
              var n = e;
              l = Js;
              var u = n.current.memoizedState.isDehydrated;
              if (u && (Zn(n, i).flags |= 256), i = rg(n, i, false), i !== 2 && i !== 6) {
                if (cL && !u) {
                  n.errorRecoveryDisabledLanes |= r, yi |= r, l = 4;
                  break e;
                }
                r = Ea, Ea = l, r !== null && (Ea === null ? Ea = r : Ea.push.apply(Ea, r));
              }
              l = i;
            }
            if (r = false, l !== 2) continue;
          }
        }
        if (l === 1) {
          Zn(e, 0), hr(e, t, 0, true);
          break;
        }
        e: {
          switch (o = e, r = l, r) {
            case 0:
            case 1:
              throw Error(R(345));
            case 4:
              if ((t & 4194048) !== t && (t & 62914560) !== t) break;
            case 6:
              hr(o, t, Na, !pr);
              break e;
            case 2:
              Ea = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(R(329));
          }
          if ((t & 62914560) === t && (l = gm + 300 - Ha(), 10 < l)) {
            if (hr(o, t, Na, !pr), am(o, 0, true) !== 0) break e;
            ul = t, o.timeoutHandle = hL(lC.bind(null, o, a, Ea, Qf, rv, t, Na, yi, jn, pr, r, "Throttled", -0, 0), l);
            break e;
          }
          lC(o, a, Ea, Qf, rv, t, Na, yi, jn, pr, r, null, -0, 0);
        }
      }
      break;
    } while (true);
    cl(e);
  }
  function lC(e, t, a, o, l, r, i, n, u, d, c, h, s, f) {
    e.timeoutHandle = -1;
    var v = t.subtreeFlags, L = (r & 335544064) === r;
    if (h = null, (L || v & 8192 || (v & 16785408) === 16785408) && (h = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: true, waitingForViewTransition: false, unsuspend: ll }, Ba = null, GE(t, r, h), L && (v = h, L = e.containerInfo, L = (L.nodeType === 9 ? L : L.ownerDocument).__reactViewTransition, L != null && (v.count++, v.waitingForViewTransition = true, v = md.bind(v), L.finished.then(v, v))), v = (r & 62914560) === r ? gm - Ha() : (r & 4194048) === r ? YE - Ha() : 0, v = ZD(h, v), v !== null)) {
      ul = r, e.cancelPendingCommit = v(iC.bind(null, e, t, r, a, o, l, i, n, u, d, c, h, null, s, f)), hr(e, r, i, !d);
      return;
    }
    iC(e, t, r, a, o, l, i, n, u, d, c, h);
  }
  function jk(e) {
    for (var t = e; ; ) {
      var a = t.tag;
      if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null))) for (var o = 0; o < a.length; o++) {
        var l = a[o], r = l.getSnapshot;
        l = l.value;
        try {
          if (!Va(r(), l)) return false;
        } catch {
          return false;
        }
      }
      if (a = t.child, t.subtreeFlags & 16384 && a !== null) a.return = t, t = a;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return true;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return true;
  }
  function hr(e, t, a, o) {
    t = YC(e, t), t &= ~Yf, t &= ~yi, e.suspendedLanes |= t, e.pingedLanes &= ~t, o && (e.warmLanes |= t), o = e.expirationTimes;
    for (var l = t; 0 < l; ) {
      var r = 31 - Fa(l), i = 1 << r;
      o[r] = -1, l &= ~i;
    }
    a !== 0 && QC(e, a, t);
  }
  function vm() {
    return (ye & 6) === 0 ? (Id(0, false), false) : true;
  }
  function fL() {
    if (se !== null) {
      if (Me === 0) var e = se.return;
      else e = se, kl = Ui = null, jv(e), Hn = null, id = 0, e = se;
      for (; e !== null; ) IE(e.alternate, e), e = e.return;
      se = null;
    }
  }
  function Zn(e, t) {
    var a = e.timeoutHandle;
    return a !== -1 && (e.timeoutHandle = -1, vD(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), ul = 0, fL(), Ne = e, se = a = Dl(e.current, null), de = t, Me = 0, Oa = null, pr = false, uu = Ld(e, t), cL = false, jn = Na = Yf = yi = Rr = ut = 0, Ea = Js = null, rv = false, ql = YC(e, t), nm(), a;
  }
  function JE(e, t) {
    te = null, Z.H = zf, t === iu || t === dm ? (t = R0(), Me = 3) : t === Fv ? (t = R0(), Me = 4) : Me = t === oL ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Oa = t, se === null && (ut = 1, Vf(e, no(t, e.current)));
  }
  function $E() {
    var e = Jt.current;
    return e === null ? true : (de & 4194048) === de ? ia === null : (de & 62914560) === de || (de & 536870912) !== 0 ? e === ia : false;
  }
  function eI() {
    var e = Z.H;
    return Z.H = zf, e === null ? zf : e;
  }
  function tI() {
    var e = Z.A;
    return Z.A = Wk, e;
  }
  function Zf() {
    ut = 4, pr || (de & 4194048) !== de && Jt.current !== null || (uu = true), (Rr & 134217727) === 0 && (yi & 134217727) === 0 || Ne === null || hr(Ne, de, Na, false);
  }
  function rg(e, t, a) {
    var o = ye;
    ye |= 2;
    var l = eI(), r = tI();
    (Ne !== e || de !== t) && (Qf = null, Zn(e, t)), t = false;
    var i = ut;
    e: do
      try {
        if (Me !== 0 && se !== null) {
          var n = se, u = Oa;
          switch (Me) {
            case 8:
              fL(), i = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Jt.current === null && (t = true);
              var d = Me;
              if (Me = 0, Oa = null, On(e, n, u, d), a && uu) {
                i = 0;
                break e;
              }
              break;
            default:
              d = Me, Me = 0, Oa = null, On(e, n, u, d);
          }
        }
        Qk(), i = ut;
        break;
      } catch (c) {
        JE(e, c);
      }
    while (true);
    return t && e.shellSuspendCounter++, kl = Ui = null, ye = o, Z.H = l, Z.A = r, se === null && (Ne = null, de = 0, nm()), i;
  }
  function Qk() {
    for (; se !== null; ) aI(se);
  }
  function Zk(e, t) {
    var a = ye;
    ye |= 2;
    var o = eI(), l = tI();
    Ne !== e || de !== t ? (Qf = null, jf = Ha() + 500, Zn(e, t)) : uu = Ld(e, t);
    e: do
      try {
        if (Me !== 0 && se !== null) {
          t = se;
          var r = Oa;
          t: switch (Me) {
            case 1:
              Me = 0, Oa = null, On(e, t, r, 1);
              break;
            case 2:
            case 9:
              if (M0(r)) {
                Me = 0, Oa = null, rC(t);
                break;
              }
              t = function() {
                Me !== 2 && Me !== 9 || Ne !== e || (Me = 7), cl(e);
              }, r.then(t, t);
              break e;
            case 3:
              Me = 7;
              break e;
            case 4:
              Me = 5;
              break e;
            case 7:
              M0(r) ? (Me = 0, Oa = null, rC(t)) : (Me = 0, Oa = null, On(e, t, r, 7));
              break;
            case 5:
              var i = null;
              switch (se.tag) {
                case 26:
                  i = se.memoizedState;
                case 5:
                case 27:
                  var n = se;
                  if (i ? TI(i) : n.stateNode.complete) {
                    Me = 0, Oa = null;
                    var u = n.sibling;
                    if (u !== null) se = u;
                    else {
                      var d = n.return;
                      d !== null ? (se = d, Lm(d)) : se = null;
                    }
                    break t;
                  }
              }
              Me = 0, Oa = null, On(e, t, r, 5);
              break;
            case 6:
              Me = 0, Oa = null, On(e, t, r, 6);
              break;
            case 8:
              fL(), ut = 6;
              break e;
            default:
              throw Error(R(462));
          }
        }
        Jk();
        break;
      } catch (c) {
        JE(e, c);
      }
    while (true);
    return kl = Ui = null, Z.H = o, Z.A = l, ye = a, se !== null ? 0 : (Ne = null, de = 0, nm(), ut);
  }
  function Jk() {
    for (; se !== null && !hR(); ) aI(se);
  }
  function aI(e) {
    var t = EE(e.alternate, e, ql);
    e.memoizedProps = e.pendingProps, t === null ? Lm(e) : se = t;
  }
  function rC(e) {
    var t = e, a = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = W0(a, t, t.pendingProps, t.type, void 0, de);
        break;
      case 11:
        t = W0(a, t, t.pendingProps, t.type.render, t.ref, de);
        break;
      case 5:
        jv(t);
        var o = t;
        o === qt && (le ? (Pf(o), o.tag === 5 && o.stateNode != null && (We = o.stateNode)) : (Pf(o), le = true));
      default:
        IE(a, t), t = se = Ay(t, ql), t = EE(a, t, ql);
    }
    e.memoizedProps = e.pendingProps, t === null ? Lm(e) : se = t;
  }
  function On(e, t, a, o) {
    kl = Ui = null, jv(t), Hn = null, id = 0;
    var l = t.return;
    try {
      if (Hk(e, l, t, a, de)) {
        ut = 1, Vf(e, no(a, e.current)), se = null;
        return;
      }
    } catch (r) {
      if (l !== null) throw se = l, r;
      ut = 1, Vf(e, no(a, e.current)), se = null;
      return;
    }
    t.flags & 32768 ? (le || o === 1 ? e = true : uu || (de & 536870912) !== 0 ? e = false : (pr = e = true, (o === 2 || o === 9 || o === 3 || o === 6) && (o = Jt.current, o !== null && o.tag === 13 && (o.flags |= 16384))), oI(t, e)) : Lm(t);
  }
  function Lm(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        oI(t, pr);
        return;
      }
      e = t.return;
      var a = Vk(t.alternate, t, ql);
      if (a !== null) {
        se = a;
        return;
      }
      if (t = t.sibling, t !== null) {
        se = t;
        return;
      }
      se = t = e;
    } while (t !== null);
    ut === 0 && (ut = 5);
  }
  function oI(e, t) {
    do {
      var a = Gk(e.alternate, e);
      if (a !== null) {
        a.flags &= 32767, se = a;
        return;
      }
      if (a = e.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (e = e.sibling, e !== null)) {
        se = e;
        return;
      }
      se = e = a;
    } while (e !== null);
    ut = 6, se = null;
  }
  function iC(e, t, a, o, l, r, i, n, u, d, c, h) {
    e.cancelPendingCommit = null;
    do
      bm();
    while (lt !== 0);
    if ((ye & 6) !== 0) throw Error(R(327));
    if (t !== null) {
      if (t === e.current) throw Error(R(177));
      e === Ne && (se = Ne = null, de = 0), Ri = t, _o = e, ul = a, nv = l, jE = o, $k(e, t, a, i, n, u, h);
    }
  }
  function $k(e, t, a, o, l, r, i) {
    var n = t.lanes | t.childLanes;
    if (iv = n, n |= Pv, IR(e, a, n, o, l, r), Vn = null, (a & 335544064) === a ? (Gn = Tk(e), o = 10262) : (Gn = null, o = 10256), (t.subtreeFlags & o) !== 0 || (t.flags & o) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, rD(Mf, function() {
      return cv(), null;
    })) : (e.callbackNode = null, e.callbackPriority = 0), Kf = false, o = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || o) {
      o = Z.T, Z.T = null, l = Ee.p, Ee.p = 2, r = ye, ye |= 4;
      try {
        Xk(e, t, a);
      } finally {
        ye = r, Ee.p = l, Z.T = o;
      }
    }
    lt = 1, Kf ? zn = yD(i, e.containerInfo, Gn, uv, sv, tD, dv, cv, eD, null, null) : (uv(), sv(), dv());
  }
  function eD(e) {
    if (lt !== 0) {
      var t = _o.onRecoverableError;
      t(e, { componentStack: null });
    }
  }
  function tD() {
    lt === 3 && (lt = 0, zE(Ri, _o), lt = 4);
  }
  function uv() {
    if (lt === 1) {
      lt = 0;
      var e = _o, t = Ri, a = ul, o = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || o) {
        o = Z.T, Z.T = null;
        var l = Ee.p;
        Ee.p = 2;
        var r = ye;
        ye |= 4;
        try {
          qs = Wf = false, qE(t, e, a), a = hv;
          var i = Ly(e.containerInfo), n = a.focusedElem, u = a.selectionRange;
          if (i !== n && n && n.ownerDocument && vy(n.ownerDocument.documentElement, n)) {
            if (u !== null && Ov(n)) {
              var d = u.start, c = u.end;
              if (c === void 0 && (c = d), "selectionStart" in n) n.selectionStart = d, n.selectionEnd = Math.min(c, n.value.length);
              else {
                var h = n.ownerDocument || document, s = h && h.defaultView || window;
                if (s.getSelection) {
                  var f = s.getSelection(), v = n.textContent.length, L = Math.min(u.start, v), x = u.end === void 0 ? L : Math.min(u.end, v);
                  !f.extend && L > x && (i = x, x = L, L = i);
                  var p = C0(n, L), m = C0(n, x);
                  if (p && m && (f.rangeCount !== 1 || f.anchorNode !== p.node || f.anchorOffset !== p.offset || f.focusNode !== m.node || f.focusOffset !== m.offset)) {
                    var g = h.createRange();
                    g.setStart(p.node, p.offset), f.removeAllRanges(), L > x ? (f.addRange(g), f.extend(m.node, m.offset)) : (g.setEnd(m.node, m.offset), f.addRange(g));
                  }
                }
              }
            }
            for (h = [], f = n; f = f.parentNode; ) f.nodeType === 1 && h.push({ element: f, left: f.scrollLeft, top: f.scrollTop });
            for (typeof n.focus == "function" && n.focus(), n = 0; n < h.length; n++) {
              var S = h[n];
              S.element.scrollLeft = S.left, S.element.scrollTop = S.top;
            }
          }
          au = !!pv, hv = pv = null;
        } finally {
          ye = r, Ee.p = l, Z.T = o;
        }
      }
      e.current = t, lt = 2;
    }
  }
  function sv() {
    if (lt === 2) {
      lt = 0;
      var e = _o, t = Ri, a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        a = Z.T, Z.T = null;
        var o = Ee.p;
        Ee.p = 2;
        var l = ye;
        ye |= 4;
        try {
          OE(e, t.alternate, t);
        } finally {
          ye = l, Ee.p = o, Z.T = a;
        }
      }
      lt = 3;
    }
  }
  function dv() {
    if (lt === 4 || lt === 3) {
      lt = 0;
      var e = zn;
      zn = null, gR();
      var t = _o, a = Ri, o = ul, l = jE, r = (o & 335544064) === o ? 10262 : 10256;
      if ((a.subtreeFlags & r) !== 0 || (a.flags & r) !== 0 ? lt = 5 : (lt = 0, Ri = _o = null, lI(t, t.pendingLanes)), r = t.pendingLanes, r === 0 && (yr = null), _v(o), a = a.stateNode, qa && typeof qa.onCommitFiberRoot == "function") try {
        qa.onCommitFiberRoot(vd, a, void 0, (a.current.flags & 128) === 128);
      } catch {
      }
      if (l !== null) {
        a = Z.T, r = Ee.p, Ee.p = 2, Z.T = null;
        try {
          for (var i = t.onRecoverableError, n = 0; n < l.length; n++) {
            var u = l[n];
            i(u.value, { componentStack: u.stack });
          }
        } finally {
          Z.T = a, Ee.p = r;
        }
      }
      if (l = Vn, i = Gn, Gn = null, l !== null && (Vn = null, i === null && (i = []), e !== null)) for (u = 0; u < l.length; u++) a = (0, l[u])(i), a !== void 0 && e.finished.finally(a);
      (ul & 3) !== 0 && bm(), cl(t), r = t.pendingLanes, (o & 261930) !== 0 && (r & 42) !== 0 ? t === Sf ? $s++ : ($s = 0, Sf = t) : ($s = 0, Sf = null), Id(0, false);
    }
  }
  function lI(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Cd(t)));
  }
  function bm() {
    return zn !== null && (zn.skipTransition(), zn = null), uv(), sv(), dv(), cv();
  }
  function cv() {
    if (lt !== 5) return false;
    var e = _o, t = iv;
    iv = 0;
    var a = _v(ul), o = Z.T, l = Ee.p;
    try {
      Ee.p = 32 > a ? 32 : a, Z.T = null, a = nv, nv = null;
      var r = _o, i = ul;
      if (lt = 0, Ri = _o = null, ul = 0, (ye & 6) !== 0) throw Error(R(331));
      var n = ye;
      if (ye |= 4, KE(r.current), VE(r, r.current, i, a), ye = n, Id(0, false), qa && typeof qa.onPostCommitFiberRoot == "function") try {
        qa.onPostCommitFiberRoot(vd, r);
      } catch {
      }
      return true;
    } finally {
      Ee.p = l, Z.T = o, lI(e, t);
    }
  }
  function nC(e, t, a) {
    t = no(a, t), t = Gg(e.stateNode, t, 2), e = xr(e, t, 2), e !== null && (bd(e, 2), cl(e));
  }
  function ke(e, t, a) {
    if (e.tag === 3) nC(e, e, a);
    else for (; t !== null; ) {
      if (t.tag === 3) {
        nC(t, e, a);
        break;
      } else if (t.tag === 1) {
        var o = t.stateNode;
        if (typeof t.type.getDerivedStateFromError == "function" || typeof o.componentDidCatch == "function" && (yr === null || !yr.has(o))) {
          e = no(a, e), a = bE(2), o = xr(t, a, 2), o !== null && (xE(a, o, t, e), bd(o, 2), cl(o));
          break;
        }
      }
      t = t.return;
    }
  }
  function ig(e, t, a) {
    var o = e.pingCache;
    if (o === null) {
      o = e.pingCache = new Yk();
      var l = /* @__PURE__ */ new Set();
      o.set(t, l);
    } else l = o.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), o.set(t, l));
    l.has(a) || (cL = true, l.add(a), e = aD.bind(null, e, t, a), t.then(e, e));
  }
  function aD(e, t, a) {
    var o = e.pingCache;
    o !== null && o.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, Ne === e && (de & a) === a && ((ut === 4 || ut === 3 && (de & 62914560) === de && 300 > Ha() - gm) && (ye & 2) === 0 ? Zn(e, 0) : Yf |= a, jn === de && (jn = 0)), cl(e);
  }
  function rI(e, t) {
    t === 0 && (t = jC()), e = Pi(e, t), e !== null && (bd(e, t), cl(e));
  }
  function oD(e) {
    var t = e.memoizedState, a = 0;
    t !== null && (a = t.retryLane), rI(e, a);
  }
  function lD(e, t) {
    var a = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var o = e.stateNode, l = e.memoizedState;
        l !== null && (a = l.retryLane);
        break;
      case 19:
        o = e.stateNode;
        break;
      case 22:
        o = e.stateNode._retryCache;
        break;
      default:
        throw Error(R(314));
    }
    o !== null && o.delete(t), rI(e, a);
  }
  function rD(e, t) {
    return Av(e, t);
  }
  var Jn = null, Cn = null, fv = false, Jf = false, ng = false, gr = 0;
  function cl(e) {
    e !== Cn && e.next === null && (Cn === null ? Jn = Cn = e : Cn = Cn.next = e), Jf = true, fv || (fv = true, nD());
  }
  function Id(e, t) {
    if (!ng && Jf) {
      ng = true;
      do
        for (var a = false, o = Jn; o !== null; ) {
          if (!t) if (e !== 0) {
            var l = o.pendingLanes;
            if (l === 0) var r = 0;
            else {
              var i = o.suspendedLanes, n = o.pingedLanes;
              r = (1 << 31 - Fa(42 | e) + 1) - 1, r &= l & ~(i & ~n), r = r & 201326741 ? r & 201326741 | 1 : r ? r | 2 : 0;
            }
            r !== 0 && (a = true, uC(o, r));
          } else r = de, r = am(o, o === Ne ? r : 0, o.cancelPendingCommit !== null || o.timeoutHandle !== -1), (r & 3) === 0 || Ld(o, r) || (a = true, uC(o, r));
          o = o.next;
        }
      while (a);
      ng = false;
    }
  }
  function iD() {
    iI();
  }
  function iI() {
    Jf = fv = false;
    var e = 0;
    gr !== 0 && gD() && (e = gr);
    for (var t = Ha(), a = null, o = Jn; o !== null; ) {
      var l = o.next, r = nI(o, t);
      r === 0 ? (o.next = null, a === null ? Jn = l : a.next = l, l === null && (Cn = a)) : (a = o, (e !== 0 || (r & 3) !== 0) && (Jf = true)), o = l;
    }
    lt !== 0 && lt !== 5 || Id(e, false), gr !== 0 && (gr = 0);
  }
  function nI(e, t) {
    for (var a = e.suspendedLanes, o = e.pingedLanes, l = e.expirationTimes, r = e.pendingLanes & -62914561; 0 < r; ) {
      var i = 31 - Fa(r), n = 1 << i, u = l[i];
      u === -1 ? ((n & a) === 0 || (n & o) !== 0) && (l[i] = ER(n, t)) : u <= t && (e.expiredLanes |= n), r &= ~n;
    }
    if (t = Ne, a = de, a = am(e, e === t ? a : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), o = e.callbackNode, a === 0 || e === t && (Me === 2 || Me === 9) || e.cancelPendingCommit !== null) return o !== null && o !== null && Hh(o), e.callbackNode = null, e.callbackPriority = 0;
    if ((a & 3) === 0 || Ld(e, a)) {
      if (t = a & -a, t === e.callbackPriority) return t;
      switch (o !== null && Hh(o), _v(a)) {
        case 2:
        case 8:
          a = KC;
          break;
        case 32:
          a = Mf;
          break;
        case 268435456:
          a = WC;
          break;
        default:
          a = Mf;
      }
      return o = uI.bind(null, e), a = Av(a, o), e.callbackPriority = t, e.callbackNode = a, t;
    }
    return o !== null && o !== null && Hh(o), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function uI(e, t) {
    if (lt !== 0 && lt !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
    var a = e.callbackNode;
    if (bm() && e.callbackNode !== a) return null;
    var o = de;
    return o = am(e, e === Ne ? o : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), o === 0 ? null : (ZE(e, o, t), nI(e, Ha()), e.callbackNode != null && e.callbackNode === a ? uI.bind(null, e) : null);
  }
  function uC(e, t) {
    if (bm()) return null;
    ZE(e, t, true);
  }
  function nD() {
    LD(function() {
      (ye & 6) !== 0 ? Av(XC, iD) : iI();
    });
  }
  function mL() {
    if (gr === 0) {
      var e = Ti;
      e === 0 && (e = Fc, Fc <<= 1, (Fc & 261888) === 0 && (Fc = 256)), gr = e;
    }
    return gr;
  }
  function sC(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : sf(e);
  }
  function uD(e, t, a, o, l) {
    if (t === "submit" && a && a.stateNode === l) {
      var r = sC((l[wa] || null).action), i = o.submitter;
      i && (t = (t = i[wa] || null) ? sC(t.formAction) : i.getAttribute("formAction"), t !== null && (r = t, i = null));
      var n = new lm("action", "action", null, o, l);
      e.push({ event: n, listeners: [{ instance: null, listener: function() {
        if (o.defaultPrevented) {
          if (gr !== 0) {
            var u = new FormData(l, i);
            zg(a, { pending: true, data: u, method: l.method, action: r }, null, u);
          }
        } else typeof r == "function" && (n.preventDefault(), u = new FormData(l, i), zg(a, { pending: true, data: u, method: l.method, action: r }, r, u));
      }, currentTarget: l }] });
    }
  }
  for (af = 0; af < Rg.length; af++) of = Rg[af], dC = of.toLowerCase(), cC = of[0].toUpperCase() + of.slice(1), wo(dC, "on" + cC);
  var of, dC, cC, af;
  wo(xy, "onAnimationEnd");
  wo(Sy, "onAnimationIteration");
  wo(Cy, "onAnimationStart");
  wo("dblclick", "onDoubleClick");
  wo("focusin", "onFocus");
  wo("focusout", "onBlur");
  wo(bk, "onTransitionRun");
  wo(xk, "onTransitionStart");
  wo(Sk, "onTransitionCancel");
  wo(yy, "onTransitionEnd");
  Kn("onMouseEnter", ["mouseout", "mouseover"]);
  Kn("onMouseLeave", ["mouseout", "mouseover"]);
  Kn("onPointerEnter", ["pointerout", "pointerover"]);
  Kn("onPointerLeave", ["pointerout", "pointerover"]);
  Di("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
  Di("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
  Di("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
  Di("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
  Di("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
  Di("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var sd = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), sD = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(sd));
  function sI(e, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < e.length; a++) {
      var o = e[a], l = o.event;
      o = o.listeners;
      e: {
        var r = void 0;
        if (t) for (var i = o.length - 1; 0 <= i; i--) {
          var n = o[i], u = n.instance, d = n.currentTarget;
          if (n = n.listener, u !== r && l.isPropagationStopped()) break e;
          r = n, l.currentTarget = d;
          try {
            r(l);
          } catch (c) {
            kf(c);
          }
          l.currentTarget = null, r = u;
        }
        else for (i = 0; i < o.length; i++) {
          if (n = o[i], u = n.instance, d = n.currentTarget, n = n.listener, u !== r && l.isPropagationStopped()) break e;
          r = n, l.currentTarget = d;
          try {
            r(l);
          } catch (c) {
            kf(c);
          }
          l.currentTarget = null, r = u;
        }
      }
    }
  }
  function ue(e, t) {
    var a = t[r0];
    a === void 0 && (a = t[r0] = /* @__PURE__ */ new Set());
    var o = e + "__bubble";
    a.has(o) || (dI(t, e, 2, false), a.add(o));
  }
  function ug(e, t, a) {
    var o = 0;
    t && (o |= 4), dI(a, e, o, t);
  }
  var lf = "_reactListening" + Math.random().toString(36).slice(2);
  function pL(e) {
    if (!e[lf]) {
      e[lf] = true, ty.forEach(function(a) {
        a !== "selectionchange" && (sD.has(a) || ug(a, false, e), ug(a, true, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[lf] || (t[lf] = true, ug("selectionchange", false, t));
    }
  }
  function dI(e, t, a, o) {
    switch (OI(t)) {
      case 2:
        var l = t2;
        break;
      case 8:
        l = a2;
        break;
      default:
        l = SL;
    }
    a = l.bind(null, t, a, e), l = void 0, !Tg || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = true), o ? l !== void 0 ? e.addEventListener(t, a, { capture: true, passive: l }) : e.addEventListener(t, a, true) : l !== void 0 ? e.addEventListener(t, a, { passive: l }) : e.addEventListener(t, a, false);
  }
  function sg(e, t, a, o, l) {
    var r = o;
    if ((t & 1) === 0 && (t & 2) === 0 && o !== null) e: for (; ; ) {
      if (o === null) return;
      var i = o.tag;
      if (i === 3 || i === 4) {
        var n = o.stateNode.containerInfo;
        if (n === l) break;
        if (i === 4) for (i = o.return; i !== null; ) {
          var u = i.tag;
          if ((u === 3 || u === 4) && i.stateNode.containerInfo === l) return;
          i = i.return;
        }
        for (; n !== null; ) {
          if (i = vi(n), i === null) return;
          if (u = i.tag, u === 5 || u === 6 || u === 26 || u === 27) {
            o = r = i;
            continue e;
          }
          n = n.parentNode;
        }
      }
      o = o.return;
    }
    sy(function() {
      var d = r, c = Mv(a), h = [];
      e: {
        var s = Ey.get(e);
        if (s !== void 0) {
          var f = lm, v = e;
          switch (e) {
            case "keypress":
              if (cf(a) === 0) break e;
            case "keydown":
            case "keyup":
              f = jR;
              break;
            case "focusin":
              v = "focus", f = Xh;
              break;
            case "focusout":
              v = "blur", f = Xh;
              break;
            case "beforeblur":
            case "afterblur":
              f = Xh;
              break;
            case "click":
              if (a.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              f = m0;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              f = BR;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              f = ek;
              break;
            case xy:
            case Sy:
            case Cy:
              f = qR;
              break;
            case yy:
              f = ak;
              break;
            case "scroll":
            case "scrollend":
              f = PR;
              break;
            case "wheel":
              f = lk;
              break;
            case "copy":
            case "cut":
            case "paste":
              f = zR;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              f = h0;
              break;
            case "submit":
              f = JR;
              break;
            case "toggle":
            case "beforetoggle":
              f = ik;
          }
          var L = (t & 4) !== 0, x = !L && (e === "scroll" || e === "scrollend"), p = L ? s !== null ? s + "Capture" : null : s;
          L = [];
          for (var m = d, g; m !== null; ) {
            var S = m;
            if (g = S.stateNode, S = S.tag, S !== 5 && S !== 26 && S !== 27 || g === null || p === null || (S = td(m, p), S != null && L.push(dd(m, S, g))), x) break;
            m = m.return;
          }
          0 < L.length && (s = new f(s, v, null, a, c), h.push({ event: s, listeners: L }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (f = e === "mouseover" || e === "pointerover", s = e === "mouseout" || e === "pointerout", f && a !== Ag && (v = a.relatedTarget || a.fromElement) && (vi(v) || v[lu])) break e;
          (s || f) && (v = c.window === c ? c : (f = c.ownerDocument) ? f.defaultView || f.parentWindow : window, s ? (f = a.relatedTarget || a.toElement, s = d, f = f ? vi(f) : null, f !== null && (x = gd(f), L = f.tag, f !== x || L !== 5 && L !== 27 && L !== 6) && (f = null)) : (s = null, f = d), s !== f && (L = m0, S = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (L = h0, S = "onPointerLeave", p = "onPointerEnter", m = "pointer"), x = s == null ? v : Ns(s), g = f == null ? v : Ns(f), v = new L(S, m + "leave", s, a, c), v.target = x, v.relatedTarget = g, S = null, vi(c) === d && (L = new L(p, m + "enter", f, a, c), L.target = g, L.relatedTarget = x, S = L), x = S, L = s && f ? pg(s, f, dD) : null, s !== null && fC(h, v, s, L, false), f !== null && x !== null && fC(h, x, f, L, true)));
        }
        e: {
          if (s = d ? Ns(d) : window, f = s.nodeName && s.nodeName.toLowerCase(), f === "select" || f === "input" && s.type === "file") var E = b0;
          else if (L0(s)) if (hy) E = gk;
          else {
            E = pk;
            var A = mk;
          }
          else f = s.nodeName, !f || f.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? d && wv(d.elementType) && (E = b0) : E = hk;
          if (E && (E = E(e, d))) {
            py(h, E, a, c);
            break e;
          }
          A && A(e, s, d);
        }
        switch (A = d ? Ns(d) : window, e) {
          case "focusin":
            (L0(A) || A.contentEditable === "true") && (_n = A, wg = d, Vs = null);
            break;
          case "focusout":
            Vs = wg = _n = null;
            break;
          case "mousedown":
            Mg = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Mg = false, y0(h, a, c);
            break;
          case "selectionchange":
            if (Lk) break;
          case "keydown":
          case "keyup":
            y0(h, a, c);
        }
        var I;
        if (Dv) e: {
          switch (e) {
            case "compositionstart":
              var T = "onCompositionStart";
              break e;
            case "compositionend":
              T = "onCompositionEnd";
              break e;
            case "compositionupdate":
              T = "onCompositionUpdate";
              break e;
          }
          T = void 0;
        }
        else Tn ? fy(e, a) && (T = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (T = "onCompositionStart");
        T && (cy && a.locale !== "ko" && (Tn || T !== "onCompositionStart" ? T === "onCompositionEnd" && Tn && (I = dy()) : (fr = c, Rv = "value" in fr ? fr.value : fr.textContent, Tn = true)), A = $f(d, T), 0 < A.length && (T = new p0(T, e, null, a, c), h.push({ event: T, listeners: A }), I ? T.data = I : (I = my(a), I !== null && (T.data = I)))), (I = uk ? sk(e, a) : dk(e, a)) && (T = $f(d, "onBeforeInput"), 0 < T.length && (A = new p0("onBeforeInput", "beforeinput", null, a, c), h.push({ event: A, listeners: T }), A.data = I)), uD(h, e, d, a, c);
      }
      sI(h, t);
    });
  }
  function dd(e, t, a) {
    return { instance: e, listener: t, currentTarget: a };
  }
  function $f(e, t) {
    for (var a = t + "Capture", o = []; e !== null; ) {
      var l = e, r = l.stateNode;
      if (l = l.tag, l !== 5 && l !== 26 && l !== 27 || r === null || (l = td(e, a), l != null && o.unshift(dd(e, l, r)), l = td(e, t), l != null && o.push(dd(e, l, r))), e.tag === 3) return o;
      e = e.return;
    }
    return [];
  }
  function dD(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function fC(e, t, a, o, l) {
    for (var r = t._reactName, i = []; a !== null && a !== o; ) {
      var n = a, u = n.alternate, d = n.stateNode;
      if (n = n.tag, u !== null && u === o) break;
      n !== 5 && n !== 26 && n !== 27 || d === null || (u = d, l ? (d = td(a, r), d != null && i.unshift(dd(a, d, u))) : l || (d = td(a, r), d != null && i.push(dd(a, d, u)))), a = a.return;
    }
    i.length !== 0 && e.push({ event: t, listeners: i });
  }
  var cD = /\r\n?/g, fD = /\u0000|\uFFFD/g;
  function mC(e) {
    return (typeof e == "string" ? e : "" + e).replace(cD, `
`).replace(fD, "");
  }
  function cI(e, t) {
    return t = mC(t), mC(e) === t;
  }
  function Re(e, t, a, o, l, r) {
    switch (a) {
      case "children":
        if (typeof o == "string") t === "body" || t === "textarea" && o === "" || Wn(e, o);
        else if (typeof o == "number" || typeof o == "bigint") t !== "body" && Wn(e, "" + o);
        else return;
        break;
      case "className":
        Gc(e, "class", o);
        break;
      case "tabIndex":
        Gc(e, "tabindex", o);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Gc(e, a, o);
        break;
      case "style":
        uy(e, o, r);
        return;
      case "data":
        if (t !== "object") {
          Gc(e, "data", o);
          break;
        }
      case "src":
      case "href":
        if (o === "" && (t !== "a" || a !== "href")) {
          e.removeAttribute(a);
          break;
        }
        if (o == null || typeof o == "function" || typeof o == "symbol" || typeof o == "boolean") {
          e.removeAttribute(a);
          break;
        }
        o = sf(o), e.setAttribute(a, o);
        break;
      case "action":
      case "formAction":
        if (typeof o == "function") {
          e.setAttribute(a, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
          break;
        } else typeof r == "function" && (a === "formAction" ? (t !== "input" && Re(e, t, "name", l.name, l, null), Re(e, t, "formEncType", l.formEncType, l, null), Re(e, t, "formMethod", l.formMethod, l, null), Re(e, t, "formTarget", l.formTarget, l, null)) : (Re(e, t, "encType", l.encType, l, null), Re(e, t, "method", l.method, l, null), Re(e, t, "target", l.target, l, null)));
        if (o == null || typeof o == "symbol" || typeof o == "boolean") {
          e.removeAttribute(a);
          break;
        }
        o = sf(o), e.setAttribute(a, o);
        break;
      case "onClick":
        o != null && (e.onclick = ll);
        return;
      case "onScroll":
        o != null && ue("scroll", e);
        return;
      case "onScrollEnd":
        o != null && ue("scrollend", e);
        return;
      case "dangerouslySetInnerHTML":
        if (o != null) {
          if (typeof o != "object" || !("__html" in o)) throw Error(R(61));
          if (a = o.__html, a != null) {
            if (l.children != null) throw Error(R(60));
            r?.__html !== a && (e.innerHTML = a);
          }
        }
        break;
      case "multiple":
        e.multiple = o && typeof o != "function" && typeof o != "symbol";
        break;
      case "muted":
        e.muted = o && typeof o != "function" && typeof o != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (o == null || typeof o == "function" || typeof o == "boolean" || typeof o == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        a = sf(o), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a);
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        o != null && typeof o != "function" && typeof o != "symbol" ? e.setAttribute(a, o) : e.removeAttribute(a);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "credentialless":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        o && typeof o != "function" && typeof o != "symbol" ? e.setAttribute(a, "") : e.removeAttribute(a);
        break;
      case "capture":
      case "download":
        o === true ? e.setAttribute(a, "") : o !== false && o != null && typeof o != "function" && typeof o != "symbol" ? e.setAttribute(a, o) : e.removeAttribute(a);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        o != null && typeof o != "function" && typeof o != "symbol" && !isNaN(o) && 1 <= o ? e.setAttribute(a, o) : e.removeAttribute(a);
        break;
      case "rowSpan":
      case "start":
        o == null || typeof o == "function" || typeof o == "symbol" || isNaN(o) ? e.removeAttribute(a) : e.setAttribute(a, o);
        break;
      case "popover":
        ue("beforetoggle", e), ue("toggle", e), uf(e, "popover", o);
        break;
      case "xlinkActuate":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:actuate", o);
        break;
      case "xlinkArcrole":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", o);
        break;
      case "xlinkRole":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:role", o);
        break;
      case "xlinkShow":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:show", o);
        break;
      case "xlinkTitle":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:title", o);
        break;
      case "xlinkType":
        wl(e, "http://www.w3.org/1999/xlink", "xlink:type", o);
        break;
      case "xmlBase":
        wl(e, "http://www.w3.org/XML/1998/namespace", "xml:base", o);
        break;
      case "xmlLang":
        wl(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", o);
        break;
      case "xmlSpace":
        wl(e, "http://www.w3.org/XML/1998/namespace", "xml:space", o);
        break;
      case "is":
        uf(e, "is", o);
        break;
      case "innerText":
      case "textContent":
        return;
      default:
        if (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") a = DR.get(a) || a, uf(e, a, o);
        else return;
    }
    Le = true;
  }
  function mv(e, t, a, o, l, r) {
    switch (a) {
      case "style":
        uy(e, o, r);
        return;
      case "dangerouslySetInnerHTML":
        if (o != null) {
          if (typeof o != "object" || !("__html" in o)) throw Error(R(61));
          if (a = o.__html, a != null) {
            if (l.children != null) throw Error(R(60));
            r?.__html !== a && (e.innerHTML = a);
          }
        }
        break;
      case "children":
        if (typeof o == "string") Wn(e, o);
        else if (typeof o == "number" || typeof o == "bigint") Wn(e, "" + o);
        else return;
        break;
      case "onScroll":
        o != null && ue("scroll", e);
        return;
      case "onScrollEnd":
        o != null && ue("scrollend", e);
        return;
      case "onClick":
        o != null && (e.onclick = ll);
        return;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        return;
      case "innerText":
      case "textContent":
        return;
      default:
        if (!ay.hasOwnProperty(a)) e: {
          if (a[0] === "o" && a[1] === "n" && (l = a.endsWith("Capture"), r = a.slice(2, l ? a.length - 7 : void 0), t = e[wa] || null, t = t != null ? t[a] : null, typeof t == "function" && e.removeEventListener(r, t, l), typeof o == "function")) {
            typeof t != "function" && t !== null && (a in e ? e[a] = null : e.hasAttribute(a) && e.removeAttribute(a)), e.addEventListener(r, o, l);
            break e;
          }
          Le = true, a in e ? e[a] = o : o === true ? e.setAttribute(a, "") : uf(e, a, o);
        }
        return;
    }
    Le = true;
  }
  function Zt(e, t, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        ue("error", e), ue("load", e);
        var o = false, l = false, r;
        for (r in a) if (a.hasOwnProperty(r)) {
          var i = a[r];
          if (i != null) switch (r) {
            case "src":
              o = true;
              break;
            case "srcSet":
              l = true;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(R(137, t));
            default:
              Re(e, t, r, i, a, null);
          }
        }
        l && Re(e, t, "srcSet", a.srcSet, a, null), o && Re(e, t, "src", a.src, a, null);
        return;
      case "input":
        ue("invalid", e);
        var n = r = i = l = null, u = null, d = null;
        for (o in a) if (a.hasOwnProperty(o)) {
          var c = a[o];
          if (c != null) switch (o) {
            case "name":
              l = c;
              break;
            case "type":
              i = c;
              break;
            case "checked":
              u = c;
              break;
            case "defaultChecked":
              d = c;
              break;
            case "value":
              r = c;
              break;
            case "defaultValue":
              n = c;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (c != null) throw Error(R(137, t));
              break;
            default:
              Re(e, t, o, c, a, null);
          }
        }
        ry(e, r, n, u, d, i, l, false);
        return;
      case "select":
        ue("invalid", e), o = i = r = null;
        for (l in a) if (a.hasOwnProperty(l) && (n = a[l], n != null)) switch (l) {
          case "value":
            r = n;
            break;
          case "defaultValue":
            i = n;
            break;
          case "multiple":
            o = n;
          default:
            Re(e, t, l, n, a, null);
        }
        t = r, a = i, e.multiple = !!o, t != null ? Un(e, !!o, t, false) : a != null && Un(e, !!o, a, true);
        return;
      case "textarea":
        ue("invalid", e), r = l = o = null;
        for (i in a) if (a.hasOwnProperty(i) && (n = a[i], n != null)) switch (i) {
          case "value":
            o = n;
            break;
          case "defaultValue":
            l = n;
            break;
          case "children":
            r = n;
            break;
          case "dangerouslySetInnerHTML":
            if (n != null) throw Error(R(91));
            break;
          default:
            Re(e, t, i, n, a, null);
        }
        ny(e, o, l, r);
        return;
      case "option":
        for (u in a) a.hasOwnProperty(u) && (o = a[u], o != null) && (u === "selected" ? e.selected = o && typeof o != "function" && typeof o != "symbol" : Re(e, t, u, o, a, null));
        return;
      case "dialog":
        ue("beforetoggle", e), ue("toggle", e), ue("cancel", e), ue("close", e);
        break;
      case "iframe":
      case "object":
        ue("load", e);
        break;
      case "video":
      case "audio":
        for (o = 0; o < sd.length; o++) ue(sd[o], e);
        break;
      case "image":
        ue("error", e), ue("load", e);
        break;
      case "details":
        ue("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        ue("error", e), ue("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (d in a) if (a.hasOwnProperty(d) && (o = a[d], o != null)) switch (d) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(R(137, t));
          default:
            Re(e, t, d, o, a, null);
        }
        return;
      default:
        if (wv(t)) {
          for (c in a) a.hasOwnProperty(c) && (o = a[c], o !== void 0 && mv(e, t, c, o, a, void 0));
          return;
        }
    }
    for (n in a) a.hasOwnProperty(n) && (o = a[n], o != null && Re(e, t, n, o, a, null));
  }
  var mD = {};
  function pD(e, t, a, o) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var l = null, r = null, i = null, n = null, u = null, d = null, c = null;
        for (f in a) {
          var h = a[f];
          if (a.hasOwnProperty(f) && h != null) switch (f) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              u = h;
            default:
              o.hasOwnProperty(f) || Re(e, t, f, null, o, h);
          }
        }
        for (var s in o) {
          var f = o[s];
          if (h = a[s], o.hasOwnProperty(s) && (f != null || h != null)) switch (s) {
            case "type":
              f !== h && (Le = true), r = f;
              break;
            case "name":
              f !== h && (Le = true), l = f;
              break;
            case "checked":
              f !== h && (Le = true), d = f;
              break;
            case "defaultChecked":
              f !== h && (Le = true), c = f;
              break;
            case "value":
              f !== h && (Le = true), i = f;
              break;
            case "defaultValue":
              f !== h && (Le = true), n = f;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (f != null) throw Error(R(137, t));
              break;
            default:
              f !== h && Re(e, t, s, f, o, h);
          }
        }
        Ig(e, i, n, u, d, c, r, l);
        return;
      case "select":
        f = i = n = s = null;
        for (r in a) if (u = a[r], a.hasOwnProperty(r) && u != null) switch (r) {
          case "value":
            break;
          case "multiple":
            f = u;
          default:
            o.hasOwnProperty(r) || Re(e, t, r, null, o, u);
        }
        for (l in o) if (r = o[l], u = a[l], o.hasOwnProperty(l) && (r != null || u != null)) switch (l) {
          case "value":
            r !== u && (Le = true), s = r;
            break;
          case "defaultValue":
            r !== u && (Le = true), n = r;
            break;
          case "multiple":
            r !== u && (Le = true), i = r;
          default:
            r !== u && Re(e, t, l, r, o, u);
        }
        t = n, a = i, o = f, s != null ? Un(e, !!a, s, false) : !!o != !!a && (t != null ? Un(e, !!a, t, true) : Un(e, !!a, a ? [] : "", false));
        return;
      case "textarea":
        f = s = null;
        for (n in a) if (l = a[n], a.hasOwnProperty(n) && l != null && !o.hasOwnProperty(n)) switch (n) {
          case "value":
            break;
          case "children":
            break;
          default:
            Re(e, t, n, null, o, l);
        }
        for (i in o) if (l = o[i], r = a[i], o.hasOwnProperty(i) && (l != null || r != null)) switch (i) {
          case "value":
            l !== r && (Le = true), s = l;
            break;
          case "defaultValue":
            l !== r && (Le = true), f = l;
            break;
          case "children":
            break;
          case "dangerouslySetInnerHTML":
            if (l != null) throw Error(R(91));
            break;
          default:
            l !== r && Re(e, t, i, l, o, r);
        }
        iy(e, s, f);
        return;
      case "option":
        for (var v in a) s = a[v], a.hasOwnProperty(v) && s != null && !o.hasOwnProperty(v) && (v === "selected" ? e.selected = false : Re(e, t, v, null, o, s));
        for (u in o) s = o[u], f = a[u], o.hasOwnProperty(u) && s !== f && (s != null || f != null) && (u === "selected" ? (s !== f && (Le = true), e.selected = s && typeof s != "function" && typeof s != "symbol") : Re(e, t, u, s, o, f));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var L in a) s = a[L], a.hasOwnProperty(L) && s != null && !o.hasOwnProperty(L) && Re(e, t, L, null, o, s);
        for (d in o) if (s = o[d], f = a[d], o.hasOwnProperty(d) && s !== f && (s != null || f != null)) switch (d) {
          case "children":
          case "dangerouslySetInnerHTML":
            if (s != null) throw Error(R(137, t));
            break;
          default:
            Re(e, t, d, s, o, f);
        }
        return;
      default:
        if (wv(t)) {
          for (var x in a) s = a[x], a.hasOwnProperty(x) && s !== void 0 && !o.hasOwnProperty(x) && mv(e, t, x, void 0, o, s);
          for (c in o) s = o[c], f = a[c], !o.hasOwnProperty(c) || s === f || s === void 0 && f === void 0 || mv(e, t, c, s, o, f);
          return;
        }
    }
    for (var p in a) s = a[p], a.hasOwnProperty(p) && s != null && !o.hasOwnProperty(p) && Re(e, t, p, null, o, s);
    for (h in o) s = o[h], f = a[h], !o.hasOwnProperty(h) || s === f || s == null && f == null || Re(e, t, h, s, o, f);
  }
  function pC(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return true;
      default:
        return false;
    }
  }
  function hD() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, a = performance.getEntriesByType("resource"), o = 0; o < a.length; o++) {
        var l = a[o], r = l.transferSize, i = l.initiatorType, n = l.duration;
        if (r && n && pC(i)) {
          for (i = 0, n = l.responseEnd, o += 1; o < a.length; o++) {
            var u = a[o], d = u.startTime;
            if (d > n) break;
            var c = u.transferSize, h = u.initiatorType;
            c && pC(h) && (u = u.responseEnd, i += c * (u < n ? 1 : (n - d) / (u - d)));
          }
          if (--o, t += 8 * (r + i) / (l.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var pv = null, hv = null;
  function cd(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function hC(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function fI(e, t) {
    if (e === 0) switch (t) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
    return e === 1 && t === "foreignObject" ? 0 : e;
  }
  function mI(e, t, a, o) {
    return a = cd(a).createElement(e), a[Wt] = o, a[wa] = t, Zt(a, e, t), Ht(a), a;
  }
  function gv(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var dg = null;
  function gD() {
    var e = window.event;
    return e && e.type === "popstate" ? e === dg ? false : (dg = e, true) : (dg = null, false);
  }
  var hL = typeof setTimeout == "function" ? setTimeout : void 0, vD = typeof clearTimeout == "function" ? clearTimeout : void 0, gC = typeof Promise == "function" ? Promise : void 0, vC = typeof requestAnimationFrame == "function" ? requestAnimationFrame : hL, LD = typeof queueMicrotask == "function" ? queueMicrotask : typeof gC < "u" ? function(e) {
    return gC.resolve(null).then(e).catch(bD);
  } : hL;
  function bD(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Dr(e) {
    return e === "head";
  }
  function LC(e, t) {
    var a = t, o = 0;
    do {
      var l = a.nextSibling;
      if (e.removeChild(a), l && l.nodeType === 8) if (a = l.data, a === "/$" || a === "/&") {
        if (o === 0) {
          e.removeChild(l), ou(t);
          return;
        }
        o--;
      } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&") o++;
      else if (a === "html") fg(e.ownerDocument.documentElement);
      else if (a === "head") {
        a = e.ownerDocument.head, fg(a);
        for (var r = a.firstChild; r; ) {
          var i = r.nextSibling, n = r.nodeName;
          r[xd] || n === "SCRIPT" || n === "STYLE" || n === "LINK" && r.rel.toLowerCase() === "stylesheet" || a.removeChild(r), r = i;
        }
      } else a === "body" && fg(e.ownerDocument.body);
      a = l;
    } while (a);
    ou(t);
  }
  function bC(e, t) {
    var a = e;
    e = 0;
    do {
      var o = a.nextSibling;
      if (a.nodeType === 1 ? t ? (a._stashedDisplay = a.style.display, a.style.display = "none") : (a.style.display = a._stashedDisplay || "", a.getAttribute("style") === "" && a.removeAttribute("style")) : a.nodeType === 3 && (t ? (a._stashedText = a.nodeValue, a.nodeValue = "") : a.nodeValue = a._stashedText || ""), o && o.nodeType === 8) if (a = o.data, a === "/$") {
        if (e === 0) break;
        e--;
      } else a !== "$" && a !== "$?" && a !== "$~" && a !== "$!" || e++;
      a = o;
    } while (a);
  }
  function pI(e, t, a) {
    if (t = CSS.escape(t) !== t ? "r-" + btoa(t).replace(/=/g, "") : t, e.style.viewTransitionName = t, a != null && (e.style.viewTransitionClass = a), a = getComputedStyle(e), a.display === "inline") {
      if (t = e.getClientRects(), t.length === 1) var o = 1;
      else for (var l = o = 0; l < t.length; l++) {
        var r = t[l];
        0 < r.width && 0 < r.height && o++;
      }
      o === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + a.paddingTop, e.marginBottom = "-" + a.paddingBottom);
    }
  }
  function hI(e, t) {
    e = e.style, t = t.style;
    var a = t != null ? t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null : null;
    e.viewTransitionName = a == null || typeof a == "boolean" ? "" : ("" + a).trim(), a = t != null ? t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null : null, e.viewTransitionClass = a == null || typeof a == "boolean" ? "" : ("" + a).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (a = t.display, e.display = a == null || typeof a == "boolean" ? "" : a, a = t.margin, a != null ? e.margin = a : (a = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = a == null || typeof a == "boolean" ? "" : a, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t)));
  }
  function gI(e, t, a) {
    return a = a.ownerDocument.defaultView, { rect: e, abs: t.position === "absolute" || t.position === "fixed", clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px", view: 0 <= e.bottom && 0 <= e.right && e.top <= a.innerHeight && e.left <= a.innerWidth };
  }
  function vv(e) {
    var t = e.getBoundingClientRect(), a = getComputedStyle(e);
    return gI(t, a, e);
  }
  function xD(e) {
    var t = e.getBoundingClientRect();
    t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
    var a = getComputedStyle(e);
    return gI(t, a, e);
  }
  function SD(e) {
    return e.documentElement.clientHeight;
  }
  function CD(e) {
    this.addEventListener("load", e), this.addEventListener("error", e);
  }
  function yD(e, t, a, o, l, r, i, n, u) {
    var d = t.nodeType === 9 ? t : t.ownerDocument;
    try {
      var c = d.startViewTransition({ update: function() {
        var s = d.defaultView, f = s.navigation && s.navigation.transition, v = d.fonts.status;
        o();
        var L = [];
        if (v === "loaded" && (SD(d), d.fonts.status === "loading" && L.push(d.fonts.ready)), v = L.length, e !== null) for (var x = e.suspenseyImages, p = 0, m = 0; m < x.length; m++) {
          var g = x[m];
          if (!g.complete) {
            var S = g.getBoundingClientRect();
            if (0 < S.bottom && 0 < S.right && S.top < s.innerHeight && S.left < s.innerWidth) {
              if (p += _I(g), p > Ef) {
                L.length = v;
                break;
              }
              g = new Promise(CD.bind(g)), L.push(g);
            }
          }
        }
        if (0 < L.length) return s = Promise.race([Promise.all(L), new Promise(function(E) {
          return setTimeout(E, 500);
        })]).then(l, l), (f ? Promise.allSettled([f.finished, s]) : s).then(r, r);
        if (l(), f) return f.finished.then(r, r);
        r();
      }, types: a });
      d.__reactViewTransition = c;
      var h = [];
      return c.ready.then(function() {
        for (var s = d.documentElement.getAnimations({ subtree: true }), f = 0; f < s.length; f++) {
          var v = s[f], L = v.effect, x = L.pseudoElement;
          if (x != null && x.startsWith("::view-transition")) {
            h.push(v), v = L.getKeyframes();
            for (var p = x = void 0, m = true, g = 0; g < v.length; g++) {
              var S = v[g], E = S.width;
              if (x === void 0) x = E;
              else if (x !== E) {
                m = false;
                break;
              }
              if (E = S.height, p === void 0) p = E;
              else if (p !== E) {
                m = false;
                break;
              }
              delete S.width, delete S.height, S.transform === "none" && delete S.transform;
            }
            m && x !== void 0 && p !== void 0 && (L.setKeyframes(v), m = getComputedStyle(L.target, L.pseudoElement), m.width !== x || m.height !== p) && (m = v[0], m.width = x, m.height = p, m = v[v.length - 1], m.width = x, m.height = p, L.setKeyframes(v));
          }
        }
        i();
      }, function(s) {
        d.__reactViewTransition === c && (d.__reactViewTransition = null);
        try {
          typeof s == "object" && s !== null && s.name === "InvalidStateError" && (s.message === "View transition was skipped because document visibility state is hidden." || s.message === "Skipping view transition because document visibility state has become hidden." || s.message === "Skipping view transition because viewport size changed." || s.message === "Transition was aborted because of invalid state") && (s = null), s !== null && u(s);
        } finally {
          o(), l(), i();
        }
      }), c.finished.finally(function() {
        for (var s = 0; s < h.length; s++) h[s].cancel();
        d.__reactViewTransition === c && (d.__reactViewTransition = null), n();
      }), c;
    } catch {
      return o(), l(), i(), null;
    }
  }
  function Li(e, t) {
    this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
  }
  Li.prototype.animate = function(e, t) {
    return t = typeof t == "number" ? { duration: t } : He({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
  };
  Li.prototype.getAnimations = function() {
    for (var e = this._scope, t = this._selector, a = e.getAnimations({ subtree: true }), o = [], l = 0; l < a.length; l++) {
      var r = a[l].effect;
      r !== null && r.target === e && r.pseudoElement === t && o.push(a[l]);
    }
    return o;
  };
  Li.prototype.getComputedStyle = function() {
    return getComputedStyle(this._scope, this._selector);
  };
  function vI(e) {
    return { name: e, group: new Li("group", e), imagePair: new Li("image-pair", e), old: new Li("old", e), new: new Li("new", e) };
  }
  function Ga(e) {
    this._fragmentFiber = e, this._observers = this._eventListeners = null;
  }
  Ga.prototype.addEventListener = function(e, t, a) {
    var o = null, l = null;
    if (!(a != null && typeof a != "boolean" && (o = a.signal || null, o !== null && o.aborted))) {
      this._eventListeners === null && (this._eventListeners = []);
      var r = this._eventListeners;
      if (LI(r, e, t, a) === -1) {
        var i = this, n = t;
        a != null && typeof a != "boolean" && a.once === true && (n = function(u) {
          i.removeEventListener(e, t, a), typeof t == "function" ? t.call(this, u) : t.handleEvent(u);
        }), o !== null && (l = i.removeEventListener.bind(i, e, t, a), o.addEventListener("abort", l, { once: true }), l = o.removeEventListener.bind(o, "abort", l)), o = $n(a), r.push({ type: e, listener: t, optionsOrUseCapture: a, attachedListener: n, cleanup: l }), _a(this._fragmentFiber.child, false, ED, e, n, o);
      }
      this._eventListeners = r;
    }
  };
  function ED(e, t, a, o) {
    return Tt(e).addEventListener(t, a, o), false;
  }
  Ga.prototype.removeEventListener = function(e, t, a) {
    var o = this._eventListeners;
    if (o !== null && (t = LI(o, e, t, a), t !== -1)) {
      var l = o[t];
      a = l.attachedListener;
      var r = l.cleanup;
      l = $n(l.optionsOrUseCapture), _a(this._fragmentFiber.child, false, ID, e, a, l), o.splice(t, 1), r !== null && r();
    }
  };
  function ID(e, t, a, o) {
    return Tt(e).removeEventListener(t, a, o), false;
  }
  function $n(e) {
    return e != null && typeof e != "boolean" && (e.once === true || e.signal instanceof AbortSignal) ? { capture: e.capture, passive: e.passive } : e;
  }
  function xC(e) {
    return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
  }
  function LI(e, t, a, o) {
    if (e.length === 0) return -1;
    o = xC(o);
    for (var l = 0; l < e.length; l++) {
      var r = e[l];
      if (r.type === t && r.listener === a && xC(r.optionsOrUseCapture) === o) return l;
    }
    return -1;
  }
  Ga.prototype.dispatchEvent = function(e) {
    var t = ki(this._fragmentFiber);
    if (t === null) return true;
    t = Tt(t);
    var a = this._eventListeners;
    if (a !== null && 0 < a.length || !e.bubbles) {
      var o = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
      if (a) for (var l = 0; l < a.length; l++) {
        var r = a[l];
        o.addEventListener(r.type, r.attachedListener, $n(r.optionsOrUseCapture));
      }
      if (t.appendChild(o), e = o.dispatchEvent(e), a) for (l = 0; l < a.length; l++) r = a[l], o.removeEventListener(r.type, r.attachedListener, $n(r.optionsOrUseCapture));
      return t.removeChild(o), e;
    }
    return t.dispatchEvent(e);
  };
  Ga.prototype.focus = function(e) {
    _a(this._fragmentFiber.child, true, bI, e, void 0, void 0);
  };
  function bI(e, t) {
    return e.tag === 6 ? false : (e = Tt(e), BD(e, t));
  }
  Ga.prototype.focusLast = function(e) {
    var t = [];
    _a(this._fragmentFiber.child, true, gL, t, void 0, void 0);
    for (var a = t.length - 1; 0 <= a && !bI(t[a], e); a--) ;
  };
  function gL(e, t) {
    return t.push(e), false;
  }
  Ga.prototype.blur = function() {
    var e = ki(this._fragmentFiber);
    e !== null && (e = Tt(e), e = cd(e).activeElement, e !== null && _a(this._fragmentFiber.child, false, AD, e, void 0, void 0));
  };
  function AD(e, t) {
    return e.tag === 6 ? false : (e = Tt(e), e === t || e.contains(t) ? (t.blur(), true) : false);
  }
  Ga.prototype.observeUsing = function(e) {
    this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), _a(this._fragmentFiber.child, false, TD, e, void 0, void 0);
  };
  function TD(e, t) {
    return e.tag === 6 || (e = Tt(e), t.observe(e)), false;
  }
  Ga.prototype.unobserveUsing = function(e) {
    var t = this._observers;
    if (t !== null && t.has(e)) {
      t.delete(e), _a(this._fragmentFiber.child, false, _D, e, void 0, void 0);
      for (var a = t = 0; a < To.length; a++) {
        var o = To[a];
        o.fragmentInstance === this && o.observer === e ? e.unobserve(o.instance) : To[t++] = o;
      }
      To.length = t;
    }
  };
  function _D(e, t) {
    return e.tag === 6 || (e = Tt(e), t.unobserve(e)), false;
  }
  var To = [], cg = false;
  function wD(e, t, a) {
    To.push({ fragmentInstance: e, observer: t, instance: a }), cg || (cg = true, ND(function() {
      cg = false;
      var o = To;
      To = [];
      for (var l = 0; l < o.length; l++) {
        var r = o[l];
        r.observer.unobserve(r.instance);
      }
    }));
  }
  Ga.prototype.getClientRects = function() {
    var e = [];
    return _a(this._fragmentFiber.child, false, MD, e, void 0, void 0), e;
  };
  function MD(e, t) {
    if (e.tag === 6) {
      e = e.stateNode;
      var a = e.ownerDocument.createRange();
      a.selectNodeContents(e), t.push.apply(t, a.getClientRects());
    } else e = Tt(e), t.push.apply(t, e.getClientRects());
    return false;
  }
  Ga.prototype.getRootNode = function(e) {
    var t = ki(this._fragmentFiber);
    return t === null ? this : Tt(t).getRootNode(e);
  };
  Ga.prototype.compareDocumentPosition = function(e) {
    var t = ki(this._fragmentFiber);
    if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
    var a = [];
    _a(this._fragmentFiber.child, false, gL, a, void 0, void 0);
    var o = Tt(t);
    if (a.length === 0) {
      if (a = o, $S(this._fragmentFiber)) {
        e: {
          for (t = this._fragmentFiber.return; t !== null; ) {
            if (t.tag === 4) {
              t = t.stateNode.containerInfo;
              break e;
            }
            if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
            t = t.return;
          }
          t = null;
        }
        t != null && (a = t);
      }
      t = this._fragmentFiber;
      var l = o = a.compareDocumentPosition(e);
      return a === e ? l = Node.DOCUMENT_POSITION_CONTAINS : o & Node.DOCUMENT_POSITION_CONTAINED_BY && (a = FC(t)[1], a === null ? l = Node.DOCUMENT_POSITION_PRECEDING : (e = Tt(a).compareDocumentPosition(e), l = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), l |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
    }
    t = Tt(a[0]), l = Tt(a[a.length - 1]);
    var r = $S(this._fragmentFiber) ? t.parentElement : o;
    if (r == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
    o = r.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, r = r.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_CONTAINED_BY;
    var i = t.compareDocumentPosition(e), n = l.compareDocumentPosition(e), u = i & Node.DOCUMENT_POSITION_CONTAINED_BY || n & Node.DOCUMENT_POSITION_CONTAINED_BY;
    return n = o && r && i & Node.DOCUMENT_POSITION_FOLLOWING && n & Node.DOCUMENT_POSITION_PRECEDING, t = o && t === e || r && l === e || u || n ? Node.DOCUMENT_POSITION_CONTAINED_BY : !o && t === e || !r && l === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : i, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || RD(t, this._fragmentFiber, a[0], a[a.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
  };
  function RD(e, t, a, o, l) {
    var r = vi(l);
    if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      if (a = !!r) e: {
        for (; r !== null; ) {
          if (r.tag === 7 && (r === t || r.alternate === t)) {
            a = true;
            break e;
          }
          r = r.return;
        }
        a = false;
      }
      return a;
    }
    if (e & Node.DOCUMENT_POSITION_CONTAINS) {
      if (r === null) return r = l.ownerDocument, l === r || l === r.documentElement || l === r.body;
      e: {
        for (r = t, t = ki(t); r !== null; ) {
          if (!(r.tag !== 5 && r.tag !== 3 && r.tag !== 27 || r !== t && r.alternate !== t)) {
            r = true;
            break e;
          }
          r = r.return;
        }
        r = false;
      }
      return r;
    }
    return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!r) && !(t = r === a) && (t = pg(a, r, e0), t === null ? t = false : (_a(t, true, nR, r, a), r = yn, yn = null, t = r !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!r) && !(t = r === o) && (t = pg(o, r, e0), t === null ? t = false : (_a(t, true, uR, r, o), r = yn, mg = yn = null, t = r !== null)), t) : false;
  }
  function SC(e, t) {
    var a = e.ownerDocument.createRange();
    a.selectNodeContents(e), e = a.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
  }
  Ga.prototype.scrollIntoView = function(e) {
    if (typeof e == "object") throw Error(R(566));
    var t = [];
    _a(this._fragmentFiber.child, false, gL, t, void 0, void 0);
    var a = e !== false;
    if (t.length === 0) {
      var o = FC(this._fragmentFiber);
      if (o = a ? o[1] || o[0] || ki(this._fragmentFiber) : o[0] || o[1], o === null) return;
      if (o.tag === 6) {
        e = Tt(o), SC(e, a);
        return;
      }
      if (o = Tt(o), o.nodeType !== 9) {
        if (o.nodeType === 11) {
          a = "host" in o ? o.host : null, a !== null && a.scrollIntoView(e);
          return;
        }
        o.scrollIntoView(e);
      }
    }
    for (o = a ? t.length - 1 : 0; o !== (a ? -1 : t.length); ) {
      var l = t[o];
      l.tag === 6 ? (l = Tt(l), SC(l, a)) : Tt(l).scrollIntoView(e), o += a ? -1 : 1;
    }
  };
  function kD(e, t) {
    return e = Tt(e), xI(e, t), false;
  }
  function xI(e, t) {
    e.reactFragments == null && (e.reactFragments = /* @__PURE__ */ new Set()), e.reactFragments.add(t);
  }
  function SI(e, t) {
    var a = t._eventListeners;
    if (a !== null) for (var o = 0; o < a.length; o++) {
      var l = a[o];
      e.addEventListener(l.type, l.attachedListener, $n(l.optionsOrUseCapture));
    }
    e.nodeType !== 3 && (a = t._observers, a !== null && a.forEach(function(r) {
      for (var i = 0, n = 0; n < To.length; n++) {
        var u = To[n];
        (u.fragmentInstance !== t || u.observer !== r || u.instance !== e) && (To[i++] = u);
      }
      To.length = i, r.observe(e);
    }), xI(e, t));
  }
  function DD(e, t) {
    var a = t._eventListeners;
    if (a !== null) for (var o = 0; o < a.length; o++) {
      var l = a[o];
      e.removeEventListener(l.type, l.attachedListener, $n(l.optionsOrUseCapture));
    }
    e.nodeType !== 3 && (a = t._observers, a !== null && a.forEach(function(r) {
      typeof r.rootMargin == "string" ? wD(t, r, e) : r.unobserve(e);
    }), e.reactFragments != null && e.reactFragments.delete(t));
  }
  function Lv(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (t = t.nextSibling, a.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Lv(a), om(a);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (a.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(a);
    }
  }
  function OD(e, t, a, o) {
    for (; e.nodeType === 1; ) {
      var l = a;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!o && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
      } else if (o) {
        if (!e[xd]) switch (t) {
          case "meta":
            if (!e.hasAttribute("itemprop")) break;
            return e;
          case "link":
            if (r = e.getAttribute("rel"), r === "stylesheet" && e.hasAttribute("data-precedence")) break;
            if (r !== l.rel || e.getAttribute("href") !== (l.href == null || l.href === "" ? null : l.href) || e.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin) || e.getAttribute("title") !== (l.title == null ? null : l.title)) break;
            return e;
          case "style":
            if (e.hasAttribute("data-precedence")) break;
            return e;
          case "script":
            if (r = e.getAttribute("src"), (r !== (l.src == null ? null : l.src) || e.getAttribute("type") !== (l.type == null ? null : l.type) || e.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin)) && r && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
            return e;
          default:
            return e;
        }
      } else if (t === "input" && e.type === "hidden") {
        var r = l.name == null ? null : "" + l.name;
        if (l.type === "hidden" && e.getAttribute("name") === r) return e;
      } else return e;
      if (e = so(e.nextSibling), e === null) break;
    }
    return null;
  }
  function PD(e, t, a) {
    if (t === "") return null;
    for (; e.nodeType !== 3; ) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = so(e.nextSibling), e === null)) return null;
    return e;
  }
  function CI(e, t) {
    for (; e.nodeType !== 8; ) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = so(e.nextSibling), e === null)) return null;
    return e;
  }
  function bv(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function vL(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function UD(e, t) {
    var a = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || a.readyState !== "loading") t();
    else {
      var o = function() {
        t(), a.removeEventListener("DOMContentLoaded", o);
      };
      a.addEventListener("DOMContentLoaded", o), e._reactRetry = o;
    }
  }
  function so(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return e;
  }
  var xv = null;
  function CC(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "/$" || a === "/&") {
          if (t === 0) return so(e.nextSibling);
          t--;
        } else a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function yC(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
          if (t === 0) return e;
          t--;
        } else a !== "/$" && a !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function BD(e, t) {
    function a() {
      o = true;
    }
    if (e.ownerDocument.activeElement === e) return true;
    var o = false;
    try {
      e.ownerDocument.addEventListener("focus", a, true), (e.focus || HTMLElement.prototype.focus).call(e, t);
    } finally {
      e.ownerDocument.removeEventListener("focus", a, true);
    }
    return o;
  }
  function ND(e) {
    vC(function() {
      vC(function(t) {
        return e(t);
      });
    });
  }
  function yI(e, t, a) {
    switch (t = cd(a), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(R(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(R(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(R(454));
        return e;
      default:
        throw Error(R(451));
    }
  }
  function EI(e, t, a) {
    for (var o in a) {
      var l = a[o];
      a.hasOwnProperty(o) && l != null && Re(e, t, o, null, mD, l);
    }
    a.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === ll && (e.onclick = null), om(e);
  }
  function fg(e) {
    for (var t = e.attributes; t.length; ) e.removeAttributeNode(t[0]);
    om(e);
  }
  var co = /* @__PURE__ */ new Map(), EC = /* @__PURE__ */ new Set();
  function fd(e) {
    if (typeof e.getRootNode == "function") {
      var t = e.getRootNode();
      if (t.nodeType === 9 || t.nodeType === 11) return t;
    }
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Vl = Ee.d;
  Ee.d = { f: HD, r: qD, D: FD, C: zD, L: VD, m: GD, X: KD, S: XD, M: WD };
  function HD() {
    var e = Vl.f(), t = vm();
    return e || t;
  }
  function qD(e) {
    var t = ru(e);
    t !== null && t.tag === 5 && t.type === "form" ? uE(t) : Vl.r(e);
  }
  var su = typeof document > "u" ? null : document;
  function II(e, t, a) {
    var o = su;
    if (o && typeof t == "string" && t) {
      var l = io(t);
      l = 'link[rel="' + e + '"][href="' + l + '"]', typeof a == "string" && (l += '[crossorigin="' + a + '"]'), EC.has(l) || (EC.add(l), e = { rel: e, crossOrigin: a, href: t }, o.querySelector(l) === null && (t = o.createElement("link"), Zt(t, "link", e), Ht(t), o.head.appendChild(t)));
    }
  }
  function FD(e) {
    Vl.D(e), II("dns-prefetch", e, null);
  }
  function zD(e, t) {
    Vl.C(e, t), II("preconnect", e, t);
  }
  function VD(e, t, a) {
    Vl.L(e, t, a);
    var o = su;
    if (o && e && t) {
      var l = 'link[rel="preload"][as="' + io(t) + '"]';
      t === "image" && a && a.imageSrcSet ? (l += '[imagesrcset="' + io(a.imageSrcSet) + '"]', typeof a.imageSizes == "string" && (l += '[imagesizes="' + io(a.imageSizes) + '"]')) : l += '[href="' + io(e) + '"]';
      var r = l;
      switch (t) {
        case "style":
          r = eu(e);
          break;
        case "script":
          r = du(e);
      }
      if (!(co.has(r) || (e = He({ rel: "preload", href: t === "image" && a && a.imageSrcSet ? void 0 : e, as: t }, a), co.set(r, e), o.querySelector(l) !== null || t === "style" && o.querySelector(Ad(r)) || t === "script" && o.querySelector(Td(r))))) {
        var i = o.createElement("link");
        Zt(i, "link", e), t === "style" && (i[Rf] = true, i.onload = i.onerror = function() {
          ey(i);
        }), Ht(i), o.head.appendChild(i);
      }
    }
  }
  function GD(e, t) {
    Vl.m(e, t);
    var a = su;
    if (a && e) {
      var o = t && typeof t.as == "string" ? t.as : "script", l = 'link[rel="modulepreload"][as="' + io(o) + '"][href="' + io(e) + '"]', r = l;
      switch (o) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          r = du(e);
      }
      if (!co.has(r) && (e = He({ rel: "modulepreload", href: e }, t), co.set(r, e), a.querySelector(l) === null)) {
        switch (o) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(Td(r))) return;
        }
        o = a.createElement("link"), Zt(o, "link", e), Ht(o), a.head.appendChild(o);
      }
    }
  }
  function XD(e, t, a) {
    Vl.S(e, t, a);
    var o = su;
    if (o && e) {
      var l = Pn(o).hoistableStyles, r = eu(e);
      t = t || "default";
      var i = l.get(r);
      if (!i) {
        var n = { loading: 0, preload: null };
        if (i = o.querySelector(Ad(r))) n.loading = 5;
        else {
          e = He({ rel: "stylesheet", href: e, "data-precedence": t }, a), (a = co.get(r)) && LL(e, a);
          var u = i = o.createElement("link");
          Ht(u), Zt(u, "link", e), u._p = new Promise(function(d, c) {
            u.onload = d, u.onerror = c;
          }), u.addEventListener("load", function() {
            n.loading |= 1;
          }), u.addEventListener("error", function() {
            n.loading |= 2;
          }), n.loading |= 4, Cf(i, t, o);
        }
        i = { type: "stylesheet", instance: i, count: 1, state: n }, l.set(r, i);
      }
    }
  }
  function KD(e, t) {
    Vl.X(e, t);
    var a = su;
    if (a && e) {
      var o = Pn(a).hoistableScripts, l = du(e), r = o.get(l);
      r || (r = a.querySelector(Td(l)), r || (e = He({ src: e, async: true }, t), (t = co.get(l)) && bL(e, t), r = a.createElement("script"), Ht(r), Zt(r, "link", e), a.head.appendChild(r)), r = { type: "script", instance: r, count: 1, state: null }, o.set(l, r));
    }
  }
  function WD(e, t) {
    Vl.M(e, t);
    var a = su;
    if (a && e) {
      var o = Pn(a).hoistableScripts, l = du(e), r = o.get(l);
      r || (r = a.querySelector(Td(l)), r || (e = He({ src: e, async: true, type: "module" }, t), (t = co.get(l)) && bL(e, t), r = a.createElement("script"), Ht(r), Zt(r, "link", e), a.head.appendChild(r)), r = { type: "script", instance: r, count: 1, state: null }, o.set(l, r));
    }
  }
  function IC(e, t, a, o) {
    var l = (l = vr.current) ? fd(l) : null;
    if (!l) throw Error(R(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string" ? (a = eu(a.href), t = Pn(l).hoistableStyles, o = t.get(a), o || (o = { type: "style", instance: null, count: 0, state: null }, t.set(a, o)), o) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
          e = eu(a.href);
          var r = Pn(l).hoistableStyles, i = r.get(e);
          if (i || (l = l.ownerDocument || l, i = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, r.set(e, i), (r = l.querySelector(Ad(e))) ? r._p || (i.instance = r, i.state.loading = 5) : (r = co.get(e), r || (r = { rel: "preload", as: "style", href: a.href, crossOrigin: a.crossOrigin, integrity: a.integrity, media: a.media, hrefLang: a.hrefLang, referrerPolicy: a.referrerPolicy }, co.set(e, r)), YD(l, e, r, i.state))), t && o === null) throw Error(R(528, ""));
          return i;
        }
        if (t && o !== null) throw Error(R(529, ""));
        return null;
      case "script":
        return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (a = du(a), t = Pn(l).hoistableScripts, o = t.get(a), o || (o = { type: "script", instance: null, count: 0, state: null }, t.set(a, o)), o) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(R(444, e));
    }
  }
  function eu(e) {
    return 'href="' + io(e) + '"';
  }
  function Ad(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function AI(e) {
    return He({}, e, { "data-precedence": e.precedence, precedence: null });
  }
  function YD(e, t, a, o) {
    if (t = e.querySelector('link[rel="preload"][as="style"][' + t + "]")) {
      if (t[Rf] !== true) {
        o.loading = 1;
        return;
      }
    } else t = e.createElement("link"), t[Rf] = true, t.onload = t.onerror = ey.bind(null, t), Zt(t, "link", a), Ht(t), e.head.appendChild(t);
    o.preload = t, t.addEventListener("load", function() {
      return o.loading |= 1;
    }), t.addEventListener("error", function() {
      return o.loading |= 2;
    });
  }
  function du(e) {
    return '[src="' + io(e) + '"]';
  }
  function Td(e) {
    return "script[async]" + e;
  }
  function AC(e, t, a) {
    if (t.count++, t.instance === null) switch (t.type) {
      case "style":
        var o = e.querySelector('style[data-href~="' + io(a.href) + '"]');
        if (o) return t.instance = o, Ht(o), o;
        var l = He({}, a, { "data-href": a.href, "data-precedence": a.precedence, href: null, precedence: null });
        return o = (e.ownerDocument || e).createElement("style"), Ht(o), Zt(o, "style", l), Cf(o, a.precedence, e), t.instance = o;
      case "stylesheet":
        l = eu(a.href);
        var r = e.querySelector(Ad(l));
        if (r) return t.state.loading |= 4, t.instance = r, Ht(r), r;
        o = AI(a), (l = co.get(l)) && LL(o, l), r = (e.ownerDocument || e).createElement("link"), Ht(r);
        var i = r;
        return i._p = new Promise(function(n, u) {
          i.onload = n, i.onerror = u;
        }), Zt(r, "link", o), t.state.loading |= 4, Cf(r, a.precedence, e), t.instance = r;
      case "script":
        return r = du(a.src), (l = e.querySelector(Td(r))) ? (t.instance = l, Ht(l), l) : (o = a, (l = co.get(r)) && (o = He({}, a), bL(o, l)), e = e.ownerDocument || e, l = e.createElement("script"), Ht(l), Zt(l, "link", o), e.head.appendChild(l), t.instance = l);
      case "void":
        return null;
      default:
        throw Error(R(443, t.type));
    }
    else t.type === "stylesheet" && (t.state.loading & 4) === 0 && (o = t.instance, t.state.loading |= 4, Cf(o, a.precedence, e));
    return t.instance;
  }
  function Cf(e, t, a) {
    for (var o = a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), l = o.length ? o[o.length - 1] : null, r = l, i = 0; i < o.length; i++) {
      var n = o[i];
      if (n.dataset.precedence === t) r = n;
      else if (r !== l) break;
    }
    r ? r.parentNode.insertBefore(e, r.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild));
  }
  function LL(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function bL(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var yf = null;
  function TC(e, t, a) {
    if (yf === null) {
      var o = /* @__PURE__ */ new Map(), l = yf = /* @__PURE__ */ new Map();
      l.set(a, o);
    } else l = yf, o = l.get(a), o || (o = /* @__PURE__ */ new Map(), l.set(a, o));
    if (o.has(e)) return o;
    for (o.set(e, null), a = a.getElementsByTagName(e), l = 0; l < a.length; l++) {
      var r = a[l];
      if (!(r[xd] || r[Wt] || e === "link" && r.getAttribute("rel") === "stylesheet") && r.namespaceURI !== "http://www.w3.org/2000/svg") {
        var i = r.getAttribute(t) || "";
        i = e + i;
        var n = o.get(i);
        n ? n.push(r) : o.set(i, [r]);
      }
    }
    return o;
  }
  function Sv(e, t, a) {
    e = e.ownerDocument || e, e.head.insertBefore(a, t === "title" ? e.querySelector("head > title") : null);
  }
  function jD(e, t, a) {
    if (a === 1 || t.itemProp != null) return false;
    switch (e) {
      case "meta":
      case "title":
        return true;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
        return true;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
        return t.rel === "stylesheet" ? (e = t.disabled, typeof t.precedence == "string" && e == null) : true;
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return true;
    }
    return false;
  }
  function _C(e, t) {
    return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
  }
  function TI(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function _I(e) {
    return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * 0.25;
  }
  function wC(e, t) {
    typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += _I(t), e.suspenseyImages.push(t)), e = JD.bind(e), t.decode().then(e, e));
  }
  function QD(e, t, a, o) {
    if (a.type === "stylesheet" && (typeof o.media != "string" || matchMedia(o.media).matches !== false) && (a.state.loading & 4) === 0) {
      if (a.instance === null) {
        var l = eu(o.href), r = t.querySelector(Ad(l));
        if (r) {
          t = r._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = md.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = r, Ht(r);
          return;
        }
        r = t.ownerDocument || t, o = AI(o), (l = co.get(l)) && LL(o, l), r = r.createElement("link"), Ht(r);
        var i = r;
        i._p = new Promise(function(n, u) {
          i.onload = n, i.onerror = u;
        }), Zt(r, "link", o), a.instance = r;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = md.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    }
  }
  var Ef = 0;
  function ZD(e, t) {
    return e.stylesheets && e.count === 0 && If(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(a) {
      var o = setTimeout(function() {
        if (e.stylesheets && If(e, e.stylesheets), e.unsuspend) {
          var r = e.unsuspend;
          e.unsuspend = null, r();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Ef === 0 && (Ef = 62500 * hD());
      var l = setTimeout(function() {
        if (e.waitingForImages = false, e.count === 0 && (e.stylesheets && If(e, e.stylesheets), e.unsuspend)) {
          var r = e.unsuspend;
          e.unsuspend = null, r();
        }
      }, (e.imgBytes > Ef ? 50 : 800) + t);
      return e.unsuspend = a, function() {
        e.unsuspend = null, clearTimeout(o), clearTimeout(l);
      };
    } : null;
  }
  function wI(e) {
    if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
      if (e.stylesheets) If(e, e.stylesheets);
      else if (e.unsuspend) {
        var t = e.unsuspend;
        e.unsuspend = null, t();
      }
    }
  }
  function md() {
    this.count--, wI(this);
  }
  function JD() {
    this.imgCount--, wI(this);
  }
  var em = null;
  function If(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, em = /* @__PURE__ */ new Map(), t.forEach($D, e), em = null, md.call(e));
  }
  function $D(e, t) {
    if (!(t.state.loading & 4)) {
      var a = em.get(e);
      if (a) var o = a.get(null);
      else {
        a = /* @__PURE__ */ new Map(), em.set(e, a);
        for (var l = e.querySelectorAll("link[data-precedence],style[data-precedence]"), r = 0; r < l.length; r++) {
          var i = l[r];
          (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") && (a.set(i.dataset.precedence, i), o = i);
        }
        o && a.set(null, o);
      }
      l = t.instance, i = l.getAttribute("data-precedence"), r = a.get(i) || o, r === o && a.set(null, l), a.set(i, l), this.count++, o = md.bind(this), l.addEventListener("load", o), l.addEventListener("error", o), r ? r.parentNode.insertBefore(l, r.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(l, e.firstChild)), t.state.loading |= 4;
    }
  }
  var tu = { $$typeof: ol, Provider: null, Consumer: null, _currentValue: bi, _currentValue2: bi, _threadCount: 0 };
  function e2(e, t, a, o, l, r, i, n, u) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = qh(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = qh(0), this.hiddenUpdates = qh(null), this.identifierPrefix = o, this.onUncaughtError = l, this.onCaughtError = r, this.onRecoverableError = i, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = u, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function MI(e, t, a, o, l, r, i, n, u, d, c, h) {
    return e = new e2(e, t, a, i, u, d, c, h, n), t = 1, r === true && (t |= 24), r = Aa(3, null, null, t), e.current = r, r.stateNode = e, t = Hv(), t.refCount++, e.pooledCache = t, t.refCount++, r.memoizedState = { element: o, isDehydrated: a, cache: t }, zv(r), e;
  }
  function RI(e) {
    return e ? (e = Rn, e) : Rn;
  }
  function kI(e, t, a, o, l, r) {
    l = RI(l), o.context === null ? o.context = l : o.pendingContext = l, o = br(t), o.payload = { element: a }, r = r === void 0 ? null : r, r !== null && (o.callback = r), a = xr(e, o, t), a !== null && (Ta(a, e, t), Xs(a, e, t));
  }
  function MC(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var a = e.retryLane;
      e.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function xL(e, t) {
    MC(e, t), (e = e.alternate) && MC(e, t);
  }
  function DI(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Pi(e, 67108864);
      t !== null && Ta(t, e, 67108864), xL(e, 67108864);
    }
  }
  function RC(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = za();
      t = Tv(t);
      var a = Pi(e, t);
      a !== null && Ta(a, e, t), xL(e, t);
    }
  }
  var au = true;
  function t2(e, t, a, o) {
    var l = Z.T;
    Z.T = null;
    var r = Ee.p;
    try {
      Ee.p = 2, SL(e, t, a, o);
    } finally {
      Ee.p = r, Z.T = l;
    }
  }
  function a2(e, t, a, o) {
    var l = Z.T;
    Z.T = null;
    var r = Ee.p;
    try {
      Ee.p = 8, SL(e, t, a, o);
    } finally {
      Ee.p = r, Z.T = l;
    }
  }
  function SL(e, t, a, o) {
    if (au) {
      var l = Cv(o);
      if (l === null) sg(e, t, o, tm, a), kC(e, o);
      else if (l2(l, e, t, a, o)) o.stopPropagation();
      else if (kC(e, o), t & 4 && -1 < o2.indexOf(e)) {
        for (; l !== null; ) {
          var r = ru(l);
          if (r !== null) switch (r.tag) {
            case 3:
              if (r = r.stateNode, r.current.memoizedState.isDehydrated) {
                var i = pi(r.pendingLanes);
                if (i !== 0) {
                  var n = r;
                  for (n.pendingLanes |= 2, n.entangledLanes |= 2; i; ) {
                    var u = 1 << 31 - Fa(i);
                    n.entanglements[1] |= u, i &= ~u;
                  }
                  cl(r), (ye & 6) === 0 && (jf = Ha() + 500, Id(0, false));
                }
              }
              break;
            case 31:
            case 13:
              n = Pi(r, 2), n !== null && Ta(n, r, 2), vm(), xL(r, 2);
          }
          if (r = Cv(o), r === null && sg(e, t, o, tm, a), r === l) break;
          l = r;
        }
        l !== null && o.stopPropagation();
      } else sg(e, t, o, null, a);
    }
  }
  function Cv(e) {
    return e = Mv(e), CL(e);
  }
  var tm = null;
  function CL(e) {
    if (tm = null, e = vi(e), e !== null) {
      var t = gd(e);
      if (t === null) e = null;
      else {
        var a = t.tag;
        if (a === 13) {
          if (e = NC(t), e !== null) return e;
          e = null;
        } else if (a === 31) {
          if (e = HC(t), e !== null) return e;
          e = null;
        } else if (a === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return tm = e, null;
  }
  function OI(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "fullscreenerror":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "resize":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (vR()) {
          case XC:
            return 2;
          case KC:
            return 8;
          case Mf:
          case LR:
            return 32;
          case WC:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var yv = false, Er = null, Ir = null, Ar = null, pd = /* @__PURE__ */ new Map(), hd = /* @__PURE__ */ new Map(), dr = [], o2 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
  function kC(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Er = null;
        break;
      case "dragenter":
      case "dragleave":
        Ir = null;
        break;
      case "mouseover":
      case "mouseout":
        Ar = null;
        break;
      case "pointerover":
      case "pointerout":
        pd.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        hd.delete(t.pointerId);
    }
  }
  function Os(e, t, a, o, l, r) {
    return e === null || e.nativeEvent !== r ? (e = { blockedOn: t, domEventName: a, eventSystemFlags: o, nativeEvent: r, targetContainers: [l] }, t !== null && (t = ru(t), t !== null && DI(t)), e) : (e.eventSystemFlags |= o, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
  }
  function l2(e, t, a, o, l) {
    switch (t) {
      case "focusin":
        return Er = Os(Er, e, t, a, o, l), true;
      case "dragenter":
        return Ir = Os(Ir, e, t, a, o, l), true;
      case "mouseover":
        return Ar = Os(Ar, e, t, a, o, l), true;
      case "pointerover":
        var r = l.pointerId;
        return pd.set(r, Os(pd.get(r) || null, e, t, a, o, l)), true;
      case "gotpointercapture":
        return r = l.pointerId, hd.set(r, Os(hd.get(r) || null, e, t, a, o, l)), true;
    }
    return false;
  }
  function PI(e) {
    var t = vi(e.target);
    if (t !== null) {
      var a = gd(t);
      if (a !== null) {
        if (t = a.tag, t === 13) {
          if (t = NC(a), t !== null) {
            e.blockedOn = t, l0(e.priority, function() {
              RC(a);
            });
            return;
          }
        } else if (t === 31) {
          if (t = HC(a), t !== null) {
            e.blockedOn = t, l0(e.priority, function() {
              RC(a);
            });
            return;
          }
        } else if (t === 3 && a.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Af(e) {
    if (e.blockedOn !== null) return false;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var a = Cv(e.nativeEvent);
      if (a === null) {
        a = e.nativeEvent;
        var o = new a.constructor(a.type, a);
        Ag = o, a.target.dispatchEvent(o), Ag = null;
      } else return t = ru(a), t !== null && DI(t), e.blockedOn = a, false;
      t.shift();
    }
    return true;
  }
  function DC(e, t, a) {
    Af(e) && a.delete(t);
  }
  function r2() {
    yv = false, Er !== null && Af(Er) && (Er = null), Ir !== null && Af(Ir) && (Ir = null), Ar !== null && Af(Ar) && (Ar = null), pd.forEach(DC), hd.forEach(DC);
  }
  function rf(e, t) {
    e.blockedOn === t && (e.blockedOn = null, yv || (yv = true, _t.unstable_scheduleCallback(_t.unstable_NormalPriority, r2)));
  }
  var nf = null;
  function OC(e) {
    nf !== e && (nf = e, _t.unstable_scheduleCallback(_t.unstable_NormalPriority, function() {
      nf === e && (nf = null);
      for (var t = 0; t < e.length; t += 3) {
        var a = e[t], o = e[t + 1], l = e[t + 2];
        if (typeof o != "function") {
          if (CL(o || a) === null) continue;
          break;
        }
        var r = ru(a);
        r !== null && (e.splice(t, 3), t -= 3, zg(r, { pending: true, data: l, method: a.method, action: o }, o, l));
      }
    }));
  }
  function ou(e) {
    function t(u) {
      return rf(u, e);
    }
    Er !== null && rf(Er, e), Ir !== null && rf(Ir, e), Ar !== null && rf(Ar, e), pd.forEach(t), hd.forEach(t);
    for (var a = 0; a < dr.length; a++) {
      var o = dr[a];
      o.blockedOn === e && (o.blockedOn = null);
    }
    for (; 0 < dr.length && (a = dr[0], a.blockedOn === null); ) PI(a), a.blockedOn === null && dr.shift();
    if (a = (e.ownerDocument || e).$$reactFormReplay, a != null) for (o = 0; o < a.length; o += 3) {
      var l = a[o], r = a[o + 1], i = l[wa] || null;
      if (typeof r == "function") i || OC(a);
      else if (i) {
        var n = null;
        if (r && r.hasAttribute("formAction")) {
          if (l = r, i = r[wa] || null) n = i.formAction;
          else if (CL(l) !== null) continue;
        } else n = i.action;
        typeof n == "function" ? a[o + 1] = n : (a.splice(o, 3), o -= 3), OC(a);
      }
    }
  }
  function UI() {
    function e(r) {
      r.canIntercept && r.info === "react-transition" && r.intercept({ handler: function() {
        return new Promise(function(i) {
          return l = i;
        });
      }, focusReset: "manual", scroll: "manual" });
    }
    function t() {
      l !== null && (l(), l = null), o || setTimeout(a, 20);
    }
    function a() {
      if (!o && !navigation.transition) {
        var r = navigation.currentEntry;
        r && r.url != null && navigation.navigate(r.url, { state: r.getState(), info: "react-transition", history: "replace" });
      }
    }
    if (typeof navigation == "object") {
      var o = false, l = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(a, 100), function() {
        o = true, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), l !== null && (l(), l = null);
      };
    }
  }
  function yL(e) {
    this._internalRoot = e;
  }
  xm.prototype.render = yL.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(R(409));
    var a = t.current, o = za();
    kI(a, o, e, t, null, null);
  };
  xm.prototype.unmount = yL.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      kI(e.current, 2, null, e, null, null), vm(), t[lu] = null;
    }
  };
  function xm(e) {
    this._internalRoot = e;
  }
  xm.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = $C();
      e = { blockedOn: null, target: e, priority: t };
      for (var a = 0; a < dr.length && t !== 0 && t < dr[a].priority; a++) ;
      dr.splice(a, 0, e), a === 0 && PI(e);
    }
  };
  var PC = UC.version;
  if (PC !== "19.3.1") throw Error(R(527, PC, "19.3.1"));
  Ee.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0) throw typeof e.render == "function" ? Error(R(188)) : (e = Object.keys(e).join(","), Error(R(268, e)));
    return e = iR(t), e = e !== null ? qC(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var i2 = { bundleType: 0, version: "19.3.1", rendererPackageName: "react-dom", currentDispatcherRef: Z, reconcilerVersion: "19.3.1" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && (Ps = __REACT_DEVTOOLS_GLOBAL_HOOK__, !Ps.isDisabled && Ps.supportsFiber)) try {
    vd = Ps.inject(i2), qa = Ps;
  } catch {
  }
  var Ps;
  Sm.createRoot = function(e, t) {
    if (!BC(e)) throw Error(R(299));
    var a = false, o = "", l = gE, r = vE, i = LE;
    return t != null && (t.unstable_strictMode === true && (a = true), t.identifierPrefix !== void 0 && (o = t.identifierPrefix), t.onUncaughtError !== void 0 && (l = t.onUncaughtError), t.onCaughtError !== void 0 && (r = t.onCaughtError), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = MI(e, 1, false, null, null, a, o, null, l, r, i, UI), e[lu] = t.current, pL(e), new yL(t);
  };
  Sm.hydrateRoot = function(e, t, a) {
    if (!BC(e)) throw Error(R(299));
    var o = false, l = "", r = gE, i = vE, n = LE, u = null;
    return a != null && (a.unstable_strictMode === true && (o = true), a.identifierPrefix !== void 0 && (l = a.identifierPrefix), a.onUncaughtError !== void 0 && (r = a.onUncaughtError), a.onCaughtError !== void 0 && (i = a.onCaughtError), a.onRecoverableError !== void 0 && (n = a.onRecoverableError), a.formState !== void 0 && (u = a.formState)), t = MI(e, 1, true, t, a ?? null, o, l, u, r, i, n, UI), t.context = RI(null), a = t.current, o = za(), o = Tv(o), l = br(o), l.callback = null, xr(a, l, o), a = o, t.current.lanes = a, bd(t, a), cl(t), e[lu] = t.current, pL(e), new xm(t);
  };
  Sm.version = "19.3.1";
});
var qI = Qo((ON, HI) => {
  "use strict";
  function NI() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(NI);
    } catch (e) {
      console.error(e);
    }
  }
  NI(), HI.exports = BI();
});
var H1 = Qo((ym) => {
  "use strict";
  var d2 = /* @__PURE__ */ Symbol.for("react.transitional.element"), c2 = /* @__PURE__ */ Symbol.for("react.fragment");
  function N1(e, t, a) {
    var o = null;
    if (a !== void 0 && (o = "" + a), t.key !== void 0 && (o = "" + t.key), "key" in t) {
      a = {};
      for (var l in t) l !== "key" && (a[l] = t[l]);
    } else a = t;
    return t = a.ref, { $$typeof: d2, type: e, key: o, ref: t !== void 0 ? t : null, props: a };
  }
  ym.Fragment = c2;
  ym.jsx = N1;
  ym.jsxs = N1;
});
var Te = Qo((y5, q1) => {
  "use strict";
  q1.exports = H1();
});
var j = N(Q(), 1), CM = N(qI(), 1);
var Cm = N(Q(), 1);
var FI = (e) => e?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
function zI(e, t, a = []) {
  if (t == null) throw new Error("[lucide]: iconNode is required when icon name is used");
  return { name: FI(e), size: 24, node: t, ...a.length > 0 ? { aliases: a } : {} };
}
var VI = (e) => {
  let t = "", a = false;
  for (let o of e) {
    if (o === "-" || o === "_" || o <= " ") {
      a = t.length > 0;
      continue;
    }
    t.length === 0 ? t += o.toLowerCase() : t += a ? o.toUpperCase() : o, a = false;
  }
  return t;
};
var GI = (e) => {
  let t = VI(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
var wd = N(Q(), 1);
var _d = (...e) => e.filter((t, a, o) => !!t && t.trim() !== "" && o.indexOf(t) === a).join(" ").trim();
var Or = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
function EL(e) {
  return e != null;
}
function XI(e, t = {}) {
  let a = t.attributeNames ?? {}, o = (s) => a[s] ?? s, l = e.size ?? e.width ?? Or.width, r = e.size ?? e.height ?? Or.height, i = e.aliases?.filter((s) => typeof s == "string" && s.trim() !== "").map((s) => `lucide-${s}`) ?? [], n = [...e.name ? [`lucide-${e.name}`] : [], ...i], u = t.className?.split(" ").filter(Boolean) ?? [], d = t.includeDefaultClasses === false ? _d(...u) : _d("lucide", ...n, ...u), c = t.absoluteStrokeWidth ? Number(t.strokeWidth ?? Or["stroke-width"]) * Number(e.size ?? e.width ?? Or.width) / Number(t.size ?? t.width ?? Or.width) : t.strokeWidth ?? Or["stroke-width"];
  return ["svg", { ...Object.entries(Or).reduce((s, [f, v]) => (s[o(f)] = v, s), {}), ..."color" in t && t.color && { [o("stroke")]: t.color }, ..."size" in t && EL(t.size) && { [o("width")]: t.size, [o("height")]: t.size }, ..."width" in t && EL(t.width) && { [o("width")]: t.width }, ..."height" in t && EL(t.height) && { [o("height")]: t.height }, [o("stroke-width")]: c, ...d && { [o("class")]: d }, [o("viewBox")]: `0 0 ${l} ${r}`, ...t.hasA11yProp === false ? { [o("aria-hidden")]: "true" } : {}, ..."attributes" in t && t.attributes }, e.node.map((s) => {
    let [f, v, L] = s, x = t.nonScalingStroke ? { [o("vector-effect")]: "non-scaling-stroke", ...v } : v;
    return L ? [f, x, L] : [f, x];
  })];
}
function KI(e, t = {}) {
  return XI(e, { ...t, attributeNames: { ...t.attributeNames, class: "className", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "vector-effect": "vectorEffect" } });
}
var WI = (e) => {
  for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return true;
  return false;
};
var cu = N(Q(), 1);
var n2 = (0, cu.createContext)({});
var YI = () => (0, cu.useContext)(n2);
var jI = (0, wd.forwardRef)(({ color: e, size: t, width: a, height: o, strokeWidth: l, absoluteStrokeWidth: r, nonScalingStroke: i, className: n = "", children: u, iconNode: d = [], icon: c = { node: d, aliases: [], size: 24 }, ...h }, s) => {
  let { size: f = 24, strokeWidth: v = 2, absoluteStrokeWidth: L = false, nonScalingStroke: x = false, color: p = "currentColor", className: m = "" } = YI() ?? {}, g = !!u || WI(h), [S, E, A = []] = KI(c, { color: e ?? p, width: a ?? t ?? f, height: o ?? t ?? f, strokeWidth: l ?? v, absoluteStrokeWidth: r ?? L, nonScalingStroke: i ?? x, className: _d(m, n), hasA11yProp: g, attributes: h });
  return (0, wd.createElement)(S, { ref: s, ...E }, [...A.map(([I, T]) => (0, wd.createElement)(I, T)), ...Array.isArray(u) ? u : [u]]);
});
function H(e, t = [], a = []) {
  let o = typeof e == "string" ? zI(e, t, a) : e, l = (0, Cm.forwardRef)(({ className: r, ...i }, n) => (0, Cm.createElement)(jI, { ref: n, icon: o, className: r, ...i }));
  return o.name && (l.displayName = GI(o.name)), l;
}
var QI = { name: "arrow-down-to-line", size: 24, node: [["path", { d: "M12 17V3", key: "1cwfxf" }], ["path", { d: "m6 11 6 6 6-6", key: "12ii2o" }], ["path", { d: "M19 21H5", key: "150jfl" }]] };
QI.node;
var Pr = H(QI);
var ZI = { name: "arrow-left", size: 24, node: [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]] };
ZI.node;
var Bi = H(ZI);
var JI = { name: "audio-lines", size: 24, node: [["path", { d: "M2 10v3", key: "1fnikh" }], ["path", { d: "M6 6v11", key: "11sgs0" }], ["path", { d: "M10 3v18", key: "yhl04a" }], ["path", { d: "M14 8v7", key: "3a1oy3" }], ["path", { d: "M18 5v13", key: "123xd1" }], ["path", { d: "M22 10v3", key: "154ddg" }]] };
JI.node;
var Xa = H(JI);
var $I = { name: "captions", size: 24, node: [["rect", { width: "18", height: "14", x: "3", y: "5", rx: "2", ry: "2", key: "12ruh7" }], ["path", { d: "M7 15h4M15 15h2M7 11h2M13 11h4", key: "1ueiar" }]], aliases: ["subtitles"] };
$I.node;
var va = H($I);
var e1 = { name: "check", size: 24, node: [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]] };
e1.node;
var na = H(e1);
var t1 = { name: "chevron-right", size: 24, node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]] };
t1.node;
var fu = H(t1);
var a1 = { name: "circle-exclamation-point", size: 24, node: [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }], ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]], aliases: ["alert-circle", "circle-alert"] };
a1.node;
var Mo = H(a1);
var o1 = { name: "clapperboard", size: 24, node: [["path", { d: "m12.296 3.464 3.02 3.956", key: "qash78" }], ["path", { d: "M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z", key: "1h7j8b" }], ["path", { d: "M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", key: "4lm6w1" }], ["path", { d: "m6.18 5.276 3.1 3.899", key: "zjj9t3" }]] };
o1.node;
var fl = H(o1);
var l1 = { name: "clipboard", size: 24, node: [["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" }]] };
l1.node;
var Ni = H(l1);
var r1 = { name: "code-xml", size: 24, node: [["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }], ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }], ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]], aliases: ["code-2"] };
r1.node;
var Ur = H(r1);
var i1 = { name: "download", size: 24, node: [["path", { d: "M12 15V3", key: "m9g1x1" }], ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }], ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]] };
i1.node;
var Ro = H(i1);
var n1 = { name: "file-braces", size: 24, node: [["path", { d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z", key: "1oefj6" }], ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }], ["path", { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }], ["path", { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }]], aliases: ["file-json"] };
n1.node;
var Gl = H(n1);
var u1 = { name: "file-play", size: 24, node: [["path", { d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z", key: "1oefj6" }], ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }], ["path", { d: "M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z", key: "1tzo1f" }]], aliases: ["file-video"] };
u1.node;
var Br = H(u1);
var s1 = { name: "file-text", size: 24, node: [["path", { d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z", key: "1oefj6" }], ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }]] };
s1.node;
var fo = H(s1);
var d1 = { name: "film", size: 24, node: [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M7 3v18", key: "bbkbws" }], ["path", { d: "M3 7.5h4", key: "zfgn84" }], ["path", { d: "M3 12h18", key: "1i2n21" }], ["path", { d: "M3 16.5h4", key: "1230mu" }], ["path", { d: "M17 3v18", key: "in4fa5" }], ["path", { d: "M17 7.5h4", key: "myr1c1" }], ["path", { d: "M17 16.5h4", key: "go4c1d" }]] };
d1.node;
var $t = H(d1);
var c1 = { name: "folder-open", size: 24, node: [["path", { d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2", key: "usdka0" }]] };
c1.node;
var qe = H(c1);
var f1 = { name: "folder", size: 24, node: [["path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1kt360" }]] };
f1.node;
var mu = H(f1);
var m1 = { name: "headphones", size: 24, node: [["path", { d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3", key: "1xhozi" }]] };
m1.node;
var Md = H(m1);
var p1 = { name: "image", size: 24, node: [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }], ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }], ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]] };
p1.node;
var Rd = H(p1);
var h1 = { name: "languages", size: 24, node: [["path", { d: "m5 8 6 6", key: "1wu5hv" }], ["path", { d: "m4 14 6-6 2-3", key: "1k1g8d" }], ["path", { d: "M2 5h12", key: "or177f" }], ["path", { d: "M7 2h1", key: "1t2jsx" }], ["path", { d: "m22 22-5-10-5 10", key: "don7ne" }], ["path", { d: "M14 18h6", key: "1m8k6r" }]] };
h1.node;
var pu = H(h1);
var g1 = { name: "loader-circle", size: 24, node: [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]], aliases: ["loader-2"] };
g1.node;
var Nr = H(g1);
var v1 = { name: "locate-fixed", size: 24, node: [["line", { x1: "2", x2: "5", y1: "12", y2: "12", key: "bvdh0s" }], ["line", { x1: "19", x2: "22", y1: "12", y2: "12", key: "1tbv5k" }], ["line", { x1: "12", x2: "12", y1: "2", y2: "5", key: "11lu5j" }], ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }], ["circle", { cx: "12", cy: "12", r: "7", key: "fim9np" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]] };
v1.node;
var kd = H(v1);
var L1 = { name: "maximize-2", size: 24, node: [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "m21 3-7 7", key: "1l2asr" }], ["path", { d: "m3 21 7-7", key: "tjx5ai" }], ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]] };
L1.node;
var Hr = H(L1);
var b1 = { name: "minus", size: 24, node: [["path", { d: "M5 12h14", key: "1ays0h" }]] };
b1.node;
var Dd = H(b1);
var x1 = { name: "play", size: 24, node: [["path", { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z", key: "10ikf1" }]] };
x1.node;
var mo = H(x1);
var S1 = { name: "plus", size: 24, node: [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "M12 5v14", key: "s699le" }]] };
S1.node;
var Hi = H(S1);
var C1 = { name: "rotate-ccw", size: 24, node: [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }]] };
C1.node;
var qi = H(C1);
var y1 = { name: "scan-line", size: 24, node: [["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }], ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }], ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }], ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }], ["path", { d: "M7 12h10", key: "b7w52i" }]] };
y1.node;
var Ka = H(y1);
var E1 = { name: "scissors", size: 24, node: [["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }], ["path", { d: "M8.12 8.12 12 12", key: "1alkpv" }], ["path", { d: "M20 4 8.12 15.88", key: "xgtan2" }], ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }], ["path", { d: "M14.8 14.8 20 20", key: "ptml3r" }]] };
E1.node;
var Xl = H(E1);
var I1 = { name: "settings-2", size: 24, node: [["path", { d: "M14 17H5", key: "gfn3mx" }], ["path", { d: "M19 7h-9", key: "6i9tg" }], ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }], ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]] };
I1.node;
var Fi = H(I1);
var A1 = { name: "sliders-horizontal", size: 24, node: [["path", { d: "M10 5H3", key: "1qgfaw" }], ["path", { d: "M12 19H3", key: "yhmn1j" }], ["path", { d: "M14 3v4", key: "1sua03" }], ["path", { d: "M16 17v4", key: "1q0r14" }], ["path", { d: "M21 12h-9", key: "1o4lsq" }], ["path", { d: "M21 19h-5", key: "1rlt1p" }], ["path", { d: "M21 5h-7", key: "1oszz2" }], ["path", { d: "M8 10v4", key: "tgpxqk" }], ["path", { d: "M8 12H3", key: "a7s4jb" }]] };
A1.node;
var Od = H(A1);
var T1 = { name: "sparkles", size: 24, node: [["path", { d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z", key: "1s2grr" }], ["path", { d: "M20 2v4", key: "1rf3ol" }], ["path", { d: "M22 4h-4", key: "gwowj6" }], ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]], aliases: ["stars"] };
T1.node;
var Ma = H(T1);
var _1 = { name: "square", size: 24, node: [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]] };
_1.node;
var hu = H(_1);
var w1 = { name: "terminal", size: 24, node: [["path", { d: "M12 19h8", key: "baeox8" }], ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]] };
w1.node;
var Kl = H(w1);
var M1 = { name: "upload", size: 24, node: [["path", { d: "M12 3v12", key: "1x0j5s" }], ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }], ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]] };
M1.node;
var Pd = H(M1);
var R1 = { name: "volume-2", size: 24, node: [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z", key: "uqj9uw" }], ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }], ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]] };
R1.node;
var zi = H(R1);
var k1 = { name: "volume-x", size: 24, node: [["path", { d: "M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z", key: "1p7khw" }], ["path", { d: "m16.5 14.5 5-5", key: "cul3yw" }], ["path", { d: "m16.5 9.5 5 5", key: "1akey5" }]] };
k1.node;
var Ud = H(k1);
var D1 = { name: "wrench", size: 24, node: [["path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z", key: "1ngwbx" }]] };
D1.node;
var po = H(D1);
var O1 = { name: "x", size: 24, node: [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]] };
O1.node;
var Wa = H(O1);
var Dt = N(Q(), 1);
var Ql = N(Q(), 1);
var u2 = Object.defineProperty, gu = (e, t) => u2(e, "name", { value: t, configurable: true }), P1 = !!(typeof window < "u" && window.document && window.document.createElement);
function be(e, t, { checkForDefaultPrevented: a = true } = {}) {
  return gu(function(l) {
    if (e?.(l), a === false || !l || !l.defaultPrevented) return t?.(l);
  }, "handleEvent");
}
gu(be, "composeEventHandlers");
function s2(e) {
  if (!P1) throw new Error("Cannot access window outside of the DOM");
  return e?.ownerDocument?.defaultView ?? window;
}
gu(s2, "getOwnerWindow");
function IL(e) {
  if (!P1) throw new Error("Cannot access document outside of the DOM");
  return e?.ownerDocument ?? document;
}
gu(IL, "getOwnerDocument");
function U1(e, t = false) {
  let { activeElement: a } = IL(e);
  if (!a?.nodeName) return null;
  if (B1(a) && a.contentDocument) return U1(a.contentDocument.body, t);
  if (t) {
    let o = a.getAttribute("aria-activedescendant");
    if (o) {
      let l = IL(a).getElementById(o);
      if (l) return l;
    }
  }
  return a;
}
gu(U1, "getActiveElement");
function B1(e) {
  return e.tagName === "IFRAME";
}
gu(B1, "isFrame");
var go = N(Q(), 1), AL = N(Te(), 1), f2 = Object.defineProperty, ho = (e, t) => f2(e, "name", { value: t, configurable: true });
function m2(e, t) {
  let a = go.createContext(t);
  a.displayName = e + "Context";
  let o = ho((r) => {
    let { children: i, ...n } = r, u = go.useMemo(() => n, Object.values(n));
    return (0, AL.jsx)(a.Provider, { value: u, children: i });
  }, "Provider");
  o.displayName = e + "Provider";
  function l(r, i = {}) {
    let { optional: n = false } = i, u = go.useContext(a);
    if (u) return u;
    if (t !== void 0) return t;
    if (!n) throw new Error(`\`${r}\` must be used within \`${e}\``);
  }
  return ho(l, "useContext"), [o, l];
}
ho(m2, "createContext");
function La(e, t = []) {
  let a = [];
  function o(r, i) {
    let n = go.createContext(i);
    n.displayName = r + "Context";
    let u = a.length;
    a = [...a, i];
    let d = ho((h) => {
      let { scope: s, children: f, ...v } = h, L = s?.[e]?.[u] || n, x = go.useMemo(() => v, Object.values(v));
      return (0, AL.jsx)(L.Provider, { value: x, children: f });
    }, "Provider");
    d.displayName = r + "Provider";
    function c(h, s, f = {}) {
      let { optional: v = false } = f, L = s?.[e]?.[u] || n, x = go.useContext(L);
      if (x) return x;
      if (i !== void 0) return i;
      if (!v) throw new Error(`\`${h}\` must be used within \`${r}\``);
    }
    return ho(c, "useContext"), [d, c];
  }
  ho(o, "createContext");
  let l = ho(() => {
    let r = a.map((i) => go.createContext(i));
    return ho(function(n) {
      let u = n?.[e] || r;
      return go.useMemo(() => ({ [`__scope${e}`]: { ...n, [e]: u } }), [n, u]);
    }, "useScope");
  }, "createScope");
  return l.scopeName = e, [o, F1(l, ...t)];
}
ho(La, "createContextScope");
function F1(...e) {
  let t = e[0];
  if (e.length === 1) return t;
  let a = ho(() => {
    let o = e.map((l) => ({ useScope: l(), scopeName: l.scopeName }));
    return ho(function(r) {
      let i = o.reduce((n, { useScope: u, scopeName: d }) => {
        let h = u(r)[`__scope${d}`];
        return { ...n, ...h };
      }, {});
      return go.useMemo(() => ({ [`__scope${t.scopeName}`]: i }), [i]);
    }, "useComposedScopes");
  }, "createScope");
  return a.scopeName = t.scopeName, a;
}
ho(F1, "composeContextScopes");
var Ft = N(Q(), 1);
var Do = N(Q(), 1);
var z1 = N(Q(), 1), p2 = Object.defineProperty, _L = (e, t) => p2(e, "name", { value: t, configurable: true });
function TL(e, t) {
  if (typeof e == "function") return e(t);
  e != null && (e.current = t);
}
_L(TL, "setRef");
function V1(...e) {
  return (t) => {
    let a = false, o = e.map((l) => {
      let r = TL(l, t);
      return !a && typeof r == "function" && (a = true), r;
    });
    if (a) return () => {
      for (let l = 0; l < o.length; l++) {
        let r = o[l];
        typeof r == "function" ? r() : TL(e[l], null);
      }
    };
  };
}
_L(V1, "composeRefs");
function De(...e) {
  return z1.useCallback(V1(...e), e);
}
_L(De, "useComposedRefs");
var ea = N(Q(), 1);
var h2 = Object.defineProperty, Ya = (e, t) => h2(e, "name", { value: t, configurable: true });
function ko(e) {
  let t = ea.forwardRef((a, o) => {
    let { children: l, ...r } = a, i = null, n = false, u = [];
    l = j1(l), ea.Children.forEach(l, (s) => {
      if (W1(s)) {
        n = true;
        let f = s, v = "child" in f.props ? f.props.child : f.props.children;
        for (; wL(v) && typeof Em == "function"; ) v = Em(v._payload);
        i = v2(f, v), u.push(i?.props?.children);
      } else u.push(s);
    }), i ? i = ea.cloneElement(i, void 0, u) : !n && ea.Children.count(l) === 1 && ea.isValidElement(l) && (i = l);
    let d = i ? K1(i) : void 0, c = De(o, d);
    if (!i) {
      if (l || l === 0) throw new Error(n ? x2(e) : b2(e));
      return l;
    }
    let h = X1(r, i.props ?? {});
    return i.type !== ea.Fragment && (h.ref = o ? c : d), ea.cloneElement(i, h);
  });
  return t.displayName = `${e}.Slot`, t;
}
Ya(ko, "createSlot");
var G1 = /* @__PURE__ */ Symbol.for("radix.slottable");
function g2(e) {
  let t = Ya((a) => "child" in a ? a.children(a.child) : a.children, "Slottable");
  return t.displayName = `${e}.Slottable`, t.__radixId = G1, t;
}
Ya(g2, "createSlottable");
var v2 = Ya((e, t) => "child" in e.props ? ea.isValidElement(t) ? ea.cloneElement(t, void 0, e.props.children(t.props.children)) : null : ea.isValidElement(t) ? t : null, "getSlottableElementFromSlottable");
function X1(e, t) {
  let a = { ...t };
  for (let o in t) {
    let l = e[o], r = t[o];
    /^on[A-Z]/.test(o) ? l && r ? a[o] = (...n) => {
      let u = r(...n);
      return l(...n), u;
    } : l && (a[o] = l) : o === "style" ? a[o] = { ...l, ...r } : o === "className" ? a[o] = [l, r].filter(Boolean).join(" ") : o === "aria-describedby" && (a[o] = Q1(r, l));
  }
  return { ...e, ...a };
}
Ya(X1, "mergeProps");
function K1(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, a = t && "isReactWarning" in t && t.isReactWarning;
  return a ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, a = t && "isReactWarning" in t && t.isReactWarning, a ? e.props.ref : e.props.ref || e.ref);
}
Ya(K1, "getElementRef");
function W1(e) {
  return ea.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === G1;
}
Ya(W1, "isSlottable");
var L2 = /* @__PURE__ */ Symbol.for("react.lazy");
function wL(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === L2 && "_payload" in e && Y1(e._payload);
}
Ya(wL, "isLazyComponent");
function Y1(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
Ya(Y1, "isPromiseLike");
function j1(e) {
  let t = e;
  for (; wL(t) && typeof Em == "function"; ) t = Em(t._payload);
  return t;
}
Ya(j1, "useUnwrappedLazy");
function Q1(...e) {
  let t = /* @__PURE__ */ new Set();
  for (let a of e) if (typeof a == "string") for (let o of String(a).trim().split(/\s+/)) o && t.add(o);
  return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
Ya(Q1, "concatAriaDescribedby");
var b2 = Ya((e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, "createSlotError"), x2 = Ya((e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, "createSlottableError"), Em = ea[" use ".trim().toString()];
var Am = N(Te(), 1), Mt = N(Q(), 1);
var Z1 = N(Q(), 1), st = globalThis?.document ? Z1.useLayoutEffect : () => {
};
var Fr = N(Te(), 1), S2 = Object.defineProperty, wt = (e, t) => S2(e, "name", { value: t, configurable: true });
function Bd(e) {
  let t = e + "CollectionProvider", [a, o] = La(t), [l, r] = a(t, { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }), i = wt((L) => {
    let { scope: x, children: p } = L, m = Do.useRef(null), g = Do.useRef(/* @__PURE__ */ new Map()).current;
    return (0, Am.jsx)(l, { scope: x, itemMap: g, collectionRef: m, children: p });
  }, "CollectionProvider");
  i.displayName = t;
  let n = e + "CollectionSlot", u = ko(n), d = Do.forwardRef((L, x) => {
    let { scope: p, children: m } = L, g = r(n, p), S = De(x, g.collectionRef);
    return (0, Am.jsx)(u, { ref: S, children: m });
  });
  d.displayName = n;
  let c = e + "CollectionItemSlot", h = "data-radix-collection-item", s = ko(c), f = Do.forwardRef((L, x) => {
    let { scope: p, children: m, ...g } = L, S = Do.useRef(null), E = De(x, S), A = r(c, p);
    return Do.useEffect(() => (A.itemMap.set(S, { ref: S, ...g }), () => {
      A.itemMap.delete(S);
    })), (0, Am.jsx)(s, { [h]: "", ref: E, children: m });
  });
  f.displayName = c;
  function v(L) {
    let x = r(e + "CollectionConsumer", L);
    return Do.useCallback(() => {
      let m = x.collectionRef.current;
      if (!m) return [];
      let g = Array.from(m.querySelectorAll(`[${h}]`));
      return Array.from(x.itemMap.values()).sort((A, I) => g.indexOf(A.ref.current) - g.indexOf(I.ref.current));
    }, [x.collectionRef, x.itemMap]);
  }
  return wt(v, "useCollection"), [{ Provider: i, Slot: d, ItemSlot: f }, v, o];
}
wt(Bd, "createCollection");
var J1 = /* @__PURE__ */ new WeakMap(), Im = class qr extends Map {
  static {
    wt(this, "OrderedDict");
  }
  #e;
  constructor(t) {
    super(t), this.#e = [...super.keys()], J1.set(this, true);
  }
  set(t, a) {
    return J1.get(this) && !this.has(t) && this.#e.push(t), super.set(t, a), this;
  }
  insert(t, a, o) {
    let l = this.has(a), r = l ? this.size : this.size + 1, i = ML(t), n = i >= 0 ? Math.min(i, r - 1) : Math.max(r + i, 0);
    if (l ? this.#e.indexOf(a) === n : n === this.size) return this.set(a, o), this;
    let u = this.#e.filter((c) => c !== a);
    u.splice(n, 0, a);
    let d = u.map((c) => [c, c === a ? o : this.get(c)]);
    this.clear();
    for (let [c, h] of d) this.set(c, h);
    return this;
  }
  with(t, a, o) {
    let l = new qr(this);
    return l.insert(t, a, o), l;
  }
  before(t) {
    let a = this.#e.indexOf(t) - 1;
    if (!(a < 0)) return this.entryAt(a);
  }
  setBefore(t, a, o) {
    let l = this.#e.indexOf(t);
    if (l === -1) return this;
    let r = this.#e.indexOf(a), i = r !== -1 && r < l ? l - 1 : l;
    return this.insert(i, a, o);
  }
  after(t) {
    let a = this.#e.indexOf(t);
    if (a = a === -1 || a === this.size - 1 ? -1 : a + 1, a !== -1) return this.entryAt(a);
  }
  setAfter(t, a, o) {
    let l = this.#e.indexOf(t);
    if (l === -1) return this;
    let r = this.#e.indexOf(a), i = r !== -1 && r <= l ? l : l + 1;
    return this.insert(i, a, o);
  }
  first() {
    return this.entryAt(0);
  }
  last() {
    return this.entryAt(-1);
  }
  clear() {
    return this.#e = [], super.clear();
  }
  delete(t) {
    let a = super.delete(t);
    return a && this.#e.splice(this.#e.indexOf(t), 1), a;
  }
  deleteAt(t) {
    let a = this.keyAt(t);
    return a !== void 0 ? this.delete(a) : false;
  }
  at(t) {
    let a = Tm(this.#e, t);
    if (a !== void 0) return this.get(a);
  }
  entryAt(t) {
    let a = Tm(this.#e, t);
    if (a !== void 0) return [a, this.get(a)];
  }
  indexOf(t) {
    return this.#e.indexOf(t);
  }
  keyAt(t) {
    return Tm(this.#e, t);
  }
  from(t, a) {
    let o = this.indexOf(t);
    if (o === -1) return;
    let l = o + a;
    return l < 0 && (l = 0), l >= this.size && (l = this.size - 1), this.at(l);
  }
  keyFrom(t, a) {
    let o = this.indexOf(t);
    if (o === -1) return;
    let l = o + a;
    return l < 0 && (l = 0), l >= this.size && (l = this.size - 1), this.keyAt(l);
  }
  find(t, a) {
    let o = 0;
    for (let l of this) {
      if (Reflect.apply(t, a, [l, o, this])) return l;
      o++;
    }
  }
  findIndex(t, a) {
    let o = 0;
    for (let l of this) {
      if (Reflect.apply(t, a, [l, o, this])) return o;
      o++;
    }
    return -1;
  }
  filter(t, a) {
    let o = [], l = 0;
    for (let r of this) Reflect.apply(t, a, [r, l, this]) && o.push(r), l++;
    return new qr(o);
  }
  map(t, a) {
    let o = [], l = 0;
    for (let r of this) o.push([r[0], Reflect.apply(t, a, [r, l, this])]), l++;
    return new qr(o);
  }
  reduce(...t) {
    let [a, o] = t, l = t.length > 1;
    if (!l && this.size === 0) throw new TypeError("Reduce of empty OrderedDict with no initial value");
    let r = 0, i = o;
    for (let n of this) r === 0 && !l ? i = n : i = Reflect.apply(a, this, [i, n, r, this]), r++;
    return i;
  }
  reduceRight(...t) {
    let [a, o] = t, l = t.length > 1;
    if (!l && this.size === 0) throw new TypeError("Reduce of empty OrderedDict with no initial value");
    let r = o;
    for (let i = this.size - 1; i >= 0; i--) {
      let n = this.entryAt(i);
      i === this.size - 1 && !l ? r = n : r = Reflect.apply(a, this, [r, n, i, this]);
    }
    return r;
  }
  sort(t) {
    if (typeof t != "function") throw new TypeError("OrderedDict.sort requires a compare function");
    let a = [...this.entries()].sort(t);
    this.clear();
    for (let [o, l] of a) this.set(o, l);
    return this;
  }
  toSorted(t) {
    if (typeof t != "function") throw new TypeError("OrderedDict.toSorted requires a compare function");
    let a = [...this.entries()].sort(t);
    return new qr(a);
  }
  toReversed() {
    let t = new qr();
    for (let a = this.size - 1; a >= 0; a--) {
      let o = this.keyAt(a), l = this.get(o);
      t.set(o, l);
    }
    return t;
  }
  toSpliced(...t) {
    let a = [...this.entries()];
    return a.splice(...t), new qr(a);
  }
  slice(t, a) {
    let o = new qr();
    for (let l of this.#e.slice(t, a)) o.set(l, this.get(l));
    return o;
  }
  every(t, a) {
    let o = 0;
    for (let l of this) {
      if (!Reflect.apply(t, a, [l, o, this])) return false;
      o++;
    }
    return true;
  }
  some(t, a) {
    let o = 0;
    for (let l of this) {
      if (Reflect.apply(t, a, [l, o, this])) return true;
      o++;
    }
    return false;
  }
};
function Tm(e, t) {
  if ("at" in Array.prototype) return Array.prototype.at.call(e, t);
  let a = $1(e, t);
  return a === -1 ? void 0 : e[a];
}
wt(Tm, "at");
function $1(e, t) {
  let a = e.length, o = ML(t), l = o >= 0 ? o : a + o;
  return l < 0 || l >= a ? -1 : l;
}
wt($1, "toSafeIndex");
function ML(e) {
  return e !== e || e === 0 ? 0 : Math.trunc(e);
}
wt(ML, "toSafeInteger");
function C2(e) {
  let t = e + "CollectionProvider", [a, o] = La(t), [l, r] = a(t);
  l.displayName = e + "CollectionStableContextProvider";
  let [i, n] = a(t);
  i.displayName = e + "CollectionStatefulContextProvider";
  let u = wt(({ state: A, ...I }) => A ? (0, Fr.jsx)(c, { ...I, state: A }) : (0, Fr.jsx)(d, { ...I }), "CollectionProvider");
  u.displayName = t;
  let d = wt((A) => {
    let I = m();
    return (0, Fr.jsx)(c, { ...A, state: I });
  }, "CollectionInit");
  d.displayName = e + "CollectionInit";
  let c = wt((A) => {
    let { scope: I, children: T, state: w } = A, k = Mt.useRef(null), [F, V] = Mt.useState(null), $ = De(k, V), [ee, me] = w, we = Mt.useRef(new Im()), je = Mt.useCallback(() => {
      let Ve = we.current;
      return aA(Ve) || Ve.sort(_m), Ve;
    }, []);
    return Mt.useEffect(() => {
      if (!F) return;
      let Ve = oA(() => {
        me((Ge) => {
          let Y = Ge.toSorted(_m);
          return Y.some(([sa], Ca) => Ge.keyAt(Ca) !== sa) ? Y : Ge;
        });
      });
      return Ve.observe(F, { childList: true, subtree: true }), () => {
        Ve.disconnect();
      };
    }, [F, me]), (0, Fr.jsx)(l, { scope: I, collectionElementRef: $, collectionElementRefObject: k, getCollection: je, setCollection: me, registryRef: we, children: (0, Fr.jsx)(i, { scope: I, collectionElement: F, collection: ee, children: T }) });
  }, "CollectionProviderImpl");
  c.displayName = e + "CollectionProviderImpl";
  let h = e + "CollectionSlot", s = ko(h), f = Mt.forwardRef((A, I) => {
    let { scope: T, children: w } = A, k = r(h, T), F = De(I, k.collectionElementRef);
    return (0, Fr.jsx)(s, { ref: F, children: w });
  });
  f.displayName = h;
  let v = e + "CollectionItemSlot", L = "data-radix-collection-item", x = ko(v), p = Mt.forwardRef((A, I) => {
    let { scope: T, children: w, ...k } = A, F = Mt.useRef(null), V = r(v, T), { setCollection: $, registryRef: ee } = V, me = Mt.useRef(k);
    eA(me.current, k) || (me.current = k);
    let we = me.current, je = Mt.useCallback((Y) => {
      let ae = ee.current;
      Y ? ae.set(Y, { ...me.current, element: Y }) : F.current && ae.delete(F.current);
    }, [ee]), Ve = De(I, je, F);
    st(() => {
      let Y = F.current, ae = ee.current;
      Y && ae.has(Y) && ae.set(Y, { ...we, element: Y });
    }, [we, ee]);
    let Ge = Mt.useRef(null);
    return Mt.useEffect(() => {
      let Y = F.current, ae = Ge.current;
      (ae?.element ?? null) === Y && (!Y || ae?.itemData === we) || (Ge.current = Y ? { element: Y, itemData: we } : null, $((sa) => {
        let Ca = new Im(sa);
        return ae && ae.element !== Y && Ca.delete(ae.element), Y && Ca.set(Y, { ...we, element: Y }), Ca.sort(_m);
      }));
    }), Mt.useEffect(() => () => {
      let Y = Ge.current;
      Ge.current = null, Y && $((ae) => {
        if (!ae.has(Y.element)) return ae;
        let sa = new Im(ae);
        return sa.delete(Y.element), sa;
      });
    }, [$]), (0, Fr.jsx)(x, { [L]: "", ref: Ve, children: w });
  });
  p.displayName = v;
  function m() {
    return Mt.useState(new Im());
  }
  wt(m, "useInitCollection");
  function g(A) {
    let { collection: I } = n(e + "CollectionConsumer", A);
    return I;
  }
  wt(g, "useCollection");
  function S(A) {
    let { getCollection: I } = r(e + "CollectionConsumer", A);
    return I;
  }
  return wt(S, "useGetCollection"), [{ Provider: u, Slot: f, ItemSlot: p }, { createCollectionScope: o, useCollection: g, useGetCollection: S, useInitCollection: m }];
}
wt(C2, "createCollection");
function eA(e, t) {
  if (e === t) return true;
  if (typeof e != "object" || typeof t != "object" || e == null || t == null) return false;
  let a = Object.keys(e), o = Object.keys(t);
  if (a.length !== o.length) return false;
  for (let l of a) if (!Object.prototype.hasOwnProperty.call(t, l) || e[l] !== t[l]) return false;
  return true;
}
wt(eA, "shallowEqual");
function tA(e, t) {
  return !!(t.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
}
wt(tA, "isElementPreceding");
function aA(e) {
  let t;
  for (let a of e.keys()) {
    if (t) {
      let o = t.compareDocumentPosition(a);
      if (!(o & Node.DOCUMENT_POSITION_DISCONNECTED) && o & Node.DOCUMENT_POSITION_PRECEDING) return false;
    }
    t = a;
  }
  return true;
}
wt(aA, "isInDocumentOrder");
function _m(e, t) {
  return !e[1].element || !t[1].element ? 0 : tA(e[1].element, t[1].element) ? -1 : 1;
}
wt(_m, "sortByDocumentPosition");
function oA(e) {
  return new MutationObserver((a) => {
    for (let o of a) if (o.type === "childList") {
      e();
      return;
    }
  });
}
wt(oA, "getChildListObserver");
var RL = N(Q(), 1);
var y2 = Object.defineProperty, E2 = (e, t) => y2(e, "name", { value: t, configurable: true }), I2 = RL[" useId ".trim().toString()] || (() => {
}), A2 = 0;
function Wl(e) {
  let [t, a] = RL.useState(I2());
  return st(() => {
    e || a((o) => o ?? String(A2++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
E2(Wl, "useId");
var lA = N(Q(), 1), rA = N(Hc(), 1);
var iA = N(Te(), 1), T2 = Object.defineProperty, _2 = (e, t) => T2(e, "name", { value: t, configurable: true }), w2 = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"], Oe = w2.reduce((e, t) => {
  let a = ko(`Primitive.${t}`), o = lA.forwardRef((l, r) => {
    let { asChild: i, ...n } = l, u = i ? a : t;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = true), (0, iA.jsx)(u, { ...n, ref: r });
  });
  return o.displayName = `Primitive.${t}`, { ...e, [t]: o };
}, {});
function kL(e, t) {
  e && rA.flushSync(() => e.dispatchEvent(t));
}
_2(kL, "dispatchDiscreteCustomEvent");
var Nd = N(Q(), 1), M2 = Object.defineProperty, R2 = (e, t) => M2(e, "name", { value: t, configurable: true }), nA = Nd[" useInsertionEffect ".trim().toString()];
function ml(e) {
  let t = Nd.useRef(e);
  return typeof nA == "function" ? nA(() => {
    t.current = e;
  }) : st(() => {
    t.current = e;
  }), Nd.useMemo(() => ((...a) => t.current?.(...a)), []);
}
R2(ml, "useCallbackRef");
var vo = N(Q(), 1);
var wm = false;
var Oo = N(Q(), 1);
var vu = N(Q(), 1), k2 = Object.defineProperty, D2 = (e, t) => k2(e, "name", { value: t, configurable: true }), uA = vu[" useEffectEvent ".trim().toString()], sA = vu[" useInsertionEffect ".trim().toString()];
function DL(e) {
  if (typeof uA == "function") return uA(e);
  let t = vu.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  return typeof sA == "function" ? sA(() => {
    t.current = e;
  }) : st(() => {
    t.current = e;
  }), vu.useMemo(() => ((...a) => t.current?.(...a)), []);
}
D2(DL, "useEffectEvent");
var O2 = Object.defineProperty, Hd = (e, t) => O2(e, "name", { value: t, configurable: true }), P2 = vo[" useInsertionEffect ".trim().toString()] || st;
function Po({ prop: e, defaultProp: t, onChange: a = Hd(() => {
}, "onChange"), caller: o }) {
  let [l, r, i] = cA({ defaultProp: t, onChange: a }), n = e !== void 0, u = n ? e : l;
  if (wm) {
    let c = vo.useRef(e !== void 0);
    vo.useEffect(() => {
      let h = c.current;
      h !== n && console.warn(`${o} is changing from ${h ? "controlled" : "uncontrolled"} to ${n ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), c.current = n;
    }, [n, o]);
  }
  let d = vo.useCallback((c) => {
    if (n) {
      let h = fA(c) ? c(e) : c;
      h !== e && i.current?.(h);
    } else r(c);
  }, [n, e, r, i]);
  return [u, d];
}
Hd(Po, "useControllableState");
function cA({ defaultProp: e, onChange: t }) {
  let [a, o] = vo.useState(e), l = vo.useRef(a), r = vo.useRef(t);
  return P2(() => {
    r.current = t;
  }, [t]), vo.useEffect(() => {
    l.current !== a && (r.current?.(a), l.current = a);
  }, [a, l]), [a, o, r];
}
Hd(cA, "useUncontrolledState");
function fA(e) {
  return typeof e == "function";
}
Hd(fA, "isFunction");
var dA = /* @__PURE__ */ Symbol("RADIX:SYNC_STATE");
function U2(e, t, a, o) {
  let { prop: l, defaultProp: r, onChange: i, caller: n } = t, u = l !== void 0, d = DL(i);
  if (wm) {
    let x = Oo.useRef(l !== void 0);
    Oo.useEffect(() => {
      let p = x.current;
      p !== u && console.warn(`${n} is changing from ${p ? "controlled" : "uncontrolled"} to ${u ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), x.current = u;
    }, [u, n]);
  }
  let c = [{ ...a, state: r }];
  o && c.push(o);
  let [h, s] = Oo.useReducer((x, p) => {
    if (p.type === dA) return { ...x, state: p.state };
    let m = e(x, p);
    return u && !Object.is(m.state, x.state) && d(m.state), m;
  }, ...c), f = h.state, v = Oo.useRef(f);
  Oo.useEffect(() => {
    v.current !== f && (v.current = f, u || d(f));
  }, [f, v, u]);
  let L = Oo.useMemo(() => l !== void 0 ? { ...h, state: l } : h, [h, l]);
  return Oo.useEffect(() => {
    u && !Object.is(l, h.state) && s({ type: dA, state: l });
  }, [l, h.state, u]), [L, s];
}
Hd(U2, "useControllableStateReducer");
var Mm = N(Q(), 1), H2 = N(Te(), 1), B2 = Object.defineProperty, N2 = (e, t) => B2(e, "name", { value: t, configurable: true }), q2 = { LTR: "ltr", RTL: "rtl" }, F2 = Mm.createContext(void 0);
function Vi(e) {
  let t = Mm.useContext(F2);
  return e || t || q2.LTR;
}
N2(Vi, "useDirection");
var V2 = N(Q(), 1), Rm = N(Q(), 1), z2 = Object.defineProperty, PL = (e, t) => z2(e, "name", { value: t, configurable: true }), OL = false;
function mA() {
  let [e, t] = Rm.useState(OL);
  return Rm.useEffect(() => {
    OL || (OL = true, t(true));
  }, []), e;
}
PL(mA, "useIsHydrated");
var pA = V2[" useSyncExternalStore ".trim().toString()];
function hA() {
  return () => {
  };
}
PL(hA, "subscribe");
function gA() {
  return pA(hA, () => true, () => false);
}
PL(gA, "useIsHydratedModern");
var vA = typeof pA == "function" ? gA : mA;
var zr = N(Te(), 1), G2 = Object.defineProperty, Gi = (e, t) => G2(e, "name", { value: t, configurable: true }), UL = "rovingFocusGroup.onEntryFocus", X2 = { bubbles: false, cancelable: true }, km = "RovingFocusGroup", [BL, bA, K2] = Bd(km), [W2, NL] = La(km, [K2]), LA = { Vertical: "vertical", Horizontal: "horizontal" }, Y2 = { LTR: "ltr", RTL: "rtl" }, [j2, Q2] = W2(km), xA = Ft.forwardRef(Gi(function(t, a) {
  return (0, zr.jsx)(BL.Provider, { scope: t.__scopeRovingFocusGroup, children: (0, zr.jsx)(BL.Slot, { scope: t.__scopeRovingFocusGroup, children: (0, zr.jsx)(Z2, { ...t, ref: a }) }) });
}, "RovingFocusGroup")), Z2 = Ft.forwardRef(Gi(function(t, a) {
  let { __scopeRovingFocusGroup: o, orientation: l, loop: r = false, dir: i, currentTabStopId: n, defaultCurrentTabStopId: u, onCurrentTabStopIdChange: d, onEntryFocus: c, preventScrollOnEntryFocus: h = false, ...s } = t, f = Ft.useRef(null), v = De(a, f), L = Vi(i), [x, p] = Po({ prop: n, defaultProp: u ?? null, onChange: d, caller: km }), [m, g] = Ft.useState(false), S = ml(c), E = bA(o), A = Ft.useRef(false), [I, T] = Ft.useState(0);
  return Ft.useEffect(() => {
    let w = f.current;
    if (w) return w.addEventListener(UL, S), () => w.removeEventListener(UL, S);
  }, [S]), (0, zr.jsx)(j2, { scope: o, orientation: l, dir: L, loop: r, currentTabStopId: x, onItemFocus: Ft.useCallback((w) => p(w), [p]), onItemShiftTab: Ft.useCallback(() => g(true), []), onFocusableItemAdd: Ft.useCallback(() => T((w) => w + 1), []), onFocusableItemRemove: Ft.useCallback(() => T((w) => w - 1), []), children: (0, zr.jsx)(Oe.div, { tabIndex: m || I === 0 ? -1 : 0, "data-orientation": l, ...s, ref: v, style: { outline: "none", ...t.style }, onMouseDown: be(t.onMouseDown, () => {
    A.current = true;
  }), onFocus: be(t.onFocus, (w) => {
    let k = !A.current;
    if (w.target === w.currentTarget && k && !m) {
      let F = new CustomEvent(UL, X2);
      if (w.currentTarget.dispatchEvent(F), !F.defaultPrevented) {
        let V = E().filter((je) => je.focusable), $ = V.find((je) => je.active), ee = V.find((je) => je.id === x), we = [$, ee, ...V].filter(Boolean).map((je) => je.ref.current);
        HL(we, h);
      }
    }
    A.current = false;
  }), onBlur: be(t.onBlur, () => g(false)) }) });
}, "RovingFocusGroupImpl")), J2 = "RovingFocusGroupItem", SA = Ft.forwardRef(Gi(function(t, a) {
  let { __scopeRovingFocusGroup: o, focusable: l = true, active: r = false, tabStopId: i, children: n, ...u } = t, d = Wl(), c = i || d, h = Q2(J2, o), s = h.currentTabStopId === c, f = bA(o), { onFocusableItemAdd: v, onFocusableItemRemove: L, currentTabStopId: x } = h, p = vA();
  return st(() => {
    if (!(!p || !l)) return v(), () => L();
  }, [p, l, v, L]), Ft.useEffect(() => {
    if (!(p || !l)) return v(), () => L();
  }, [p, l, v, L]), (0, zr.jsx)(BL.ItemSlot, { scope: o, id: c, focusable: l, active: r, children: (0, zr.jsx)(Oe.span, { tabIndex: s ? 0 : -1, "data-orientation": h.orientation, ...u, ref: a, onMouseDown: be(t.onMouseDown, (m) => {
    l ? h.onItemFocus(c) : m.preventDefault();
  }), onFocus: be(t.onFocus, () => h.onItemFocus(c)), onKeyDown: be(t.onKeyDown, (m) => {
    if (m.key === "Tab" && m.shiftKey) {
      h.onItemShiftTab();
      return;
    }
    if (m.target !== m.currentTarget) return;
    let g = yA(m, h.orientation, h.dir);
    if (g !== void 0) {
      if (m.metaKey || m.ctrlKey || m.altKey || m.shiftKey) return;
      m.preventDefault();
      let E = f().filter((A) => A.focusable).map((A) => A.ref.current);
      if (g === "last") E.reverse();
      else if (g === "prev" || g === "next") {
        g === "prev" && E.reverse();
        let A = E.indexOf(m.currentTarget);
        E = h.loop ? EA(E, A + 1) : E.slice(A + 1);
      }
      setTimeout(() => HL(E));
    }
  }), children: typeof n == "function" ? n({ isCurrentTabStop: s, hasTabStop: x != null }) : n }) });
}, "RovingFocusGroupItem")), $2 = { ArrowLeft: "prev", ArrowUp: "prev", ArrowRight: "next", ArrowDown: "next", PageUp: "first", Home: "first", PageDown: "last", End: "last" };
function CA(e, t) {
  return t !== Y2.RTL ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
Gi(CA, "getDirectionAwareKey");
function yA(e, t, a) {
  let o = CA(e.key, a);
  if (!(t === LA.Vertical && ["ArrowLeft", "ArrowRight"].includes(o)) && !(t === LA.Horizontal && ["ArrowUp", "ArrowDown"].includes(o))) return $2[o];
}
Gi(yA, "getFocusIntent");
function HL(e, t = false) {
  let a = document.activeElement;
  for (let o of e) if (o === a || (o.focus({ preventScroll: t }), document.activeElement !== a)) return;
}
Gi(HL, "focusFirst");
function EA(e, t) {
  return e.map((a, o) => e[(t + o) % e.length]);
}
Gi(EA, "wrapArray");
var ta = N(Q(), 1);
var IA = N(Q(), 1), tO = Object.defineProperty, Yl = (e, t) => tO(e, "name", { value: t, configurable: true });
function AA(e, t) {
  return IA.useReducer((a, o) => t[a][o] ?? a, e);
}
Yl(AA, "useStateMachine");
var bu = Yl((e) => {
  let { present: t, children: a } = e, o = TA(t), l = typeof a == "function" ? a({ present: o.isPresent }) : ta.Children.only(a), r = _A(o.ref, wA(l));
  return typeof a == "function" || o.isPresent ? ta.cloneElement(l, { ref: r }) : null;
}, "Presence");
function TA(e) {
  let [t, a] = ta.useState(), o = ta.useRef(null), l = ta.useRef(e), r = ta.useRef("none"), i = ta.useRef(void 0), n = e ? "mounted" : "unmounted", [u, d] = AA(n, { mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" }, unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" }, unmounted: { MOUNT: "mounted" } });
  return ta.useEffect(() => {
    u === "mounted" ? (r.current = i.current ?? Lu(o.current), i.current = void 0) : r.current = "none";
  }, [u]), st(() => {
    let c = o.current, h = l.current;
    if (h !== e) {
      let f = r.current, v = Lu(c);
      e ? (i.current = v, d("MOUNT")) : v === "none" || c?.display === "none" ? d("UNMOUNT") : d(h && f !== v ? "ANIMATION_OUT" : "UNMOUNT"), l.current = e;
    }
  }, [e, d]), st(() => {
    if (t) {
      let c, h = t.ownerDocument.defaultView ?? window, s = Yl((v) => {
        let x = Lu(o.current).includes(CSS.escape(v.animationName));
        if (v.target === t && x && (d("ANIMATION_END"), !l.current)) {
          let p = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", c = h.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = p);
          });
        }
      }, "handleAnimationEnd"), f = Yl((v) => {
        v.target === t && (r.current = Lu(o.current));
      }, "handleAnimationStart");
      return t.addEventListener("animationstart", f), t.addEventListener("animationcancel", s), t.addEventListener("animationend", s), () => {
        h.clearTimeout(c), t.removeEventListener("animationstart", f), t.removeEventListener("animationcancel", s), t.removeEventListener("animationend", s);
      };
    } else d("ANIMATION_END");
  }, [t, d]), { isPresent: ["mounted", "unmountSuspended"].includes(u), ref: ta.useCallback((c) => {
    if (c) {
      let h = getComputedStyle(c);
      o.current = h, i.current = Lu(h);
    } else o.current = null;
    a(c);
  }, []) };
}
Yl(TA, "usePresence");
function qL(e, t) {
  if (typeof e == "function") return e(t);
  e != null && (e.current = t);
}
Yl(qL, "setRef");
function _A(...e) {
  let t = ta.useRef(e);
  return t.current = e, ta.useCallback((a) => {
    let o = t.current, l = false, r = o.map((i) => {
      let n = qL(i, a);
      return !l && typeof n == "function" && (l = true), n;
    });
    if (l) return () => {
      for (let i = 0; i < r.length; i++) {
        let n = r[i];
        typeof n == "function" ? n() : qL(o[i], null);
      }
    };
  }, []);
}
Yl(_A, "useStableComposedRefs");
function Lu(e) {
  return e?.animationName || "none";
}
Yl(Lu, "getAnimationName");
function wA(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, a = t && "isReactWarning" in t && t.isReactWarning;
  return a ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, a = t && "isReactWarning" in t && t.isReactWarning, a ? e.props.ref : e.props.ref || e.ref);
}
Yl(wA, "getElementRef");
var jl = N(Te(), 1), aO = Object.defineProperty, xu = (e, t) => aO(e, "name", { value: t, configurable: true }), MA = { Automatic: "automatic", Manual: "manual" }, FL = "Tabs", [oO, xH] = La(FL, [NL]), RA = NL(), [lO, zL] = oO(FL), Dm = Ql.forwardRef(xu(function(t, a) {
  let { __scopeTabs: o, value: l, onValueChange: r, defaultValue: i, orientation: n = "horizontal", dir: u, activationMode: d = MA.Automatic, ...c } = t, h = Vi(u), [s, f] = Po({ prop: l, onChange: r, defaultProp: i ?? "", caller: FL });
  return (0, jl.jsx)(lO, { scope: o, baseId: Wl(), value: s, onValueChange: f, orientation: n, dir: h, activationMode: d, children: (0, jl.jsx)(Oe.div, { dir: h, "data-orientation": n, ...c, ref: a }) });
}, "Tabs")), rO = "TabsList", Om = Ql.forwardRef(xu(function(t, a) {
  let { __scopeTabs: o, loop: l = true, ...r } = t, i = zL(rO, o), n = RA(o);
  return (0, jl.jsx)(xA, { asChild: true, ...n, orientation: i.orientation, dir: i.dir, loop: l, children: (0, jl.jsx)(Oe.div, { role: "tablist", "aria-orientation": i.orientation, ...r, ref: a }) });
}, "TabsList")), iO = "TabsTrigger", Pm = Ql.forwardRef(xu(function(t, a) {
  let { __scopeTabs: o, value: l, disabled: r = false, ...i } = t, n = zL(iO, o), u = RA(o), d = VL(n.baseId, l), c = GL(n.baseId, l), h = l === n.value;
  return (0, jl.jsx)(SA, { asChild: true, ...u, focusable: !r, active: h, children: (0, jl.jsx)(Oe.button, { type: "button", role: "tab", "aria-selected": h, "aria-controls": c, "data-state": h ? "active" : "inactive", "data-disabled": r ? "" : void 0, disabled: r, id: d, ...i, ref: a, onMouseDown: be(t.onMouseDown, (s) => {
    !r && s.button === 0 && s.ctrlKey === false ? (s.currentTarget.focus(), n.onValueChange(l)) : s.preventDefault();
  }), onKeyDown: be(t.onKeyDown, (s) => {
    r || s.target !== s.currentTarget || [" ", "Enter"].includes(s.key) && n.onValueChange(l);
  }), onFocus: be(t.onFocus, () => {
    let s = n.activationMode !== MA.Manual;
    !h && !r && s && n.onValueChange(l);
  }) }) });
}, "TabsTrigger")), nO = "TabsContent", Xi = Ql.forwardRef(xu(function(t, a) {
  let { __scopeTabs: o, value: l, forceMount: r, children: i, ...n } = t, u = zL(nO, o), d = VL(u.baseId, l), c = GL(u.baseId, l), h = l === u.value, s = Ql.useRef(h);
  return Ql.useEffect(() => {
    let f = requestAnimationFrame(() => s.current = false);
    return () => cancelAnimationFrame(f);
  }, []), (0, jl.jsx)(bu, { present: r || h, children: ({ present: f }) => (0, jl.jsx)(Oe.div, { "data-state": h ? "active" : "inactive", "data-orientation": u.orientation, role: "tabpanel", "aria-labelledby": d, hidden: !f, id: c, tabIndex: 0, ...n, ref: a, style: { ...t.style, animationDuration: s.current ? "0s" : void 0 }, children: f && i }) });
}, "TabsContent"));
function VL(e, t) {
  return `${e}-trigger-${t}`;
}
xu(VL, "makeTriggerId");
function GL(e, t) {
  return `${e}-content-${t}`;
}
xu(GL, "makeContentId");
var Fe = N(Q(), 1);
var Ue = N(Q(), 1);
var OA = N(Te(), 1), uO = Object.defineProperty, zt = (e, t) => uO(e, "name", { value: t, configurable: true }), XL = "dismissableLayer.update", sO = "dismissableLayer.pointerDownOutside", dO = "dismissableLayer.focusOutside", DA, PA = Ue.createContext({ layers: /* @__PURE__ */ new Set(), layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(), branches: /* @__PURE__ */ new Set(), dismissableSurfaces: /* @__PURE__ */ new Set() }), UA = Ue.forwardRef(zt(function(t, a) {
  let { disableOutsidePointerEvents: o = false, deferPointerDownOutside: l = false, onEscapeKeyDown: r, onPointerDownOutside: i, onFocusOutside: n, onInteractOutside: u, onDismiss: d, ...c } = t, h = Ue.useContext(PA), [s, f] = Ue.useState(null), v = s?.ownerDocument ?? globalThis?.document, [, L] = Ue.useState({}), x = De(a, f), p = Array.from(h.layers), [m] = [...h.layersWithOutsidePointerEventsDisabled].slice(-1), g = m ? p.indexOf(m) : -1, S = s ? p.indexOf(s) : -1, E = h.layersWithOutsidePointerEventsDisabled.size > 0, A = S >= g, I = Ue.useRef(false), T = BA((V) => {
    i?.(V), u?.(V), V.defaultPrevented || d?.();
  }, { ownerDocument: v, deferPointerDownOutside: l, isDeferredPointerDownOutsideRef: I, dismissableSurfaces: h.dismissableSurfaces, shouldHandlePointerDownOutside: Ue.useCallback((V) => {
    if (!(V instanceof Node)) return false;
    let $ = [...h.branches].some((ee) => ee.contains(V));
    return A && !$;
  }, [h.branches, A]) }), w = NA((V) => {
    if (l && I.current) return;
    let $ = V.target;
    [...h.branches].some((me) => me.contains($)) || (n?.(V), u?.(V), V.defaultPrevented || d?.());
  }, v), k = s ? S === p.length - 1 : false, F = ml((V) => {
    V.key === "Escape" && (r?.(V), !V.defaultPrevented && d && (V.preventDefault(), d()));
  });
  return Ue.useEffect(() => {
    if (k) return v.addEventListener("keydown", F, { capture: true }), () => v.removeEventListener("keydown", F, { capture: true });
  }, [v, k, F]), Ue.useEffect(() => {
    if (s) return o && (h.layersWithOutsidePointerEventsDisabled.size === 0 && (DA = v.body.style.pointerEvents, v.body.style.pointerEvents = "none"), h.layersWithOutsidePointerEventsDisabled.add(s)), h.layers.add(s), KL(), () => {
      o && (h.layersWithOutsidePointerEventsDisabled.delete(s), h.layersWithOutsidePointerEventsDisabled.size === 0 && (v.body.style.pointerEvents = DA));
    };
  }, [s, v, o, h]), Ue.useEffect(() => () => {
    s && (h.layers.delete(s), h.layersWithOutsidePointerEventsDisabled.delete(s), KL());
  }, [s, h]), Ue.useEffect(() => {
    let V = zt(() => L({}), "handleUpdate");
    return document.addEventListener(XL, V), () => document.removeEventListener(XL, V);
  }, []), (0, OA.jsx)(Oe.div, { ...c, ref: x, style: { pointerEvents: E ? A ? "auto" : "none" : void 0, ...t.style }, onFocusCapture: be(t.onFocusCapture, w.onFocusCapture), onBlurCapture: be(t.onBlurCapture, w.onBlurCapture), onPointerDownCapture: be(t.onPointerDownCapture, T.onPointerDownCapture) });
}, "DismissableLayer"));
function WL() {
  let e = Ue.useContext(PA), [t, a] = Ue.useState(null);
  return Ue.useEffect(() => {
    if (t) return e.dismissableSurfaces.add(t), () => {
      e.dismissableSurfaces.delete(t);
    };
  }, [t, e.dismissableSurfaces]), a;
}
zt(WL, "useDismissableLayerSurface");
var cO = zt(() => true, "IS_TRUE");
function BA(e, t) {
  let { ownerDocument: a = globalThis?.document, deferPointerDownOutside: o = false, isDeferredPointerDownOutsideRef: l, dismissableSurfaces: r, shouldHandlePointerDownOutside: i = cO } = t, n = ml(e), u = Ue.useRef(false), d = Ue.useRef(false), c = Ue.useRef(/* @__PURE__ */ new Map()), h = Ue.useRef(() => {
  });
  return Ue.useEffect(() => {
    function s() {
      d.current = false, l.current = false, c.current.clear();
    }
    zt(s, "resetOutsideInteraction");
    function f() {
      return Array.from(c.current.values()).some(Boolean);
    }
    zt(f, "isOutsideInteractionIntercepted");
    function v(g) {
      if (!d.current) return;
      let S = g.target;
      S instanceof Node && [...r].some((A) => A.contains(S)) || c.current.set(g.type, true), g.type === "click" && window.setTimeout(() => {
        d.current && h.current();
      }, 0);
    }
    zt(v, "handleInteractionCapture");
    function L(g) {
      d.current && c.current.set(g.type, false);
    }
    zt(L, "handleInteractionBubble");
    let x = zt((g) => {
      if (g.target && !u.current) {
        let E = function() {
          a.removeEventListener("click", h.current);
          let I = f();
          s(), I || YL(sO, n, A, { discrete: true });
        };
        var S = E;
        if (zt(E, "handleAndDispatchPointerDownOutsideEvent"), !i(g.target)) {
          a.removeEventListener("click", h.current), s(), u.current = false;
          return;
        }
        let A = { originalEvent: g };
        d.current = true, l.current = o && g.button === 0, c.current.clear(), !o || g.button !== 0 ? E() : (a.removeEventListener("click", h.current), h.current = E, a.addEventListener("click", h.current, { once: true }));
      } else a.removeEventListener("click", h.current), s();
      u.current = false;
    }, "handlePointerDown"), p = ["pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click"];
    for (let g of p) a.addEventListener(g, v, true), a.addEventListener(g, L);
    let m = window.setTimeout(() => {
      a.addEventListener("pointerdown", x);
    }, 0);
    return () => {
      window.clearTimeout(m), a.removeEventListener("pointerdown", x), a.removeEventListener("click", h.current);
      for (let g of p) a.removeEventListener(g, v, true), a.removeEventListener(g, L);
    };
  }, [a, n, o, l, r, i]), { onPointerDownCapture: zt(() => u.current = true, "onPointerDownCapture") };
}
zt(BA, "usePointerDownOutside");
function NA(e, t = globalThis?.document) {
  let a = ml(e), o = Ue.useRef(false);
  return Ue.useEffect(() => {
    let l = zt((r) => {
      r.target && !o.current && YL(dO, a, { originalEvent: r }, { discrete: false });
    }, "handleFocus");
    return t.addEventListener("focusin", l), () => t.removeEventListener("focusin", l);
  }, [t, a]), { onFocusCapture: zt(() => o.current = true, "onFocusCapture"), onBlurCapture: zt(() => o.current = false, "onBlurCapture") };
}
zt(NA, "useFocusOutside");
function KL() {
  let e = new CustomEvent(XL);
  document.dispatchEvent(e);
}
zt(KL, "dispatchUpdate");
function YL(e, t, a, { discrete: o }) {
  let l = a.originalEvent.target, r = new CustomEvent(e, { bubbles: false, cancelable: true, detail: a });
  t && l.addEventListener(e, t, { once: true }), o ? kL(l, r) : l.dispatchEvent(r);
}
zt(YL, "handleAndDispatchCustomEvent");
var rt = N(Q(), 1);
var $L = N(Te(), 1), fO = Object.defineProperty, bt = (e, t) => fO(e, "name", { value: t, configurable: true }), jL = "focusScope.autoFocusOnMount", QL = "focusScope.autoFocusOnUnmount", HA = { bubbles: false, cancelable: true }, FA = rt.forwardRef(bt(function(t, a) {
  let { loop: o = false, trapped: l = false, branches: r, onMountAutoFocus: i, onUnmountAutoFocus: n, ...u } = t, [d, c] = rt.useState(null), h = ml(i), s = ml(n), f = rt.useRef(null), v = De(a, c), L = rt.useRef(r);
  rt.useEffect(() => {
    L.current = r;
  });
  let x = rt.useCallback((g) => g ? d?.contains(g) ? true : !!L.current?.some((S) => S.contains(g)) : false, [d]), p = rt.useRef({ paused: false, pause() {
    this.paused = true;
  }, resume() {
    this.paused = false;
  } }).current;
  rt.useEffect(() => {
    if (l) {
      let A = function(k) {
        if (p.paused || !d) return;
        let F = k.target;
        x(F) ? f.current = F : Zl(f.current, { select: true });
      }, I = function(k) {
        if (p.paused || !d) return;
        let F = k.relatedTarget;
        F !== null && (x(F) || Zl(f.current, { select: true }));
      }, T = function(k) {
        if (document.activeElement === document.body) for (let V of k) V.removedNodes.length > 0 && Zl(d);
      };
      var g = A, S = I, E = T;
      bt(A, "handleFocusIn"), bt(I, "handleFocusOut"), bt(T, "handleMutations"), document.addEventListener("focusin", A), document.addEventListener("focusout", I);
      let w = new MutationObserver(T);
      return d && w.observe(d, { childList: true, subtree: true }), () => {
        document.removeEventListener("focusin", A), document.removeEventListener("focusout", I), w.disconnect();
      };
    }
  }, [l, d, p.paused, x]), rt.useEffect(() => {
    if (d) {
      qA.add(p);
      let g = document.activeElement;
      if (!d.contains(g)) {
        let E = new CustomEvent(jL, HA);
        d.addEventListener(jL, h), d.dispatchEvent(E), E.defaultPrevented || (VA(YA(ab(d)), { select: true }), document.activeElement === g && Zl(d));
      }
      return () => {
        d.removeEventListener(jL, h);
        let E = d.ownerDocument, A = CustomEvent;
        setTimeout(() => {
          let I = new A(QL, HA);
          d.addEventListener(QL, s), d.dispatchEvent(I), I.defaultPrevented || Zl(g ?? E.body, { select: true }), d.removeEventListener(QL, s), qA.remove(p);
        }, 0);
      };
    }
  }, [d, h, s, p]);
  let m = rt.useCallback((g) => {
    if (!o && !l || p.paused) return;
    let S = g.key === "Tab" && !g.altKey && !g.ctrlKey && !g.metaKey, E = document.activeElement;
    if (S && E) {
      let A = g.currentTarget, [I, T] = GA(A);
      I && T ? !g.shiftKey && E === T ? (g.preventDefault(), o && Zl(I, { select: true })) : g.shiftKey && E === I && (g.preventDefault(), o && Zl(T, { select: true })) : E === A && g.preventDefault();
    }
  }, [o, l, p.paused]);
  return (0, $L.jsx)(Oe.div, { tabIndex: -1, ...u, ref: v, onKeyDown: m });
}, "FocusScope")), zA = rt.createContext(null);
function eb({ registry: e, children: t }) {
  return e ? (0, $L.jsx)(zA.Provider, { value: e, children: t }) : t;
}
bt(eb, "FocusScopeBranchProvider");
function tb() {
  let [e, t] = rt.useState([]), a = rt.useMemo(() => ({ add: bt((o) => t((l) => l.includes(o) ? l : [...l, o]), "add"), remove: bt((o) => t((l) => l.filter((r) => r !== o)), "remove") }), []);
  return { nodes: e, registry: a };
}
bt(tb, "useFocusScopeBranchRegistry");
function mO(e) {
  let t = rt.useContext(zA);
  rt.useEffect(() => {
    if (!(!e || !t)) return t.add(e), () => t.remove(e);
  }, [e, t]);
}
bt(mO, "useFocusScopeBranch");
function VA(e, { select: t = false } = {}) {
  let a = document.activeElement;
  for (let o of e) if (Zl(o, { select: t }), document.activeElement !== a) return;
}
bt(VA, "focusFirst");
function GA(e) {
  let t = ab(e), a = ZL(t, e), o = ZL(t.reverse(), e);
  return [a, o];
}
bt(GA, "getTabbableEdges");
function ab(e) {
  let t = [], o = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: bt((l) => {
    let r = l.tagName === "INPUT" && l.type === "hidden";
    return l.disabled || l.hidden || r ? NodeFilter.FILTER_SKIP : l.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  }, "acceptNode") });
  for (; o.nextNode(); ) t.push(o.currentNode);
  return t;
}
bt(ab, "getTabbableCandidates");
function ZL(e, t) {
  let a = typeof t.checkVisibility == "function" && t.checkVisibility({ checkVisibilityCSS: true });
  for (let o of e) if (!(a ? !o.checkVisibility({ checkVisibilityCSS: true }) : XA(o, { upTo: t }))) return o;
}
bt(ZL, "findVisible");
function XA(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return true;
  for (; e; ) {
    if (t !== void 0 && e === t) return false;
    if (getComputedStyle(e).display === "none") return true;
    e = e.parentElement;
  }
  return false;
}
bt(XA, "isHidden");
function KA(e) {
  return e.tagName === "INPUT" && typeof e.select == "function";
}
bt(KA, "isSelectableInput");
function Zl(e, { select: t = false } = {}) {
  if (e && e.focus) {
    let o = (e.ownerDocument ?? document).activeElement;
    e.focus({ preventScroll: true }), e !== o && KA(e) && t && e.select();
  }
}
bt(Zl, "focus");
var qA = WA();
function WA() {
  let e = [];
  return { add(t) {
    let a = e[0];
    t !== a && a?.pause(), e = JL(e, t), e.unshift(t);
  }, remove(t) {
    e = JL(e, t), e[0]?.resume();
  } };
}
bt(WA, "createFocusScopesStack");
function JL(e, t) {
  let a = [...e], o = a.indexOf(t);
  return o !== -1 && a.splice(o, 1), a;
}
bt(JL, "arrayRemove");
function YA(e) {
  return e.filter((t) => t.tagName !== "A");
}
bt(YA, "removeLinks");
var Um = N(Q(), 1), jA = N(Hc(), 1);
var QA = N(Te(), 1), pO = Object.defineProperty, hO = (e, t) => pO(e, "name", { value: t, configurable: true }), ZA = Um.forwardRef(hO(function(t, a) {
  let { container: o, ...l } = t, [r, i] = Um.useState(false);
  st(() => i(true), []);
  let n = o || r && globalThis?.document?.body;
  return n ? jA.createPortal((0, QA.jsx)(Oe.div, { ...l, ref: a }), n) : null;
}, "Portal"));
var JA = N(Q(), 1), gO = Object.defineProperty, lb = (e, t) => gO(e, "name", { value: t, configurable: true }), Bm = 0, Su = null;
function vO(e) {
  return Nm(), e.children;
}
lb(vO, "FocusGuards");
function Nm() {
  JA.useEffect(() => {
    Su || (Su = { start: ob(), end: ob() });
    let { start: e, end: t } = Su;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== t && document.body.insertAdjacentElement("beforeend", t), Bm++, () => {
      Bm === 1 && (Su?.start.remove(), Su?.end.remove(), Su = null), Bm = Math.max(0, Bm - 1);
    };
  }, []);
}
lb(Nm, "useFocusGuards");
function ob() {
  let e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
lb(ob, "createFocusGuard");
var Ra = function() {
  return Ra = Object.assign || function(t) {
    for (var a, o = 1, l = arguments.length; o < l; o++) {
      a = arguments[o];
      for (var r in a) Object.prototype.hasOwnProperty.call(a, r) && (t[r] = a[r]);
    }
    return t;
  }, Ra.apply(this, arguments);
};
function Hm(e, t) {
  var a = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (a[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var l = 0, o = Object.getOwnPropertySymbols(e); l < o.length; l++) t.indexOf(o[l]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[l]) && (a[o[l]] = e[o[l]]);
  return a;
}
function $A(e, t, a) {
  if (a || arguments.length === 2) for (var o = 0, l = t.length, r; o < l; o++) (r || !(o in t)) && (r || (r = Array.prototype.slice.call(t, 0, o)), r[o] = t[o]);
  return e.concat(r || Array.prototype.slice.call(t));
}
var Gm = N(Q());
var ua = N(Q());
var Ki = "right-scroll-bar-position", Wi = "width-before-scroll-bar", rb = "with-scroll-bars-hidden", ib = "--removed-body-scroll-bar-size";
function qm(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
var eT = N(Q());
function tT(e, t) {
  var a = (0, eT.useState)(function() {
    return { value: e, callback: t, facade: { get current() {
      return a.value;
    }, set current(o) {
      var l = a.value;
      l !== o && (a.value = o, a.callback(o, l));
    } } };
  })[0];
  return a.callback = t, a.facade;
}
var Fm = N(Q());
var LO = typeof window < "u" ? Fm.useLayoutEffect : Fm.useEffect, aT = /* @__PURE__ */ new WeakMap();
function nb(e, t) {
  var a = tT(t || null, function(o) {
    return e.forEach(function(l) {
      return qm(l, o);
    });
  });
  return LO(function() {
    var o = aT.get(a);
    if (o) {
      var l = new Set(o), r = new Set(e), i = a.current;
      l.forEach(function(n) {
        r.has(n) || qm(n, null);
      }), r.forEach(function(n) {
        l.has(n) || qm(n, i);
      });
    }
    aT.set(a, e);
  }, [e]), a;
}
function bO(e) {
  return e;
}
function xO(e, t) {
  t === void 0 && (t = bO);
  var a = [], o = false, l = { read: function() {
    if (o) throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
    return a.length ? a[a.length - 1] : e;
  }, useMedium: function(r) {
    var i = t(r, o);
    return a.push(i), function() {
      a = a.filter(function(n) {
        return n !== i;
      });
    };
  }, assignSyncMedium: function(r) {
    for (o = true; a.length; ) {
      var i = a;
      a = [], i.forEach(r);
    }
    a = { push: function(n) {
      return r(n);
    }, filter: function() {
      return a;
    } };
  }, assignMedium: function(r) {
    o = true;
    var i = [];
    if (a.length) {
      var n = a;
      a = [], n.forEach(r), i = a;
    }
    var u = function() {
      var c = i;
      i = [], c.forEach(r);
    }, d = function() {
      return Promise.resolve().then(u);
    };
    d(), a = { push: function(c) {
      i.push(c), d();
    }, filter: function(c) {
      return i = i.filter(c), a;
    } };
  } };
  return l;
}
function ub(e) {
  e === void 0 && (e = {});
  var t = xO(null);
  return t.options = Ra({ async: true, ssr: false }, e), t;
}
var oT = N(Q()), lT = function(e) {
  var t = e.sideCar, a = Hm(e, ["sideCar"]);
  if (!t) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o) throw new Error("Sidecar medium not found");
  return oT.createElement(o, Ra({}, a));
};
lT.isSideCarExport = true;
function sb(e, t) {
  return e.useMedium(t), lT;
}
var zm = ub();
var db = function() {
}, qd = ua.forwardRef(function(e, t) {
  var a = ua.useRef(null), o = ua.useState({ onScrollCapture: db, onWheelCapture: db, onTouchMoveCapture: db }), l = o[0], r = o[1], i = e.forwardProps, n = e.children, u = e.className, d = e.removeScrollBar, c = e.enabled, h = e.shards, s = e.sideCar, f = e.noRelative, v = e.noIsolation, L = e.inert, x = e.allowPinchZoom, p = e.as, m = p === void 0 ? "div" : p, g = e.gapMode, S = Hm(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = s, A = nb([a, t]), I = Ra(Ra({}, S), l);
  return ua.createElement(ua.Fragment, null, c && ua.createElement(E, { sideCar: zm, removeScrollBar: d, shards: h, noRelative: f, noIsolation: v, inert: L, setCallbacks: r, allowPinchZoom: !!x, lockRef: a, gapMode: g }), i ? ua.cloneElement(ua.Children.only(n), Ra(Ra({}, I), { ref: A })) : ua.createElement(m, Ra({}, I, { className: u, ref: A }), n));
});
qd.defaultProps = { enabled: true, removeScrollBar: true, inert: false };
qd.classNames = { fullWidth: Wi, zeroRight: Ki };
var Qe = N(Q());
var yu = N(Q());
var nT = N(Q());
var rT;
var iT = function() {
  if (rT) return rT;
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function SO() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = iT();
  return t && e.setAttribute("nonce", t), e;
}
function CO(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function yO(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var cb = function() {
  var e = 0, t = null;
  return { add: function(a) {
    e == 0 && (t = SO()) && (CO(t, a), yO(t)), e++;
  }, remove: function() {
    e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
  } };
};
var fb = function() {
  var e = cb();
  return function(t, a) {
    nT.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && a]);
  };
};
var Fd = function() {
  var e = fb(), t = function(a) {
    var o = a.styles, l = a.dynamic;
    return e(o, l), null;
  };
  return t;
};
var EO = { left: 0, top: 0, right: 0, gap: 0 }, mb = function(e) {
  return parseInt(e || "", 10) || 0;
}, IO = function(e) {
  var t = window.getComputedStyle(document.body), a = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], l = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [mb(a), mb(o), mb(l)];
}, pb = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u") return EO;
  var t = IO(e), a = document.documentElement.clientWidth, o = window.innerWidth;
  return { left: t[0], top: t[1], right: t[2], gap: Math.max(0, o - a + t[2] - t[0]) };
};
var AO = Fd(), Cu = "data-scroll-locked", TO = function(e, t, a, o) {
  var l = e.left, r = e.top, i = e.right, n = e.gap;
  return a === void 0 && (a = "margin"), `
  .`.concat(rb, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(n, "px ").concat(o, `;
  }
  body[`).concat(Cu, `] {
    overflow: hidden `).concat(o, `;
    overscroll-behavior: contain;
    `).concat([t && "position: relative ".concat(o, ";"), a === "margin" && `
    padding-left: `.concat(l, `px;
    padding-top: `).concat(r, `px;
    padding-right: `).concat(i, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(n, "px ").concat(o, `;
    `), a === "padding" && "padding-right: ".concat(n, "px ").concat(o, ";")].filter(Boolean).join(""), `
  }
  
  .`).concat(Ki, ` {
    right: `).concat(n, "px ").concat(o, `;
  }
  
  .`).concat(Wi, ` {
    margin-right: `).concat(n, "px ").concat(o, `;
  }
  
  .`).concat(Ki, " .").concat(Ki, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(Wi, " .").concat(Wi, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(Cu, `] {
    `).concat(ib, ": ").concat(n, `px;
  }
`);
}, uT = function() {
  var e = parseInt(document.body.getAttribute(Cu) || "0", 10);
  return isFinite(e) ? e : 0;
}, _O = function() {
  yu.useEffect(function() {
    return document.body.setAttribute(Cu, (uT() + 1).toString()), function() {
      var e = uT() - 1;
      e <= 0 ? document.body.removeAttribute(Cu) : document.body.setAttribute(Cu, e.toString());
    };
  }, []);
}, hb = function(e) {
  var t = e.noRelative, a = e.noImportant, o = e.gapMode, l = o === void 0 ? "margin" : o;
  _O();
  var r = yu.useMemo(function() {
    return pb(l);
  }, [l]);
  return yu.createElement(AO, { styles: TO(r, !t, l, a ? "" : "!important") });
};
var gb = false;
if (typeof window < "u") try {
  zd = Object.defineProperty({}, "passive", { get: function() {
    return gb = true, true;
  } }), window.addEventListener("test", zd, zd), window.removeEventListener("test", zd, zd);
} catch {
  gb = false;
}
var zd, Yi = gb ? { passive: false } : false;
var wO = function(e) {
  return e.tagName === "TEXTAREA";
}, sT = function(e, t) {
  if (!(e instanceof Element)) return false;
  var a = window.getComputedStyle(e);
  return a[t] !== "hidden" && !(a.overflowY === a.overflowX && !wO(e) && a[t] === "visible");
}, MO = function(e) {
  return sT(e, "overflowY");
}, RO = function(e) {
  return sT(e, "overflowX");
}, vb = function(e, t) {
  var a = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var l = dT(e, o);
    if (l) {
      var r = cT(e, o), i = r[1], n = r[2];
      if (i > n) return true;
    }
    o = o.parentNode;
  } while (o && o !== a.body);
  return false;
}, kO = function(e) {
  var t = e.scrollTop, a = e.scrollHeight, o = e.clientHeight;
  return [t, a, o];
}, DO = function(e) {
  var t = e.scrollLeft, a = e.scrollWidth, o = e.clientWidth;
  return [t, a, o];
}, dT = function(e, t) {
  return e === "v" ? MO(t) : RO(t);
}, cT = function(e, t) {
  return e === "v" ? kO(t) : DO(t);
}, OO = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, fT = function(e, t, a, o, l) {
  var r = OO(e, window.getComputedStyle(t).direction), i = r * o, n = a.target, u = t.contains(n), d = false, c = i > 0, h = 0, s = 0;
  do {
    if (!n) break;
    var f = cT(e, n), v = f[0], L = f[1], x = f[2], p = L - x - r * v;
    (v || p) && dT(e, n) && (h += p, s += v);
    var m = n.parentNode;
    n = m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? m.host : m;
  } while (!u && n !== document.body || u && (t.contains(n) || t === n));
  return (c && (l && Math.abs(h) < 1 || !l && i > h) || !c && (l && Math.abs(s) < 1 || !l && -i > s)) && (d = true), d;
};
var Vm = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, mT = function(e) {
  return [e.deltaX, e.deltaY];
}, pT = function(e) {
  return e && "current" in e ? e.current : e;
}, PO = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, UO = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, BO = 0, Eu = [];
function hT(e) {
  var t = Qe.useRef([]), a = Qe.useRef([0, 0]), o = Qe.useRef(), l = Qe.useState(BO++)[0], r = Qe.useState(Fd)[0], i = Qe.useRef(e);
  Qe.useEffect(function() {
    i.current = e;
  }, [e]), Qe.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(l));
      var L = $A([e.lockRef.current], (e.shards || []).map(pT), true).filter(Boolean);
      return L.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(l));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(l)), L.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(l));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var n = Qe.useCallback(function(L, x) {
    if ("touches" in L && L.touches.length === 2 || L.type === "wheel" && L.ctrlKey) return !i.current.allowPinchZoom;
    var p = Vm(L), m = a.current, g = "deltaX" in L ? L.deltaX : m[0] - p[0], S = "deltaY" in L ? L.deltaY : m[1] - p[1], E, A = L.target, I = Math.abs(g) > Math.abs(S) ? "h" : "v";
    if ("touches" in L && I === "h" && A.type === "range") return false;
    var T = window.getSelection(), w = T && T.anchorNode, k = w ? w === A || w.contains(A) : false;
    if (k) return false;
    var F = vb(I, A);
    if (!F) return true;
    if (F ? E = I : (E = I === "v" ? "h" : "v", F = vb(I, A)), !F) return false;
    if (!o.current && "changedTouches" in L && (g || S) && (o.current = E), !E) return true;
    var V = o.current || E;
    return fT(V, x, L, V === "h" ? g : S, true);
  }, []), u = Qe.useCallback(function(L) {
    var x = L;
    if (!(!Eu.length || Eu[Eu.length - 1] !== r)) {
      var p = "deltaY" in x ? mT(x) : Vm(x), m = t.current.filter(function(E) {
        return E.name === x.type && (E.target === x.target || x.target === E.shadowParent) && PO(E.delta, p);
      })[0];
      if (m && m.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!m) {
        var g = (i.current.shards || []).map(pT).filter(Boolean).filter(function(E) {
          return E.contains(x.target);
        }), S = g.length > 0 ? n(x, g[0]) : !i.current.noIsolation;
        S && x.cancelable && x.preventDefault();
      }
    }
  }, []), d = Qe.useCallback(function(L, x, p, m) {
    var g = { name: L, delta: x, target: p, should: m, shadowParent: NO(p) };
    t.current.push(g), setTimeout(function() {
      t.current = t.current.filter(function(S) {
        return S !== g;
      });
    }, 1);
  }, []), c = Qe.useCallback(function(L) {
    a.current = Vm(L), o.current = void 0;
  }, []), h = Qe.useCallback(function(L) {
    d(L.type, mT(L), L.target, n(L, e.lockRef.current));
  }, []), s = Qe.useCallback(function(L) {
    d(L.type, Vm(L), L.target, n(L, e.lockRef.current));
  }, []);
  Qe.useEffect(function() {
    return Eu.push(r), e.setCallbacks({ onScrollCapture: h, onWheelCapture: h, onTouchMoveCapture: s }), document.addEventListener("wheel", u, Yi), document.addEventListener("touchmove", u, Yi), document.addEventListener("touchstart", c, Yi), function() {
      Eu = Eu.filter(function(L) {
        return L !== r;
      }), document.removeEventListener("wheel", u, Yi), document.removeEventListener("touchmove", u, Yi), document.removeEventListener("touchstart", c, Yi);
    };
  }, []);
  var f = e.removeScrollBar, v = e.inert;
  return Qe.createElement(Qe.Fragment, null, v ? Qe.createElement(r, { styles: UO(l) }) : null, f ? Qe.createElement(hb, { noRelative: e.noRelative, gapMode: e.gapMode }) : null);
}
function NO(e) {
  for (var t = null; e !== null; ) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
var gT = sb(zm, hT);
var vT = Gm.forwardRef(function(e, t) {
  return Gm.createElement(qd, Ra({}, e, { ref: t, sideCar: gT }));
});
vT.classNames = qd.classNames;
var Lb = vT;
var HO = function(e) {
  if (typeof document > "u") return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, Iu = /* @__PURE__ */ new WeakMap(), Xm = /* @__PURE__ */ new WeakMap(), Km = {}, bb = 0, LT = function(e) {
  return e && (e.host || LT(e.parentNode));
}, qO = function(e, t) {
  return t.map(function(a) {
    if (e.contains(a)) return a;
    var o = LT(a);
    return o && e.contains(o) ? o : (console.error("aria-hidden", a, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(a) {
    return !!a;
  });
}, FO = function(e, t, a, o) {
  var l = qO(t, Array.isArray(e) ? e : [e]);
  Km[a] || (Km[a] = /* @__PURE__ */ new WeakMap());
  var r = Km[a], i = [], n = /* @__PURE__ */ new Set(), u = new Set(l), d = function(h) {
    !h || n.has(h) || (n.add(h), d(h.parentNode));
  };
  l.forEach(d);
  var c = function(h) {
    !h || u.has(h) || Array.prototype.forEach.call(h.children, function(s) {
      if (n.has(s)) c(s);
      else try {
        var f = s.getAttribute(o), v = f !== null && f !== "false", L = (Iu.get(s) || 0) + 1, x = (r.get(s) || 0) + 1;
        Iu.set(s, L), r.set(s, x), i.push(s), L === 1 && v && Xm.set(s, true), x === 1 && s.setAttribute(a, "true"), v || s.setAttribute(o, "true");
      } catch (p) {
        console.error("aria-hidden: cannot operate on ", s, p);
      }
    });
  };
  return c(t), n.clear(), bb++, function() {
    i.forEach(function(h) {
      var s = Iu.get(h) - 1, f = r.get(h) - 1;
      Iu.set(h, s), r.set(h, f), s || (Xm.has(h) || h.removeAttribute(o), Xm.delete(h)), f || h.removeAttribute(a);
    }), bb--, bb || (Iu = /* @__PURE__ */ new WeakMap(), Iu = /* @__PURE__ */ new WeakMap(), Xm = /* @__PURE__ */ new WeakMap(), Km = {});
  };
}, bT = function(e, t, a) {
  a === void 0 && (a = "data-aria-hidden");
  var o = Array.from(Array.isArray(e) ? e : [e]), l = t || HO(e);
  return l ? (o.push.apply(o, Array.from(l.querySelectorAll("[aria-live], script"))), FO(o, l, a, "aria-hidden")) : function() {
    return null;
  };
};
var xt = N(Te(), 1), zO = Object.defineProperty, ja = (e, t) => zO(e, "name", { value: t, configurable: true }), Sb = "Dialog", [xT, lF] = La(Sb), [VO, pl] = xT(Sb), ST = ja((e) => {
  let { __scopeDialog: t, children: a, open: o, defaultOpen: l, onOpenChange: r, modal: i = true } = e, n = Fe.useRef(null), u = Fe.useRef(null), { nodes: d, registry: c } = tb(), [h, s] = Po({ prop: o, defaultProp: l ?? false, onChange: r, caller: Sb }), [f, v] = Fe.useState(0), [L, x] = Fe.useState(0);
  return (0, xt.jsx)(VO, { scope: t, triggerRef: n, contentRef: u, contentId: Wl(), titleId: Wl(), descriptionId: Wl(), titlePresent: f > 0, descriptionPresent: L > 0, setTitleCount: v, setDescriptionCount: x, open: h, onOpenChange: s, onOpenToggle: Fe.useCallback(() => s((p) => !p), [s]), modal: i, branchNodes: d, branchRegistry: c, children: a });
}, "Dialog");
var CT = "DialogPortal", [GO, yT] = xT(CT, { forceMount: void 0 }), ET = ja((e) => {
  let { __scopeDialog: t, forceMount: a, children: o, container: l } = e, r = pl(CT, t);
  return (0, xt.jsx)(GO, { scope: t, forceMount: a, children: Fe.Children.map(o, (i) => (0, xt.jsx)(bu, { present: a || r.open, children: (0, xt.jsx)(ZA, { asChild: true, container: l, children: i }) })) });
}, "DialogPortal"), xb = "DialogOverlay", IT = Fe.forwardRef(ja(function(t, a) {
  let o = yT(xb, t.__scopeDialog), { forceMount: l = o.forceMount, ...r } = t, i = pl(xb, t.__scopeDialog);
  return i.modal ? (0, xt.jsx)(bu, { present: l || i.open, children: (0, xt.jsx)(KO, { ...r, ref: a }) }) : null;
}, "DialogOverlay")), XO = ko("DialogOverlay.RemoveScroll"), KO = Fe.forwardRef(ja(function(t, a) {
  let { __scopeDialog: o, ...l } = t, r = pl(xb, o), i = WL(), n = De(a, i);
  return (0, xt.jsx)(Lb, { as: XO, allowPinchZoom: true, shards: Fe.useMemo(() => [r.contentRef, ...r.branchNodes.map((u) => ({ current: u }))], [r.contentRef, r.branchNodes]), children: (0, xt.jsx)(Oe.div, { "data-state": Cb(r.open), ...l, ref: n, style: { pointerEvents: "auto", ...l.style } }) });
}, "DialogOverlayImpl")), Vd = "DialogContent", AT = Fe.forwardRef(ja(function(t, a) {
  let o = yT(Vd, t.__scopeDialog), { forceMount: l = o.forceMount, ...r } = t, i = pl(Vd, t.__scopeDialog);
  return (0, xt.jsx)(bu, { present: l || i.open, children: i.modal ? (0, xt.jsx)(WO, { ...r, ref: a }) : (0, xt.jsx)(YO, { ...r, ref: a }) });
}, "DialogContent")), WO = Fe.forwardRef(ja(function(t, a) {
  let o = pl(Vd, t.__scopeDialog), l = Fe.useRef(null), r = De(a, o.contentRef, l);
  return Fe.useEffect(() => {
    let i = l.current;
    if (i) return bT(i);
  }, []), (0, xt.jsx)(TT, { ...t, ref: r, trapFocus: o.open, disableOutsidePointerEvents: o.open, onCloseAutoFocus: be(t.onCloseAutoFocus, (i) => {
    i.preventDefault(), o.triggerRef.current?.focus();
  }), onPointerDownOutside: be(t.onPointerDownOutside, (i) => {
    let n = i.detail.originalEvent, u = n.button === 0 && n.ctrlKey === true;
    (n.button === 2 || u) && i.preventDefault();
  }), onFocusOutside: be(t.onFocusOutside, (i) => i.preventDefault()) });
}, "DialogContentModal")), YO = Fe.forwardRef(ja(function(t, a) {
  let o = pl(Vd, t.__scopeDialog), l = Fe.useRef(false), r = Fe.useRef(false);
  return (0, xt.jsx)(TT, { ...t, ref: a, trapFocus: false, disableOutsidePointerEvents: false, onCloseAutoFocus: (i) => {
    t.onCloseAutoFocus?.(i), i.defaultPrevented || (l.current || o.triggerRef.current?.focus(), i.preventDefault()), l.current = false, r.current = false;
  }, onInteractOutside: (i) => {
    t.onInteractOutside?.(i), i.defaultPrevented || (l.current = true, i.detail.originalEvent.type === "pointerdown" && (r.current = true));
    let n = i.target;
    o.triggerRef.current?.contains(n) && i.preventDefault(), i.detail.originalEvent.type === "focusin" && r.current && i.preventDefault();
  } });
}, "DialogContentNonModal")), TT = Fe.forwardRef(ja(function(t, a) {
  let { __scopeDialog: o, trapFocus: l, onOpenAutoFocus: r, onCloseAutoFocus: i, "aria-describedby": n, children: u, ...d } = t, c = pl(Vd, o);
  return Nm(), (0, xt.jsx)(eb, { registry: c.branchRegistry, children: (0, xt.jsx)(FA, { asChild: true, loop: true, trapped: l, branches: c.branchNodes, onMountAutoFocus: r, onUnmountAutoFocus: i, children: (0, xt.jsx)(UA, { role: "dialog", id: c.contentId, "aria-labelledby": c.titlePresent ? c.titleId : void 0, "aria-describedby": c.descriptionPresent ? RT(n, c.descriptionId) : n, "data-state": Cb(c.open), ...d, ref: a, deferPointerDownOutside: true, onDismiss: () => c.onOpenChange(false), children: u }) }) });
}, "DialogContentImpl")), _T = Fe.forwardRef(ja(function(t, a) {
  let { __scopeDialog: o, ...l } = t, r = pl("DialogTitle", o), { setTitleCount: i } = r;
  return st(() => (i((n) => n + 1), () => i((n) => n - 1)), [i]), (0, xt.jsx)(Oe.h2, { id: r.titleId, ...l, ref: a });
}, "DialogTitle")), wT = Fe.forwardRef(ja(function(t, a) {
  let { __scopeDialog: o, ...l } = t, r = pl("DialogDescription", o), { setDescriptionCount: i } = r;
  return st(() => (i((n) => n + 1), () => i((n) => n - 1)), [i]), (0, xt.jsx)(Oe.p, { id: r.descriptionId, ...l, ref: a });
}, "DialogDescription")), jO = "DialogClose", MT = Fe.forwardRef(ja(function(t, a) {
  let { __scopeDialog: o, ...l } = t, r = pl(jO, o);
  return (0, xt.jsx)(Oe.button, { type: "button", ...l, ref: a, onClick: be(t.onClick, () => r.onOpenChange(false)) });
}, "DialogClose"));
function RT(...e) {
  let t = /* @__PURE__ */ new Set();
  for (let a of e) if (typeof a == "string") for (let o of String(a).trim().split(/\s+/)) o && t.add(o);
  return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
ja(RT, "concatAriaDescribedby");
function Cb(e) {
  return e ? "open" : "closed";
}
ja(Cb, "getState");
var Rt = N(Q(), 1);
var kT = N(Q(), 1);
var ZO = Object.defineProperty, JO = (e, t) => ZO(e, "name", { value: t, configurable: true });
function Gd(e) {
  let [t, a] = kT.useState(void 0);
  return st(() => {
    if (e) {
      a({ width: e.offsetWidth, height: e.offsetHeight });
      let o = 0, l = new ResizeObserver((r) => {
        if (!Array.isArray(r) || !r.length) return;
        let i = r[0];
        window.cancelAnimationFrame(o), o = window.requestAnimationFrame(() => {
          let n, u;
          if ("borderBoxSize" in i) {
            let d = i.borderBoxSize, c = Array.isArray(d) ? d[0] : d;
            n = c.inlineSize, u = c.blockSize;
          } else n = e.offsetWidth, u = e.offsetHeight;
          a({ width: n, height: u });
        });
      });
      return l.observe(e, { box: "border-box" }), () => {
        window.cancelAnimationFrame(o), l.unobserve(e);
      };
    } else a(void 0);
  }, [e]), t;
}
JO(Gd, "useSize");
var Lo = N(Te(), 1), $O = Object.defineProperty, Vr = (e, t) => $O(e, "name", { value: t, configurable: true }), yb = "Switch", [eP, mF] = La(yb), [tP, Eb] = eP(yb);
function DT(e) {
  let { __scopeSwitch: t, checked: a, children: o, defaultChecked: l, disabled: r, form: i, name: n, onCheckedChange: u, required: d, value: c = "on", internal_do_not_use_render: h } = e, [s, f] = Po({ prop: a, defaultProp: l ?? false, onChange: u, caller: yb }), [v, L] = Rt.useState(null), [x, p] = Rt.useState(null), [m, g] = Rt.useState(null), S = v ? !!i || !!v.closest("form") : true, E = { checked: s, setChecked: f, disabled: r, control: v, setControl: L, name: n, form: i, value: c, userClick: m, onUserClick: g, required: d, defaultChecked: l, isFormControl: S, bubbleInput: x, setBubbleInput: p };
  return (0, Lo.jsx)(tP, { scope: t, ...E, children: UT(h) ? h(E) : o });
}
Vr(DT, "SwitchProvider");
var aP = "SwitchTrigger", oP = Rt.forwardRef(Vr(function({ __scopeSwitch: t, onClick: a, ...o }, l) {
  let { control: r, form: i, value: n, disabled: u, checked: d, required: c, setControl: h, setChecked: s, onUserClick: f, isFormControl: v, bubbleInput: L } = Eb(aP, t), x = De(l, h), p = Rt.useRef(d);
  return Rt.useEffect(() => {
    let m = i ? r?.ownerDocument.getElementById(i) : r?.form;
    if (m instanceof HTMLFormElement) {
      let g = Vr(() => s(p.current), "reset");
      return m.addEventListener("reset", g), () => m.removeEventListener("reset", g);
    }
  }, [r, i, s]), (0, Lo.jsx)(Oe.button, { type: "button", role: "switch", "aria-checked": d, "aria-required": c, "data-state": Ib(d), "data-disabled": u ? "" : void 0, disabled: u, value: n, ...o, ref: x, onClick: be(a, (m) => {
    let g = m.isPropagationStopped();
    f({ requestedChecked: !d, hasConsumerStoppedPropagation: g }), s((S) => !S), L && v && (g || m.stopPropagation());
  }) });
}, "SwitchTrigger")), OT = Rt.forwardRef(Vr(function(t, a) {
  let { __scopeSwitch: o, name: l, checked: r, defaultChecked: i, required: n, disabled: u, value: d, onCheckedChange: c, form: h, ...s } = t;
  return (0, Lo.jsx)(DT, { __scopeSwitch: o, checked: r, defaultChecked: i, disabled: u, required: n, onCheckedChange: c, name: l, form: h, value: d, internal_do_not_use_render: ({ isFormControl: f }) => (0, Lo.jsxs)(Lo.Fragment, { children: [(0, Lo.jsx)(oP, { ...s, ref: a, __scopeSwitch: o }), f && (0, Lo.jsx)(iP, { __scopeSwitch: o })] }) });
}, "Switch")), lP = "SwitchThumb", PT = Rt.forwardRef(Vr(function(t, a) {
  let { __scopeSwitch: o, ...l } = t, r = Eb(lP, o);
  return (0, Lo.jsx)(Oe.span, { "data-state": Ib(r.checked), "data-disabled": r.disabled ? "" : void 0, ...l, ref: a });
}, "SwitchThumb")), rP = "SwitchBubbleInput", iP = Rt.forwardRef(Vr(function({ __scopeSwitch: t, onClick: a, ...o }, l) {
  let { control: r, userClick: i, checked: n, defaultChecked: u, required: d, disabled: c, name: h, value: s, form: f, bubbleInput: v, setBubbleInput: L } = Eb(rP, t), x = De(l, L), p = Gd(r), m = Rt.useRef(false), g = Rt.useRef(n), S = Rt.useRef(i), E = Rt.useRef(null);
  Rt.useEffect(() => {
    let I = v;
    if (!I) return;
    let T = window.HTMLInputElement.prototype, k = Object.getOwnPropertyDescriptor(T, "checked").set;
    if (!k) return;
    let F = g.current !== n;
    g.current = n;
    let V = i !== null && i !== S.current;
    if (S.current = i, V) E.current = F ? null : i, F && k.call(I, n), I.dispatchEvent(new Event("click", { bubbles: !i.hasConsumerStoppedPropagation }));
    else if (F) {
      let $ = E.current;
      E.current = null;
      let ee = $?.requestedChecked === n;
      m.current = true, k.call(I, n), I.dispatchEvent(new Event("click", { bubbles: !(ee && $.hasConsumerStoppedPropagation) })), m.current = false;
    }
  }, [v, n, i]);
  let A = Rt.useRef(n);
  return (0, Lo.jsx)(Oe.input, { type: "checkbox", "aria-hidden": true, defaultChecked: u ?? A.current, required: d, disabled: c, name: h, value: s, form: f, ...o, tabIndex: -1, ref: x, onClick: be(a, (I) => {
    m.current && I.stopPropagation();
  }), style: { ...o.style, ...p, position: "absolute", pointerEvents: "none", opacity: 0, margin: 0, transform: "translateX(-100%)" } });
}, "SwitchBubbleInput"));
function UT(e) {
  return typeof e == "function";
}
Vr(UT, "isFunction");
function Ib(e) {
  return e ? "checked" : "unchecked";
}
Vr(Ib, "getState");
var Ze = N(Te(), 1);
function D({ icon: e, children: t, kind: a = "soft", busy: o, className: l = "", ...r }) {
  return (0, Ze.jsxs)("button", { type: "button", className: "button button--" + a + " " + l, ...r, children: [o ? (0, Ze.jsx)(Nr, { size: 16, className: "spin", "aria-hidden": true }) : e && (0, Ze.jsx)(e, { size: 16, "aria-hidden": true }), t] });
}
function St({ icon: e, label: t, children: a, className: o = "", ...l }) {
  return (0, Ze.jsxs)("button", { type: "button", title: t, "aria-label": t, className: "icon-button " + o, ...l, children: [(0, Ze.jsx)(e, { size: 17, "aria-hidden": true }), a] });
}
function Gr({ src: e, className: t = "" }) {
  return (0, Ze.jsx)("div", { className: "thumb " + t, children: e ? (0, Ze.jsx)("img", { src: e, alt: "", draggable: false }) : (0, Ze.jsx)($t, { size: 17, "aria-hidden": true }) });
}
function bo({ checked: e, onChange: t, children: a, hint: o, disabled: l }) {
  return (0, Ze.jsxs)("label", { className: "toggle-line", children: [(0, Ze.jsxs)("span", { className: "toggle-copy", children: [(0, Ze.jsx)("span", { children: a }), o && (0, Ze.jsx)("small", { children: o })] }), (0, Ze.jsx)(OT, { checked: e, onCheckedChange: t, disabled: l, className: "switch", "aria-label": typeof a == "string" ? a : void 0, children: (0, Ze.jsx)(PT, { className: "switch-thumb" }) })] });
}
function hl({ open: e, onClose: t, title: a, description: o, children: l, className: r = "" }) {
  return (0, Ze.jsx)(ST, { open: e, onOpenChange: (i) => !i && t(), children: (0, Ze.jsxs)(ET, { children: [(0, Ze.jsx)(IT, { className: "modal-shade" }), (0, Ze.jsxs)(AT, { className: "modal " + r, ...o ? {} : { "aria-describedby": void 0 }, children: [(0, Ze.jsxs)("div", { className: "modal-head", children: [(0, Ze.jsx)(_T, { children: a }), (0, Ze.jsx)(MT, { asChild: true, children: (0, Ze.jsx)(St, { icon: Wa, label: "关闭窗口" }) })] }), o && (0, Ze.jsx)(wT, { className: "modal-desc", children: o }), l] })] }) });
}
var xo = N(Q(), 1);
async function BT(e) {
  let t = await e.json();
  if (!e.ok) throw new Error(t.error || "请求未完成。");
  return t;
}
async function NT() {
  return BT(await fetch("/api/state", { cache: "no-store" }));
}
async function Uo(e, t = {}) {
  return (await BT(await fetch("/api/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...t, action: e }) }))).result;
}
function HT(e, t, a) {
  return new Promise((o, l) => {
    let r = new XMLHttpRequest();
    r.open("POST", "/api/import" + (t ? "?shot=" + encodeURIComponent(t) : "")), r.setRequestHeader("Content-Type", "application/octet-stream"), r.setRequestHeader("X-Filename", encodeURIComponent(e.name)), r.upload.onprogress = (i) => {
      i.lengthComputable && a(Math.round(i.loaded / i.total * 100));
    }, r.onload = () => {
      try {
        let i = JSON.parse(r.responseText);
        if (r.status >= 400) throw new Error(i.error || "导入失败。");
        o();
      } catch (i) {
        l(i);
      }
    }, r.onerror = () => l(new Error("导入连接中断，请重试。")), r.send(e);
  });
}
function kt(e, t = false) {
  let a = Number.isFinite(e) ? Math.max(0, e) : 0, o = Math.floor(a / 60), l = Math.floor(a) % 60, r = String(o).padStart(2, "0") + ":" + String(l).padStart(2, "0");
  return t ? r + "." + String(Math.floor(a % 1 * 100)).padStart(2, "0") : r;
}
function Ab(e = "") {
  return e.replace(/\.[a-z0-9]+$/i, "");
}
function Wm(e = "") {
  return e.split(/[\\/]/).filter(Boolean).at(-1) || "";
}
var Xr = N(Q(), 1);
var ne = N(Te(), 1), uP = { zh: "ja", ja: "ja", en_zh: "en", en: "en", screen_zh: "screen", screen_en: "screen", screen: "screen" };
function qT({ state: e, track: t, command: a, disabled: o, notify: l, seek: r, close: i }) {
  let [n, u] = (0, Xr.useState)(null), [d, c] = (0, Xr.useState)(uP[t]), [h, s] = (0, Xr.useState)(0), [f, v] = (0, Xr.useState)({}), [L, x] = (0, Xr.useState)(false), p = e.project?.id;
  (0, Xr.useEffect)(() => {
    let w = false;
    return u(null), v({}), s(0), Uo("read_subtitle_edits").then((k) => {
      w || u(k);
    }).catch((k) => {
      w || (u([]), l(k.message, true));
    }), () => {
      w = true;
    };
  }, [p, l]);
  let m = n?.find((w) => w.id === d) || n?.[0], g = m?.rows[h], S = g ? m.id + ":" + JSON.stringify(g) : "", E = f[S] || g, A = o || L;
  function I(w, k) {
    v((F) => ({ ...F, [S]: { ...E, [w]: k } }));
  }
  async function T() {
    x(true);
    try {
      let w = await a("save_subtitle_edit", { project: p, group: m.id, revision: m.revision, index: h, ...E });
      w && (u(w.groups), s(w.index), v((k) => {
        let F = { ...k };
        return delete F[S], F;
      }), l("字幕、报告和 SRT 已同步保存"));
    } finally {
      x(false);
    }
  }
  return (0, ne.jsxs)(ne.Fragment, { children: [(0, ne.jsxs)("section", { className: "inspector-block subtitle-editor-head", children: [(0, ne.jsx)("h3", { children: "双语字幕校对" }), (0, ne.jsx)(D, { kind: "ghost", icon: Bi, onClick: i, children: "返回字幕" })] }), m ? (0, ne.jsxs)(ne.Fragment, { children: [(0, ne.jsxs)("section", { className: "inspector-block", children: [(0, ne.jsxs)("label", { className: "tool-field", children: [(0, ne.jsx)("span", { children: "字幕组" }), (0, ne.jsx)("select", { value: m.id, "aria-label": "字幕组", disabled: A, onChange: (w) => {
    c(w.target.value), s(0);
  }, children: n.map((w) => (0, ne.jsxs)("option", { value: w.id, children: [w.label, " · ", w.rows.length, " 句"] }, w.id)) })] }), (0, ne.jsx)("div", { className: "cue-list subtitle-editor-list", "aria-label": "待校对字幕", children: m.rows.map((w, k) => (0, ne.jsxs)("button", { type: "button", className: k === h ? "cue active" : "cue", "aria-pressed": k === h, disabled: L, onClick: () => {
    s(k), r(w.start);
  }, children: [(0, ne.jsx)("time", { children: kt(w.start, true) }), (0, ne.jsx)("span", { children: w.translation || w.original })] }, k)) })] }), E && (0, ne.jsxs)("section", { className: "inspector-block subtitle-editor-fields", children: [(0, ne.jsxs)("div", { className: "tool-fields two-fields", children: [(0, ne.jsxs)("label", { className: "tool-field", children: [(0, ne.jsx)("span", { children: "开始时间（秒）" }), (0, ne.jsx)("input", { type: "number", min: "0", step: "0.001", disabled: A, value: E.start, onChange: (w) => I("start", w.target.value) })] }), (0, ne.jsxs)("label", { className: "tool-field", children: [(0, ne.jsx)("span", { children: "结束时间（秒）" }), (0, ne.jsx)("input", { type: "number", min: "0", step: "0.001", disabled: A, value: E.end, onChange: (w) => I("end", w.target.value) })] })] }), (0, ne.jsxs)("label", { className: "tool-field", children: [(0, ne.jsx)("span", { children: "字幕原文" }), (0, ne.jsx)("textarea", { value: E.original, maxLength: 4e3, disabled: A, rows: 4, onChange: (w) => I("original", w.target.value) })] }), (0, ne.jsxs)("label", { className: "tool-field", children: [(0, ne.jsx)("span", { children: "中文译文" }), (0, ne.jsx)("textarea", { value: E.translation, maxLength: 4e3, disabled: A, rows: 4, onChange: (w) => I("translation", w.target.value) })] }), (0, ne.jsxs)("div", { className: "button-row", children: [(0, ne.jsx)(D, { icon: kd, disabled: !Number.isFinite(Number(E.start)), onClick: () => r(Number(E.start)), children: "定位原片" }), (0, ne.jsx)(D, { kind: "primary", icon: na, disabled: A || !E.original.trim(), onClick: T, children: "保存此句" })] })] })] }) : (0, ne.jsx)("section", { className: "inspector-block", children: (0, ne.jsx)("p", { className: "field-hint", children: n ? "项目还没有双语字幕。可以在「拆解」补写报告译文。" : "正在读取字幕…" }) })] });
}
var M = N(Te(), 1), Tb = [{ id: "analysis", label: "拆解", icon: Ka }, { id: "shot", label: "镜头", icon: Xl }, { id: "subtitles", label: "字幕", icon: va }, { id: "prompts", label: "提示词", icon: Ma }];
function Kr({ values: e, value: t, onChange: a, label: o, disabled: l }) {
  return (0, M.jsx)("div", { className: "segments", role: "group", "aria-label": o, children: e.map(([r, i]) => (0, M.jsx)("button", { type: "button", "aria-pressed": r === t, className: r === t ? "segment active" : "segment", disabled: l, onClick: () => a(r), children: i }, r)) });
}
function FT({ icon: e, text: t, hint: a }) {
  return (0, M.jsxs)("div", { className: "inspector-empty", children: [(0, M.jsx)(e, { size: 24 }), (0, M.jsx)("strong", { children: t }), a && (0, M.jsx)("p", { children: a })] });
}
function sP({ state: e, options: t, setOption: a, command: o, openSettings: l, disabled: r }) {
  let i = e.settings.env || e.settings.base && e.settings.model && e.settings.has_key;
  return (0, M.jsxs)(M.Fragment, { children: [(0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "识别语言" }), (0, M.jsx)(Kr, { label: "画面字幕识别语言", values: [["zh", "中文 / 英文"], ["ja", "日语 / 日本語"]], value: t.ocr_language, onChange: (n) => a({ ocr_language: n }), disabled: r }), (0, M.jsxs)("div", { className: "translation-box", children: [(0, M.jsx)(pu, { size: 17 }), (0, M.jsxs)("div", { className: "toggle-copy", children: [(0, M.jsx)("strong", { children: "报告自动附中文译文" }), (0, M.jsx)("small", { children: "英文画面文字、英文和日语口播" })] })] })] }), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "分析选项" }), (0, M.jsx)(bo, { checked: t.ocr, onChange: (n) => a({ ocr: n }), disabled: r, children: "识别画面文字" }), (0, M.jsx)(bo, { checked: t.packaging, onChange: (n) => a({ packaging: n }), disabled: r, children: "分析剪辑包装" }), (0, M.jsx)(bo, { checked: t.stems, onChange: (n) => a({ stems: n }), disabled: r, children: "分离人声与配乐" }), (0, M.jsx)(bo, { checked: t.vlm, onChange: (n) => a({ vlm: n }), disabled: r, children: "多模态分析" }), t.vlm && (0, M.jsxs)("div", { className: "model-note", children: [(0, M.jsx)("span", { children: i ? "使用已配置的模型服务" : "请先配置模型服务" }), (0, M.jsx)(D, { kind: "ghost", onClick: l, children: "设置模型" })] })] }), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "报告与保存" }), (0, M.jsx)(Kr, { label: "报告语言", values: [["zh", "中文"], ["en", "English"]], value: t.report_language, onChange: (n) => a({ report_language: n }), disabled: r }), (0, M.jsxs)("button", { type: "button", className: "path-button", onClick: () => o("pick_output"), disabled: r, title: e.settings.output, children: [(0, M.jsx)(mu, { size: 16 }), (0, M.jsx)("span", { children: e.settings.output })] }), (0, M.jsx)(D, { className: "wide", kind: "primary", icon: Ka, disabled: r || !e.source || e.source.missing, onClick: () => o("analyze", { options: t }), children: "开始拆解" }), e.project && (0, M.jsx)(D, { className: "wide secondary-action", icon: pu, disabled: r, onClick: () => o("translate"), children: "补写报告译文" })] })] });
}
function dP({ shot: e, shotIndex: t, command: a, playback: o, disabled: l, state: r, openAdvanced: i }) {
  return e ? (0, M.jsxs)(M.Fragment, { children: [(0, M.jsxs)("section", { className: "inspector-block shot-detail", children: [(0, M.jsx)(Gr, { src: e.thumb, className: "detail-cover" }), (0, M.jsxs)("div", { className: "section-head", children: [(0, M.jsxs)("h3", { children: ["镜头 ", String(t + 1).padStart(2, "0")] }), (0, M.jsx)("span", { className: "type-tag", children: e.label })] }), (0, M.jsxs)("div", { className: "shot-times", children: [(0, M.jsxs)("span", { children: [kt(e.start, true), " → ", kt(e.end, true)] }), (0, M.jsxs)("span", { children: [Number(e.duration).toFixed(2), " 秒"] })] }), e.description && (0, M.jsx)("p", { className: "shot-description", children: e.description })] }), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "替换素材" }), e.replacement_name && (0, M.jsxs)("div", { className: "assigned-file", title: e.replacement_name, children: [(0, M.jsx)($t, { size: 17 }), (0, M.jsx)("span", { children: e.replacement_name }), (0, M.jsx)(St, { icon: Wa, label: "移除替换素材", disabled: l, onClick: () => a("clear_replacement", { shot: e.id }) })] }), (0, M.jsxs)("div", { className: "button-row", children: [(0, M.jsx)(D, { icon: mu, disabled: l, onClick: () => a("replace", { shot: e.id }), children: "选择替换视频" }), e.replacement && (0, M.jsx)(D, { icon: mo, onClick: () => o({ url: e.replacement, label: "镜头 " + (t + 1) + " · 替换预览", override: true }), children: "预览替换" })] }), !e.replacement_name && (0, M.jsx)("p", { className: "field-hint", children: "也可以把视频文件拖到时间线上的镜头。" })] }), r.project.exports.length > 0 && (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "已导出" }), (0, M.jsx)("div", { className: "button-row", children: r.project.exports.map((n) => (0, M.jsx)(D, { icon: mo, onClick: () => o({ ...n, override: true }), children: n.label }, n.label)) })] }), (0, M.jsx)("section", { className: "inspector-block", children: (0, M.jsx)(D, { kind: "ghost", icon: po, onClick: () => i("timeline"), children: "批量匹配与生成结果" }) })] }) : (0, M.jsx)(FT, { icon: Xl, text: "等待分镜", hint: "完成拆解后，点击时间线上的镜头查看和替换素材。" });
}
function cP({ state: e, track: t, setTrack: a, cues: o, time: l, seek: r, command: i, options: n, setOption: u, disabled: d, openAdvanced: c, notify: h }) {
  let [s, f] = (0, xo.useState)(false), v = o.findIndex((x) => l >= x.start && l < x.end), L = (0, xo.useRef)([]);
  return (0, xo.useEffect)(() => {
    v >= 0 && L.current[v]?.scrollIntoView({ block: "nearest" });
  }, [v]), s && e.project ? (0, M.jsx)(qT, { state: e, track: t, command: i, disabled: d, notify: h, seek: r, close: () => f(false) }) : (0, M.jsxs)(M.Fragment, { children: [(0, M.jsxs)("section", { className: "inspector-block subtitle-block", children: [(0, M.jsxs)("div", { className: "section-head", children: [(0, M.jsx)("h3", { children: "字幕轨" }), e.subtitle_editable && (0, M.jsx)(D, { kind: "ghost", icon: va, disabled: d, onClick: () => f(true), children: "校对字幕" })] }), e.tracks.length > 0 ? (0, M.jsxs)(M.Fragment, { children: [(0, M.jsx)(Kr, { label: "选择字幕轨", value: t, onChange: a, values: e.tracks.map((x) => [x.id, x.label]) }), (0, M.jsxs)("div", { className: "cue-list", children: [o.map((x, p) => (0, M.jsxs)("button", { type: "button", "aria-pressed": p === v, className: p === v ? "cue active" : "cue", ref: (m) => {
    L.current[p] = m;
  }, onClick: () => r(x.start), children: [(0, M.jsx)("time", { children: kt(x.start, true) }), (0, M.jsx)("span", { children: x.text })] }, p)), !o.length && (0, M.jsx)("p", { className: "field-hint", children: "这条字幕轨没有可预览的字幕。" })] }), (0, M.jsxs)("div", { className: "button-row", children: [(0, M.jsx)(D, { icon: Ro, disabled: d, onClick: () => i("save_track", { track: t }), children: "保存 SRT" }), (0, M.jsx)(D, { icon: $t, disabled: d || e.source?.missing, onClick: () => i("burn", { track: t }), children: "压制到视频" })] })] }) : (0, M.jsx)("p", { className: "field-hint", children: "拆解或转写完成后，可点击字幕定位原片。" })] }), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)("h3", { children: "口播和音轨" }), (0, M.jsx)(Kr, { label: "口播识别语言", value: n.speech_language, disabled: d, onChange: (x) => u({ speech_language: x }), values: [["zh", "中文 / 英文"], ["ja", "日语"]] }), (0, M.jsxs)("div", { className: "button-row secondary-action", children: [(0, M.jsx)(D, { icon: va, disabled: d || !e.source?.url, onClick: () => i("transcribe", { language: n.speech_language }), children: "转写口播" }), (0, M.jsx)(D, { icon: zi, disabled: d || !e.source?.url, onClick: () => i("separate"), children: "分离音轨" })] }), e.stems.map((x) => (0, M.jsxs)("div", { className: "stem", children: [(0, M.jsx)("label", { children: x.label }), (0, M.jsx)("audio", { controls: true, preload: "none", src: x.url, "aria-label": x.label })] }, x.label)), (0, M.jsx)(D, { kind: "ghost", icon: po, onClick: () => c("media"), children: "其他字幕和音频工具" })] })] });
}
function fP({ shot: e, project: t, command: a, disabled: o, notify: l, openAdvanced: r }) {
  let [i, n] = (0, xo.useState)(""), [u, d] = (0, xo.useState)(false), c = (0, xo.useRef)(""), h = (0, xo.useRef)(null), s = (0, xo.useRef)(null);
  if ((0, xo.useEffect)(() => {
    let p = false;
    return d(false), n(""), c.current = "", h.current = null, e && Uo("prompt", { shot: e.id }).then((m) => {
      p || (n(m), c.current = m, d(true));
    }).catch((m) => !p && l(m.message, true)), () => {
      p = true;
    };
  }, [t?.id, e?.id, l]), !e) return (0, M.jsx)(FT, { icon: Ma, text: "暂无镜头提示词", hint: "拆解视频后，选择一个镜头生成可编辑草稿。" });
  let f = u && !o;
  async function v() {
    if (!u || c.current === i) return true;
    let p = e.id;
    if (h.current?.key === p && h.current?.text === i) return h.current.promise;
    let m = { key: p, text: i };
    return m.promise = a("save_prompt", { shot: p, text: i }).then((g) => (h.current === m && (g !== void 0 && (c.current = i), h.current = null), g !== void 0)), h.current = m, m.promise;
  }
  async function L() {
    try {
      await navigator.clipboard.writeText(i);
    } catch {
      if (s.current?.select(), !document.execCommand("copy")) {
        l("复制失败，可手动选中文字复制。", true);
        return;
      }
    }
    await v(), l("提示词已复制");
  }
  async function x() {
    if (await v(), await a("reset_prompt", { shot: e.id }) !== void 0) try {
      let m = await Uo("prompt", { shot: e.id });
      n(m), c.current = m;
    } catch (m) {
      l(m.message, true);
    }
  }
  return (0, M.jsxs)(M.Fragment, { children: [(0, M.jsxs)("section", { className: "inspector-block prompt-block", children: [(0, M.jsxs)("div", { className: "section-head", children: [(0, M.jsxs)("h3", { children: ["镜头 ", String(e.id).padStart(2, "0"), " 的提示词"] }), (0, M.jsx)(St, { icon: qi, label: "恢复分镜草稿", disabled: !f, onClick: x })] }), (0, M.jsx)("textarea", { ref: s, "aria-label": "编辑提示词", value: i, disabled: !f, onChange: (p) => n(p.target.value), onBlur: () => f && v(), placeholder: u ? "输入当前镜头的提示词" : "正在读取草稿…" }), (0, M.jsxs)("div", { className: "button-row", children: [(0, M.jsx)(D, { kind: "primary", icon: Ni, disabled: !f, onClick: L, children: "复制提示词" }), (0, M.jsx)(D, { icon: na, disabled: !f, onClick: v, children: "保存" })] })] }), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)(D, { className: "wide", icon: Ro, disabled: o, onClick: async () => {
    await v() && a("export_prompts");
  }, children: "导出全部提示词" }), (0, M.jsx)(D, { className: "wide secondary-action", kind: "ghost", icon: po, disabled: o, onClick: async () => {
    await v() && r("prompts");
  }, children: "生成任务与参考图" })] })] });
}
function zT({ tab: e, onTab: t, hidden: a, ...o }) {
  return (0, M.jsx)("aside", { className: "inspector", "aria-label": "工作区面板", hidden: a, children: (0, M.jsxs)(Dm, { value: e, onValueChange: t, className: "inspector-tabs", children: [(0, M.jsx)(Om, { className: "tabbar", "aria-label": "工作区", children: Tb.map(({ id: l, label: r, icon: i }) => (0, M.jsxs)(Pm, { value: l, className: "tab", children: [(0, M.jsx)(i, { size: 15 }), (0, M.jsx)("span", { children: r })] }, l)) }), (0, M.jsx)(Xi, { value: "analysis", className: "inspector-body", children: (0, M.jsx)(sP, { ...o }) }), (0, M.jsx)(Xi, { value: "shot", className: "inspector-body", children: (0, M.jsx)(dP, { ...o }) }), (0, M.jsx)(Xi, { value: "subtitles", className: "inspector-body", children: (0, M.jsx)(cP, { ...o }) }), (0, M.jsx)(Xi, { value: "prompts", className: "inspector-body", children: (0, M.jsx)(fP, { ...o, project: o.state.project }) })] }) });
}
var C = N(Te(), 1), _b = [{ id: "tools", label: "实用工具", icon: po, detail: "检查视频、抽帧和复核项目。", Panel: mP }, { id: "media", label: "字幕与声音", icon: Xa, detail: "处理项目字幕、外部视频或音频。", Panel: pP }, { id: "timeline", label: "批量剪辑", icon: Xl, detail: "按文件名匹配素材，或把生成结果导入分镜。", Panel: hP }, { id: "prompts", label: "提示词与生成", icon: Ma, detail: "设置参考帧，准备和预览逐镜生成任务。", Panel: gP }];
function Qa({ title: e, icon: t, children: a, className: o = "" }) {
  return (0, C.jsxs)("section", { className: "tool-card " + o, children: [(0, C.jsxs)("div", { className: "tool-card-head", children: [(0, C.jsx)("span", { className: "tool-icon", children: (0, C.jsx)(t, { size: 17 }) }), (0, C.jsx)("h2", { children: e })] }), a] });
}
function Kd({ label: e, value: t, placeholder: a = "选择文件…", choose: o, clear: l, disabled: r }) {
  return (0, C.jsxs)("div", { className: "tool-field", children: [(0, C.jsx)("span", { children: e }), (0, C.jsxs)("div", { className: "tool-path", children: [(0, C.jsxs)("button", { type: "button", className: "path-button", "aria-label": e, title: t || void 0, disabled: r, onClick: o, children: [(0, C.jsx)(qe, { size: 16 }), (0, C.jsx)("span", { children: t || a })] }), t && l && (0, C.jsx)(St, { icon: Wa, label: "清除" + e, disabled: r, onClick: l })] })] });
}
function Xd({ label: e, value: t, options: a, onChange: o, disabled: l }) {
  let r = (0, Dt.useId)();
  return (0, C.jsxs)("div", { className: "tool-field", children: [(0, C.jsx)("label", { htmlFor: r, children: e }), (0, C.jsx)("select", { id: r, value: t, disabled: l, onChange: (i) => o(i.target.value), children: a.map(([i, n]) => (0, C.jsx)("option", { value: i, children: n }, i)) })] });
}
function wb({ label: e, value: t, onChange: a, disabled: o, ...l }) {
  return (0, C.jsxs)("label", { className: "tool-field", children: [(0, C.jsx)("span", { children: e }), (0, C.jsx)("input", { value: t, onChange: (r) => a(r.target.value), disabled: o, ...l })] });
}
function Mb({ field: e, label: t, state: a, command: o, disabled: l, useSource: r = false }) {
  let i = a.tools.inputs[e], n = r && !a.source?.missing ? a.source?.path : "";
  return (0, C.jsx)(Kd, { label: t, value: i || n, disabled: l, choose: () => o("tool_pick", { field: e }), clear: i ? () => o("tool_clear_input", { field: e }) : void 0 });
}
function VT({ shots: e, shot: t, onChange: a, disabled: o }) {
  return (0, C.jsx)(Xd, { label: "镜头", value: t.id, disabled: o, onChange: a, options: e.map((l) => [l.id, "镜头 " + l.id.padStart(2, "0") + " · " + kt(l.start, true)]) });
}
function mP({ state: e, command: t, disabled: a, initialShot: o, openSettings: l }) {
  let [r, i] = (0, Dt.useState)({ start: "0", end: "3", every: "0.25" }), [n, u] = (0, Dt.useState)(o), [d, c] = (0, Dt.useState)(""), [h, s] = (0, Dt.useState)(""), f = e.project?.shots || [], v = f.find((m) => m.id === n) || f[0], L = e.tools.labels, x = d || (L[v?.type] ? v.type : "live_action"), p = !!(e.tools.inputs.video || e.source && !e.source.missing);
  return (0, C.jsxs)(C.Fragment, { children: [(0, C.jsxs)(Qa, { title: "单文件工具", icon: $t, children: [(0, C.jsx)(Mb, { field: "video", label: "视频文件", state: e, command: t, disabled: a, useSource: true }), (0, C.jsx)("div", { className: "tool-fields three-fields", children: Object.entries({ start: "开始秒数", end: "结束秒数", every: "间隔秒数" }).map(([m, g]) => (0, C.jsx)(wb, { label: g, value: r[m], type: "number", min: "0", step: "any", disabled: a, onChange: (S) => i({ ...r, [m]: S }) }, m)) }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { icon: fo, disabled: a || !p, onClick: () => t("tool_probe"), children: "查看元数据" }), (0, C.jsx)(D, { kind: "primary", icon: Ka, disabled: a || !p, onClick: () => t("tool_tiles", r), children: "生成抽帧图" })] })] }), v && (0, C.jsxs)(Qa, { title: "当前项目复核", icon: na, children: [(0, C.jsxs)("div", { className: "tool-review-grid", children: [(0, C.jsx)(Gr, { src: v.thumb, className: "tool-review-thumb" }), (0, C.jsxs)("div", { children: [(0, C.jsxs)("div", { className: "tool-fields two-fields", children: [(0, C.jsx)(VT, { shots: f, shot: v, disabled: a, onChange: (m) => {
    u(m), c(""), s("");
  } }), (0, C.jsx)(Xd, { label: "正确类型", value: x, options: Object.entries(L), onChange: c, disabled: a })] }), (0, C.jsx)(wb, { label: "依据（可选）", value: h, onChange: s, disabled: a, maxLength: 2e3, placeholder: "填写判断依据" })] })] }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { kind: "primary", icon: na, disabled: a, onClick: () => t("tool_correct", { shot: v.id, label: x, note: h }), children: "保存镜头纠正" }), (0, C.jsx)(D, { disabled: a, onClick: () => t("tool_make_review"), children: "生成复核文件" }), (0, C.jsx)(D, { disabled: a, onClick: () => t("tool_apply_review"), children: "并入复核文件" }), (0, C.jsx)(D, { icon: qe, disabled: a, onClick: () => t("tool_relink"), children: "重新定位原片" })] })] }), (0, C.jsxs)(Qa, { title: "项目数据与批量评测", icon: Ur, className: "tool-span", children: [(0, C.jsxs)("div", { className: "button-row", children: [(0, C.jsx)(D, { icon: fo, disabled: a, onClick: () => t("tool_memory"), children: "查看本机纠错记忆" }), (0, C.jsx)(D, { icon: Ro, disabled: a, onClick: () => t("tool_export_labels"), children: "导出纠错标签" }), (0, C.jsx)(D, { icon: Ka, disabled: a, onClick: () => t("tool_evaluate"), children: "评测标注集…" }), e.project && (0, C.jsxs)(C.Fragment, { children: [(0, C.jsx)(D, { disabled: a, onClick: () => t("tool_summary"), children: "查看精简结论" }), (0, C.jsx)(D, { icon: Gl, disabled: a, onClick: () => t("tool_export_analysis"), children: "导出视频分析 JSON" }), (0, C.jsx)(D, { disabled: a || !e.settings.capsule_root, onClick: () => t("tool_draft"), children: "导出复刻配方草稿" })] }), (0, C.jsx)(D, { icon: Kl, disabled: a, onClick: () => t("tool_runtime"), children: "检查本机运行环境" })] }), e.project && !e.settings.capsule_root && (0, C.jsxs)("div", { className: "tool-inline-note", children: [(0, C.jsx)("span", { children: "导出复刻配方需配置生成后端。" }), (0, C.jsx)(D, { kind: "ghost", onClick: l, children: "打开设置" })] })] })] });
}
function pP({ state: e, command: t, disabled: a, options: o, setOption: l }) {
  let r = e.tools.has_ass ? [...e.tracks, { id: "ass", label: "剪辑包装 ASS" }] : e.tracks, i = r.map((v) => [v.id, v.label]), [n, u] = (0, Dt.useState)(""), d = r.find((v) => v.id === n)?.id || r[0]?.id || "", [c, h] = (0, Dt.useState)(""), s = r.some((v) => v.id === c) ? c : "", f = !!(e.tools.inputs.media || e.source && !e.source.missing);
  return (0, C.jsxs)(C.Fragment, { children: [(0, C.jsxs)(Qa, { title: "口播转写与音轨分离", icon: Xa, children: [(0, C.jsx)(Mb, { field: "media", label: "视频或音频", state: e, command: t, disabled: a, useSource: true }), (0, C.jsxs)("div", { className: "tool-field", children: [(0, C.jsx)("span", { children: "口播识别语言" }), (0, C.jsx)(Kr, { label: "口播识别语言", values: [["zh", "中文 / 英文"], ["ja", "日语 / 日本語"]], value: o.speech_language, onChange: (v) => l({ speech_language: v }), disabled: a })] }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { kind: "primary", icon: va, disabled: a || !f, onClick: () => t("tool_transcribe", { language: o.speech_language }), children: "转写口播为 SRT" }), (0, C.jsx)(D, { icon: Xa, disabled: a || !f, onClick: () => t("tool_separate"), children: "分离音轨" })] }), e.stems.map((v) => (0, C.jsxs)("div", { className: "tool-audio", children: [(0, C.jsx)("span", { children: v.label }), (0, C.jsx)("audio", { controls: true, preload: "none", src: v.url, "aria-label": v.label })] }, v.label))] }), (0, C.jsxs)(Qa, { title: "压制字幕到视频", icon: va, children: [(0, C.jsx)(Xd, { label: "字幕来源", value: s, disabled: a, onChange: h, options: [["", "外部 SRT / ASS 文件"], ...i] }), !s && (0, C.jsx)(Mb, { field: "caption", label: "外部字幕文件", state: e, command: t, disabled: a }), (0, C.jsx)(D, { className: "tool-actions", kind: "primary", icon: $t, disabled: a || !f || !s && !e.tools.inputs.caption, onClick: () => t("tool_burn", { track: s }), children: "导出带字幕 MP4" })] }), (0, C.jsx)(Qa, { title: "当前项目字幕", icon: fo, className: "tool-span", children: d ? (0, C.jsxs)(C.Fragment, { children: [(0, C.jsx)(Xd, { label: "项目字幕轨", value: d, onChange: u, options: i, disabled: a }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { icon: fo, disabled: a, onClick: () => t("tool_read_subtitle", { track: d }), children: "查看字幕文件" }), (0, C.jsx)(D, { icon: Ro, disabled: a, onClick: () => t("tool_copy_subtitle", { track: d }), children: "另存字幕文件" })] })] }) : (0, C.jsx)("p", { className: "field-hint", children: "拆解或转写完成后，字幕文件会出现在这里。" }) })] });
}
function GT({ command: e, disabled: t }) {
  return (0, C.jsxs)(Qa, { title: "打开项目", icon: qe, className: "tool-span", children: [(0, C.jsx)("p", { className: "field-hint", children: "先拆解视频，或打开一个已有项目。" }), (0, C.jsx)(D, { className: "tool-actions", icon: qe, onClick: () => e("pick_project"), disabled: t, children: "打开已有项目" })] });
}
function hP(e) {
  let { state: t, command: a, disabled: o, onEditor: l, onExport: r, onPreview: i } = e;
  if (!t.project) return (0, C.jsx)(GT, { ...e });
  let { shots: n, exports: u } = t.project, d = n.filter((c) => c.replacement).length;
  return (0, C.jsxs)(C.Fragment, { children: [(0, C.jsxs)(Qa, { title: "批量替换镜头", icon: Xl, className: "tool-span", children: [(0, C.jsx)("p", { className: "field-hint", children: "文件名可用 shot_001.mp4 或 001.mp4。生成任务也可通过 results.json 导入。" }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { kind: "primary", icon: qe, disabled: o, onClick: () => a("tool_batch_clips"), children: "按文件名批量匹配" }), (0, C.jsx)(D, { icon: Gl, disabled: o, onClick: () => a("tool_import_results"), children: "导入生成结果" })] })] }), (0, C.jsx)(Qa, { title: `已分配素材 · ${d} / ${n.length}`, icon: fl, className: "tool-span", children: (0, C.jsx)("div", { className: "tool-table-wrap", children: (0, C.jsxs)("table", { className: "tool-table", children: [(0, C.jsx)("thead", { children: (0, C.jsxs)("tr", { children: [(0, C.jsx)("th", { children: "镜头" }), (0, C.jsx)("th", { children: "时间" }), (0, C.jsx)("th", { children: "类型" }), (0, C.jsx)("th", { children: "替换素材" })] }) }), (0, C.jsx)("tbody", { children: n.map((c) => (0, C.jsxs)("tr", { children: [(0, C.jsx)("td", { children: (0, C.jsxs)("button", { className: "tool-shot-link", type: "button", onClick: () => l("shot", c), children: [(0, C.jsx)(Gr, { src: c.thumb }), (0, C.jsxs)("span", { children: ["镜头 ", c.id.padStart(2, "0")] })] }) }), (0, C.jsx)("td", { children: (0, C.jsxs)("time", { children: [kt(c.start, true), "–", kt(c.end, true)] }) }), (0, C.jsx)("td", { children: c.label }), (0, C.jsxs)("td", { title: c.replacement_name || void 0, children: [c.replacement_name && !c.replacement ? "文件已移动 · " : "", c.replacement_name || (["static_hold", "still_motion"].includes(c.type) ? "本地静图重建" : "沿用原片")] })] }, c.id)) })] }) }) }), (0, C.jsx)(Qa, { title: "拼接与输出", icon: $t, className: "tool-span", children: (0, C.jsxs)("div", { className: "button-row", children: [(0, C.jsx)(D, { kind: "primary", icon: Ro, disabled: o || t.source?.missing, onClick: r, children: "导出成片" }), u.map((c) => (0, C.jsxs)(D, { icon: mo, onClick: () => i(c), children: ["播放", c.label] }, c.label)), u.length > 0 && (0, C.jsx)(D, { icon: qe, onClick: () => a("tool_open_exports"), children: "打开输出文件夹" })] }) })] });
}
function gP(e) {
  let { state: t, command: a, disabled: o, initialShot: l, onEditor: r, openSettings: i, notify: n } = e, [u, d] = (0, Dt.useState)(l), [c, h] = (0, Dt.useState)(null), [s, f] = (0, Dt.useState)(null), [v, L] = (0, Dt.useState)(null), [x, p] = (0, Dt.useState)("image_to_video"), [m, g] = (0, Dt.useState)(null), [S, E] = (0, Dt.useState)(false), A = t.project?.shots || [], I = A.find(($) => $.id === u) || A[0], T = I?.id;
  if ((0, Dt.useEffect)(() => {
    if (!T) return;
    let $ = false;
    return Uo("tool_references", { shot: T }).then((ee) => {
      $ || h({ id: T, value: ee });
    }).catch((ee) => {
      $ || n(ee.message, true);
    }), () => {
      $ = true;
    };
  }, [T, t.project?.id, n]), !I) return (0, C.jsx)(GT, { ...e });
  let w = c?.id === T ? c.value : null, k = m ?? t.settings.engine, F = { shot: T, only: S };
  async function V($, ee = false) {
    let me = await a("tool_set_reference", { shot: T, role: $, reset: ee });
    me && h({ id: T, value: me });
  }
  return (0, C.jsxs)(C.Fragment, { children: [(0, C.jsxs)(Qa, { title: "生成参考图", icon: Rd, className: "tool-span", children: [(0, C.jsxs)("div", { className: "tool-reference-top", children: [(0, C.jsx)(VT, { shots: A, shot: I, onChange: d, disabled: o }), (0, C.jsx)(D, { icon: fo, onClick: () => r("prompts", I), children: "编辑该镜提示词" })] }), (0, C.jsx)("div", { className: "tool-fields two-fields tool-refs", children: [["first", "首帧"], ["last", "尾帧"]].map(([$, ee]) => {
    let me = w?.[$], we = me?.missing ? "图片已移动 · " + me.name : me?.name || "使用原片" + ee;
    return (0, C.jsxs)("div", { className: "tool-ref", children: [(0, C.jsxs)("button", { className: "tool-reference-image", type: "button", disabled: !me?.image, "aria-label": "放大参考" + ee, onClick: () => f({ title: "参考" + ee, url: me.image }), children: [(0, C.jsx)(Gr, { src: me?.image }), me?.image && (0, C.jsx)(Hr, { size: 15, className: "tool-zoom-icon" })] }), (0, C.jsxs)("div", { className: "tool-ref-label", title: we, children: [(0, C.jsx)("strong", { children: ee }), (0, C.jsx)("span", { children: we })] }), (0, C.jsxs)("div", { className: "button-row", children: [(0, C.jsxs)(D, { icon: qe, disabled: o, onClick: () => V($), children: ["选择参考", ee] }), me?.name && (0, C.jsxs)(D, { kind: "ghost", disabled: o, onClick: () => V($, true), children: ["使用原", ee] }), me?.original && me?.name && (0, C.jsxs)(D, { kind: "ghost", onClick: () => f({ title: "原片" + ee, url: me.original }), children: ["看原", ee] })] })] }, $);
  }) })] }), (0, C.jsxs)(Qa, { title: "视频生成任务", icon: Ma, className: "tool-span", children: [(0, C.jsxs)("div", { className: "tool-fields two-fields", children: [(0, C.jsx)(Xd, { label: "生成模式", value: x, onChange: p, options: Object.entries(t.tools.modes), disabled: o }), (0, C.jsx)(wb, { label: "生成引擎", value: k, onChange: g, disabled: o, placeholder: "使用默认引擎" })] }), (0, C.jsx)(bo, { checked: S, onChange: E, disabled: o, children: "只运行当前镜头" }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [(0, C.jsx)(D, { kind: "primary", icon: Ro, disabled: o, onClick: () => a("tool_build_jobs", { mode: x, engine: k }), children: "导出任务表" }), (0, C.jsx)(D, { icon: Kl, disabled: o || !t.tools.jobs_ready, onClick: () => a("tool_preview_jobs", F), children: "预览任务" }), (0, C.jsx)(D, { icon: Ma, disabled: o || !t.tools.jobs_ready || !t.settings.capsule_root, onClick: async () => {
    let $ = await a("tool_run_jobs", F);
    $?.count && L({ ...F, count: $.count });
  }, children: "调用模型生成…" }), (0, C.jsx)(D, { icon: qe, disabled: !t.tools.jobs_ready, onClick: () => a("tool_open_jobs"), children: "打开任务文件夹" }), (0, C.jsx)(D, { kind: "ghost", icon: Fi, onClick: i, children: "生成后端设置" })] })] }), (0, C.jsx)(hl, { open: !!s, onClose: () => f(null), title: s?.title || "参考图", className: "tool-image-modal", children: s && (0, C.jsx)("img", { className: "tool-image-preview", src: s.url, alt: s.title }) }), (0, C.jsx)(hl, { open: !!v, onClose: () => L(null), title: "调用视频模型", description: v ? `将执行 ${v.count} 个生成任务，模型服务可能收费。` : void 0, children: (0, C.jsxs)("div", { className: "modal-actions", children: [(0, C.jsx)(D, { onClick: () => L(null), children: "取消" }), (0, C.jsx)(D, { kind: "primary", icon: Ma, disabled: o, onClick: async () => {
    await a("tool_run_jobs", { ...v, confirmed: true }) !== void 0 && L(null);
  }, children: "开始生成" })] }) })] });
}
function vP({ result: e, command: t, page: a, notify: o }) {
  let [l, r] = (0, Dt.useState)(false);
  return (0, C.jsxs)("aside", { className: "tool-result", "aria-label": "工具结果", children: [(0, C.jsxs)(Qa, { title: e.title, icon: na, children: [e.name && (0, C.jsxs)("div", { className: "tool-result-file", children: [(0, C.jsx)(fo, { size: 15 }), (0, C.jsx)("span", { title: e.name, children: e.name })] }), e.image && (0, C.jsxs)("button", { className: "tool-result-image", type: "button", "aria-label": "放大抽帧图", onClick: () => r(true), children: [(0, C.jsx)("img", { src: e.image, alt: "抽帧图" }), (0, C.jsx)(Hr, { className: "tool-zoom-icon", size: 16 })] }), e.video && (0, C.jsx)("video", { className: "tool-result-video", src: e.video, controls: true, preload: "metadata" }), e.audio.map((i) => (0, C.jsxs)("div", { className: "tool-audio", children: [(0, C.jsx)("span", { children: i.label }), (0, C.jsx)("audio", { controls: true, preload: "none", src: i.url, "aria-label": i.label })] }, i.label)), e.text && (0, C.jsx)("pre", { className: "tool-result-text", tabIndex: 0, children: e.text }), (0, C.jsxs)("div", { className: "button-row tool-actions", children: [e.text && (0, C.jsx)(D, { icon: Ni, onClick: async () => {
    try {
      await navigator.clipboard.writeText(e.text), o("结果已复制");
    } catch {
      o("可选中结果文本后复制。", true);
    }
  }, children: "复制结果" }), e.name && (0, C.jsx)(D, { icon: qe, onClick: () => t("tool_open_output", { page: a }), children: "打开输出目录" })] })] }), (0, C.jsx)(hl, { open: l, onClose: () => r(false), title: "抽帧图", className: "tool-image-modal", children: e.image && (0, C.jsx)("img", { className: "tool-image-preview", src: e.image, alt: "抽帧图" }) })] });
}
function XT({ page: e, setPage: t, close: a, ...o }) {
  let l = _b.find((i) => i.id === e), r = o.state.tools.results[e];
  return (0, C.jsxs)("main", { className: "advanced-workspace", "aria-label": "高级工具工作区", children: [(0, C.jsxs)("div", { className: "advanced-header", children: [(0, C.jsxs)("div", { className: "advanced-heading", children: [(0, C.jsx)("span", { className: "tool-icon", children: (0, C.jsx)(po, { size: 22 }) }), (0, C.jsxs)("div", { children: [(0, C.jsx)("h1", { children: "高级工具" }), (0, C.jsx)("p", { children: l.detail })] })] }), (0, C.jsx)(D, { kind: "ghost", icon: Bi, onClick: a, children: "返回工作台" })] }), (0, C.jsxs)(Dm, { value: e, onValueChange: t, className: "advanced-tabs", children: [(0, C.jsx)(Om, { className: "advanced-tabbar", "aria-label": "高级工具分类", children: _b.map(({ id: i, label: n, icon: u }) => (0, C.jsxs)(Pm, { value: i, className: "tab", children: [(0, C.jsx)(u, { size: 16 }), (0, C.jsx)("span", { children: n })] }, i)) }), _b.map(({ id: i, Panel: n }) => (0, C.jsx)(Xi, { className: "advanced-scroll", value: i, children: i === e && (0, C.jsxs)("div", { className: "advanced-content" + (r ? " has-tool-result" : ""), children: [(0, C.jsx)("div", { className: "tool-cards", children: (0, C.jsx)(n, { ...o }, o.state.project?.id || o.state.source?.path || "empty") }), r && (0, C.jsx)(vP, { result: r, command: o.command, page: e, notify: o.notify }, r.title)] }) }, i))] })] });
}
var Wd = N(Q(), 1);
var _e = N(Te(), 1), LP = { vocals: "人声", music: "配乐与环境声", external: "外部音频" };
function KT({ state: e, open: t, close: a, command: o, time: l, disabled: r }) {
  let [i, n] = (0, Wd.useState)({}), [u, d] = (0, Wd.useState)(null);
  (0, Wd.useEffect)(() => {
    t && (n(e.audio_mix || {}), d(null));
  }, [t, e.project?.id, e.source?.path]);
  let c = e.audio_tracks || [], h = c.find((p) => p.id === "external"), s = [...c, ...Object.entries(LP).filter(([p]) => i[p]?.enabled && !c.some((m) => m.id === p)).map(([p, m]) => ({ id: p, label: m, name: "文件不可用", missing: true }))], f = u && e.mix_preview?.url !== u.previous ? e.mix_preview : null, v = c.filter((p) => i[p.id]?.enabled && i[p.id]?.volume > 0);
  function L(p, m) {
    n((g) => ({ ...g, [p]: { ...g[p], ...m } })), d(null);
  }
  async function x(p) {
    d({ previous: e.mix_preview?.url }), await o("preview_audio_mix", { levels: i, solo: p }) === void 0 && d(null);
  }
  return (0, _e.jsxs)(hl, { open: t, onClose: a, title: "工程音轨混音", className: "audio-mix-modal", children: [(0, _e.jsxs)("div", { className: "modal-content", children: [(0, _e.jsx)("div", { className: "mix-track-list", children: s.map((p) => {
    let m = i[p.id] || { enabled: false, volume: 100 };
    return (0, _e.jsxs)("section", { className: "mix-track", "aria-label": p.label, children: [(0, _e.jsxs)("div", { className: "mix-track-head", children: [(0, _e.jsx)("span", { className: "mix-track-icon audio-label--" + p.id, children: (0, _e.jsx)(Xa, { size: 17 }) }), (0, _e.jsxs)("div", { className: "mix-track-name", children: [(0, _e.jsx)("strong", { children: p.label }), (0, _e.jsx)("small", { title: p.name, children: p.name })] }), (0, _e.jsx)(St, { icon: Md, label: "试听" + p.label, disabled: r || p.missing, onClick: () => x(p.id) })] }), (0, _e.jsxs)("label", { className: "mix-volume", children: [(0, _e.jsx)("span", { children: "音量" }), (0, _e.jsx)("input", { type: "range", min: "0", max: "100", value: m.volume, "aria-label": p.label + "音量", onChange: (g) => L(p.id, { volume: Number(g.target.value) }), disabled: r }), (0, _e.jsxs)("output", { children: [m.volume, "%"] })] }), (0, _e.jsx)(bo, { checked: m.enabled, disabled: r, onChange: (g) => L(p.id, { enabled: g }), children: "加入混音" })] }, p.id);
  }) }), (0, _e.jsxs)("div", { className: "mix-external button-row", children: [(0, _e.jsx)(D, { icon: qe, disabled: r, onClick: async () => {
    await o("pick_mix_audio") && L("external", { enabled: true, volume: i.external?.volume ?? 100 });
  }, children: h ? "更换外部音频" : "添加外部音频" }), e.external_audio && (0, _e.jsxs)(D, { kind: "ghost", icon: Wa, disabled: r, title: e.external_audio, onClick: async () => {
    await o("remove_mix_audio") !== void 0 && L("external", { enabled: false, volume: i.external?.volume ?? 100 });
  }, children: ["移除", h ? "外部音频" : "已移动音频 · " + Wm(e.external_audio)] })] }), f && (0, _e.jsxs)("div", { className: "mix-preview", "aria-label": "音频试听", children: [(0, _e.jsx)("span", { children: f.label }), (0, _e.jsx)("audio", { src: f.url, controls: true, preload: "metadata", onLoadedMetadata: (p) => {
    let m = p.currentTarget;
    l < m.duration && (m.currentTime = l), m.play().catch(() => {
    });
  } }, f.url)] }), u && !f && e.active && (0, _e.jsx)("p", { className: "field-hint", children: "正在生成试听音频…" }), s.length > 0 && !v.length && (0, _e.jsx)("p", { className: "field-hint", children: "当前没有启用音轨，按工程音轨导出时将静音。" })] }), (0, _e.jsxs)("div", { className: "modal-actions", children: [(0, _e.jsx)(D, { kind: "ghost", onClick: a, children: "关闭" }), (0, _e.jsx)(D, { icon: mo, disabled: r || !v.length, onClick: () => x(null), children: "试听混音" }), (0, _e.jsx)(D, { kind: "primary", icon: na, disabled: r, onClick: async () => {
    await o("save_audio_mix", { levels: i }) !== void 0 && a();
  }, children: "保存工程音轨" })] })] });
}
var Sa = N(Q(), 1);
var he = N(Q(), 1);
var bP = /* @__PURE__ */ new Set(["style", "children", "ref", "key", "suppressContentEditableWarning", "suppressHydrationWarning", "dangerouslySetInnerHTML"]), xP = { className: "class", htmlFor: "for" };
function SP(e) {
  return e.toLowerCase();
}
function WT(e) {
  if (typeof e == "boolean") return e ? "" : void 0;
  if (typeof e != "function" && !(typeof e == "object" && e !== null)) return e;
}
function pe({ react: e, tagName: t, elementClass: a, events: o, displayName: l, defaultProps: r, toAttributeName: i = SP, toAttributeValue: n = WT }) {
  let u = Number.parseInt(e.version) >= 19, d = e.forwardRef((c, h) => {
    let s = e.useRef(null), f = e.useRef(/* @__PURE__ */ new Map()), v = {}, L = {}, x = {}, p = {};
    for (let [m, g] of Object.entries(c)) {
      if (bP.has(m)) {
        x[m] = g;
        continue;
      }
      let S = i(xP[m] ?? m);
      if (a.prototype && m in a.prototype && !(m in (globalThis.HTMLElement?.prototype ?? {})) && !a.observedAttributes?.some((A) => A === S)) {
        p[m] = g;
        continue;
      }
      if (m.startsWith("on")) {
        v[m] = g;
        continue;
      }
      let E = n(g);
      if (S && E != null && (L[S] = String(E), u || (x[S] = E)), S && u) {
        let A = WT(g);
        E !== A ? x[S] = E : x[S] = g;
      }
    }
    if (typeof window < "u") {
      for (let m in v) {
        let g = v[m], S = m.endsWith("Capture"), E = (o?.[m] ?? m.slice(2).toLowerCase()).slice(0, S ? -7 : void 0);
        e.useLayoutEffect(() => {
          let A = s?.current;
          if (!(!A || typeof g != "function")) return A.addEventListener(E, g, S), () => {
            A.removeEventListener(E, g, S);
          };
        }, [s?.current, g]);
      }
      e.useLayoutEffect(() => {
        if (s.current === null) return;
        let m = /* @__PURE__ */ new Map();
        for (let g in p) YT(s.current, g, p[g]), f.current.delete(g), m.set(g, p[g]);
        for (let [g, S] of f.current) YT(s.current, g, void 0);
        f.current = m;
      });
    }
    if (typeof window > "u" && a?.getTemplateHTML && a?.shadowRootOptions) {
      let { mode: m, delegatesFocus: g } = a.shadowRootOptions, S = e.createElement("template", { shadowrootmode: m, shadowrootdelegatesfocus: g, dangerouslySetInnerHTML: { __html: a.getTemplateHTML(L, c) }, key: "ce-la-react-ssr-template-shadow-root" });
      x.children = [S, x.children];
    }
    return e.createElement(t, { ...r, ...x, ref: e.useCallback((m) => {
      s.current = m, typeof h == "function" ? h(m) : h !== null && (h.current = m);
    }, [h]) }, x.children);
  });
  return d.displayName = l ?? a.name, d;
}
function YT(e, t, a) {
  e[t] = a, a == null && t in (globalThis.HTMLElement?.prototype ?? {}) && e.removeAttribute(t);
}
var P = { MEDIA_PLAY_REQUEST: "mediaplayrequest", MEDIA_PAUSE_REQUEST: "mediapauserequest", MEDIA_MUTE_REQUEST: "mediamuterequest", MEDIA_UNMUTE_REQUEST: "mediaunmuterequest", MEDIA_LOOP_REQUEST: "medialooprequest", MEDIA_VOLUME_REQUEST: "mediavolumerequest", MEDIA_SEEK_REQUEST: "mediaseekrequest", MEDIA_AIRPLAY_REQUEST: "mediaairplayrequest", MEDIA_ENTER_FULLSCREEN_REQUEST: "mediaenterfullscreenrequest", MEDIA_EXIT_FULLSCREEN_REQUEST: "mediaexitfullscreenrequest", MEDIA_PREVIEW_REQUEST: "mediapreviewrequest", MEDIA_ENTER_PIP_REQUEST: "mediaenterpiprequest", MEDIA_EXIT_PIP_REQUEST: "mediaexitpiprequest", MEDIA_ENTER_CAST_REQUEST: "mediaentercastrequest", MEDIA_EXIT_CAST_REQUEST: "mediaexitcastrequest", MEDIA_SHOW_TEXT_TRACKS_REQUEST: "mediashowtexttracksrequest", MEDIA_HIDE_TEXT_TRACKS_REQUEST: "mediahidetexttracksrequest", MEDIA_SHOW_SUBTITLES_REQUEST: "mediashowsubtitlesrequest", MEDIA_DISABLE_SUBTITLES_REQUEST: "mediadisablesubtitlesrequest", MEDIA_TOGGLE_SUBTITLES_REQUEST: "mediatogglesubtitlesrequest", MEDIA_PLAYBACK_RATE_REQUEST: "mediaplaybackraterequest", MEDIA_RENDITION_REQUEST: "mediarenditionrequest", MEDIA_AUDIO_TRACK_REQUEST: "mediaaudiotrackrequest", MEDIA_SEEK_TO_LIVE_REQUEST: "mediaseektoliverequest", REGISTER_MEDIA_STATE_RECEIVER: "registermediastatereceiver", UNREGISTER_MEDIA_STATE_RECEIVER: "unregistermediastatereceiver" }, re = { MEDIA_CHROME_ATTRIBUTES: "mediachromeattributes", MEDIA_CONTROLLER: "mediacontroller" }, Rb = { MEDIA_AIRPLAY_UNAVAILABLE: "mediaAirplayUnavailable", MEDIA_AUDIO_TRACK_ENABLED: "mediaAudioTrackEnabled", MEDIA_AUDIO_TRACK_LIST: "mediaAudioTrackList", MEDIA_AUDIO_TRACK_UNAVAILABLE: "mediaAudioTrackUnavailable", MEDIA_BUFFERED: "mediaBuffered", MEDIA_CAST_UNAVAILABLE: "mediaCastUnavailable", MEDIA_CHAPTERS_CUES: "mediaChaptersCues", MEDIA_CURRENT_TIME: "mediaCurrentTime", MEDIA_DURATION: "mediaDuration", MEDIA_ENDED: "mediaEnded", MEDIA_ERROR: "mediaError", MEDIA_ERROR_CODE: "mediaErrorCode", MEDIA_ERROR_MESSAGE: "mediaErrorMessage", MEDIA_FULLSCREEN_UNAVAILABLE: "mediaFullscreenUnavailable", MEDIA_HAS_PLAYED: "mediaHasPlayed", MEDIA_HEIGHT: "mediaHeight", MEDIA_IS_AIRPLAYING: "mediaIsAirplaying", MEDIA_IS_CASTING: "mediaIsCasting", MEDIA_IS_FULLSCREEN: "mediaIsFullscreen", MEDIA_IS_PIP: "mediaIsPip", MEDIA_LOADING: "mediaLoading", MEDIA_MUTED: "mediaMuted", MEDIA_LOOP: "mediaLoop", MEDIA_PAUSED: "mediaPaused", MEDIA_PIP_UNAVAILABLE: "mediaPipUnavailable", MEDIA_PLAYBACK_RATE: "mediaPlaybackRate", MEDIA_PREVIEW_CHAPTER: "mediaPreviewChapter", MEDIA_PREVIEW_COORDS: "mediaPreviewCoords", MEDIA_PREVIEW_IMAGE: "mediaPreviewImage", MEDIA_PREVIEW_TIME: "mediaPreviewTime", MEDIA_RENDITION_LIST: "mediaRenditionList", MEDIA_RENDITION_SELECTED: "mediaRenditionSelected", MEDIA_RENDITION_UNAVAILABLE: "mediaRenditionUnavailable", MEDIA_SEEKABLE: "mediaSeekable", MEDIA_STREAM_TYPE: "mediaStreamType", MEDIA_SUBTITLES_LIST: "mediaSubtitlesList", MEDIA_SUBTITLES_SHOWING: "mediaSubtitlesShowing", MEDIA_TARGET_LIVE_WINDOW: "mediaTargetLiveWindow", MEDIA_TIME_IS_LIVE: "mediaTimeIsLive", MEDIA_VOLUME: "mediaVolume", MEDIA_VOLUME_LEVEL: "mediaVolumeLevel", MEDIA_VOLUME_UNAVAILABLE: "mediaVolumeUnavailable", MEDIA_LANG: "mediaLang", MEDIA_WIDTH: "mediaWidth" }, jT = Object.entries(Rb), b = jT.reduce((e, [t, a]) => (e[t] = a.toLowerCase(), e), {}), CP = { USER_INACTIVE_CHANGE: "userinactivechange", BREAKPOINTS_CHANGE: "breakpointchange", BREAKPOINTS_COMPUTED: "breakpointscomputed" }, ji = jT.reduce((e, [t, a]) => (e[t] = a.toLowerCase(), e), { ...CP }), BF = Object.entries(ji).reduce((e, [t, a]) => {
  let o = b[t];
  return o && (e[a] = o), e;
}, { userinactivechange: "userinactive" }), QT = Object.entries(b).reduce((e, [t, a]) => {
  let o = ji[t];
  return o && (e[a] = o), e;
}, { userinactive: "userinactivechange" }), ka = { SUBTITLES: "subtitles", CAPTIONS: "captions", DESCRIPTIONS: "descriptions", CHAPTERS: "chapters", METADATA: "metadata" }, Wr = { DISABLED: "disabled", HIDDEN: "hidden", SHOWING: "showing" };
var Ym = { MOUSE: "mouse", PEN: "pen", TOUCH: "touch" }, Da = { UNAVAILABLE: "unavailable", UNSUPPORTED: "unsupported" }, Za = { LIVE: "live", ON_DEMAND: "on-demand", UNKNOWN: "unknown" };
var ZT = { INLINE: "inline", FULLSCREEN: "fullscreen", PICTURE_IN_PICTURE: "picture-in-picture" };
function JT(e) {
  return e?.map(EP).join(" ");
}
function EP(e) {
  if (e) {
    let { id: t, width: a, height: o } = e;
    return [t, a, o].filter((l) => l != null).join(":");
  }
}
function $T(e) {
  return e?.map(IP).join(" ");
}
function IP(e) {
  if (e) {
    let { id: t, kind: a, language: o, label: l } = e;
    return [t, a, o, l].filter((r) => r != null).join(":");
  }
}
function Au(e) {
  return typeof e == "number" && !Number.isNaN(e) && Number.isFinite(e);
}
var jm = (e) => new Promise((t) => setTimeout(t, e));
var AP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function Qm(e) {
  return String(e).replace(/[&<>"']/g, (t) => AP[t]);
}
var e_ = { "Start airplay": "Start airplay", "Stop airplay": "Stop airplay", Audio: "Audio", Captions: "Captions", "Enable captions": "Enable captions", "Disable captions": "Disable captions", "Start casting": "Start casting", "Stop casting": "Stop casting", "Enter fullscreen mode": "Enter fullscreen mode", "Exit fullscreen mode": "Exit fullscreen mode", Mute: "Mute", Unmute: "Unmute", Loop: "Loop", "Enter picture in picture mode": "Enter picture in picture mode", "Exit picture in picture mode": "Exit picture in picture mode", Play: "Play", Pause: "Pause", "Playback rate": "Playback rate", "Playback rate {playbackRate}": "Playback rate {playbackRate}", Quality: "Quality", "Seek backward": "Seek backward", "Seek forward": "Seek forward", Settings: "Settings", Auto: "Auto", "audio player": "audio player", "video player": "video player", volume: "volume", seek: "seek", "closed captions": "closed captions", "current playback rate": "current playback rate", "playback time": "playback time", "media loading": "media loading", settings: "settings", "audio tracks": "audio tracks", quality: "quality", play: "play", pause: "pause", mute: "mute", unmute: "unmute", "chapter: {chapterName}": "chapter: {chapterName}", live: "live", Off: "Off", "start airplay": "start airplay", "stop airplay": "stop airplay", "start casting": "start casting", "stop casting": "stop casting", "enter fullscreen mode": "enter fullscreen mode", "exit fullscreen mode": "exit fullscreen mode", "enter picture in picture mode": "enter picture in picture mode", "exit picture in picture mode": "exit picture in picture mode", "seek to live": "seek to live", "playing live": "playing live", "seek back {seekOffset} seconds": "seek back {seekOffset} seconds", "seek forward {seekOffset} seconds": "seek forward {seekOffset} seconds", "Network Error": "Network Error", "Decode Error": "Decode Error", "Source Not Supported": "Source Not Supported", "Encryption Error": "Encryption Error", "A network error caused the media download to fail.": "A network error caused the media download to fail.", "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.": "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.", "An unsupported error occurred. The server or network failed, or your browser does not support this format.": "An unsupported error occurred. The server or network failed, or your browser does not support this format.", "The media is encrypted and there are no keys to decrypt it.": "The media is encrypted and there are no keys to decrypt it.", hour: "hour", hours: "hours", minute: "minute", minutes: "minutes", second: "second", seconds: "seconds", "{time} remaining": "{time} remaining", "{currentTime} of {totalTime}": "{currentTime} of {totalTime}", "video not loaded, unknown time.": "video not loaded, unknown time." };
var t_, Yd = { en: e_ }, Tu = ((t_ = globalThis.navigator) == null ? void 0 : t_.language) || "en", a_ = (e) => {
  Tu = e;
};
var TP = (e) => {
  var t, a, o;
  let [l] = Tu.split("-");
  return ((t = Yd[Tu]) == null ? void 0 : t[e]) || ((a = Yd[l]) == null ? void 0 : a[e]) || ((o = Yd.en) == null ? void 0 : o[e]) || e;
}, o_ = () => {
  let [e] = Tu.split("-");
  return Yd[Tu] ? Tu : Yd[e] ? e : "en";
}, U = (e, t = {}) => TP(e).replace(/\{(\w+)\}/g, (a, o) => o in t ? String(t[o]) : `{${o}}`);
var l_ = [{ singular: "hour", plural: "hours" }, { singular: "minute", plural: "minutes" }, { singular: "second", plural: "seconds" }], r_ = (e, t) => {
  let a = e === 1 ? U(l_[t].singular) : U(l_[t].plural);
  return `${e} ${a}`;
}, Qi = (e) => {
  if (!Au(e)) return "";
  let t = Math.abs(e), a = t !== e, o = new Date(0, 0, 0, 0, 0, t, 0), r = [o.getHours(), o.getMinutes(), o.getSeconds()].map((i, n) => i && r_(i, n)).filter((i) => i).join(", ");
  return a ? U("{time} remaining", { time: r }) : t === 0 ? r_(0, 2) : r;
};
function Bo(e, t) {
  let a = false;
  e < 0 && (a = true, e = 0 - e), e = e < 0 ? 0 : e;
  let o = Math.floor(e % 60), l = Math.floor(e / 60 % 60), r = Math.floor(e / 3600), i = Math.floor(t / 60 % 60), n = Math.floor(t / 3600);
  return (isNaN(e) || e === 1 / 0) && (r = l = o = "0"), r = r > 0 || n > 0 ? r + ":" : "", l = ((r || i >= 10) && l < 10 ? "0" + l : l) + ":", o = o < 10 ? "0" + o : o, (a ? "-" : "") + r + l + o;
}
var GF = Object.freeze({ length: 0, start(e) {
  let t = e >>> 0;
  if (t >= this.length) throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);
  return 0;
}, end(e) {
  let t = e >>> 0;
  if (t >= this.length) throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);
  return 0;
} });
var Zm = class {
  addEventListener() {
  }
  removeEventListener() {
  }
  dispatchEvent() {
    return true;
  }
}, Jm = class extends Zm {
}, $m = class extends Jm {
  constructor() {
    super(...arguments), this.role = null;
  }
}, kb = class {
  observe() {
  }
  unobserve() {
  }
  disconnect() {
  }
}, i_ = { createElement: function() {
  return new jd.HTMLElement();
}, createElementNS: function() {
  return new jd.HTMLElement();
}, addEventListener() {
}, removeEventListener() {
}, dispatchEvent(e) {
  return false;
} }, jd = { ResizeObserver: kb, document: i_, Node: Jm, Element: $m, HTMLElement: class extends $m {
  constructor() {
    super(...arguments), this.innerHTML = "";
  }
  get content() {
    return new jd.DocumentFragment();
  }
}, DocumentFragment: class extends Zm {
}, customElements: { get: function() {
}, define: function() {
}, whenDefined: function() {
} }, localStorage: { getItem(e) {
  return null;
}, setItem(e, t) {
}, removeItem(e) {
} }, CustomEvent: function() {
}, getComputedStyle: function() {
}, navigator: { languages: [], get userAgent() {
  return "";
} }, matchMedia(e) {
  return { matches: false, media: e };
}, DOMParser: class {
  parseFromString(t, a) {
    return { body: { textContent: t } };
  }
} }, n_ = "global" in globalThis && globalThis?.global === globalThis || typeof window > "u" || typeof window.customElements > "u", u_ = Object.keys(jd).every((e) => e in globalThis), y = n_ && !u_ ? jd : globalThis, Ct = n_ && !u_ ? i_ : globalThis.document;
var s_ = /* @__PURE__ */ new WeakMap(), Db = (e) => {
  let t = s_.get(e);
  return t || s_.set(e, t = /* @__PURE__ */ new Set()), t;
}, d_ = new y.ResizeObserver((e) => {
  for (let t of e) for (let a of Db(t.target)) a(t);
});
function ep(e, t) {
  Db(e).add(t), d_.observe(e);
}
function tp(e, t) {
  let a = Db(e);
  a.delete(t), a.size || d_.unobserve(e);
}
function dt(e) {
  let t = {};
  for (let a of e) t[a.name] = a.value;
  return t;
}
function c_(e) {
  var t;
  return (t = wP(e)) != null ? t : Yr(e, "media-controller");
}
function wP(e) {
  var t;
  let { MEDIA_CONTROLLER: a } = re, o = e.getAttribute(a);
  if (o) return (t = RP(e)) == null ? void 0 : t.getElementById(o);
}
var ap = (e, t, a = ".value") => {
  let o = e.querySelector(a);
  o && (o.textContent = t);
}, MP = (e, t) => {
  let a = `slot[name="${t}"]`, o = e.shadowRoot.querySelector(a);
  return o ? o.children : [];
}, op = (e, t) => MP(e, t)[0], gl = (e, t) => !e || !t ? false : e?.contains(t) ? true : gl(e, t.getRootNode().host), Yr = (e, t) => {
  if (!e) return null;
  let a = e.closest(t);
  return a || Yr(e.getRootNode().host, t);
};
function Ob(e = document) {
  var t;
  let a = e?.activeElement;
  return a ? (t = Ob(a.shadowRoot)) != null ? t : a : null;
}
function RP(e) {
  var t;
  let a = (t = e?.getRootNode) == null ? void 0 : t.call(e);
  return a instanceof ShadowRoot || a instanceof Document ? a : null;
}
function lp(e, { depth: t = 3, checkOpacity: a = true, checkVisibilityCSS: o = true } = {}) {
  if (e.checkVisibility) return e.checkVisibility({ checkOpacity: a, checkVisibilityCSS: o });
  let l = e;
  for (; l && t > 0; ) {
    let r = getComputedStyle(l);
    if (a && r.opacity === "0" || o && r.visibility === "hidden" || r.display === "none") return false;
    l = l.parentElement, t--;
  }
  return true;
}
function f_(e, t, a, o) {
  let l = o.x - a.x, r = o.y - a.y, i = l * l + r * r;
  if (i === 0) return 0;
  let n = ((e - a.x) * l + (t - a.y) * r) / i;
  return Math.max(0, Math.min(1, n));
}
function ze(e, t) {
  let a = kP(e, (o) => o === t);
  return a || Pb(e, t);
}
function kP(e, t) {
  var a, o;
  let l;
  for (l of (a = e.querySelectorAll("style:not([media])")) != null ? a : []) {
    let r;
    try {
      r = (o = l.sheet) == null ? void 0 : o.cssRules;
    } catch {
      continue;
    }
    for (let i of r ?? []) if (t(i.selectorText)) return i;
  }
}
function Pb(e, t) {
  var a, o;
  let l = (a = e.querySelectorAll("style:not([media])")) != null ? a : [], r = l?.[l.length - 1];
  if (!r?.sheet) return console.warn("Media Chrome: No style sheet found on style tag of", e), { style: { setProperty: () => {
  }, removeProperty: () => "", getPropertyValue: () => "" } };
  let i = r?.sheet.insertRule(`${t}{}`, r.sheet.cssRules.length);
  return (o = r.sheet.cssRules) == null ? void 0 : o[i];
}
function xe(e, t, a = Number.NaN) {
  let o = e.getAttribute(t);
  return o != null ? +o : a;
}
function Be(e, t, a) {
  let o = +a;
  if (a == null || Number.isNaN(o)) {
    e.hasAttribute(t) && e.removeAttribute(t);
    return;
  }
  xe(e, t, void 0) !== o && e.setAttribute(t, `${o}`);
}
function X(e, t) {
  return e.hasAttribute(t);
}
function K(e, t, a) {
  if (a == null) {
    e.hasAttribute(t) && e.removeAttribute(t);
    return;
  }
  X(e, t) != a && e.toggleAttribute(t, a);
}
function ie(e, t, a = null) {
  var o;
  return (o = e.getAttribute(t)) != null ? o : a;
}
function oe(e, t, a) {
  if (a == null) {
    e.hasAttribute(t) && e.removeAttribute(t);
    return;
  }
  let o = `${a}`;
  ie(e, t, void 0) !== o && e.setAttribute(t, o);
}
var m_ = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, No = (e, t, a) => (m_(e, t, "read from private field"), a ? a.call(e) : t.get(e)), DP = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, rp = (e, t, a, o) => (m_(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), aa;
function OP(e) {
  return `
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `;
}
var _u = class extends y.HTMLElement {
  constructor() {
    if (super(), DP(this, aa, void 0), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
  }
  static get observedAttributes() {
    return [re.MEDIA_CONTROLLER, b.MEDIA_PAUSED];
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === re.MEDIA_CONTROLLER && (a && ((r = (l = No(this, aa)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), rp(this, aa, null)), o && this.isConnected && (rp(this, aa, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = No(this, aa)) == null ? void 0 : n.associateElement) == null || u.call(n, this)));
  }
  connectedCallback() {
    var t, a;
    this.tabIndex = -1, this.setAttribute("aria-hidden", "true"), rp(this, aa, PP(this)), this.getAttribute(re.MEDIA_CONTROLLER) && ((a = (t = No(this, aa)) == null ? void 0 : t.associateElement) == null || a.call(t, this)), No(this, aa) && (No(this, aa).addEventListener("pointerdown", this), No(this, aa).addEventListener("click", this), No(this, aa).hasAttribute("tabindex") || (No(this, aa).tabIndex = 0));
  }
  disconnectedCallback() {
    var t, a, o, l;
    this.getAttribute(re.MEDIA_CONTROLLER) && ((a = (t = No(this, aa)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this)), (o = No(this, aa)) == null || o.removeEventListener("pointerdown", this), (l = No(this, aa)) == null || l.removeEventListener("click", this), rp(this, aa, null);
  }
  handleEvent(t) {
    var a;
    let o = (a = t.composedPath()) == null ? void 0 : a[0];
    if (["video", "media-controller"].includes(o?.localName)) {
      if (t.type === "pointerdown") this._pointerType = t.pointerType;
      else if (t.type === "click") {
        let { clientX: r, clientY: i } = t, { left: n, top: u, width: d, height: c } = this.getBoundingClientRect(), h = r - n, s = i - u;
        if (h < 0 || s < 0 || h > d || s > c || d === 0 && c === 0) return;
        let f = this._pointerType || "mouse";
        if (this._pointerType = void 0, f === Ym.TOUCH) {
          this.handleTap(t);
          return;
        } else if (f === Ym.MOUSE || f === Ym.PEN) {
          this.handleMouseClick(t);
          return;
        }
      }
    }
  }
  get mediaPaused() {
    return X(this, b.MEDIA_PAUSED);
  }
  set mediaPaused(t) {
    K(this, b.MEDIA_PAUSED, t);
  }
  handleTap(t) {
  }
  handleMouseClick(t) {
    let a = this.mediaPaused ? P.MEDIA_PLAY_REQUEST : P.MEDIA_PAUSE_REQUEST;
    this.dispatchEvent(new y.CustomEvent(a, { composed: true, bubbles: true }));
  }
};
aa = /* @__PURE__ */ new WeakMap();
_u.shadowRootOptions = { mode: "open" };
_u.getTemplateHTML = OP;
function PP(e) {
  var t;
  let a = e.getAttribute(re.MEDIA_CONTROLLER);
  return a ? (t = e.getRootNode()) == null ? void 0 : t.getElementById(a) : Yr(e, "media-controller");
}
y.customElements.get("media-gesture-receiver") || y.customElements.define("media-gesture-receiver", _u);
var wu = _u;
var Hb = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, mt = (e, t, a) => (Hb(e, t, "read from private field"), a ? a.call(e) : t.get(e)), ba = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Ho = (e, t, a, o) => (Hb(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), qo = (e, t, a) => (Hb(e, t, "access private method"), a), Qd, up, Mu, Du, ku, Ub, Ru, ip, Bb, p_, Nb, h_, Zd, sp, dp, qb, Ou, Jd, jr, np, W = { AUDIO: "audio", AUTOHIDE: "autohide", BREAKPOINTS: "breakpoints", GESTURES_DISABLED: "gesturesdisabled", KEYBOARD_CONTROL: "keyboardcontrol", NO_AUTOHIDE: "noautohide", USER_INACTIVE: "userinactive", AUTOHIDE_OVER_CONTROLS: "autohideovercontrols" };
function UP(e) {
  return `
    <style>
      
      :host([${b.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${W.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${W.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${W.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${W.AUDIO}])[${W.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${W.AUDIO}])[${W.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${W.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${W.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${W.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${W.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${W.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${W.USER_INACTIVE}]:not([${b.MEDIA_PAUSED}]):not([${b.MEDIA_IS_AIRPLAYING}]):not([${b.MEDIA_IS_CASTING}]):not([${W.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${W.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${W.USER_INACTIVE}]:not([${W.NO_AUTOHIDE}]):not([${b.MEDIA_PAUSED}]):not([${b.MEDIA_IS_CASTING}]):not([${W.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${W.USER_INACTIVE}][${W.AUTOHIDE_OVER_CONTROLS}]:not([${W.NO_AUTOHIDE}]):not([${b.MEDIA_PAUSED}]):not([${b.MEDIA_IS_CASTING}]):not([${W.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      
      :host(:not([${W.AUDIO}])[${b.MEDIA_HAS_PLAYED}]) slot[name=poster],
      :host(:not([${W.AUDIO}])[${b.MEDIA_STREAM_TYPE}="${Za.ON_DEMAND}"][${b.MEDIA_CURRENT_TIME}]:not([${b.MEDIA_CURRENT_TIME}="0"])) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${wu.shadowRootOptions.mode}">
          ${wu.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `;
}
var BP = Object.values(b), NP = "sm:384 md:576 lg:768 xl:960";
function HP(e) {
  g_(e.target, e.contentRect.width);
}
function g_(e, t) {
  var a;
  if (!e.isConnected) return;
  let o = (a = e.getAttribute(W.BREAKPOINTS)) != null ? a : NP, l = qP(o), r = FP(l, t), i = false;
  if (Object.keys(l).forEach((n) => {
    if (r.includes(n)) {
      e.hasAttribute(`breakpoint${n}`) || (e.setAttribute(`breakpoint${n}`, ""), i = true);
      return;
    }
    e.hasAttribute(`breakpoint${n}`) && (e.removeAttribute(`breakpoint${n}`), i = true);
  }), i) {
    let n = new CustomEvent(ji.BREAKPOINTS_CHANGE, { detail: r });
    e.dispatchEvent(n);
  }
  e.breakpointsComputed || (e.breakpointsComputed = true, e.dispatchEvent(new CustomEvent(ji.BREAKPOINTS_COMPUTED, { bubbles: true, composed: true })));
}
function qP(e) {
  let t = e.split(/\s+/);
  return Object.fromEntries(t.map((a) => a.split(":")));
}
function FP(e, t) {
  return Object.keys(e).filter((a) => t >= parseInt(e[a]));
}
var Qr = class extends y.HTMLElement {
  constructor() {
    if (super(), ba(this, Bb), ba(this, Nb), ba(this, Zd), ba(this, dp), ba(this, Ou), ba(this, Qd, void 0), ba(this, up, 0), ba(this, Mu, null), ba(this, Du, null), ba(this, ku, void 0), this.breakpointsComputed = false, ba(this, Ub, (t) => {
      let a = this.media;
      for (let o of t) {
        if (o.type !== "childList") continue;
        let l = o.removedNodes;
        for (let r of l) {
          if (r.slot != "media" || o.target != this) continue;
          let i = o.previousSibling && o.previousSibling.previousElementSibling;
          if (!i || !a) this.mediaUnsetCallback(r);
          else {
            let n = i.slot !== "media";
            for (; (i = i.previousSibling) !== null; ) i.slot == "media" && (n = false);
            n && this.mediaUnsetCallback(r);
          }
        }
        if (a) for (let r of o.addedNodes) r === a && this.handleMediaUpdated(a);
      }
    }), ba(this, Ru, false), ba(this, ip, (t) => {
      mt(this, Ru) || (setTimeout(() => {
        HP(t), Ho(this, Ru, false);
      }, 0), Ho(this, Ru, true));
    }), ba(this, jr, void 0), ba(this, np, () => {
      if (!mt(this, jr).assignedElements({ flatten: true }).length) {
        mt(this, Mu) && this.mediaUnsetCallback(mt(this, Mu));
        return;
      }
      this.handleMediaUpdated(this.media);
    }), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes), a = this.constructor.getTemplateHTML(t);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(a) : this.shadowRoot.innerHTML = a;
    }
    Ho(this, Qd, new MutationObserver(mt(this, Ub)));
  }
  static get observedAttributes() {
    return [W.AUTOHIDE, W.GESTURES_DISABLED].concat(BP).filter((t) => ![b.MEDIA_RENDITION_LIST, b.MEDIA_AUDIO_TRACK_LIST, b.MEDIA_CHAPTERS_CUES, b.MEDIA_WIDTH, b.MEDIA_HEIGHT, b.MEDIA_ERROR, b.MEDIA_ERROR_MESSAGE].includes(t));
  }
  attributeChangedCallback(t, a, o) {
    t.toLowerCase() == W.AUTOHIDE && (this.autohide = o);
  }
  get media() {
    let t = this.querySelector(":scope > [slot=media]");
    return t?.nodeName == "SLOT" && (t = t.assignedElements({ flatten: true })[0]), t;
  }
  async handleMediaUpdated(t) {
    t && (Ho(this, Mu, t), t.localName.includes("-") && await y.customElements.whenDefined(t.localName), this.mediaSetCallback(t));
  }
  connectedCallback() {
    var t;
    mt(this, Qd).observe(this, { childList: true, subtree: true }), ep(this, mt(this, ip));
    let o = this.getAttribute(W.AUDIO) != null ? U("audio player") : U("video player");
    this.setAttribute("role", "region"), this.setAttribute("aria-label", o), this.handleMediaUpdated(this.media), this.setAttribute(W.USER_INACTIVE, ""), g_(this, this.getBoundingClientRect().width);
    let l = this.querySelector(":scope > slot[slot=media]");
    l && (Ho(this, jr, l), mt(this, jr).addEventListener("slotchange", mt(this, np))), this.addEventListener("pointerdown", this), this.addEventListener("pointermove", this), this.addEventListener("pointerup", this), this.addEventListener("mouseleave", this), this.addEventListener("keyup", this), (t = y.window) == null || t.addEventListener("mouseup", this);
  }
  disconnectedCallback() {
    var t;
    tp(this, mt(this, ip)), clearTimeout(mt(this, Du)), mt(this, Qd).disconnect(), this.media && this.mediaUnsetCallback(this.media), (t = y.window) == null || t.removeEventListener("mouseup", this), this.removeEventListener("pointerdown", this), this.removeEventListener("pointermove", this), this.removeEventListener("pointerup", this), this.removeEventListener("mouseleave", this), this.removeEventListener("keyup", this), mt(this, jr) && (mt(this, jr).removeEventListener("slotchange", mt(this, np)), Ho(this, jr, null)), Ho(this, Ru, false);
  }
  mediaSetCallback(t) {
  }
  mediaUnsetCallback(t) {
    Ho(this, Mu, null);
  }
  handleEvent(t) {
    switch (t.type) {
      case "pointerdown":
        Ho(this, up, t.timeStamp);
        break;
      case "pointermove":
        qo(this, Bb, p_).call(this, t);
        break;
      case "pointerup":
        qo(this, Nb, h_).call(this, t);
        break;
      case "mouseleave":
        qo(this, Zd, sp).call(this);
        break;
      case "mouseup":
        this.removeAttribute(W.KEYBOARD_CONTROL);
        break;
      case "keyup":
        qo(this, Ou, Jd).call(this), this.setAttribute(W.KEYBOARD_CONTROL, "");
        break;
    }
  }
  set autohide(t) {
    let a = Number(t);
    Ho(this, ku, isNaN(a) ? 0 : a);
  }
  get autohide() {
    return (mt(this, ku) === void 0 ? 2 : mt(this, ku)).toString();
  }
  get breakpoints() {
    return ie(this, W.BREAKPOINTS);
  }
  set breakpoints(t) {
    oe(this, W.BREAKPOINTS, t);
  }
  get audio() {
    return X(this, W.AUDIO);
  }
  set audio(t) {
    K(this, W.AUDIO, t);
  }
  get gesturesDisabled() {
    return X(this, W.GESTURES_DISABLED);
  }
  set gesturesDisabled(t) {
    K(this, W.GESTURES_DISABLED, t);
  }
  get keyboardControl() {
    return X(this, W.KEYBOARD_CONTROL);
  }
  set keyboardControl(t) {
    K(this, W.KEYBOARD_CONTROL, t);
  }
  get noAutohide() {
    return X(this, W.NO_AUTOHIDE);
  }
  set noAutohide(t) {
    K(this, W.NO_AUTOHIDE, t);
  }
  get autohideOverControls() {
    return X(this, W.AUTOHIDE_OVER_CONTROLS);
  }
  set autohideOverControls(t) {
    K(this, W.AUTOHIDE_OVER_CONTROLS, t);
  }
  get userInteractive() {
    return X(this, W.USER_INACTIVE);
  }
  set userInteractive(t) {
    K(this, W.USER_INACTIVE, t);
  }
};
Qd = /* @__PURE__ */ new WeakMap();
up = /* @__PURE__ */ new WeakMap();
Mu = /* @__PURE__ */ new WeakMap();
Du = /* @__PURE__ */ new WeakMap();
ku = /* @__PURE__ */ new WeakMap();
Ub = /* @__PURE__ */ new WeakMap();
Ru = /* @__PURE__ */ new WeakMap();
ip = /* @__PURE__ */ new WeakMap();
Bb = /* @__PURE__ */ new WeakSet();
p_ = function(e) {
  if (e.pointerType !== "mouse" && e.timeStamp - mt(this, up) < 250) return;
  qo(this, dp, qb).call(this), clearTimeout(mt(this, Du));
  let t = this.hasAttribute(W.AUTOHIDE_OVER_CONTROLS);
  ([this, this.media].includes(e.target) || t) && qo(this, Ou, Jd).call(this);
};
Nb = /* @__PURE__ */ new WeakSet();
h_ = function(e) {
  if (e.pointerType === "touch") {
    let t = !this.hasAttribute(W.USER_INACTIVE);
    [this, this.media].includes(e.target) && t ? qo(this, Zd, sp).call(this) : qo(this, Ou, Jd).call(this);
  } else e.composedPath().some((t) => ["media-play-button", "media-fullscreen-button"].includes(t?.localName)) && qo(this, Ou, Jd).call(this);
};
Zd = /* @__PURE__ */ new WeakSet();
sp = function() {
  if (mt(this, ku) < 0 || this.hasAttribute(W.USER_INACTIVE)) return;
  this.setAttribute(W.USER_INACTIVE, "");
  let e = new y.CustomEvent(ji.USER_INACTIVE_CHANGE, { composed: true, bubbles: true, detail: true });
  this.dispatchEvent(e);
};
dp = /* @__PURE__ */ new WeakSet();
qb = function() {
  if (!this.hasAttribute(W.USER_INACTIVE)) return;
  this.removeAttribute(W.USER_INACTIVE);
  let e = new y.CustomEvent(ji.USER_INACTIVE_CHANGE, { composed: true, bubbles: true, detail: false });
  this.dispatchEvent(e);
};
Ou = /* @__PURE__ */ new WeakSet();
Jd = function() {
  qo(this, dp, qb).call(this), clearTimeout(mt(this, Du));
  let e = parseInt(this.autohide);
  e < 0 || Ho(this, Du, setTimeout(() => {
    qo(this, Zd, sp).call(this);
  }, e * 1e3));
};
jr = /* @__PURE__ */ new WeakMap();
np = /* @__PURE__ */ new WeakMap();
Qr.shadowRootOptions = { mode: "open" };
Qr.getTemplateHTML = UP;
y.customElements.get("media-container") || y.customElements.define("media-container", Qr);
var Fb = Qr;
var Yb = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Ji = (e, t, a) => (Yb(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Jl = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, jb = (e, t, a, o) => (Yb(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Zi = (e, t, a) => (Yb(e, t, "access private method"), a), fp, ec, $i, cp, zb, Vb, v_, Gb, L_, Xb, b_, Kb, x_, Wb, S_;
function zP(e) {
  return `
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `;
}
function VP(e) {
  return `
    <slot id="content"></slot>
  `;
}
var $d = { OPEN: "open", ANCHOR: "anchor" }, Fo = class extends y.HTMLElement {
  constructor() {
    super(), Jl(this, cp), Jl(this, Vb), Jl(this, Gb), Jl(this, Xb), Jl(this, Kb), Jl(this, Wb), Jl(this, fp, false), Jl(this, ec, null), Jl(this, $i, null);
  }
  static get observedAttributes() {
    return [$d.OPEN, $d.ANCHOR];
  }
  get open() {
    return X(this, $d.OPEN);
  }
  set open(t) {
    K(this, $d.OPEN, t);
  }
  handleEvent(t) {
    switch (t.type) {
      case "invoke":
        Zi(this, Xb, b_).call(this, t);
        break;
      case "focusout":
        Zi(this, Kb, x_).call(this, t);
        break;
      case "keydown":
        Zi(this, Wb, S_).call(this, t);
        break;
    }
  }
  connectedCallback() {
    Zi(this, cp, zb).call(this), this.role || (this.role = "dialog"), this.addEventListener("invoke", this), this.addEventListener("focusout", this), this.addEventListener("keydown", this);
  }
  disconnectedCallback() {
    this.removeEventListener("invoke", this), this.removeEventListener("focusout", this), this.removeEventListener("keydown", this);
  }
  attributeChangedCallback(t, a, o) {
    Zi(this, cp, zb).call(this), t === $d.OPEN && o !== a && (this.open ? Zi(this, Vb, v_).call(this) : Zi(this, Gb, L_).call(this));
  }
  focus() {
    jb(this, ec, Ob());
    let t = !this.dispatchEvent(new Event("focus", { composed: true, cancelable: true })), a = !this.dispatchEvent(new Event("focusin", { composed: true, bubbles: true, cancelable: true }));
    if (t || a) return;
    let o = this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');
    o?.focus();
  }
  get keysUsed() {
    return ["Escape", "Tab"];
  }
};
fp = /* @__PURE__ */ new WeakMap();
ec = /* @__PURE__ */ new WeakMap();
$i = /* @__PURE__ */ new WeakMap();
cp = /* @__PURE__ */ new WeakSet();
zb = function() {
  if (!Ji(this, fp) && (jb(this, fp, true), !this.shadowRoot)) {
    this.attachShadow(this.constructor.shadowRootOptions);
    let e = dt(this.attributes);
    this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(e), queueMicrotask(() => {
      let { style: t } = ze(this.shadowRoot, ":host");
      t.setProperty("transition", "display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in");
    });
  }
};
Vb = /* @__PURE__ */ new WeakSet();
v_ = function() {
  var e;
  (e = Ji(this, $i)) == null || e.setAttribute("aria-expanded", "true"), this.dispatchEvent(new Event("open", { composed: true, bubbles: true })), this.addEventListener("transitionend", () => this.focus(), { once: true });
};
Gb = /* @__PURE__ */ new WeakSet();
L_ = function() {
  var e;
  (e = Ji(this, $i)) == null || e.setAttribute("aria-expanded", "false"), this.dispatchEvent(new Event("close", { composed: true, bubbles: true }));
};
Xb = /* @__PURE__ */ new WeakSet();
b_ = function(e) {
  jb(this, $i, e.relatedTarget), gl(this, e.relatedTarget) || (this.open = !this.open);
};
Kb = /* @__PURE__ */ new WeakSet();
x_ = function(e) {
  var t;
  gl(this, e.relatedTarget) || ((t = Ji(this, ec)) == null || t.focus(), Ji(this, $i) && Ji(this, $i) !== e.relatedTarget && this.open && (this.open = false));
};
Wb = /* @__PURE__ */ new WeakSet();
S_ = function(e) {
  var t, a, o, l, r;
  let { key: i, ctrlKey: n, altKey: u, metaKey: d } = e;
  n || u || d || this.keysUsed.includes(i) && (e.preventDefault(), e.stopPropagation(), i === "Tab" ? (e.shiftKey ? (a = (t = this.previousElementSibling) == null ? void 0 : t.focus) == null || a.call(t) : (l = (o = this.nextElementSibling) == null ? void 0 : o.focus) == null || l.call(o), this.blur()) : i === "Escape" && ((r = Ji(this, ec)) == null || r.focus(), this.open = false));
};
Fo.shadowRootOptions = { mode: "open" };
Fo.getTemplateHTML = zP;
Fo.getSlotTemplateHTML = VP;
y.customElements.get("media-chrome-dialog") || y.customElements.define("media-chrome-dialog", Fo);
var Qb = Fo;
var GP = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Zr = (e, t, a) => (GP(e, t, "read from private field"), a ? a.call(e) : t.get(e)), C_ = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Pu, Uu, tc = { HOTKEYS: "hotkeys" }, XP = [{ keys: [{ key: " ", label: "Space" }, { key: "k" }], description: "Toggle Playback" }, { keys: [{ key: "m" }], description: "Toggle mute" }, { keys: [{ key: "f" }], description: "Toggle fullscreen" }, { keys: [{ key: "c" }], description: "Toggle captions or subtitles, if available" }, { keys: [{ key: "p" }], description: "Toggle Picture in Picture" }, { keys: [{ key: "ArrowLeft", label: "←" }, { key: "j" }], description: "Seek back 10s" }, { keys: [{ key: "ArrowRight", label: "→" }, { key: "l" }], description: "Seek forward 10s" }, { keys: [{ key: "ArrowUp", label: "↑" }], description: "Turn volume up" }, { keys: [{ key: "ArrowDown", label: "↓" }], description: "Turn volume down" }, { keys: [{ key: "<", label: "< (SHIFT+,)" }], description: "Decrease playback rate" }, { keys: [{ key: ">", label: "> (SHIFT+.)" }], description: "Increase playback rate" }, { keys: [{ key: "shift+/", label: "SHIFT+/" }], description: "Show keyboard shortcuts" }];
function mp(e) {
  return e === " " ? "nospace" : `no${e.toLowerCase()}`;
}
function KP(e) {
  let t = new Set(e?.split(/\s+/));
  return XP.map(({ keys: a, description: o }) => ({ keys: a.filter(({ key: l }) => !t.has(mp(l))), description: o })).filter(({ keys: a }) => a.length);
}
function WP(e) {
  return `
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${y_(e[tc.HOTKEYS])}
    </slot>
  `;
}
function y_(e) {
  return `
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${KP(e).map(({ keys: a, description: o }) => `
        <tr>
          <td>
            <div class="key-combo">${a.map(({ key: r, label: i = r }, n) => n > 0 ? `<span class="key-separator">or</span><span class="key">${i}</span>` : `<span class="key">${i}</span>`).join("")}</div>
          </td>
          <td class="description">${o}</td>
        </tr>
      `).join("")}</table>
  `;
}
var ac = class extends Fo {
  constructor() {
    super(...arguments), C_(this, Pu, (t) => {
      var a;
      if (!this.open) return;
      let o = (a = this.shadowRoot) == null ? void 0 : a.querySelector("#content");
      if (!o) return;
      let l = t.composedPath(), r = l[0] === this || l.includes(this), i = l.includes(o);
      r && !i && (this.open = false);
    }), C_(this, Uu, (t) => {
      if (!this.open) return;
      let a = t.shiftKey && (t.key === "/" || t.key === "?");
      (t.key === "Escape" || a) && !t.ctrlKey && !t.altKey && !t.metaKey && (this.open = false, t.preventDefault(), t.stopPropagation());
    });
  }
  static get observedAttributes() {
    return [...super.observedAttributes, tc.HOTKEYS];
  }
  get hotkeys() {
    var t;
    return (t = ie(this, tc.HOTKEYS)) != null ? t : void 0;
  }
  set hotkeys(t) {
    oe(this, tc.HOTKEYS, t);
  }
  connectedCallback() {
    super.connectedCallback(), this.open && (this.addEventListener("click", Zr(this, Pu)), document.addEventListener("keydown", Zr(this, Uu)));
  }
  disconnectedCallback() {
    this.removeEventListener("click", Zr(this, Pu)), document.removeEventListener("keydown", Zr(this, Uu));
  }
  attributeChangedCallback(t, a, o) {
    var l;
    if (super.attributeChangedCallback(t, a, o), t === "open") this.open ? (this.addEventListener("click", Zr(this, Pu)), document.addEventListener("keydown", Zr(this, Uu))) : (this.removeEventListener("click", Zr(this, Pu)), document.removeEventListener("keydown", Zr(this, Uu)));
    else if (t === tc.HOTKEYS && o !== a) {
      let r = (l = this.shadowRoot) == null ? void 0 : l.querySelector("#content");
      r && (r.innerHTML = y_(o));
    }
  }
};
Pu = /* @__PURE__ */ new WeakMap();
Uu = /* @__PURE__ */ new WeakMap();
ac.getSlotTemplateHTML = WP;
y.customElements.get("media-keyboard-shortcuts-dialog") || y.customElements.define("media-keyboard-shortcuts-dialog", ac);
var Zb = ac;
var E_ = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Vt = (e, t, a) => (E_(e, t, "read from private field"), a ? a.call(e) : t.get(e)), oc = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, pp = (e, t, a, o) => (E_(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Bu, Nu, hp, en, $l, Jr, Hu = class {
  constructor(t, a, { defaultValue: o } = { defaultValue: void 0 }) {
    oc(this, $l), oc(this, Bu, void 0), oc(this, Nu, void 0), oc(this, hp, void 0), oc(this, en, /* @__PURE__ */ new Set()), pp(this, Bu, t), pp(this, Nu, a), pp(this, hp, new Set(o));
  }
  [Symbol.iterator]() {
    return Vt(this, $l, Jr).values();
  }
  get length() {
    return Vt(this, $l, Jr).size;
  }
  get value() {
    var t;
    return (t = [...Vt(this, $l, Jr)].join(" ")) != null ? t : "";
  }
  set value(t) {
    var a;
    t !== this.value && (pp(this, en, /* @__PURE__ */ new Set()), this.add(...(a = t?.split(" ")) != null ? a : []));
  }
  toString() {
    return this.value;
  }
  item(t) {
    return [...Vt(this, $l, Jr)][t];
  }
  values() {
    return Vt(this, $l, Jr).values();
  }
  forEach(t, a) {
    Vt(this, $l, Jr).forEach(t, a);
  }
  add(...t) {
    var a, o;
    t.forEach((l) => Vt(this, en).add(l)), !(this.value === "" && !((a = Vt(this, Bu)) != null && a.hasAttribute(`${Vt(this, Nu)}`))) && ((o = Vt(this, Bu)) == null || o.setAttribute(`${Vt(this, Nu)}`, `${this.value}`));
  }
  remove(...t) {
    var a;
    t.forEach((o) => Vt(this, en).delete(o)), (a = Vt(this, Bu)) == null || a.setAttribute(`${Vt(this, Nu)}`, `${this.value}`);
  }
  contains(t) {
    return Vt(this, $l, Jr).has(t);
  }
  toggle(t, a) {
    return typeof a < "u" ? a ? (this.add(t), true) : (this.remove(t), false) : this.contains(t) ? (this.remove(t), false) : (this.add(t), true);
  }
  replace(t, a) {
    return this.remove(t), this.add(a), t === a;
  }
};
Bu = /* @__PURE__ */ new WeakMap();
Nu = /* @__PURE__ */ new WeakMap();
hp = /* @__PURE__ */ new WeakMap();
en = /* @__PURE__ */ new WeakMap();
$l = /* @__PURE__ */ new WeakSet();
Jr = function() {
  return Vt(this, en).size ? Vt(this, en) : Vt(this, hp);
};
var YP = (e = "") => e.split(/\s+/), I_ = (e = "") => {
  let [t, a, o] = e.split(":"), l = o ? decodeURIComponent(o) : void 0;
  return { kind: t === "cc" ? ka.CAPTIONS : ka.SUBTITLES, language: a, label: l };
}, Jb = (e = "", t = {}) => YP(e).map((a) => {
  let o = I_(a);
  return { ...t, ...o };
}), $b = (e) => e ? Array.isArray(e) ? e.map((t) => typeof t == "string" ? I_(t) : t) : typeof e == "string" ? Jb(e) : [e] : [], jP = ({ kind: e, label: t, language: a } = { kind: "subtitles" }) => t ? `${e === "captions" ? "cc" : "sb"}:${a}:${encodeURIComponent(t)}` : a, lc = (e = []) => Array.prototype.map.call(e, jP).join(" "), QP = (e, t) => (a) => a[e] === t, A_ = (e) => {
  let t = Object.entries(e).map(([a, o]) => QP(a, o));
  return (a) => t.every((o) => o(a));
}, tn = (e, t = [], a = []) => {
  let o = $b(a).map(A_), l = (r) => o.some((i) => i(r));
  Array.from(t).filter(l).forEach((r) => {
    r.mode = e;
  });
}, an = (e, t = () => true) => {
  if (!e?.textTracks) return [];
  let a = typeof t == "function" ? t : A_(t);
  return Array.from(e.textTracks).filter(a);
}, T_ = (e) => {
  var t;
  return !!((t = e.mediaSubtitlesShowing) != null && t.length) || e.hasAttribute(b.MEDIA_SUBTITLES_SHOWING);
};
var w_ = (e) => {
  var t;
  let { media: a, fullscreenElement: o } = e;
  try {
    let l = o && "requestFullscreen" in o ? "requestFullscreen" : o && "webkitRequestFullScreen" in o ? "webkitRequestFullScreen" : void 0;
    if (l) {
      let r = (t = o[l]) == null ? void 0 : t.call(o);
      if (r instanceof Promise) return r.catch(() => {
      });
    } else a?.webkitEnterFullscreen ? a.webkitEnterFullscreen() : a?.requestFullscreen && a.requestFullscreen();
  } catch (l) {
    console.error(l);
  }
}, __ = "exitFullscreen" in Ct ? "exitFullscreen" : "webkitExitFullscreen" in Ct ? "webkitExitFullscreen" : "webkitCancelFullScreen" in Ct ? "webkitCancelFullScreen" : void 0, M_ = (e) => {
  var t;
  let { documentElement: a } = e;
  if (__) {
    let o = (t = a?.[__]) == null ? void 0 : t.call(a);
    if (o instanceof Promise) return o.catch(() => {
    });
  }
}, rc = "fullscreenElement" in Ct ? "fullscreenElement" : "webkitFullscreenElement" in Ct ? "webkitFullscreenElement" : void 0, ZP = (e) => {
  let { documentElement: t, media: a } = e, o = t?.[rc];
  return !o && "webkitDisplayingFullscreen" in a && "webkitPresentationMode" in a && a.webkitDisplayingFullscreen && a.webkitPresentationMode === ZT.FULLSCREEN ? a : o;
}, R_ = (e) => {
  var t;
  let { media: a, documentElement: o, fullscreenElement: l = a } = e;
  if (!a || !o) return false;
  let r = ZP(e);
  if (!r) return false;
  if (r === l || r === a) return true;
  if (r.localName.includes("-")) {
    let i = r.shadowRoot;
    if (!(rc in i)) return gl(r, l);
    for (; i?.[rc]; ) {
      if (i[rc] === l) return true;
      i = (t = i[rc]) == null ? void 0 : t.shadowRoot;
    }
  }
  return false;
}, JP = "fullscreenEnabled" in Ct ? "fullscreenEnabled" : "webkitFullscreenEnabled" in Ct ? "webkitFullscreenEnabled" : void 0, k_ = (e) => {
  let { documentElement: t, media: a } = e;
  return !!t?.[JP] || a && "webkitSupportsFullscreen" in a;
};
var gp, ex = () => {
  var e, t;
  return gp || (gp = (t = (e = Ct) == null ? void 0 : e.createElement) == null ? void 0 : t.call(e, "video"), gp);
}, D_ = async (e = ex()) => {
  if (!e) return false;
  let t = e.volume;
  e.volume = t / 2 + 0.1;
  let a = new AbortController(), o = await Promise.race([$P(e, a.signal), eU(e, t)]);
  return a.abort(), o;
}, $P = (e, t) => new Promise((a) => {
  e.addEventListener("volumechange", () => a(true), { signal: t });
}), eU = async (e, t) => {
  for (let a = 0; a < 10; a++) {
    if (e.volume === t) return false;
    await jm(10);
  }
  return e.volume !== t;
}, tU = /.*Version\/.*Safari\/.*/.test(y.navigator.userAgent), tx = (e = ex()) => y.matchMedia("(display-mode: standalone)").matches && tU ? false : typeof e?.requestPictureInPicture == "function", ax = (e = ex()) => k_({ documentElement: Ct, media: e }), O_ = ax(), P_ = tx(), U_ = !!y.WebKitPlaybackTargetAvailabilityEvent, B_ = !!y.chrome;
var qu = (e) => an(e.media, (t) => [ka.SUBTITLES, ka.CAPTIONS].includes(t.kind)).sort((t, a) => t.kind >= a.kind ? 1 : -1), ox = (e) => an(e.media, (t) => t.mode === Wr.SHOWING && [ka.SUBTITLES, ka.CAPTIONS].includes(t.kind)), vp = (e, t) => {
  let a = qu(e), o = ox(e), l = !!o.length;
  if (a.length) {
    if (t === false || l && t !== true) tn(Wr.DISABLED, a, o);
    else if (t === true || !l && t !== false) {
      let r = a[0], { options: i } = e;
      if (!i?.noSubtitlesLangPref) {
        let c = y.localStorage.getItem("media-chrome-pref-subtitles-lang"), h = c ? [c, ...y.navigator.languages] : y.navigator.languages, s = a.filter((f) => h.some((v) => f.language.toLowerCase().startsWith(v.split("-")[0]))).sort((f, v) => {
          let L = h.findIndex((p) => f.language.toLowerCase().startsWith(p.split("-")[0])), x = h.findIndex((p) => v.language.toLowerCase().startsWith(p.split("-")[0]));
          return L - x;
        });
        s[0] && (r = s[0]);
      }
      let { language: n, label: u, kind: d } = r;
      tn(Wr.DISABLED, a, o), tn(Wr.SHOWING, a, [{ language: n, label: u, kind: d }]);
    }
  }
}, Lp = (e, t) => e === t ? true : e == null || t == null || typeof e != typeof t ? false : typeof e == "number" && Number.isNaN(e) && Number.isNaN(t) ? true : typeof e != "object" ? false : Array.isArray(e) ? aU(e, t) : Object.entries(e).every(([a, o]) => a in t && Lp(o, t[a])), aU = (e, t) => {
  let a = Array.isArray(e), o = Array.isArray(t);
  return a !== o ? false : a || o ? e.length !== t.length ? false : e.every((l, r) => Lp(l, t[r])) : true;
};
var oU = Object.values(Za), bp, lU = D_().then((e) => (bp = e, bp)), N_ = async (...e) => {
  await Promise.all(e.filter((t) => t).map(async (t) => {
    if (!("localName" in t && t instanceof y.HTMLElement)) return;
    let a = t.localName;
    if (!a.includes("-")) return;
    let o = y.customElements.get(a);
    o && t instanceof o || (await y.customElements.whenDefined(a), y.customElements.upgrade(t));
  }));
}, rU = new y.DOMParser(), iU = (e) => e && (rU.parseFromString(e, "text/html").body.textContent || e), Fu = { mediaError: { get(e, t) {
  let { media: a } = e;
  if (t?.type !== "playing") return a?.error;
}, mediaEvents: ["emptied", "error", "playing"] }, mediaErrorCode: { get(e, t) {
  var a;
  let { media: o } = e;
  if (t?.type !== "playing") return (a = o?.error) == null ? void 0 : a.code;
}, mediaEvents: ["emptied", "error", "playing"] }, mediaErrorMessage: { get(e, t) {
  var a, o;
  let { media: l } = e;
  if (t?.type !== "playing") return (o = (a = l?.error) == null ? void 0 : a.message) != null ? o : "";
}, mediaEvents: ["emptied", "error", "playing"] }, mediaWidth: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.videoWidth) != null ? t : 0;
}, mediaEvents: ["resize"] }, mediaHeight: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.videoHeight) != null ? t : 0;
}, mediaEvents: ["resize"] }, mediaPaused: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.paused) != null ? t : true;
}, set(e, t) {
  var a;
  let { media: o } = t;
  o && (e ? o.pause() : (a = o.play()) == null || a.catch(() => {
  }));
}, mediaEvents: ["play", "playing", "pause", "emptied"] }, mediaHasPlayed: { get(e, t) {
  let { media: a } = e;
  return a ? t ? t.type === "playing" : !a.paused : false;
}, mediaEvents: ["playing", "emptied"] }, mediaEnded: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.ended) != null ? t : false;
}, mediaEvents: ["seeked", "ended", "emptied"] }, mediaPlaybackRate: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.playbackRate) != null ? t : 1;
}, set(e, t) {
  let { media: a } = t;
  a && Number.isFinite(+e) && (a.playbackRate = +e);
}, mediaEvents: ["ratechange", "loadstart"] }, mediaMuted: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.muted) != null ? t : false;
}, set(e, t) {
  let { media: a, options: { noMutedPref: o } = {} } = t;
  if (a) {
    a.muted = e;
    try {
      let l = y.localStorage.getItem("media-chrome-pref-muted") !== null, r = a.hasAttribute("muted");
      if (o) {
        l && y.localStorage.removeItem("media-chrome-pref-muted");
        return;
      }
      if (r && !l) return;
      y.localStorage.setItem("media-chrome-pref-muted", e ? "true" : "false");
    } catch (l) {
      console.debug("Error setting muted pref", l);
    }
  }
}, mediaEvents: ["volumechange"], stateOwnersUpdateHandlers: [(e, t) => {
  let { options: { noMutedPref: a } } = t, { media: o } = t;
  if (!(!o || o.muted || a)) try {
    let l = y.localStorage.getItem("media-chrome-pref-muted") === "true";
    Fu.mediaMuted.set(l, t), e(l);
  } catch (l) {
    console.debug("Error getting muted pref", l);
  }
}] }, mediaLoop: { get(e) {
  let { media: t } = e;
  return t?.loop;
}, set(e, t) {
  let { media: a } = t;
  a && (a.loop = e);
}, mediaEvents: ["medialooprequest"] }, mediaVolume: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.volume) != null ? t : 1;
}, set(e, t) {
  let { media: a, options: { noVolumePref: o } = {} } = t;
  if (a) {
    try {
      e == null ? y.localStorage.removeItem("media-chrome-pref-volume") : !a.hasAttribute("muted") && !o && y.localStorage.setItem("media-chrome-pref-volume", e.toString());
    } catch (l) {
      console.debug("Error setting volume pref", l);
    }
    Number.isFinite(+e) && (a.volume = +e);
  }
}, mediaEvents: ["volumechange"], stateOwnersUpdateHandlers: [(e, t) => {
  let { options: { noVolumePref: a } } = t;
  if (!a) try {
    let { media: o } = t;
    if (!o) return;
    let l = y.localStorage.getItem("media-chrome-pref-volume");
    if (l == null) return;
    Fu.mediaVolume.set(+l, t), e(+l);
  } catch (o) {
    console.debug("Error getting volume pref", o);
  }
}] }, mediaVolumeLevel: { get(e) {
  let { media: t } = e;
  return typeof t?.volume > "u" ? "high" : t.muted || t.volume === 0 ? "off" : t.volume < 0.5 ? "low" : t.volume < 0.75 ? "medium" : "high";
}, mediaEvents: ["volumechange"] }, mediaCurrentTime: { get(e) {
  var t;
  let { media: a } = e;
  return (t = a?.currentTime) != null ? t : 0;
}, set(e, t) {
  let { media: a } = t;
  !a || !Au(e) || (a.currentTime = e);
}, mediaEvents: ["timeupdate", "loadedmetadata", "seeking"] }, mediaDuration: { get(e) {
  let { media: t, options: { defaultDuration: a } = {} } = e;
  return a && (!t || !t.duration || Number.isNaN(t.duration) || !Number.isFinite(t.duration)) ? a : Number.isFinite(t?.duration) ? t.duration : Number.NaN;
}, mediaEvents: ["durationchange", "loadedmetadata", "emptied"] }, mediaLoading: { get(e) {
  let { media: t } = e;
  return t?.readyState < 3;
}, mediaEvents: ["waiting", "playing", "emptied"] }, mediaSeekable: { get(e) {
  var t;
  let { media: a } = e;
  if (!((t = a?.seekable) != null && t.length)) return;
  let o = a.seekable.start(0), l = a.seekable.end(a.seekable.length - 1);
  if (!(!o && !l)) return [Number(o.toFixed(3)), Number(l.toFixed(3))];
}, mediaEvents: ["loadedmetadata", "emptied", "progress", "seekablechange"] }, mediaBuffered: { get(e) {
  var t;
  let { media: a } = e, o = (t = a?.buffered) != null ? t : [];
  return Array.from(o).map((l, r) => [Number(o.start(r).toFixed(3)), Number(o.end(r).toFixed(3))]);
}, mediaEvents: ["progress", "emptied"] }, mediaStreamType: { get(e) {
  let { media: t, options: { defaultStreamType: a } = {} } = e, o = [Za.LIVE, Za.ON_DEMAND].includes(a) ? a : void 0;
  if (!t) return o;
  let { streamType: l } = t;
  if (oU.includes(l)) return l === Za.UNKNOWN ? o : l;
  let r = t.duration;
  return r === 1 / 0 ? Za.LIVE : Number.isFinite(r) ? Za.ON_DEMAND : o;
}, mediaEvents: ["emptied", "durationchange", "loadedmetadata", "streamtypechange"] }, mediaTargetLiveWindow: { get(e) {
  let { media: t } = e;
  if (!t) return Number.NaN;
  let { targetLiveWindow: a } = t, o = Fu.mediaStreamType.get(e);
  return (a == null || Number.isNaN(a)) && o === Za.LIVE ? 0 : a;
}, mediaEvents: ["emptied", "durationchange", "loadedmetadata", "streamtypechange", "targetlivewindowchange"] }, mediaTimeIsLive: { get(e) {
  let { media: t, options: { liveEdgeOffset: a = 10 } = {} } = e;
  if (!t) return false;
  if (typeof t.liveEdgeStart == "number") return Number.isNaN(t.liveEdgeStart) ? false : t.currentTime >= t.liveEdgeStart;
  if (!(Fu.mediaStreamType.get(e) === Za.LIVE)) return false;
  let l = t.seekable;
  if (!l) return true;
  if (!l.length) return false;
  let r = l.end(l.length - 1) - a;
  return t.currentTime >= r;
}, mediaEvents: ["playing", "timeupdate", "progress", "waiting", "emptied"] }, mediaSubtitlesList: { get(e) {
  return qu(e).map(({ kind: t, label: a, language: o }) => ({ kind: t, label: a, language: o }));
}, mediaEvents: ["loadstart"], textTracksEvents: ["addtrack", "removetrack"] }, mediaSubtitlesShowing: { get(e) {
  return ox(e).map(({ kind: t, label: a, language: o }) => ({ kind: t, label: a, language: o }));
}, mediaEvents: ["loadstart"], textTracksEvents: ["addtrack", "removetrack", "change"], stateOwnersUpdateHandlers: [(e, t) => {
  var a, o;
  let { media: l, options: r } = t;
  if (!l) return;
  let i = (n) => {
    var u;
    !r.defaultSubtitles || n && ![ka.CAPTIONS, ka.SUBTITLES].includes((u = n?.track) == null ? void 0 : u.kind) || vp(t, true);
  };
  return l.addEventListener("loadstart", i), (a = l.textTracks) == null || a.addEventListener("addtrack", i), (o = l.textTracks) == null || o.addEventListener("removetrack", i), () => {
    var n, u;
    l.removeEventListener("loadstart", i), (n = l.textTracks) == null || n.removeEventListener("addtrack", i), (u = l.textTracks) == null || u.removeEventListener("removetrack", i);
  };
}] }, mediaChaptersCues: { get(e) {
  var t;
  let { media: a } = e;
  if (!a) return [];
  let [o] = an(a, { kind: ka.CHAPTERS });
  return Array.from((t = o?.cues) != null ? t : []).map(({ text: l, startTime: r, endTime: i }) => ({ text: iU(l), startTime: r, endTime: i }));
}, mediaEvents: ["loadstart", "loadedmetadata"], textTracksEvents: ["addtrack", "removetrack", "change"], stateOwnersUpdateHandlers: [(e, t) => {
  var a;
  let { media: o } = t;
  if (!o) return;
  let l = o.querySelector('track[kind="chapters"][default][src]'), r = (a = o.shadowRoot) == null ? void 0 : a.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');
  return l?.addEventListener("load", e), r?.addEventListener("load", e), () => {
    l?.removeEventListener("load", e), r?.removeEventListener("load", e);
  };
}] }, mediaIsPip: { get(e) {
  var t, a;
  let { media: o, documentElement: l } = e;
  if (!o || !l || !l.pictureInPictureElement) return false;
  if (l.pictureInPictureElement === o) return true;
  if (l.pictureInPictureElement instanceof HTMLMediaElement) return (t = o.localName) != null && t.includes("-") ? gl(o, l.pictureInPictureElement) : false;
  if (l.pictureInPictureElement.localName.includes("-")) {
    let r = l.pictureInPictureElement.shadowRoot;
    for (; r?.pictureInPictureElement; ) {
      if (r.pictureInPictureElement === o) return true;
      r = (a = r.pictureInPictureElement) == null ? void 0 : a.shadowRoot;
    }
  }
  return false;
}, set(e, t) {
  let { media: a } = t;
  if (a) if (e) {
    if (!Ct.pictureInPictureEnabled) {
      console.warn("MediaChrome: Picture-in-picture is not enabled");
      return;
    }
    if (!a.requestPictureInPicture) {
      console.warn("MediaChrome: The current media does not support picture-in-picture");
      return;
    }
    let o = () => {
      console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.");
    };
    a.requestPictureInPicture().catch((l) => {
      if (l.code === 11) {
        if (!a.src) {
          console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");
          return;
        }
        if (a.readyState === 0 && a.preload === "none") {
          let r = () => {
            a.removeEventListener("loadedmetadata", i), a.preload = "none";
          }, i = () => {
            a.requestPictureInPicture().catch(o), r();
          };
          a.addEventListener("loadedmetadata", i), a.preload = "metadata", setTimeout(() => {
            a.readyState === 0 && o(), r();
          }, 1e3);
        } else throw l;
      } else throw l;
    });
  } else Ct.pictureInPictureElement && Ct.exitPictureInPicture();
}, mediaEvents: ["enterpictureinpicture", "leavepictureinpicture"] }, mediaRenditionList: { get(e) {
  var t;
  let { media: a } = e;
  return [...(t = a?.videoRenditions) != null ? t : []].map((o) => ({ ...o }));
}, mediaEvents: ["emptied", "loadstart"], videoRenditionsEvents: ["addrendition", "removerendition"] }, mediaRenditionSelected: { get(e) {
  var t, a, o;
  let { media: l } = e;
  return (o = (a = l?.videoRenditions) == null ? void 0 : a[(t = l.videoRenditions) == null ? void 0 : t.selectedIndex]) == null ? void 0 : o.id;
}, set(e, t) {
  let { media: a } = t;
  if (!a?.videoRenditions) {
    console.warn("MediaController: Rendition selection not supported by this media.");
    return;
  }
  let o = e, l = Array.prototype.findIndex.call(a.videoRenditions, (r) => r.id == o);
  a.videoRenditions.selectedIndex != l && (a.videoRenditions.selectedIndex = l);
}, mediaEvents: ["emptied"], videoRenditionsEvents: ["addrendition", "removerendition", "change"] }, mediaAudioTrackList: { get(e) {
  var t;
  let { media: a } = e;
  return [...(t = a?.audioTracks) != null ? t : []];
}, mediaEvents: ["emptied", "loadstart"], audioTracksEvents: ["addtrack", "removetrack"] }, mediaAudioTrackEnabled: { get(e) {
  var t, a;
  let { media: o } = e;
  return (a = [...(t = o?.audioTracks) != null ? t : []].find((l) => l.enabled)) == null ? void 0 : a.id;
}, set(e, t) {
  let { media: a } = t;
  if (!a?.audioTracks) {
    console.warn("MediaChrome: Audio track selection not supported by this media.");
    return;
  }
  let o = e;
  for (let l of a.audioTracks) l.enabled = o == l.id;
}, mediaEvents: ["emptied"], audioTracksEvents: ["addtrack", "removetrack", "change"] }, mediaIsFullscreen: { get(e) {
  return R_(e);
}, set(e, t, a) {
  var o, l;
  e ? (w_(t), a.detail && !((o = t.media) != null && o.inert) && ((l = t.media) == null || l.focus())) : M_(t);
}, rootEvents: ["fullscreenchange", "webkitfullscreenchange"], mediaEvents: ["webkitbeginfullscreen", "webkitendfullscreen", "webkitpresentationmodechanged"] }, mediaIsCasting: { get(e) {
  var t;
  let { media: a } = e;
  return !a?.remote || ((t = a.remote) == null ? void 0 : t.state) === "disconnected" ? false : a.remote.state === "connected";
}, set(e, t) {
  var a, o;
  let { media: l } = t;
  if (l && !(e && ((a = l.remote) == null ? void 0 : a.state) !== "disconnected") && !(!e && ((o = l.remote) == null ? void 0 : o.state) !== "connected")) {
    if (typeof l.remote.prompt != "function") {
      console.warn("MediaChrome: Casting is not supported in this environment");
      return;
    }
    l.remote.prompt().catch(() => {
    });
  }
}, remoteEvents: ["connect", "connecting", "disconnect"] }, mediaIsAirplaying: { get() {
  return false;
}, set(e, t) {
  let { media: a } = t;
  if (a) {
    if (!(a.webkitShowPlaybackTargetPicker && y.WebKitPlaybackTargetAvailabilityEvent)) {
      console.error("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");
      return;
    }
    a.webkitShowPlaybackTargetPicker();
  }
}, mediaEvents: ["webkitcurrentplaybacktargetiswirelesschanged"] }, mediaFullscreenUnavailable: { get(e) {
  let { media: t } = e;
  if (!O_ || !ax(t)) return Da.UNSUPPORTED;
} }, mediaPipUnavailable: { get(e) {
  let { media: t } = e;
  if (!P_ || !tx(t)) return Da.UNSUPPORTED;
  if (t?.disablePictureInPicture) return Da.UNAVAILABLE;
} }, mediaVolumeUnavailable: { get(e) {
  let { media: t } = e;
  if (bp === false || t?.volume == null) return Da.UNSUPPORTED;
}, stateOwnersUpdateHandlers: [(e) => {
  bp == null && lU.then((t) => e(t ? void 0 : Da.UNSUPPORTED));
}] }, mediaCastUnavailable: { get(e, { availability: t = "not-available" } = {}) {
  var a;
  let { media: o } = e;
  if (!B_ || !((a = o?.remote) != null && a.state)) return Da.UNSUPPORTED;
  if (!(t == null || t === "available")) return Da.UNAVAILABLE;
}, stateOwnersUpdateHandlers: [(e, t) => {
  var a;
  let { media: o } = t;
  return o ? (o.disableRemotePlayback || o.hasAttribute("disableremoteplayback") || (a = o?.remote) == null || a.watchAvailability((r) => {
    e({ availability: r ? "available" : "not-available" });
  }).catch((r) => {
    r.name === "NotSupportedError" ? e({ availability: null }) : e({ availability: "not-available" });
  }), () => {
    var r;
    (r = o?.remote) == null || r.cancelWatchAvailability().catch(() => {
    });
  }) : void 0;
}] }, mediaAirplayUnavailable: { get(e, t) {
  if (!U_) return Da.UNSUPPORTED;
  if (t?.availability === "not-available") return Da.UNAVAILABLE;
}, mediaEvents: ["webkitplaybacktargetavailabilitychanged"], stateOwnersUpdateHandlers: [(e, t) => {
  var a;
  let { media: o } = t;
  return o ? (o.disableRemotePlayback || o.hasAttribute("disableremoteplayback") || (a = o?.remote) == null || a.watchAvailability((r) => {
    e({ availability: r ? "available" : "not-available" });
  }).catch((r) => {
    r.name === "NotSupportedError" ? e({ availability: null }) : e({ availability: "not-available" });
  }), () => {
    var r;
    (r = o?.remote) == null || r.cancelWatchAvailability().catch(() => {
    });
  }) : void 0;
}] }, mediaRenditionUnavailable: { get(e) {
  var t;
  let { media: a } = e;
  if (!a?.videoRenditions) return Da.UNSUPPORTED;
  if (!((t = a.videoRenditions) != null && t.length)) return Da.UNAVAILABLE;
}, mediaEvents: ["emptied", "loadstart"], videoRenditionsEvents: ["addrendition", "removerendition"] }, mediaAudioTrackUnavailable: { get(e) {
  var t, a;
  let { media: o } = e;
  if (!o?.audioTracks) return Da.UNSUPPORTED;
  if (((a = (t = o.audioTracks) == null ? void 0 : t.length) != null ? a : 0) <= 1) return Da.UNAVAILABLE;
}, mediaEvents: ["emptied", "loadstart"], audioTracksEvents: ["addtrack", "removetrack"] }, mediaLang: { get(e) {
  let { options: { mediaLang: t } = {} } = e;
  return t ?? "en";
} } };
var H_ = { [P.MEDIA_PREVIEW_REQUEST](e, t, { detail: a }) {
  var o, l, r;
  let { media: i } = t, n = a ?? void 0, u, d;
  if (i && n != null) {
    let [f] = an(i, { kind: ka.METADATA, label: "thumbnails" }), v = Array.prototype.find.call((o = f?.cues) != null ? o : [], (L, x, p) => x === 0 ? L.endTime > n : x === p.length - 1 ? L.startTime <= n : L.startTime <= n && L.endTime > n);
    if (v) {
      let L = /'^(?:[a-z]+:)?\/\//i.test(v.text) || (l = i?.querySelector('track[label="thumbnails"]')) == null ? void 0 : l.src, x = new URL(v.text, L);
      d = new URLSearchParams(x.hash).get("#xywh").split(",").map((m) => +m), u = x.href;
    }
  }
  let c = e.mediaDuration.get(t), s = (r = e.mediaChaptersCues.get(t).find((f, v, L) => v === L.length - 1 && c === f.endTime ? f.startTime <= n && f.endTime >= n : f.startTime <= n && f.endTime > n)) == null ? void 0 : r.text;
  return a != null && s == null && (s = ""), { mediaPreviewTime: n, mediaPreviewImage: u, mediaPreviewCoords: d, mediaPreviewChapter: s };
}, [P.MEDIA_PAUSE_REQUEST](e, t) {
  e["mediaPaused"].set(true, t);
}, [P.MEDIA_PLAY_REQUEST](e, t) {
  var a, o, l, r;
  let i = "mediaPaused", u = e.mediaStreamType.get(t) === Za.LIVE, d = !((a = t.options) != null && a.noAutoSeekToLive), c = e.mediaTargetLiveWindow.get(t) > 0;
  if (u && d && !c) {
    let h = (o = e.mediaSeekable.get(t)) == null ? void 0 : o[1];
    if (h) {
      let s = (r = (l = t.options) == null ? void 0 : l.seekToLiveOffset) != null ? r : 0, f = h - s;
      e.mediaCurrentTime.set(f, t);
    }
  }
  e[i].set(false, t);
}, [P.MEDIA_PLAYBACK_RATE_REQUEST](e, t, { detail: a }) {
  let o = "mediaPlaybackRate", l = a;
  e[o].set(l, t);
}, [P.MEDIA_MUTE_REQUEST](e, t) {
  e["mediaMuted"].set(true, t);
}, [P.MEDIA_UNMUTE_REQUEST](e, t) {
  let a = "mediaMuted";
  e.mediaVolume.get(t) || e.mediaVolume.set(0.25, t), e[a].set(false, t);
}, [P.MEDIA_LOOP_REQUEST](e, t, { detail: a }) {
  let o = "mediaLoop", l = !!a;
  return e[o].set(l, t), { mediaLoop: l };
}, [P.MEDIA_VOLUME_REQUEST](e, t, { detail: a }) {
  let o = "mediaVolume", l = a;
  l && e.mediaMuted.get(t) && e.mediaMuted.set(false, t), e[o].set(l, t);
}, [P.MEDIA_SEEK_REQUEST](e, t, { detail: a }) {
  let o = "mediaCurrentTime", l = a;
  e[o].set(l, t);
}, [P.MEDIA_SEEK_TO_LIVE_REQUEST](e, t) {
  var a, o, l;
  let r = "mediaCurrentTime", i = (a = e.mediaSeekable.get(t)) == null ? void 0 : a[1];
  if (Number.isNaN(Number(i))) return;
  let n = (l = (o = t.options) == null ? void 0 : o.seekToLiveOffset) != null ? l : 0, u = i - n;
  e[r].set(u, t);
}, [P.MEDIA_SHOW_SUBTITLES_REQUEST](e, t, { detail: a }) {
  var o;
  let { options: l } = t, r = qu(t), i = $b(a), n = (o = i[0]) == null ? void 0 : o.language;
  n && !l.noSubtitlesLangPref && y.localStorage.setItem("media-chrome-pref-subtitles-lang", n), tn(Wr.SHOWING, r, i);
}, [P.MEDIA_DISABLE_SUBTITLES_REQUEST](e, t, { detail: a }) {
  let o = qu(t), l = a ?? [];
  tn(Wr.DISABLED, o, l);
}, [P.MEDIA_TOGGLE_SUBTITLES_REQUEST](e, t, { detail: a }) {
  vp(t, a);
}, [P.MEDIA_RENDITION_REQUEST](e, t, { detail: a }) {
  let o = "mediaRenditionSelected", l = a;
  e[o].set(l, t);
}, [P.MEDIA_AUDIO_TRACK_REQUEST](e, t, { detail: a }) {
  let o = "mediaAudioTrackEnabled", l = a;
  e[o].set(l, t);
}, [P.MEDIA_ENTER_PIP_REQUEST](e, t) {
  let a = "mediaIsPip";
  e.mediaIsFullscreen.get(t) && e.mediaIsFullscreen.set(false, t), e[a].set(true, t);
}, [P.MEDIA_EXIT_PIP_REQUEST](e, t) {
  e["mediaIsPip"].set(false, t);
}, [P.MEDIA_ENTER_FULLSCREEN_REQUEST](e, t, a) {
  let o = "mediaIsFullscreen";
  e.mediaIsPip.get(t) && e.mediaIsPip.set(false, t), e[o].set(true, t, a);
}, [P.MEDIA_EXIT_FULLSCREEN_REQUEST](e, t) {
  e["mediaIsFullscreen"].set(false, t);
}, [P.MEDIA_ENTER_CAST_REQUEST](e, t) {
  let a = "mediaIsCasting";
  e.mediaIsFullscreen.get(t) && e.mediaIsFullscreen.set(false, t), e[a].set(true, t);
}, [P.MEDIA_EXIT_CAST_REQUEST](e, t) {
  e["mediaIsCasting"].set(false, t);
}, [P.MEDIA_AIRPLAY_REQUEST](e, t) {
  e["mediaIsAirplaying"].set(true, t);
} };
var q_ = ({ media: e, fullscreenElement: t, documentElement: a, stateMediator: o = Fu, requestMap: l = H_, options: r = {}, monitorStateOwnersOnlyWithSubscriptions: i = true }) => {
  let n = [], u = { options: { ...r } }, d = Object.freeze({ mediaPreviewTime: void 0, mediaPreviewImage: void 0, mediaPreviewCoords: void 0, mediaPreviewChapter: void 0 }), c = (L) => {
    L != null && (Lp(L, d) || (d = Object.freeze({ ...d, ...L }), n.forEach((x) => x(d))));
  }, h = () => {
    let L = Object.entries(o).reduce((x, [p, { get: m }]) => (x[p] = m(u), x), {});
    c(L);
  }, s = {}, f, v = async (L, x) => {
    var p, m, g, S, E, A, I, T, w, k, F, V, $, ee, me, we;
    let je = !!f;
    if (f = { ...u, ...f ?? {}, ...L }, je) return;
    await N_(...Object.values(L));
    let Ve = n.length > 0 && x === 0 && i, Ge = u.media !== f.media, Y = ((p = u.media) == null ? void 0 : p.textTracks) !== ((m = f.media) == null ? void 0 : m.textTracks), ae = ((g = u.media) == null ? void 0 : g.videoRenditions) !== ((S = f.media) == null ? void 0 : S.videoRenditions), sa = ((E = u.media) == null ? void 0 : E.audioTracks) !== ((A = f.media) == null ? void 0 : A.audioTracks), Ca = ((I = u.media) == null ? void 0 : I.remote) !== ((T = f.media) == null ? void 0 : T.remote), Tl = u.documentElement !== f.documentElement, yo = !!u.media && (Ge || Ve), pt = !!((w = u.media) != null && w.textTracks) && (Y || Ve), Pt = !!((k = u.media) != null && k.videoRenditions) && (ae || Ve), at = !!((F = u.media) != null && F.audioTracks) && (sa || Ve), Et = !!((V = u.media) != null && V.remote) && (Ca || Ve), Ut = !!u.documentElement && (Tl || Ve), ct = yo || pt || Pt || at || Et || Ut, It = n.length === 0 && x === 1 && i, Yo = !!f.media && (Ge || It), ni = !!(($ = f.media) != null && $.textTracks) && (Y || It), ui = !!((ee = f.media) != null && ee.videoRenditions) && (ae || It), tr = !!((me = f.media) != null && me.audioTracks) && (sa || It), dn = !!((we = f.media) != null && we.remote) && (Ca || It), cn = !!f.documentElement && (Tl || It), Cs = Yo || ni || ui || tr || dn || cn;
    if (!(ct || Cs)) {
      Object.entries(f).forEach(([ve, ar]) => {
        u[ve] = ar;
      }), h(), f = void 0;
      return;
    }
    Object.entries(o).forEach(([ve, { get: ar, mediaEvents: di = [], textTracksEvents: kc = [], videoRenditionsEvents: fn = [], audioTracksEvents: ys = [], remoteEvents: Es = [], rootEvents: bh = [], stateOwnersUpdateHandlers: jo = [] }]) => {
      s[ve] || (s[ve] = {});
      let da = (Ie) => {
        let ot = ar(u, Ie);
        c({ [ve]: ot });
      }, ht;
      ht = s[ve].mediaEvents, di.forEach((Ie) => {
        ht && yo && (u.media.removeEventListener(Ie, ht), s[ve].mediaEvents = void 0), Yo && (f.media.addEventListener(Ie, da), s[ve].mediaEvents = da);
      }), ht = s[ve].textTracksEvents, kc.forEach((Ie) => {
        var ot, ca;
        ht && pt && ((ot = u.media.textTracks) == null || ot.removeEventListener(Ie, ht), s[ve].textTracksEvents = void 0), ni && ((ca = f.media.textTracks) == null || ca.addEventListener(Ie, da), s[ve].textTracksEvents = da);
      }), ht = s[ve].videoRenditionsEvents, fn.forEach((Ie) => {
        var ot, ca;
        ht && Pt && ((ot = u.media.videoRenditions) == null || ot.removeEventListener(Ie, ht), s[ve].videoRenditionsEvents = void 0), ui && ((ca = f.media.videoRenditions) == null || ca.addEventListener(Ie, da), s[ve].videoRenditionsEvents = da);
      }), ht = s[ve].audioTracksEvents, ys.forEach((Ie) => {
        var ot, ca;
        ht && at && ((ot = u.media.audioTracks) == null || ot.removeEventListener(Ie, ht), s[ve].audioTracksEvents = void 0), tr && ((ca = f.media.audioTracks) == null || ca.addEventListener(Ie, da), s[ve].audioTracksEvents = da);
      }), ht = s[ve].remoteEvents, Es.forEach((Ie) => {
        var ot, ca;
        ht && Et && ((ot = u.media.remote) == null || ot.removeEventListener(Ie, ht), s[ve].remoteEvents = void 0), dn && ((ca = f.media.remote) == null || ca.addEventListener(Ie, da), s[ve].remoteEvents = da);
      }), ht = s[ve].rootEvents, bh.forEach((Ie) => {
        ht && Ut && (u.documentElement.removeEventListener(Ie, ht), s[ve].rootEvents = void 0), cn && (f.documentElement.addEventListener(Ie, da), s[ve].rootEvents = da);
      });
      let ci = s[ve].stateOwnersUpdateHandlers;
      if (ci && ct && (Array.isArray(ci) ? ci : [ci]).forEach((ot) => {
        typeof ot == "function" && ot();
      }), Cs) {
        let Ie = jo.map((ot) => ot(da, f)).filter((ot) => typeof ot == "function");
        s[ve].stateOwnersUpdateHandlers = Ie.length === 1 ? Ie[0] : Ie;
      } else ct && (s[ve].stateOwnersUpdateHandlers = void 0);
    }), Object.entries(f).forEach(([ve, ar]) => {
      u[ve] = ar;
    }), h(), f = void 0;
  };
  return v({ media: e, fullscreenElement: t, documentElement: a, options: r }), { dispatch(L) {
    let { type: x, detail: p } = L;
    if (l[x] && d.mediaErrorCode == null) {
      c(l[x](o, u, L));
      return;
    }
    x === "mediaelementchangerequest" ? v({ media: p }) : x === "fullscreenelementchangerequest" ? v({ fullscreenElement: p }) : x === "documentelementchangerequest" ? v({ documentElement: p }) : x === "optionschangerequest" && (Object.entries(p ?? {}).forEach(([m, g]) => {
      u.options[m] = g;
    }), h());
  }, getState() {
    return d;
  }, subscribe(L) {
    return v({}, n.length + 1), n.push(L), L(d), () => {
      let x = n.indexOf(L);
      x >= 0 && (v({}, n.length - 1), n.splice(x, 1));
    };
  } };
};
var ux = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, z = (e, t, a) => (ux(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Ja = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, zo = (e, t, a, o) => (ux(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), $r = (e, t, a) => (ux(e, t, "access private method"), a), er, ic, ce, $a, nc, vl, xp, uc, Sp, lx, ln, Cp, rx, sc, yp, ix, W_, Y_ = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " ", "f", "m", "k", "c", "l", "j", ">", "<", "p"], F_ = 10, z_ = 0.025, V_ = 0.25, nU = 0.25, uU = 2, O = { DEFAULT_SUBTITLES: "defaultsubtitles", DEFAULT_STREAM_TYPE: "defaultstreamtype", DEFAULT_DURATION: "defaultduration", FULLSCREEN_ELEMENT: "fullscreenelement", HOTKEYS: "hotkeys", KEYBOARD_BACKWARD_SEEK_OFFSET: "keyboardbackwardseekoffset", KEYBOARD_FORWARD_SEEK_OFFSET: "keyboardforwardseekoffset", KEYBOARD_DOWN_VOLUME_STEP: "keyboarddownvolumestep", KEYBOARD_UP_VOLUME_STEP: "keyboardupvolumestep", KEYS_USED: "keysused", LANG: "lang", LOOP: "loop", LIVE_EDGE_OFFSET: "liveedgeoffset", NO_AUTO_SEEK_TO_LIVE: "noautoseektolive", NO_DEFAULT_STORE: "nodefaultstore", NO_HOTKEYS: "nohotkeys", NO_MUTED_PREF: "nomutedpref", NO_SUBTITLES_LANG_PREF: "nosubtitleslangpref", NO_VOLUME_PREF: "novolumepref", SEEK_TO_LIVE_OFFSET: "seektoliveoffset" }, Ep = class extends Qr {
  constructor() {
    super(), Ja(this, Sp), Ja(this, Cp), Ja(this, sc), Ja(this, ix), this.mediaStateReceivers = [], this.associatedElementSubscriptions = /* @__PURE__ */ new Map(), Ja(this, er, new Hu(this, O.HOTKEYS)), Ja(this, ic, void 0), Ja(this, ce, void 0), Ja(this, $a, null), Ja(this, nc, void 0), Ja(this, vl, void 0), Ja(this, xp, (a) => {
      var o;
      (o = z(this, ce)) == null || o.dispatch(a);
    }), Ja(this, uc, void 0), Ja(this, ln, (a) => {
      let { key: o, shiftKey: l } = a;
      if (!(l && (o === "/" || o === "?") || Y_.includes(o))) {
        this.removeEventListener("keyup", z(this, ln));
        return;
      }
      this.keyboardShortcutHandler(a);
    }), this.associateElement(this);
    let t = {};
    zo(this, nc, (a) => {
      Object.entries(a).forEach(([o, l]) => {
        if (o in t && t[o] === l) return;
        this.propagateMediaState(o, l);
        let r = o.toLowerCase(), i = new y.CustomEvent(QT[r], { composed: true, detail: l });
        this.dispatchEvent(i);
      }), t = a;
    });
  }
  static get observedAttributes() {
    return super.observedAttributes.concat(O.NO_HOTKEYS, O.HOTKEYS, O.DEFAULT_STREAM_TYPE, O.DEFAULT_SUBTITLES, O.DEFAULT_DURATION, O.NO_MUTED_PREF, O.NO_VOLUME_PREF, O.LANG, O.LOOP, O.LIVE_EDGE_OFFSET, O.SEEK_TO_LIVE_OFFSET, O.NO_AUTO_SEEK_TO_LIVE);
  }
  get mediaStore() {
    return z(this, ce);
  }
  set mediaStore(t) {
    var a, o;
    if (z(this, ce) && ((a = z(this, vl)) == null || a.call(this), zo(this, vl, void 0)), zo(this, ce, t), !z(this, ce) && !this.hasAttribute(O.NO_DEFAULT_STORE)) {
      $r(this, Sp, lx).call(this);
      return;
    }
    zo(this, vl, (o = z(this, ce)) == null ? void 0 : o.subscribe(z(this, nc)));
  }
  get fullscreenElement() {
    var t;
    return (t = z(this, ic)) != null ? t : this;
  }
  set fullscreenElement(t) {
    var a;
    this.hasAttribute(O.FULLSCREEN_ELEMENT) && this.removeAttribute(O.FULLSCREEN_ELEMENT), zo(this, ic, t), (a = z(this, ce)) == null || a.dispatch({ type: "fullscreenelementchangerequest", detail: this.fullscreenElement });
  }
  get defaultSubtitles() {
    return X(this, O.DEFAULT_SUBTITLES);
  }
  set defaultSubtitles(t) {
    K(this, O.DEFAULT_SUBTITLES, t);
  }
  get defaultStreamType() {
    return ie(this, O.DEFAULT_STREAM_TYPE);
  }
  set defaultStreamType(t) {
    oe(this, O.DEFAULT_STREAM_TYPE, t);
  }
  get defaultDuration() {
    return xe(this, O.DEFAULT_DURATION);
  }
  set defaultDuration(t) {
    Be(this, O.DEFAULT_DURATION, t);
  }
  get noHotkeys() {
    return X(this, O.NO_HOTKEYS);
  }
  set noHotkeys(t) {
    K(this, O.NO_HOTKEYS, t);
  }
  get keysUsed() {
    return ie(this, O.KEYS_USED);
  }
  set keysUsed(t) {
    oe(this, O.KEYS_USED, t);
  }
  get liveEdgeOffset() {
    return xe(this, O.LIVE_EDGE_OFFSET);
  }
  set liveEdgeOffset(t) {
    Be(this, O.LIVE_EDGE_OFFSET, t);
  }
  get noAutoSeekToLive() {
    return X(this, O.NO_AUTO_SEEK_TO_LIVE);
  }
  set noAutoSeekToLive(t) {
    K(this, O.NO_AUTO_SEEK_TO_LIVE, t);
  }
  get noVolumePref() {
    return X(this, O.NO_VOLUME_PREF);
  }
  set noVolumePref(t) {
    K(this, O.NO_VOLUME_PREF, t);
  }
  get noMutedPref() {
    return X(this, O.NO_MUTED_PREF);
  }
  set noMutedPref(t) {
    K(this, O.NO_MUTED_PREF, t);
  }
  get noSubtitlesLangPref() {
    return X(this, O.NO_SUBTITLES_LANG_PREF);
  }
  set noSubtitlesLangPref(t) {
    K(this, O.NO_SUBTITLES_LANG_PREF, t);
  }
  get noDefaultStore() {
    return X(this, O.NO_DEFAULT_STORE);
  }
  set noDefaultStore(t) {
    K(this, O.NO_DEFAULT_STORE, t);
  }
  get resolvedLang() {
    return o_();
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u, d, c, h, s, f, v, L;
    if (super.attributeChangedCallback(t, a, o), t === O.NO_HOTKEYS) o !== a && o === "" ? (this.hasAttribute(O.HOTKEYS) && console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."), this.disableHotkeys()) : o !== a && o === null && this.enableHotkeys(), $r(this, sc, yp).call(this);
    else if (t === O.HOTKEYS) z(this, er).value = o, $r(this, sc, yp).call(this);
    else if (t === O.DEFAULT_SUBTITLES && o !== a) (l = z(this, ce)) == null || l.dispatch({ type: "optionschangerequest", detail: { defaultSubtitles: this.hasAttribute(O.DEFAULT_SUBTITLES) } });
    else if (t === O.DEFAULT_STREAM_TYPE) (i = z(this, ce)) == null || i.dispatch({ type: "optionschangerequest", detail: { defaultStreamType: (r = this.getAttribute(O.DEFAULT_STREAM_TYPE)) != null ? r : void 0 } });
    else if (t === O.LIVE_EDGE_OFFSET && o !== a) (n = z(this, ce)) == null || n.dispatch({ type: "optionschangerequest", detail: { liveEdgeOffset: this.hasAttribute(O.LIVE_EDGE_OFFSET) ? +this.getAttribute(O.LIVE_EDGE_OFFSET) : void 0, seekToLiveOffset: this.hasAttribute(O.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(O.SEEK_TO_LIVE_OFFSET) : this.hasAttribute(O.LIVE_EDGE_OFFSET) ? +this.getAttribute(O.LIVE_EDGE_OFFSET) : void 0 } });
    else if (t === O.SEEK_TO_LIVE_OFFSET && o !== a) (u = z(this, ce)) == null || u.dispatch({ type: "optionschangerequest", detail: { seekToLiveOffset: this.hasAttribute(O.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(O.SEEK_TO_LIVE_OFFSET) : this.hasAttribute(O.LIVE_EDGE_OFFSET) ? +this.getAttribute(O.LIVE_EDGE_OFFSET) : void 0 } });
    else if (t === O.NO_AUTO_SEEK_TO_LIVE) (d = z(this, ce)) == null || d.dispatch({ type: "optionschangerequest", detail: { noAutoSeekToLive: this.hasAttribute(O.NO_AUTO_SEEK_TO_LIVE) } });
    else if (t === O.FULLSCREEN_ELEMENT) {
      let x = o ? (c = this.getRootNode()) == null ? void 0 : c.getElementById(o) : void 0;
      zo(this, ic, x), (h = z(this, ce)) == null || h.dispatch({ type: "fullscreenelementchangerequest", detail: this.fullscreenElement });
    } else t === O.LANG && o !== a ? (a_(o), (s = z(this, ce)) == null || s.dispatch({ type: "optionschangerequest", detail: { mediaLang: o } })) : t === O.LOOP && o !== a ? (f = z(this, ce)) == null || f.dispatch({ type: P.MEDIA_LOOP_REQUEST, detail: o != null }) : t === O.NO_VOLUME_PREF && o !== a ? (v = z(this, ce)) == null || v.dispatch({ type: "optionschangerequest", detail: { noVolumePref: this.hasAttribute(O.NO_VOLUME_PREF) } }) : t === O.NO_MUTED_PREF && o !== a && ((L = z(this, ce)) == null || L.dispatch({ type: "optionschangerequest", detail: { noMutedPref: this.hasAttribute(O.NO_MUTED_PREF) } }));
  }
  connectedCallback() {
    var t, a, o;
    this.associateElement(this), !z(this, ce) && !this.hasAttribute(O.NO_DEFAULT_STORE) && $r(this, Sp, lx).call(this), (t = z(this, ce)) == null || t.dispatch({ type: "documentelementchangerequest", detail: Ct }), (a = z(this, ce)) == null || a.dispatch({ type: "fullscreenelementchangerequest", detail: this.fullscreenElement }), super.connectedCallback(), z(this, ce) && !z(this, vl) && zo(this, vl, (o = z(this, ce)) == null ? void 0 : o.subscribe(z(this, nc))), z(this, uc) !== void 0 && z(this, ce) && this.media && setTimeout(() => {
      var l, r, i;
      (r = (l = this.media) == null ? void 0 : l.textTracks) != null && r.length && ((i = z(this, ce)) == null || i.dispatch({ type: P.MEDIA_TOGGLE_SUBTITLES_REQUEST, detail: z(this, uc) }));
    }, 0), this.hasAttribute(O.NO_HOTKEYS) ? this.disableHotkeys() : this.enableHotkeys();
  }
  disconnectedCallback() {
    var t, a, o, l, r, i;
    if ((t = super.disconnectedCallback) == null || t.call(this), this.disableHotkeys(), z(this, ce)) {
      let n = z(this, ce).getState();
      zo(this, uc, !!((a = n.mediaSubtitlesShowing) != null && a.length)), (o = z(this, ce)) == null || o.dispatch({ type: "fullscreenelementchangerequest", detail: void 0 }), (l = z(this, ce)) == null || l.dispatch({ type: "documentelementchangerequest", detail: void 0 }), (r = z(this, ce)) == null || r.dispatch({ type: P.MEDIA_TOGGLE_SUBTITLES_REQUEST, detail: false });
    }
    z(this, vl) && ((i = z(this, vl)) == null || i.call(this), zo(this, vl, void 0)), this.unassociateElement(this), z(this, $a) && (z(this, $a).remove(), zo(this, $a, null));
  }
  mediaSetCallback(t) {
    var a;
    super.mediaSetCallback(t), (a = z(this, ce)) == null || a.dispatch({ type: "mediaelementchangerequest", detail: t }), t.hasAttribute("tabindex") || (t.tabIndex = -1);
  }
  mediaUnsetCallback(t) {
    var a;
    super.mediaUnsetCallback(t), (a = z(this, ce)) == null || a.dispatch({ type: "mediaelementchangerequest", detail: void 0 });
  }
  propagateMediaState(t, a) {
    K_(this.mediaStateReceivers, t, a);
  }
  associateElement(t) {
    if (!t) return;
    let { associatedElementSubscriptions: a } = this;
    if (a.has(t)) return;
    let o = this.registerMediaStateReceiver.bind(this), l = this.unregisterMediaStateReceiver.bind(this), r = pU(t, o, l);
    Object.values(P).forEach((i) => {
      t.addEventListener(i, z(this, xp));
    }), a.set(t, r);
  }
  unassociateElement(t) {
    if (!t) return;
    let { associatedElementSubscriptions: a } = this;
    if (!a.has(t)) return;
    a.get(t)(), a.delete(t), Object.values(P).forEach((l) => {
      t.removeEventListener(l, z(this, xp));
    });
  }
  registerMediaStateReceiver(t) {
    if (!t) return;
    let a = this.mediaStateReceivers;
    a.indexOf(t) > -1 || (a.push(t), z(this, ce) && Object.entries(z(this, ce).getState()).forEach(([l, r]) => {
      K_([t], l, r);
    }));
  }
  unregisterMediaStateReceiver(t) {
    let a = this.mediaStateReceivers, o = a.indexOf(t);
    o < 0 || a.splice(o, 1);
  }
  enableHotkeys() {
    this.addEventListener("keydown", $r(this, Cp, rx));
  }
  disableHotkeys() {
    this.removeEventListener("keydown", $r(this, Cp, rx)), this.removeEventListener("keyup", z(this, ln));
  }
  get hotkeys() {
    return z(this, er);
  }
  set hotkeys(t) {
    oe(this, O.HOTKEYS, t);
  }
  keyboardShortcutHandler(t) {
    var a, o, l, r, i, n, u, d, c;
    let h = t.target;
    if (((l = (o = (a = h.getAttribute(O.KEYS_USED)) == null ? void 0 : a.split(" ")) != null ? o : h?.keysUsed) != null ? l : []).map((p) => p === "Space" ? " " : p).filter(Boolean).includes(t.key)) return;
    let f, v, L;
    if (!(z(this, er).contains(mp(t.key)) || t.shiftKey && (t.key === "/" || t.key === "?") && z(this, er).contains("noshift+/"))) switch (t.key) {
      case " ":
      case "k":
        f = z(this, ce).getState().mediaPaused ? P.MEDIA_PLAY_REQUEST : P.MEDIA_PAUSE_REQUEST, this.dispatchEvent(new y.CustomEvent(f, { composed: true, bubbles: true }));
        break;
      case "m":
        f = this.mediaStore.getState().mediaVolumeLevel === "off" ? P.MEDIA_UNMUTE_REQUEST : P.MEDIA_MUTE_REQUEST, this.dispatchEvent(new y.CustomEvent(f, { composed: true, bubbles: true }));
        break;
      case "f":
        f = this.mediaStore.getState().mediaIsFullscreen ? P.MEDIA_EXIT_FULLSCREEN_REQUEST : P.MEDIA_ENTER_FULLSCREEN_REQUEST, this.dispatchEvent(new y.CustomEvent(f, { composed: true, bubbles: true }));
        break;
      case "c":
        this.dispatchEvent(new y.CustomEvent(P.MEDIA_TOGGLE_SUBTITLES_REQUEST, { composed: true, bubbles: true }));
        break;
      case "ArrowLeft":
      case "j": {
        let p = this.hasAttribute(O.KEYBOARD_BACKWARD_SEEK_OFFSET) ? +this.getAttribute(O.KEYBOARD_BACKWARD_SEEK_OFFSET) : F_;
        v = Math.max(((r = this.mediaStore.getState().mediaCurrentTime) != null ? r : 0) - p, 0), L = new y.CustomEvent(P.MEDIA_SEEK_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case "ArrowRight":
      case "l": {
        let p = this.hasAttribute(O.KEYBOARD_FORWARD_SEEK_OFFSET) ? +this.getAttribute(O.KEYBOARD_FORWARD_SEEK_OFFSET) : F_;
        v = Math.max(((i = this.mediaStore.getState().mediaCurrentTime) != null ? i : 0) + p, 0), L = new y.CustomEvent(P.MEDIA_SEEK_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case "ArrowUp": {
        let p = this.hasAttribute(O.KEYBOARD_UP_VOLUME_STEP) ? +this.getAttribute(O.KEYBOARD_UP_VOLUME_STEP) : z_;
        v = Math.min(((n = this.mediaStore.getState().mediaVolume) != null ? n : 1) + p, 1), L = new y.CustomEvent(P.MEDIA_VOLUME_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case "ArrowDown": {
        let p = this.hasAttribute(O.KEYBOARD_DOWN_VOLUME_STEP) ? +this.getAttribute(O.KEYBOARD_DOWN_VOLUME_STEP) : z_;
        v = Math.max(((u = this.mediaStore.getState().mediaVolume) != null ? u : 1) - p, 0), L = new y.CustomEvent(P.MEDIA_VOLUME_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case "<": {
        let p = (d = this.mediaStore.getState().mediaPlaybackRate) != null ? d : 1;
        v = Math.max(p - V_, nU).toFixed(2), L = new y.CustomEvent(P.MEDIA_PLAYBACK_RATE_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case ">": {
        let p = (c = this.mediaStore.getState().mediaPlaybackRate) != null ? c : 1;
        v = Math.min(p + V_, uU).toFixed(2), L = new y.CustomEvent(P.MEDIA_PLAYBACK_RATE_REQUEST, { composed: true, bubbles: true, detail: v }), this.dispatchEvent(L);
        break;
      }
      case "/":
      case "?": {
        t.shiftKey && $r(this, ix, W_).call(this);
        break;
      }
      case "p": {
        f = this.mediaStore.getState().mediaIsPip ? P.MEDIA_EXIT_PIP_REQUEST : P.MEDIA_ENTER_PIP_REQUEST, L = new y.CustomEvent(f, { composed: true, bubbles: true }), this.dispatchEvent(L);
        break;
      }
      default:
        break;
    }
  }
};
er = /* @__PURE__ */ new WeakMap();
ic = /* @__PURE__ */ new WeakMap();
ce = /* @__PURE__ */ new WeakMap();
$a = /* @__PURE__ */ new WeakMap();
nc = /* @__PURE__ */ new WeakMap();
vl = /* @__PURE__ */ new WeakMap();
xp = /* @__PURE__ */ new WeakMap();
uc = /* @__PURE__ */ new WeakMap();
Sp = /* @__PURE__ */ new WeakSet();
lx = function() {
  var e;
  this.mediaStore = q_({ media: this.media, fullscreenElement: this.fullscreenElement, options: { defaultSubtitles: this.hasAttribute(O.DEFAULT_SUBTITLES), defaultDuration: this.hasAttribute(O.DEFAULT_DURATION) ? +this.getAttribute(O.DEFAULT_DURATION) : void 0, defaultStreamType: (e = this.getAttribute(O.DEFAULT_STREAM_TYPE)) != null ? e : void 0, liveEdgeOffset: this.hasAttribute(O.LIVE_EDGE_OFFSET) ? +this.getAttribute(O.LIVE_EDGE_OFFSET) : void 0, seekToLiveOffset: this.hasAttribute(O.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(O.SEEK_TO_LIVE_OFFSET) : this.hasAttribute(O.LIVE_EDGE_OFFSET) ? +this.getAttribute(O.LIVE_EDGE_OFFSET) : void 0, noAutoSeekToLive: this.hasAttribute(O.NO_AUTO_SEEK_TO_LIVE), noVolumePref: this.hasAttribute(O.NO_VOLUME_PREF), noMutedPref: this.hasAttribute(O.NO_MUTED_PREF), noSubtitlesLangPref: this.hasAttribute(O.NO_SUBTITLES_LANG_PREF) } });
};
ln = /* @__PURE__ */ new WeakMap();
Cp = /* @__PURE__ */ new WeakSet();
rx = function(e) {
  var t;
  let { metaKey: a, altKey: o, key: l, shiftKey: r } = e, i = r && (l === "/" || l === "?");
  if (i && ((t = z(this, $a)) != null && t.open)) {
    this.removeEventListener("keyup", z(this, ln));
    return;
  }
  if (a || o || !i && !Y_.includes(l)) {
    this.removeEventListener("keyup", z(this, ln));
    return;
  }
  let n = e.target, u = n instanceof HTMLElement && (n.tagName.toLowerCase() === "media-volume-range" || n.tagName.toLowerCase() === "media-time-range");
  [" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(l) && !z(this, er).contains(mp(l)) && !u && e.preventDefault(), this.addEventListener("keyup", z(this, ln), { once: true });
};
sc = /* @__PURE__ */ new WeakSet();
yp = function() {
  z(this, $a) && (z(this, $a).hotkeys = z(this, er).value || void 0, (this.noHotkeys || z(this, er).contains("noshift+/")) && (z(this, $a).open = false));
};
ix = /* @__PURE__ */ new WeakSet();
W_ = function() {
  z(this, $a) || (zo(this, $a, Ct.createElement("media-keyboard-shortcuts-dialog")), $r(this, sc, yp).call(this), this.appendChild(z(this, $a))), z(this, $a).open = true;
};
var sU = Object.values(b), dU = Object.values(Rb), j_ = (e) => {
  var t, a, o, l;
  let { observedAttributes: r } = e.constructor;
  !r && ((t = e.nodeName) != null && t.includes("-")) && (y.customElements.upgrade(e), { observedAttributes: r } = e.constructor);
  let i = (l = (o = (a = e?.getAttribute) == null ? void 0 : a.call(e, re.MEDIA_CHROME_ATTRIBUTES)) == null ? void 0 : o.split) == null ? void 0 : l.call(o, /\s+/);
  return Array.isArray(r || i) ? (r || i).filter((n) => sU.includes(n)) : [];
}, cU = (e) => {
  var t, a;
  return (t = e.nodeName) != null && t.includes("-") && y.customElements.get((a = e.nodeName) == null ? void 0 : a.toLowerCase()) && !(e instanceof y.customElements.get(e.nodeName.toLowerCase())) && y.customElements.upgrade(e), dU.some((o) => o in e);
}, nx = (e) => cU(e) || !!j_(e).length, G_ = (e) => {
  var t;
  return (t = e?.join) == null ? void 0 : t.call(e, ":");
}, X_ = { [b.MEDIA_SUBTITLES_LIST]: lc, [b.MEDIA_SUBTITLES_SHOWING]: lc, [b.MEDIA_SEEKABLE]: G_, [b.MEDIA_BUFFERED]: (e) => e?.map(G_).join(" "), [b.MEDIA_PREVIEW_COORDS]: (e) => e?.join(" "), [b.MEDIA_RENDITION_LIST]: JT, [b.MEDIA_AUDIO_TRACK_LIST]: $T }, fU = async (e, t, a) => {
  var o, l;
  if (e.isConnected || await jm(0), typeof a == "boolean" || a == null) return K(e, t, a);
  if (typeof a == "number") return Be(e, t, a);
  if (typeof a == "string") return oe(e, t, a);
  if (Array.isArray(a) && !a.length) return e.removeAttribute(t);
  let r = (l = (o = X_[t]) == null ? void 0 : o.call(X_, a)) != null ? l : a;
  return e.setAttribute(t, r);
}, mU = (e) => {
  var t;
  return !!((t = e.closest) != null && t.call(e, '*[slot="media"]'));
}, on = (e, t) => {
  if (mU(e)) return;
  let a = (l, r) => {
    var i, n;
    nx(l) && r(l);
    let { children: u = [] } = l ?? {}, d = (n = (i = l?.shadowRoot) == null ? void 0 : i.children) != null ? n : [];
    [...u, ...d].forEach((h) => on(h, r));
  }, o = e?.nodeName.toLowerCase();
  if (o.includes("-") && !nx(e)) {
    y.customElements.whenDefined(o).then(() => {
      a(e, t);
    });
    return;
  }
  a(e, t);
}, K_ = (e, t, a) => {
  e.forEach((o) => {
    if (t in o) {
      o[t] = a;
      return;
    }
    let l = j_(o), r = t.toLowerCase();
    l.includes(r) && fU(o, r, a);
  });
}, pU = (e, t, a) => {
  on(e, t);
  let o = (c) => {
    var h;
    let s = (h = c?.composedPath()[0]) != null ? h : c.target;
    t(s);
  }, l = (c) => {
    var h;
    let s = (h = c?.composedPath()[0]) != null ? h : c.target;
    a(s);
  };
  e.addEventListener(P.REGISTER_MEDIA_STATE_RECEIVER, o), e.addEventListener(P.UNREGISTER_MEDIA_STATE_RECEIVER, l);
  let r = (c) => {
    c.forEach((h) => {
      let { addedNodes: s = [], removedNodes: f = [], type: v, target: L, attributeName: x } = h;
      v === "childList" ? (Array.prototype.forEach.call(s, (p) => on(p, t)), Array.prototype.forEach.call(f, (p) => on(p, a))) : v === "attributes" && x === re.MEDIA_CHROME_ATTRIBUTES && (nx(L) ? t(L) : a(L));
    });
  }, i = [], n = (c) => {
    let h = c.target;
    h.name !== "media" && (i.forEach((s) => on(s, a)), i = [...h.assignedElements({ flatten: true })], i.forEach((s) => on(s, t)));
  };
  e.addEventListener("slotchange", n);
  let u = new MutationObserver(r);
  return u.observe(e, { childList: true, attributes: true, subtree: true }), () => {
    on(e, a), e.removeEventListener("slotchange", n), u.disconnect(), e.removeEventListener(P.REGISTER_MEDIA_STATE_RECEIVER, o), e.removeEventListener(P.UNREGISTER_MEDIA_STATE_RECEIVER, l);
  };
};
y.customElements.get("media-controller") || y.customElements.define("media-controller", Ep);
var sx = Ep;
var zu = { PLACEMENT: "placement", BOUNDS: "bounds" };
function hU(e) {
  return `
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `;
}
var Vu = class extends y.HTMLElement {
  constructor() {
    if (super(), this.updateXOffset = () => {
      var t;
      if (!lp(this, { checkOpacity: false, checkVisibilityCSS: false })) return;
      let a = this.placement;
      if (a === "left" || a === "right") {
        this.style.removeProperty("--media-tooltip-offset-x");
        return;
      }
      let o = getComputedStyle(this), l = (t = Yr(this, "#" + this.bounds)) != null ? t : c_(this);
      if (!l) return;
      let { x: r, width: i } = l.getBoundingClientRect(), { x: n, width: u } = this.getBoundingClientRect(), d = n + u, c = r + i, h = o.getPropertyValue("--media-tooltip-offset-x"), s = h ? parseFloat(h.replace("px", "")) : 0, f = o.getPropertyValue("--media-tooltip-container-margin"), v = f ? parseFloat(f.replace("px", "")) : 0, L = n - r + s - v, x = d - c + s + v;
      if (L < 0) {
        this.style.setProperty("--media-tooltip-offset-x", `${L}px`);
        return;
      }
      if (x > 0) {
        this.style.setProperty("--media-tooltip-offset-x", `${x}px`);
        return;
      }
      this.style.removeProperty("--media-tooltip-offset-x");
    }, !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
    if (this.arrowEl = this.shadowRoot.querySelector("#arrow"), Object.prototype.hasOwnProperty.call(this, "placement")) {
      let t = this.placement;
      delete this.placement, this.placement = t;
    }
  }
  static get observedAttributes() {
    return [zu.PLACEMENT, zu.BOUNDS];
  }
  get placement() {
    return ie(this, zu.PLACEMENT);
  }
  set placement(t) {
    oe(this, zu.PLACEMENT, t);
  }
  get bounds() {
    return ie(this, zu.BOUNDS);
  }
  set bounds(t) {
    oe(this, zu.BOUNDS, t);
  }
};
Vu.shadowRootOptions = { mode: "open" };
Vu.getTemplateHTML = hU;
y.customElements.get("media-tooltip") || y.customElements.define("media-tooltip", Vu);
var Gu = Vu;
var fx = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, yt = (e, t, a) => (fx(e, t, "read from private field"), a ? a.call(e) : t.get(e)), rn = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Ip = (e, t, a, o) => (fx(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Q_ = (e, t, a) => (fx(e, t, "access private method"), a), Ll, Ku, dx, Z_, ti, Xu, Ap, cx, J_, ei = { TOOLTIP_PLACEMENT: "tooltipplacement", DISABLED: "disabled", NO_TOOLTIP: "notooltip" };
function gU(e, t = {}) {
  return `
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      slot[name="icon"] {
        display: inline-flex;
        align-items: center;
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(e, t)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${Gu.shadowRootOptions.mode}">
          ${Gu.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(e)}
        </slot>
      </media-tooltip>
    </slot>
  `;
}
function vU(e, t) {
  return `
    <slot></slot>
  `;
}
function LU() {
  return "";
}
var Se = class extends y.HTMLElement {
  constructor() {
    if (super(), rn(this, dx), rn(this, cx), rn(this, Ll, void 0), this.preventClick = false, this.tooltipEl = null, rn(this, Ku, (t) => {
      this.preventClick || this.handleClick(t), setTimeout(yt(this, ti), 0);
    }), rn(this, ti, () => {
      var t, a;
      (a = (t = this.tooltipEl) == null ? void 0 : t.updateXOffset) == null || a.call(t);
    }), rn(this, Xu, (t) => {
      let { key: a } = t;
      if (!this.keysUsed.includes(a)) {
        this.removeEventListener("keyup", yt(this, Xu));
        return;
      }
      this.preventClick || this.handleClick(t);
    }), rn(this, Ap, (t) => {
      let { metaKey: a, altKey: o, key: l } = t;
      if (a || o || !this.keysUsed.includes(l)) {
        this.removeEventListener("keyup", yt(this, Xu));
        return;
      }
      this.addEventListener("keyup", yt(this, Xu), { once: true });
    }), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes), a = this.constructor.getTemplateHTML(t);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(a) : this.shadowRoot.innerHTML = a;
    }
    this.tooltipEl = this.shadowRoot.querySelector("media-tooltip");
  }
  static get observedAttributes() {
    return ["disabled", ei.TOOLTIP_PLACEMENT, re.MEDIA_CONTROLLER, b.MEDIA_LANG];
  }
  enable() {
    this.addEventListener("click", yt(this, Ku)), this.addEventListener("keydown", yt(this, Ap)), this.tabIndex = 0;
  }
  disable() {
    this.removeEventListener("click", yt(this, Ku)), this.removeEventListener("keydown", yt(this, Ap)), this.removeEventListener("keyup", yt(this, Xu)), this.tabIndex = -1;
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === re.MEDIA_CONTROLLER ? (a && ((r = (l = yt(this, Ll)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), Ip(this, Ll, null)), o && this.isConnected && (Ip(this, Ll, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = yt(this, Ll)) == null ? void 0 : n.associateElement) == null || u.call(n, this))) : t === "disabled" && o !== a ? o == null ? this.enable() : this.disable() : t === ei.TOOLTIP_PLACEMENT && this.tooltipEl && o !== a ? this.tooltipEl.placement = o : t === b.MEDIA_LANG && (this.shadowRoot.querySelector('slot[name="tooltip-content"]').innerHTML = this.constructor.getTooltipContentHTML()), Q_(this, dx, Z_).call(this) && yt(this, ti).call(this);
  }
  connectedCallback() {
    var t, a, o;
    let { style: l } = ze(this.shadowRoot, ":host");
    l.setProperty("display", `var(--media-control-display, var(--${this.localName}-display, inline-flex))`), this.hasAttribute("disabled") ? this.disable() : this.enable(), this.setAttribute("role", "button");
    let r = this.getAttribute(re.MEDIA_CONTROLLER);
    r && (Ip(this, Ll, (t = this.getRootNode()) == null ? void 0 : t.getElementById(r)), (o = (a = yt(this, Ll)) == null ? void 0 : a.associateElement) == null || o.call(a, this)), y.customElements.whenDefined("media-tooltip").then(() => Q_(this, cx, J_).call(this));
  }
  disconnectedCallback() {
    var t, a;
    this.disable(), (a = (t = yt(this, Ll)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), Ip(this, Ll, null), this.removeEventListener("mouseenter", yt(this, ti)), this.removeEventListener("focus", yt(this, ti)), this.removeEventListener("click", yt(this, Ku));
  }
  get keysUsed() {
    return ["Enter", " "];
  }
  get tooltipPlacement() {
    return ie(this, ei.TOOLTIP_PLACEMENT);
  }
  set tooltipPlacement(t) {
    oe(this, ei.TOOLTIP_PLACEMENT, t);
  }
  get mediaController() {
    return ie(this, re.MEDIA_CONTROLLER);
  }
  set mediaController(t) {
    oe(this, re.MEDIA_CONTROLLER, t);
  }
  get disabled() {
    return X(this, ei.DISABLED);
  }
  set disabled(t) {
    K(this, ei.DISABLED, t);
  }
  get noTooltip() {
    return X(this, ei.NO_TOOLTIP);
  }
  set noTooltip(t) {
    K(this, ei.NO_TOOLTIP, t);
  }
  handleClick(t) {
  }
};
Ll = /* @__PURE__ */ new WeakMap();
Ku = /* @__PURE__ */ new WeakMap();
dx = /* @__PURE__ */ new WeakSet();
Z_ = function() {
  try {
    return this.matches(":hover, :focus-visible");
  } catch {
    return this.matches(":hover, :focus");
  }
};
ti = /* @__PURE__ */ new WeakMap();
Xu = /* @__PURE__ */ new WeakMap();
Ap = /* @__PURE__ */ new WeakMap();
cx = /* @__PURE__ */ new WeakSet();
J_ = function() {
  this.addEventListener("mouseenter", yt(this, ti)), this.addEventListener("focus", yt(this, ti)), this.addEventListener("click", yt(this, Ku));
  let e = this.tooltipPlacement;
  e && this.tooltipEl && (this.tooltipEl.placement = e);
};
Se.shadowRootOptions = { mode: "open" };
Se.getTemplateHTML = gU;
Se.getSlotTemplateHTML = vU;
Se.getTooltipContentHTML = LU;
y.customElements.get("media-chrome-button") || y.customElements.define("media-chrome-button", Se);
var mx = Se;
var $_ = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;
function bU(e) {
  return `
    <style>
      :host([${b.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${b.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${b.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${b.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${$_}</slot>
      <slot name="exit">${$_}</slot>
    </slot>
  `;
}
function xU() {
  return `
    <slot name="tooltip-enter">${U("start airplay")}</slot>
    <slot name="tooltip-exit">${U("stop airplay")}</slot>
  `;
}
var ew = (e) => {
  let t = e.mediaIsAirplaying ? U("stop airplay") : U("start airplay");
  e.setAttribute("aria-label", t);
}, Wu = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_IS_AIRPLAYING, b.MEDIA_AIRPLAY_UNAVAILABLE];
  }
  connectedCallback() {
    super.connectedCallback(), ew(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_IS_AIRPLAYING && ew(this);
  }
  get mediaIsAirplaying() {
    return X(this, b.MEDIA_IS_AIRPLAYING);
  }
  set mediaIsAirplaying(t) {
    K(this, b.MEDIA_IS_AIRPLAYING, t);
  }
  get mediaAirplayUnavailable() {
    return ie(this, b.MEDIA_AIRPLAY_UNAVAILABLE);
  }
  set mediaAirplayUnavailable(t) {
    oe(this, b.MEDIA_AIRPLAY_UNAVAILABLE, t);
  }
  handleClick() {
    let t = new y.CustomEvent(P.MEDIA_AIRPLAY_REQUEST, { composed: true, bubbles: true });
    this.dispatchEvent(t);
  }
};
Wu.getSlotTemplateHTML = bU;
Wu.getTooltipContentHTML = xU;
y.customElements.get("media-airplay-button") || y.customElements.define("media-airplay-button", Wu);
var px = Wu;
var SU = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`, CU = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;
function yU(e) {
  return `
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${SU}</slot>
      <slot name="off">${CU}</slot>
    </slot>
  `;
}
function EU() {
  return `
    <slot name="tooltip-enable">${U("Enable captions")}</slot>
    <slot name="tooltip-disable">${U("Disable captions")}</slot>
  `;
}
var tw = (e) => {
  e.setAttribute("aria-checked", T_(e).toString());
}, Yu = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_SUBTITLES_LIST, b.MEDIA_SUBTITLES_SHOWING];
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("role", "button"), this.setAttribute("aria-label", U("closed captions")), tw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_SUBTITLES_SHOWING && tw(this);
  }
  get mediaSubtitlesList() {
    return aw(this, b.MEDIA_SUBTITLES_LIST);
  }
  set mediaSubtitlesList(t) {
    ow(this, b.MEDIA_SUBTITLES_LIST, t);
  }
  get mediaSubtitlesShowing() {
    return aw(this, b.MEDIA_SUBTITLES_SHOWING);
  }
  set mediaSubtitlesShowing(t) {
    ow(this, b.MEDIA_SUBTITLES_SHOWING, t);
  }
  handleClick() {
    this.dispatchEvent(new y.CustomEvent(P.MEDIA_TOGGLE_SUBTITLES_REQUEST, { composed: true, bubbles: true }));
  }
};
Yu.getSlotTemplateHTML = yU;
Yu.getTooltipContentHTML = EU;
var aw = (e, t) => {
  let a = e.getAttribute(t);
  return a ? Jb(a) : [];
}, ow = (e, t, a) => {
  if (!a?.length) {
    e.removeAttribute(t);
    return;
  }
  let o = lc(a);
  e.getAttribute(t) !== o && e.setAttribute(t, o);
};
y.customElements.get("media-captions-button") || y.customElements.define("media-captions-button", Yu);
var hx = Yu;
var IU = '<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>', AU = '<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>';
function TU(e) {
  return `
    <style>
      :host([${b.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${b.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${b.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${b.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${IU}</slot>
      <slot name="exit">${AU}</slot>
    </slot>
  `;
}
function _U() {
  return `
    <slot name="tooltip-enter">${U("Start casting")}</slot>
    <slot name="tooltip-exit">${U("Stop casting")}</slot>
  `;
}
var lw = (e) => {
  let t = e.mediaIsCasting ? U("stop casting") : U("start casting");
  e.setAttribute("aria-label", t);
}, ju = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_IS_CASTING, b.MEDIA_CAST_UNAVAILABLE];
  }
  connectedCallback() {
    super.connectedCallback(), lw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_IS_CASTING && lw(this);
  }
  get mediaIsCasting() {
    return X(this, b.MEDIA_IS_CASTING);
  }
  set mediaIsCasting(t) {
    K(this, b.MEDIA_IS_CASTING, t);
  }
  get mediaCastUnavailable() {
    return ie(this, b.MEDIA_CAST_UNAVAILABLE);
  }
  set mediaCastUnavailable(t) {
    oe(this, b.MEDIA_CAST_UNAVAILABLE, t);
  }
  handleClick() {
    let t = this.mediaIsCasting ? P.MEDIA_EXIT_CAST_REQUEST : P.MEDIA_ENTER_CAST_REQUEST;
    this.dispatchEvent(new y.CustomEvent(t, { composed: true, bubbles: true }));
  }
};
ju.getSlotTemplateHTML = TU;
ju.getTooltipContentHTML = _U;
y.customElements.get("media-cast-button") || y.customElements.define("media-cast-button", ju);
var gx = ju;
var yx = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, it = (e, t, a) => (yx(e, t, "read from private field"), a ? a.call(e) : t.get(e)), oa = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, ai = (e, t, a, o) => (yx(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Vo = (e, t, a) => (yx(e, t, "access private method"), a), bl, Up, Tp, _p, Go, Op, wp, Mp, Rp, Ex, rw, kp, vx, Dp, Lx, Pp, Ix, bx, iw, xx, nw, Sx, uw, Cx, sw;
function wU(e) {
  return `
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, 0);
        height: var(--media-time-range-hover-height, max(100% , 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, 0);
          height: var(--media-time-range-hover-height, max(100%, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }

      /* Visible label for accessibility - positioned off-screen but technically visible (Firefox requires visible labels) */
      #range-label {
        position: absolute;
        left: -10000px;
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        pointer-events: none;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments" aria-hidden="true"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
        <input id="range" type="range" min="0" max="1" step="any" value="0">
        <label for="range" id="range-label"></label>

      ${this.getContainerTemplateHTML(e)}
    </div>
    <div id="rightgap"></div>
  `;
}
function MU(e) {
  return "";
}
var Xo = class extends y.HTMLElement {
  constructor() {
    if (super(), oa(this, Ex), oa(this, kp), oa(this, Dp), oa(this, Pp), oa(this, bx), oa(this, xx), oa(this, Sx), oa(this, Cx), oa(this, bl, void 0), oa(this, Up, void 0), oa(this, Tp, void 0), oa(this, _p, void 0), oa(this, Go, {}), oa(this, Op, []), oa(this, wp, () => {
      if (this.range.matches(":focus-visible")) {
        let { style: t } = ze(this.shadowRoot, ":host");
        t.setProperty("--_focus-visible-box-shadow", "var(--_focus-box-shadow)");
      }
    }), oa(this, Mp, () => {
      let { style: t } = ze(this.shadowRoot, ":host");
      t.removeProperty("--_focus-visible-box-shadow");
    }), oa(this, Rp, () => {
      let t = this.shadowRoot.querySelector("#segments-clipping");
      t && t.parentNode.append(t);
    }), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes), a = this.constructor.getTemplateHTML(t);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(a) : this.shadowRoot.innerHTML = a;
    }
    this.container = this.shadowRoot.querySelector("#container"), ai(this, Tp, this.shadowRoot.querySelector("#startpoint")), ai(this, _p, this.shadowRoot.querySelector("#endpoint")), this.range = this.shadowRoot.querySelector("#range"), this.appearance = this.shadowRoot.querySelector("#appearance");
  }
  static get observedAttributes() {
    return ["disabled", "aria-disabled", re.MEDIA_CONTROLLER];
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === re.MEDIA_CONTROLLER ? (a && ((r = (l = it(this, bl)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), ai(this, bl, null)), o && this.isConnected && (ai(this, bl, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = it(this, bl)) == null ? void 0 : n.associateElement) == null || u.call(n, this))) : (t === "disabled" || t === "aria-disabled" && a !== o) && (o == null ? (this.range.removeAttribute(t), Vo(this, kp, vx).call(this)) : (this.range.setAttribute(t, o), Vo(this, Dp, Lx).call(this)));
  }
  connectedCallback() {
    var t, a, o;
    let { style: l } = ze(this.shadowRoot, ":host");
    l.setProperty("display", `var(--media-control-display, var(--${this.localName}-display, inline-flex))`), it(this, Go).pointer = ze(this.shadowRoot, "#pointer"), it(this, Go).progress = ze(this.shadowRoot, "#progress"), it(this, Go).thumb = ze(this.shadowRoot, '#thumb, ::slotted([slot="thumb"])'), it(this, Go).activeSegment = ze(this.shadowRoot, "#segments-clipping rect:nth-child(0)");
    let r = this.getAttribute(re.MEDIA_CONTROLLER);
    r && (ai(this, bl, (t = this.getRootNode()) == null ? void 0 : t.getElementById(r)), (o = (a = it(this, bl)) == null ? void 0 : a.associateElement) == null || o.call(a, this)), this.updateBar(), this.shadowRoot.addEventListener("focusin", it(this, wp)), this.shadowRoot.addEventListener("focusout", it(this, Mp)), Vo(this, kp, vx).call(this), ep(this.container, it(this, Rp));
  }
  disconnectedCallback() {
    var t, a;
    Vo(this, Dp, Lx).call(this), (a = (t = it(this, bl)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), ai(this, bl, null), this.shadowRoot.removeEventListener("focusin", it(this, wp)), this.shadowRoot.removeEventListener("focusout", it(this, Mp)), tp(this.container, it(this, Rp));
  }
  updatePointerBar(t) {
    var a;
    (a = it(this, Go).pointer) == null || a.style.setProperty("width", `${this.getPointerRatio(t) * 100}%`);
  }
  updateBar() {
    var t, a;
    let o = this.range.valueAsNumber * 100;
    (t = it(this, Go).progress) == null || t.style.setProperty("width", `${o}%`), (a = it(this, Go).thumb) == null || a.style.setProperty("left", `${o}%`);
  }
  updateSegments(t) {
    let a = this.shadowRoot.querySelector("#segments-clipping");
    if (a.textContent = "", this.container.classList.toggle("segments", !!t?.length), !t?.length) return;
    let o = [.../* @__PURE__ */ new Set([+this.range.min, ...t.flatMap((r) => [r.start, r.end]), +this.range.max])];
    ai(this, Op, [...o]);
    let l = o.pop();
    for (let [r, i] of o.entries()) {
      let [n, u] = [r === 0, r === o.length - 1], d = n ? "calc(var(--segments-gap) / -1)" : `${i * 100}%`, h = `calc(${((u ? l : o[r + 1]) - i) * 100}%${n || u ? "" : " - var(--segments-gap)"})`, s = Ct.createElementNS("http://www.w3.org/2000/svg", "rect"), f = Pb(this.shadowRoot, `#segments-clipping rect:nth-child(${r + 1})`);
      f.style.setProperty("x", d), f.style.setProperty("width", h), a.append(s);
    }
  }
  getPointerRatio(t) {
    return f_(t.clientX, t.clientY, it(this, Tp).getBoundingClientRect(), it(this, _p).getBoundingClientRect());
  }
  get dragging() {
    return this.hasAttribute("dragging");
  }
  handleEvent(t) {
    switch (t.type) {
      case "pointermove":
        Vo(this, Cx, sw).call(this, t);
        break;
      case "input":
        this.updateBar();
        break;
      case "pointerenter":
        Vo(this, bx, iw).call(this, t);
        break;
      case "pointerdown":
        Vo(this, Pp, Ix).call(this, t);
        break;
      case "pointerup":
        Vo(this, xx, nw).call(this);
        break;
      case "pointerleave":
        Vo(this, Sx, uw).call(this);
        break;
    }
  }
  get keysUsed() {
    return ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  }
};
bl = /* @__PURE__ */ new WeakMap();
Up = /* @__PURE__ */ new WeakMap();
Tp = /* @__PURE__ */ new WeakMap();
_p = /* @__PURE__ */ new WeakMap();
Go = /* @__PURE__ */ new WeakMap();
Op = /* @__PURE__ */ new WeakMap();
wp = /* @__PURE__ */ new WeakMap();
Mp = /* @__PURE__ */ new WeakMap();
Rp = /* @__PURE__ */ new WeakMap();
Ex = /* @__PURE__ */ new WeakSet();
rw = function(e) {
  let t = it(this, Go).activeSegment;
  if (!t) return;
  let a = this.getPointerRatio(e), l = `#segments-clipping rect:nth-child(${it(this, Op).findIndex((r, i, n) => {
    let u = n[i + 1];
    return u != null && a >= r && a <= u;
  }) + 1})`;
  (t.selectorText != l || !t.style.transform) && (t.selectorText = l, t.style.setProperty("transform", "var(--media-range-segment-hover-transform, scaleY(2))"));
};
kp = /* @__PURE__ */ new WeakSet();
vx = function() {
  this.hasAttribute("disabled") || !this.isConnected || (this.addEventListener("input", this), this.addEventListener("pointerdown", this), this.addEventListener("pointerenter", this));
};
Dp = /* @__PURE__ */ new WeakSet();
Lx = function() {
  var e, t;
  this.removeEventListener("input", this), this.removeEventListener("pointerdown", this), this.removeEventListener("pointerenter", this), this.removeEventListener("pointerleave", this), (e = y.window) == null || e.removeEventListener("pointerup", this), (t = y.window) == null || t.removeEventListener("pointermove", this);
};
Pp = /* @__PURE__ */ new WeakSet();
Ix = function(e) {
  var t;
  ai(this, Up, e.composedPath().includes(this.range)), (t = y.window) == null || t.addEventListener("pointerup", this, { once: true });
};
bx = /* @__PURE__ */ new WeakSet();
iw = function(e) {
  var t;
  e.pointerType !== "mouse" && Vo(this, Pp, Ix).call(this, e), this.addEventListener("pointerleave", this, { once: true }), (t = y.window) == null || t.addEventListener("pointermove", this);
};
xx = /* @__PURE__ */ new WeakSet();
nw = function() {
  var e;
  (e = y.window) == null || e.removeEventListener("pointerup", this), this.toggleAttribute("dragging", false), this.range.disabled = this.hasAttribute("disabled");
};
Sx = /* @__PURE__ */ new WeakSet();
uw = function() {
  var e, t;
  this.removeEventListener("pointerleave", this), (e = y.window) == null || e.removeEventListener("pointermove", this), this.toggleAttribute("dragging", false), this.range.disabled = this.hasAttribute("disabled"), (t = it(this, Go).activeSegment) == null || t.style.removeProperty("transform");
};
Cx = /* @__PURE__ */ new WeakSet();
sw = function(e) {
  e.pointerType === "pen" && e.buttons === 0 || (this.toggleAttribute("dragging", e.buttons === 1 || e.pointerType !== "mouse"), this.updatePointerBar(e), Vo(this, Ex, rw).call(this, e), this.dragging && (e.pointerType !== "mouse" || !it(this, Up)) && (this.range.disabled = true, this.range.valueAsNumber = this.getPointerRatio(e), this.range.dispatchEvent(new Event("input", { bubbles: true, composed: true }))));
};
Xo.shadowRootOptions = { mode: "open" };
Xo.getTemplateHTML = wU;
Xo.getContainerTemplateHTML = MU;
y.customElements.get("media-chrome-range") || y.customElements.define("media-chrome-range", Xo);
var Ax = Xo;
var dw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Bp = (e, t, a) => (dw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), RU = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Np = (e, t, a, o) => (dw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), xl;
function kU(e) {
  return `
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `;
}
var Qu = class extends y.HTMLElement {
  constructor() {
    if (super(), RU(this, xl, void 0), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
  }
  static get observedAttributes() {
    return [re.MEDIA_CONTROLLER];
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === re.MEDIA_CONTROLLER && (a && ((r = (l = Bp(this, xl)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), Np(this, xl, null)), o && this.isConnected && (Np(this, xl, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = Bp(this, xl)) == null ? void 0 : n.associateElement) == null || u.call(n, this)));
  }
  connectedCallback() {
    var t, a, o;
    let l = this.getAttribute(re.MEDIA_CONTROLLER);
    l && (Np(this, xl, (t = this.getRootNode()) == null ? void 0 : t.getElementById(l)), (o = (a = Bp(this, xl)) == null ? void 0 : a.associateElement) == null || o.call(a, this));
  }
  disconnectedCallback() {
    var t, a;
    (a = (t = Bp(this, xl)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), Np(this, xl, null);
  }
};
xl = /* @__PURE__ */ new WeakMap();
Qu.shadowRootOptions = { mode: "open" };
Qu.getTemplateHTML = kU;
y.customElements.get("media-control-bar") || y.customElements.define("media-control-bar", Qu);
var Tx = Qu;
var cw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Hp = (e, t, a) => (cw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), DU = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, qp = (e, t, a, o) => (cw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Sl;
function OU(e, t = {}) {
  return `
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(e, t)}
  `;
}
function PU(e, t) {
  return `
    <slot></slot>
  `;
}
var xa = class extends y.HTMLElement {
  constructor() {
    if (super(), DU(this, Sl, void 0), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
  }
  static get observedAttributes() {
    return [re.MEDIA_CONTROLLER];
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === re.MEDIA_CONTROLLER && (a && ((r = (l = Hp(this, Sl)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), qp(this, Sl, null)), o && this.isConnected && (qp(this, Sl, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = Hp(this, Sl)) == null ? void 0 : n.associateElement) == null || u.call(n, this)));
  }
  connectedCallback() {
    var t, a, o;
    let { style: l } = ze(this.shadowRoot, ":host");
    l.setProperty("display", `var(--media-control-display, var(--${this.localName}-display, inline-flex))`);
    let r = this.getAttribute(re.MEDIA_CONTROLLER);
    r && (qp(this, Sl, (t = this.getRootNode()) == null ? void 0 : t.getElementById(r)), (o = (a = Hp(this, Sl)) == null ? void 0 : a.associateElement) == null || o.call(a, this));
  }
  disconnectedCallback() {
    var t, a;
    (a = (t = Hp(this, Sl)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), qp(this, Sl, null);
  }
};
Sl = /* @__PURE__ */ new WeakMap();
xa.shadowRootOptions = { mode: "open" };
xa.getTemplateHTML = OU;
xa.getSlotTemplateHTML = PU;
y.customElements.get("media-text-display") || y.customElements.define("media-text-display", xa);
var _x = xa;
var mw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, fw = (e, t, a) => (mw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), UU = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, BU = (e, t, a, o) => (mw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), dc;
function NU(e, t) {
  return `
    <slot>${Bo(t.mediaDuration)}</slot>
  `;
}
var cc = class extends xa {
  constructor() {
    var t;
    super(), UU(this, dc, void 0), BU(this, dc, this.shadowRoot.querySelector("slot")), fw(this, dc).textContent = Bo((t = this.mediaDuration) != null ? t : 0);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_DURATION];
  }
  attributeChangedCallback(t, a, o) {
    t === b.MEDIA_DURATION && (fw(this, dc).textContent = Bo(+o)), super.attributeChangedCallback(t, a, o);
  }
  get mediaDuration() {
    return xe(this, b.MEDIA_DURATION);
  }
  set mediaDuration(t) {
    Be(this, b.MEDIA_DURATION, t);
  }
};
dc = /* @__PURE__ */ new WeakMap();
cc.getSlotTemplateHTML = NU;
y.customElements.get("media-duration-display") || y.customElements.define("media-duration-display", cc);
var wx = cc;
var HU = { 2: U("Network Error"), 3: U("Decode Error"), 4: U("Source Not Supported"), 5: U("Encryption Error") }, qU = { 2: U("A network error caused the media download to fail."), 3: U("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."), 4: U("An unsupported error occurred. The server or network failed, or your browser does not support this format."), 5: U("The media is encrypted and there are no keys to decrypt it.") }, Fp = (e) => {
  var t, a;
  return e.code === 1 ? null : { title: (t = HU[e.code]) != null ? t : `Error ${e.code}`, message: (a = qU[e.code]) != null ? a : e.message };
};
var hw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, FU = (e, t, a) => (hw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), zU = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, VU = (e, t, a, o) => (hw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), zp;
function GU(e) {
  let t = +e.mediaerrorcode;
  return `
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${t}" id="content">
      ${gw({ code: t, message: e.mediaerrormessage })}
    </slot>
  `;
}
function XU(e) {
  return e.code && Fp(e) !== null;
}
function gw(e) {
  var t;
  let { title: a, message: o } = (t = Fp(e)) != null ? t : {}, l = Qm(e.code), r = "";
  return a && (r += `<slot name="error-${l}-title"><h3>${Qm(a)}</h3></slot>`), o && (r += `<slot name="error-${l}-message"><p>${Qm(o)}</p></slot>`), r;
}
var pw = [b.MEDIA_ERROR_CODE, b.MEDIA_ERROR_MESSAGE], Zu = class extends Fo {
  constructor() {
    super(...arguments), zU(this, zp, null);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, ...pw];
  }
  formatErrorMessage(t) {
    return this.constructor.formatErrorMessage(t);
  }
  attributeChangedCallback(t, a, o) {
    var l;
    if (super.attributeChangedCallback(t, a, o), !pw.includes(t)) return;
    let r = (l = this.mediaError) != null ? l : { code: this.mediaErrorCode, message: this.mediaErrorMessage };
    if (this.open = XU(r), this.open && (this.shadowRoot.querySelector("slot").name = `error-${this.mediaErrorCode}`, this.shadowRoot.querySelector("#content").innerHTML = this.formatErrorMessage(r), !this.hasAttribute("aria-label"))) {
      let { title: i } = Fp(r);
      i && this.setAttribute("aria-label", i);
    }
  }
  get mediaError() {
    return FU(this, zp);
  }
  set mediaError(t) {
    VU(this, zp, t);
  }
  get mediaErrorCode() {
    return xe(this, "mediaerrorcode");
  }
  set mediaErrorCode(t) {
    Be(this, "mediaerrorcode", t);
  }
  get mediaErrorMessage() {
    return ie(this, "mediaerrormessage");
  }
  set mediaErrorMessage(t) {
    oe(this, "mediaerrormessage", t);
  }
};
zp = /* @__PURE__ */ new WeakMap();
Zu.getSlotTemplateHTML = GU;
Zu.formatErrorMessage = gw;
y.customElements.get("media-error-dialog") || y.customElements.define("media-error-dialog", Zu);
var Mx = Zu;
var Lw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, KU = (e, t, a) => (Lw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), WU = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, YU = (e, t, a, o) => (Lw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Vp, jU = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`, QU = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;
function ZU(e) {
  return `
    <style>
      :host([${b.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${b.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${b.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${b.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${jU}</slot>
      <slot name="exit">${QU}</slot>
    </slot>
  `;
}
function JU() {
  return `
    <slot name="tooltip-enter">${U("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${U("Exit fullscreen mode")}</slot>
  `;
}
var vw = (e) => {
  let t = e.mediaIsFullscreen ? U("exit fullscreen mode") : U("enter fullscreen mode");
  e.setAttribute("aria-label", t);
}, Ju = class extends Se {
  constructor() {
    super(...arguments), WU(this, Vp, null);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_IS_FULLSCREEN, b.MEDIA_FULLSCREEN_UNAVAILABLE];
  }
  connectedCallback() {
    super.connectedCallback(), vw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_IS_FULLSCREEN && vw(this);
  }
  get mediaFullscreenUnavailable() {
    return ie(this, b.MEDIA_FULLSCREEN_UNAVAILABLE);
  }
  set mediaFullscreenUnavailable(t) {
    oe(this, b.MEDIA_FULLSCREEN_UNAVAILABLE, t);
  }
  get mediaIsFullscreen() {
    return X(this, b.MEDIA_IS_FULLSCREEN);
  }
  set mediaIsFullscreen(t) {
    K(this, b.MEDIA_IS_FULLSCREEN, t);
  }
  handleClick(t) {
    YU(this, Vp, t);
    let a = KU(this, Vp) instanceof PointerEvent, o = this.mediaIsFullscreen ? new y.CustomEvent(P.MEDIA_EXIT_FULLSCREEN_REQUEST, { composed: true, bubbles: true }) : new y.CustomEvent(P.MEDIA_ENTER_FULLSCREEN_REQUEST, { composed: true, bubbles: true, detail: a });
    this.dispatchEvent(o);
  }
};
Vp = /* @__PURE__ */ new WeakMap();
Ju.getSlotTemplateHTML = ZU;
Ju.getTooltipContentHTML = JU;
y.customElements.get("media-fullscreen-button") || y.customElements.define("media-fullscreen-button", Ju);
var Rx = Ju;
var { MEDIA_TIME_IS_LIVE: Gp, MEDIA_PAUSED: fc } = b, { MEDIA_SEEK_TO_LIVE_REQUEST: $U, MEDIA_PLAY_REQUEST: eB } = P, tB = '<svg viewBox="0 0 6 12" aria-hidden="true"><circle cx="3" cy="6" r="2"></circle></svg>';
function aB(e) {
  return `
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${Gp}]:not([${fc}])) slot[name=indicator] > *,
      :host([${Gp}]:not([${fc}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${Gp}]:not([${fc}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${tB}</slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${U("live")}</slot>
  `;
}
var bw = (e) => {
  var t;
  let a = e.mediaPaused || !e.mediaTimeIsLive, o = a ? U("seek to live") : U("playing live");
  e.setAttribute("aria-label", o);
  let l = (t = e.shadowRoot) == null ? void 0 : t.querySelector('slot[name="text"]');
  l && (l.textContent = U("live")), a ? e.removeAttribute("aria-disabled") : e.setAttribute("aria-disabled", "true");
}, mc = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, Gp, fc];
  }
  connectedCallback() {
    super.connectedCallback(), bw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), bw(this);
  }
  get mediaPaused() {
    return X(this, b.MEDIA_PAUSED);
  }
  set mediaPaused(t) {
    K(this, b.MEDIA_PAUSED, t);
  }
  get mediaTimeIsLive() {
    return X(this, b.MEDIA_TIME_IS_LIVE);
  }
  set mediaTimeIsLive(t) {
    K(this, b.MEDIA_TIME_IS_LIVE, t);
  }
  handleClick() {
    !this.mediaPaused && this.mediaTimeIsLive || (this.dispatchEvent(new y.CustomEvent($U, { composed: true, bubbles: true })), this.hasAttribute(fc) && this.dispatchEvent(new y.CustomEvent(eB, { composed: true, bubbles: true })));
  }
};
mc.getSlotTemplateHTML = aB;
y.customElements.get("media-live-button") || y.customElements.define("media-live-button", mc);
var kx = mc;
var Sw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, pc = (e, t, a) => (Sw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), xw = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, hc = (e, t, a, o) => (Sw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Cl, Kp, Xp = { LOADING_DELAY: "loadingdelay", NO_AUTOHIDE: "noautohide" }, Cw = 500, oB = `
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;
function lB(e) {
  return `
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${Cw}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${b.MEDIA_LOADING}]:not([${b.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${b.MEDIA_LOADING}]:not([${b.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${b.MEDIA_LOADING}]:not([${b.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${oB}</slot>
    <div id="status" role="status" aria-live="polite">${U("media loading")}</div>
  `;
}
var $u = class extends y.HTMLElement {
  constructor() {
    if (super(), xw(this, Cl, void 0), xw(this, Kp, Cw), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
  }
  static get observedAttributes() {
    return [re.MEDIA_CONTROLLER, b.MEDIA_PAUSED, b.MEDIA_LOADING, Xp.LOADING_DELAY];
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    t === Xp.LOADING_DELAY && a !== o ? this.loadingDelay = Number(o) : t === re.MEDIA_CONTROLLER && (a && ((r = (l = pc(this, Cl)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), hc(this, Cl, null)), o && this.isConnected && (hc(this, Cl, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = pc(this, Cl)) == null ? void 0 : n.associateElement) == null || u.call(n, this)));
  }
  connectedCallback() {
    var t, a, o;
    let l = this.getAttribute(re.MEDIA_CONTROLLER);
    l && (hc(this, Cl, (t = this.getRootNode()) == null ? void 0 : t.getElementById(l)), (o = (a = pc(this, Cl)) == null ? void 0 : a.associateElement) == null || o.call(a, this));
  }
  disconnectedCallback() {
    var t, a;
    (a = (t = pc(this, Cl)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), hc(this, Cl, null);
  }
  get loadingDelay() {
    return pc(this, Kp);
  }
  set loadingDelay(t) {
    hc(this, Kp, t);
    let { style: a } = ze(this.shadowRoot, ":host");
    a.setProperty("--_loading-indicator-delay", `var(--media-loading-indicator-transition-delay, ${t}ms)`);
  }
  get mediaPaused() {
    return X(this, b.MEDIA_PAUSED);
  }
  set mediaPaused(t) {
    K(this, b.MEDIA_PAUSED, t);
  }
  get mediaLoading() {
    return X(this, b.MEDIA_LOADING);
  }
  set mediaLoading(t) {
    K(this, b.MEDIA_LOADING, t);
  }
  get mediaController() {
    return ie(this, re.MEDIA_CONTROLLER);
  }
  set mediaController(t) {
    oe(this, re.MEDIA_CONTROLLER, t);
  }
  get noAutohide() {
    return X(this, Xp.NO_AUTOHIDE);
  }
  set noAutohide(t) {
    K(this, Xp.NO_AUTOHIDE, t);
  }
};
Cl = /* @__PURE__ */ new WeakMap();
Kp = /* @__PURE__ */ new WeakMap();
$u.shadowRootOptions = { mode: "open" };
$u.getTemplateHTML = lB;
y.customElements.get("media-loading-indicator") || y.customElements.define("media-loading-indicator", $u);
var Dx = $u;
var rB = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`, yw = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`, iB = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;
function nB(e) {
  return `
    <style>
      :host(:not([${b.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${b.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${b.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${b.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${b.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${b.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${b.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${rB}</slot>
      <slot name="low">${yw}</slot>
      <slot name="medium">${yw}</slot>
      <slot name="high">${iB}</slot>
    </slot>
  `;
}
function uB() {
  return `
    <slot name="tooltip-mute">${U("Mute")}</slot>
    <slot name="tooltip-unmute">${U("Unmute")}</slot>
  `;
}
var Ew = (e) => {
  let a = e.mediaVolumeLevel === "off" ? U("unmute") : U("mute");
  e.setAttribute("aria-label", a);
}, es = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_VOLUME_LEVEL];
  }
  connectedCallback() {
    super.connectedCallback(), Ew(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_VOLUME_LEVEL && Ew(this);
  }
  get mediaVolumeLevel() {
    return ie(this, b.MEDIA_VOLUME_LEVEL);
  }
  set mediaVolumeLevel(t) {
    oe(this, b.MEDIA_VOLUME_LEVEL, t);
  }
  handleClick() {
    let t = this.mediaVolumeLevel === "off" ? P.MEDIA_UNMUTE_REQUEST : P.MEDIA_MUTE_REQUEST;
    this.dispatchEvent(new y.CustomEvent(t, { composed: true, bubbles: true }));
  }
};
es.getSlotTemplateHTML = nB;
es.getTooltipContentHTML = uB;
y.customElements.get("media-mute-button") || y.customElements.define("media-mute-button", es);
var Ox = es;
var Iw = `<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;
function sB(e) {
  return `
    <style>
      :host([${b.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${b.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${b.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${b.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Iw}</slot>
      <slot name="exit">${Iw}</slot>
    </slot>
  `;
}
function dB() {
  return `
    <slot name="tooltip-enter">${U("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${U("Exit picture in picture mode")}</slot>
  `;
}
var Aw = (e) => {
  let t = e.mediaIsPip ? U("exit picture in picture mode") : U("enter picture in picture mode");
  e.setAttribute("aria-label", t);
}, ts = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_IS_PIP, b.MEDIA_PIP_UNAVAILABLE];
  }
  connectedCallback() {
    super.connectedCallback(), Aw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_IS_PIP && Aw(this);
  }
  get mediaPipUnavailable() {
    return ie(this, b.MEDIA_PIP_UNAVAILABLE);
  }
  set mediaPipUnavailable(t) {
    oe(this, b.MEDIA_PIP_UNAVAILABLE, t);
  }
  get mediaIsPip() {
    return X(this, b.MEDIA_IS_PIP);
  }
  set mediaIsPip(t) {
    K(this, b.MEDIA_IS_PIP, t);
  }
  handleClick() {
    let t = this.mediaIsPip ? P.MEDIA_EXIT_PIP_REQUEST : P.MEDIA_ENTER_PIP_REQUEST;
    this.dispatchEvent(new y.CustomEvent(t, { composed: true, bubbles: true }));
  }
};
ts.getSlotTemplateHTML = sB;
ts.getTooltipContentHTML = dB;
y.customElements.get("media-pip-button") || y.customElements.define("media-pip-button", ts);
var Px = ts;
var cB = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, as = (e, t, a) => (cB(e, t, "read from private field"), a ? a.call(e) : t.get(e)), fB = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, oi, Ux = { RATES: "rates" }, mB = [1, 1.2, 1.5, 1.7, 2], gc = 1;
function Bx(e) {
  return Math.round(e * 100) / 100;
}
function pB(e) {
  return `
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate ? Bx(+e.mediaplaybackrate) : gc}x</slot>
  `;
}
function hB() {
  return U("Playback rate");
}
var os = class extends Se {
  constructor() {
    var t;
    super(), fB(this, oi, new Hu(this, Ux.RATES, { defaultValue: mB })), this.container = this.shadowRoot.querySelector('slot[name="icon"]'), this.container.innerHTML = `${Bx((t = this.mediaPlaybackRate) != null ? t : gc)}x`;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_PLAYBACK_RATE, Ux.RATES];
  }
  attributeChangedCallback(t, a, o) {
    if (super.attributeChangedCallback(t, a, o), t === Ux.RATES && (as(this, oi).value = o), t === b.MEDIA_PLAYBACK_RATE) {
      let l = o ? +o : Number.NaN, r = Bx(Number.isNaN(l) ? gc : l);
      this.container.innerHTML = `${r}x`, this.setAttribute("aria-label", U("Playback rate {playbackRate}", { playbackRate: r }));
    }
  }
  get rates() {
    return as(this, oi);
  }
  set rates(t) {
    t ? Array.isArray(t) ? as(this, oi).value = t.join(" ") : typeof t == "string" && (as(this, oi).value = t) : as(this, oi).value = "";
  }
  get mediaPlaybackRate() {
    return xe(this, b.MEDIA_PLAYBACK_RATE, gc);
  }
  set mediaPlaybackRate(t) {
    Be(this, b.MEDIA_PLAYBACK_RATE, t);
  }
  handleClick() {
    var t, a;
    let o = Array.from(as(this, oi).values(), (i) => +i).sort((i, n) => i - n), l = (a = (t = o.find((i) => i > this.mediaPlaybackRate)) != null ? t : o[0]) != null ? a : gc, r = new y.CustomEvent(P.MEDIA_PLAYBACK_RATE_REQUEST, { composed: true, bubbles: true, detail: l });
    this.dispatchEvent(r);
  }
};
oi = /* @__PURE__ */ new WeakMap();
os.getSlotTemplateHTML = pB;
os.getTooltipContentHTML = hB;
y.customElements.get("media-playback-rate-button") || y.customElements.define("media-playback-rate-button", os);
var Nx = os;
var gB = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`, vB = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;
function LB(e) {
  return `
    <style>
      :host([${b.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${b.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${b.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${b.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${gB}</slot>
      <slot name="pause">${vB}</slot>
    </slot>
  `;
}
function bB() {
  return `
    <slot name="tooltip-play">${U("Play")}</slot>
    <slot name="tooltip-pause">${U("Pause")}</slot>
  `;
}
var Tw = (e) => {
  let t = e.mediaPaused ? U("play") : U("pause");
  e.setAttribute("aria-label", t);
}, ls = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_PAUSED, b.MEDIA_ENDED];
  }
  connectedCallback() {
    super.connectedCallback(), Tw(this);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), (t === b.MEDIA_PAUSED || t === b.MEDIA_LANG) && Tw(this);
  }
  get mediaPaused() {
    return X(this, b.MEDIA_PAUSED);
  }
  set mediaPaused(t) {
    K(this, b.MEDIA_PAUSED, t);
  }
  handleClick() {
    let t = this.mediaPaused ? P.MEDIA_PLAY_REQUEST : P.MEDIA_PAUSE_REQUEST;
    this.dispatchEvent(new y.CustomEvent(t, { composed: true, bubbles: true }));
  }
};
ls.getSlotTemplateHTML = LB;
ls.getTooltipContentHTML = bB;
y.customElements.get("media-play-button") || y.customElements.define("media-play-button", ls);
var Hx = ls;
var yl = { PLACEHOLDER_SRC: "placeholdersrc", SRC: "src" };
function xB(e) {
  return `
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `;
}
var SB = (e) => {
  e.style.removeProperty("background-image");
}, CB = (e, t) => {
  e.style["background-image"] = `url('${t}')`;
}, rs = class extends y.HTMLElement {
  static get observedAttributes() {
    return [yl.PLACEHOLDER_SRC, yl.SRC];
  }
  constructor() {
    if (super(), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
    this.image = this.shadowRoot.querySelector("#image");
  }
  attributeChangedCallback(t, a, o) {
    t === yl.SRC && (o == null ? this.image.removeAttribute(yl.SRC) : this.image.setAttribute(yl.SRC, o)), t === yl.PLACEHOLDER_SRC && (o == null ? SB(this.image) : CB(this.image, o));
  }
  get placeholderSrc() {
    return ie(this, yl.PLACEHOLDER_SRC);
  }
  set placeholderSrc(t) {
    oe(this, yl.SRC, t);
  }
  get src() {
    return ie(this, yl.SRC);
  }
  set src(t) {
    oe(this, yl.SRC, t);
  }
};
rs.shadowRootOptions = { mode: "open" };
rs.getTemplateHTML = xB;
y.customElements.get("media-poster-image") || y.customElements.define("media-poster-image", rs);
var qx = rs;
var _w = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, yB = (e, t, a) => (_w(e, t, "read from private field"), a ? a.call(e) : t.get(e)), EB = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, IB = (e, t, a, o) => (_w(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Wp, Yp = class extends xa {
  constructor() {
    super(), EB(this, Wp, void 0), IB(this, Wp, this.shadowRoot.querySelector("slot"));
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_PREVIEW_CHAPTER, b.MEDIA_LANG];
  }
  attributeChangedCallback(t, a, o) {
    if (super.attributeChangedCallback(t, a, o), (t === b.MEDIA_PREVIEW_CHAPTER || t === b.MEDIA_LANG) && o !== a && o != null) if (yB(this, Wp).textContent = o, o !== "") {
      let l = U("chapter: {chapterName}", { chapterName: o });
      this.setAttribute("aria-valuetext", l);
    } else this.removeAttribute("aria-valuetext");
  }
  get mediaPreviewChapter() {
    return ie(this, b.MEDIA_PREVIEW_CHAPTER);
  }
  set mediaPreviewChapter(t) {
    oe(this, b.MEDIA_PREVIEW_CHAPTER, t);
  }
};
Wp = /* @__PURE__ */ new WeakMap();
y.customElements.get("media-preview-chapter-display") || y.customElements.define("media-preview-chapter-display", Yp);
var Fx = Yp;
var ww = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, jp = (e, t, a) => (ww(e, t, "read from private field"), a ? a.call(e) : t.get(e)), AB = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Qp = (e, t, a, o) => (ww(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), El;
function TB(e) {
  return `
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `;
}
var is = class extends y.HTMLElement {
  constructor() {
    if (super(), AB(this, El, void 0), !this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      let t = dt(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(t);
    }
  }
  static get observedAttributes() {
    return [re.MEDIA_CONTROLLER, b.MEDIA_PREVIEW_IMAGE, b.MEDIA_PREVIEW_COORDS];
  }
  connectedCallback() {
    var t, a, o;
    let l = this.getAttribute(re.MEDIA_CONTROLLER);
    l && (Qp(this, El, (t = this.getRootNode()) == null ? void 0 : t.getElementById(l)), (o = (a = jp(this, El)) == null ? void 0 : a.associateElement) == null || o.call(a, this));
  }
  disconnectedCallback() {
    var t, a;
    (a = (t = jp(this, El)) == null ? void 0 : t.unassociateElement) == null || a.call(t, this), Qp(this, El, null);
  }
  attributeChangedCallback(t, a, o) {
    var l, r, i, n, u;
    [b.MEDIA_PREVIEW_IMAGE, b.MEDIA_PREVIEW_COORDS].includes(t) && this.update(), t === re.MEDIA_CONTROLLER && (a && ((r = (l = jp(this, El)) == null ? void 0 : l.unassociateElement) == null || r.call(l, this), Qp(this, El, null)), o && this.isConnected && (Qp(this, El, (i = this.getRootNode()) == null ? void 0 : i.getElementById(o)), (u = (n = jp(this, El)) == null ? void 0 : n.associateElement) == null || u.call(n, this)));
  }
  get mediaPreviewImage() {
    return ie(this, b.MEDIA_PREVIEW_IMAGE);
  }
  set mediaPreviewImage(t) {
    oe(this, b.MEDIA_PREVIEW_IMAGE, t);
  }
  get mediaPreviewCoords() {
    let t = this.getAttribute(b.MEDIA_PREVIEW_COORDS);
    if (t) return t.split(/\s+/).map((a) => +a);
  }
  set mediaPreviewCoords(t) {
    if (!t) {
      this.removeAttribute(b.MEDIA_PREVIEW_COORDS);
      return;
    }
    this.setAttribute(b.MEDIA_PREVIEW_COORDS, t.join(" "));
  }
  update() {
    let t = this.mediaPreviewCoords, a = this.mediaPreviewImage;
    if (!(t && a)) return;
    let [o, l, r, i] = t, n = a.split("#")[0], u = getComputedStyle(this), { maxWidth: d, maxHeight: c, minWidth: h, minHeight: s } = u, f = u.getPropertyValue("--media-preview-thumbnail-object-fit").trim() || "contain", v, L;
    if (f === "fill") {
      let A = parseInt(d) / r, I = parseInt(c) / i, T = parseInt(h) / r, w = parseInt(s) / i;
      v = A < 1 ? A : Math.max(A, T), L = I < 1 ? I : Math.max(I, w);
    } else {
      let A = Math.min(parseInt(d) / r, parseInt(c) / i), I = Math.max(parseInt(h) / r, parseInt(s) / i), w = A < 1 ? A : I > 1 ? I : 1;
      v = w, L = w;
    }
    let { style: x } = ze(this.shadowRoot, ":host"), p = ze(this.shadowRoot, "img").style, m = this.shadowRoot.querySelector("img"), S = Math.min(v, L) < 1 ? "min" : "max";
    x.setProperty(`${S}-width`, "initial", "important"), x.setProperty(`${S}-height`, "initial", "important"), x.width = `${r * v}px`, x.height = `${i * L}px`;
    let E = () => {
      p.width = `${this.imgWidth * v}px`, p.height = `${this.imgHeight * L}px`, p.display = "block";
    };
    m.src !== n && (m.onload = () => {
      this.imgWidth = m.naturalWidth, this.imgHeight = m.naturalHeight, E(), m.onload = null;
    }, m.src = n, E()), E(), p.transform = `translate(-${o * v}px, -${l * L}px)`;
  }
};
El = /* @__PURE__ */ new WeakMap();
is.shadowRootOptions = { mode: "open" };
is.getTemplateHTML = TB;
y.customElements.get("media-preview-thumbnail") || y.customElements.define("media-preview-thumbnail", is);
var ns = is;
var Rw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Mw = (e, t, a) => (Rw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), _B = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, wB = (e, t, a, o) => (Rw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), vc, Zp = class extends xa {
  constructor() {
    super(), _B(this, vc, void 0), wB(this, vc, this.shadowRoot.querySelector("slot")), Mw(this, vc).textContent = Bo(0);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_PREVIEW_TIME];
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_PREVIEW_TIME && o != null && (Mw(this, vc).textContent = Bo(parseFloat(o)));
  }
  get mediaPreviewTime() {
    return xe(this, b.MEDIA_PREVIEW_TIME);
  }
  set mediaPreviewTime(t) {
    Be(this, b.MEDIA_PREVIEW_TIME, t);
  }
};
vc = /* @__PURE__ */ new WeakMap();
y.customElements.get("media-preview-time-display") || y.customElements.define("media-preview-time-display", Zp);
var zx = Zp;
var us = { SEEK_OFFSET: "seekoffset" }, Vx = 30, MB = (e) => `
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${e}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;
function RB(e, t) {
  return `
    <slot name="icon">${MB(t.seekOffset)}</slot>
  `;
}
var kB = (e, t) => {
  e.setAttribute("aria-label", U("seek back {seekOffset} seconds", { seekOffset: t }));
};
function DB() {
  return U("Seek backward");
}
var OB = 0, ss = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_CURRENT_TIME, us.SEEK_OFFSET];
  }
  connectedCallback() {
    super.connectedCallback(), this.seekOffset = xe(this, us.SEEK_OFFSET, Vx);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), kB(this, this.seekOffset), t === us.SEEK_OFFSET && (this.seekOffset = xe(this, us.SEEK_OFFSET, Vx));
  }
  get seekOffset() {
    return xe(this, us.SEEK_OFFSET, Vx);
  }
  set seekOffset(t) {
    Be(this, us.SEEK_OFFSET, t), this.setAttribute("aria-label", U("seek back {seekOffset} seconds", { seekOffset: this.seekOffset })), ap(op(this, "icon"), this.seekOffset);
  }
  get mediaCurrentTime() {
    return xe(this, b.MEDIA_CURRENT_TIME, OB);
  }
  set mediaCurrentTime(t) {
    Be(this, b.MEDIA_CURRENT_TIME, t);
  }
  handleClick() {
    let t = Math.max(this.mediaCurrentTime - this.seekOffset, 0), a = new y.CustomEvent(P.MEDIA_SEEK_REQUEST, { composed: true, bubbles: true, detail: t });
    this.dispatchEvent(a);
  }
};
ss.getSlotTemplateHTML = RB;
ss.getTooltipContentHTML = DB;
y.customElements.get("media-seek-backward-button") || y.customElements.define("media-seek-backward-button", ss);
var Gx = ss;
var ds = { SEEK_OFFSET: "seekoffset" }, Xx = 30, PB = (e) => `
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${e}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;
function UB(e, t) {
  return `
    <slot name="icon">${PB(t.seekOffset)}</slot>
  `;
}
var BB = (e, t) => {
  e.setAttribute("aria-label", U("seek forward {seekOffset} seconds", { seekOffset: t }));
};
function NB() {
  return U("Seek forward");
}
var HB = 0, cs = class extends Se {
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_CURRENT_TIME, ds.SEEK_OFFSET];
  }
  connectedCallback() {
    super.connectedCallback(), this.seekOffset = xe(this, ds.SEEK_OFFSET, Xx);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), BB(this, this.seekOffset), t === ds.SEEK_OFFSET && (this.seekOffset = xe(this, ds.SEEK_OFFSET, Xx));
  }
  get seekOffset() {
    return xe(this, ds.SEEK_OFFSET, Xx);
  }
  set seekOffset(t) {
    Be(this, ds.SEEK_OFFSET, t), this.setAttribute("aria-label", U("seek forward {seekOffset} seconds", { seekOffset: this.seekOffset })), ap(op(this, "icon"), this.seekOffset);
  }
  get mediaCurrentTime() {
    return xe(this, b.MEDIA_CURRENT_TIME, HB);
  }
  set mediaCurrentTime(t) {
    Be(this, b.MEDIA_CURRENT_TIME, t);
  }
  handleClick() {
    let t = this.mediaCurrentTime + this.seekOffset, a = new y.CustomEvent(P.MEDIA_SEEK_REQUEST, { composed: true, bubbles: true, detail: t });
    this.dispatchEvent(a);
  }
};
cs.getSlotTemplateHTML = UB;
cs.getTooltipContentHTML = NB;
y.customElements.get("media-seek-forward-button") || y.customElements.define("media-seek-forward-button", cs);
var Kx = cs;
var jx = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Ko = (e, t, a) => (jx(e, t, "read from private field"), a ? a.call(e) : t.get(e)), nn = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Qx = (e, t, a, o) => (jx(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), ri = (e, t, a) => (jx(e, t, "access private method"), a), fs, Il, th, Zx, Dw, eh, Jx, Lc, Jp, $p, Wx, li = { REMAINING: "remaining", SHOW_DURATION: "showduration", NO_TOGGLE: "notoggle" }, kw = [...Object.values(li), b.MEDIA_CURRENT_TIME, b.MEDIA_DURATION, b.MEDIA_SEEKABLE], Ow = ["Enter", " "], qB = "&nbsp;/&nbsp;", Yx = (e, { timesSep: t = qB } = {}) => {
  var a, o;
  let l = (a = e.mediaCurrentTime) != null ? a : 0, [, r] = (o = e.mediaSeekable) != null ? o : [], i = 0;
  Number.isFinite(e.mediaDuration) ? i = e.mediaDuration : Number.isFinite(r) && (i = r);
  let n = e.remaining ? Bo(0 - (i - l)) : Bo(l);
  return e.showDuration ? `${n}${t}${Bo(i)}` : n;
}, FB = (e) => {
  var t;
  let a = e.mediaCurrentTime, [, o] = (t = e.mediaSeekable) != null ? t : [], l = null;
  if (Number.isFinite(e.mediaDuration) ? l = e.mediaDuration : Number.isFinite(o) && (l = o), a == null || l === null) {
    e.setAttribute("aria-description", U("video not loaded, unknown time."));
    return;
  }
  let r = e.remaining ? Qi(0 - (l - a)) : Qi(a);
  if (!e.showDuration) {
    e.setAttribute("aria-description", r);
    return;
  }
  let i = Qi(l), n = U("{currentTime} of {totalTime}", { currentTime: r, totalTime: i });
  e.setAttribute("aria-description", n);
};
function zB(e, t) {
  return `
    <slot>${Yx(t)}</slot>
  `;
}
var VB = (e) => {
  e.setAttribute("aria-label", U("playback time"));
}, bc = class extends xa {
  constructor() {
    super(), nn(this, Zx), nn(this, eh), nn(this, Lc), nn(this, $p), nn(this, fs, void 0), nn(this, Il, null), nn(this, th, (t) => {
      let { metaKey: a, altKey: o, key: l } = t;
      if (a || o || !Ow.includes(l)) {
        this.removeEventListener("keyup", Ko(this, Il));
        return;
      }
      this.addEventListener("keyup", Ko(this, Il));
    }), Qx(this, fs, this.shadowRoot.querySelector("slot")), Ko(this, fs).innerHTML = `${Yx(this)}`;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, ...kw, "disabled"];
  }
  connectedCallback() {
    let { style: t } = ze(this.shadowRoot, ":host(:hover:not([notoggle]))");
    t.setProperty("cursor", "var(--media-cursor, pointer)"), t.setProperty("background", "var(--media-control-hover-background, rgba(50 50 70 / .7))"), this.setAttribute("aria-label", U("playback time")), ri(this, Lc, Jp).call(this), super.connectedCallback();
  }
  toggleTimeDisplay() {
    this.noToggle || (this.hasAttribute("remaining") ? this.removeAttribute("remaining") : this.setAttribute("remaining", ""));
  }
  disconnectedCallback() {
    this.disable(), ri(this, eh, Jx).call(this), super.disconnectedCallback();
  }
  attributeChangedCallback(t, a, o) {
    VB(this), kw.includes(t) ? this.update() : t === "disabled" && o !== a ? o == null ? ri(this, Lc, Jp).call(this) : ri(this, $p, Wx).call(this) : t === li.NO_TOGGLE && o !== a && (this.noToggle ? ri(this, $p, Wx).call(this) : ri(this, Lc, Jp).call(this)), super.attributeChangedCallback(t, a, o);
  }
  enable() {
    this.noToggle || (this.tabIndex = 0);
  }
  disable() {
    this.tabIndex = -1;
  }
  get remaining() {
    return X(this, li.REMAINING);
  }
  set remaining(t) {
    K(this, li.REMAINING, t);
  }
  get showDuration() {
    return X(this, li.SHOW_DURATION);
  }
  set showDuration(t) {
    K(this, li.SHOW_DURATION, t);
  }
  get noToggle() {
    return X(this, li.NO_TOGGLE);
  }
  set noToggle(t) {
    K(this, li.NO_TOGGLE, t);
  }
  get mediaDuration() {
    return xe(this, b.MEDIA_DURATION);
  }
  set mediaDuration(t) {
    Be(this, b.MEDIA_DURATION, t);
  }
  get mediaCurrentTime() {
    return xe(this, b.MEDIA_CURRENT_TIME);
  }
  set mediaCurrentTime(t) {
    Be(this, b.MEDIA_CURRENT_TIME, t);
  }
  get mediaSeekable() {
    let t = this.getAttribute(b.MEDIA_SEEKABLE);
    if (t) return t.split(":").map((a) => +a);
  }
  set mediaSeekable(t) {
    if (t == null) {
      this.removeAttribute(b.MEDIA_SEEKABLE);
      return;
    }
    this.setAttribute(b.MEDIA_SEEKABLE, t.join(":"));
  }
  update() {
    let t = Yx(this);
    FB(this), t !== Ko(this, fs).innerHTML && (Ko(this, fs).innerHTML = t);
  }
};
fs = /* @__PURE__ */ new WeakMap();
Il = /* @__PURE__ */ new WeakMap();
th = /* @__PURE__ */ new WeakMap();
Zx = /* @__PURE__ */ new WeakSet();
Dw = function() {
  Ko(this, Il) || (Qx(this, Il, (e) => {
    let { key: t } = e;
    if (!Ow.includes(t)) {
      this.removeEventListener("keyup", Ko(this, Il));
      return;
    }
    this.toggleTimeDisplay();
  }), this.addEventListener("keydown", Ko(this, th)), this.addEventListener("click", this.toggleTimeDisplay));
};
eh = /* @__PURE__ */ new WeakSet();
Jx = function() {
  Ko(this, Il) && (this.removeEventListener("keyup", Ko(this, Il)), this.removeEventListener("keydown", Ko(this, th)), this.removeEventListener("click", this.toggleTimeDisplay), Qx(this, Il, null));
};
Lc = /* @__PURE__ */ new WeakSet();
Jp = function() {
  !this.noToggle && !this.hasAttribute("disabled") && (this.setAttribute("role", "button"), this.enable(), ri(this, Zx, Dw).call(this));
};
$p = /* @__PURE__ */ new WeakSet();
Wx = function() {
  this.removeAttribute("role"), this.disable(), ri(this, eh, Jx).call(this);
};
bc.getSlotTemplateHTML = zB;
y.customElements.get("media-time-display") || y.customElements.define("media-time-display", bc);
var $x = bc;
var Pw = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Gt = (e, t, a) => (Pw(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Al = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, eo = (e, t, a, o) => (Pw(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), GB = (e, t, a, o) => ({ set _(l) {
  eo(e, t, l, a);
}, get _() {
  return Gt(e, t, o);
} }), ms, ah, ps, xc, oh, lh, rh, hs, un, ih, nh = class {
  constructor(t, a, o) {
    Al(this, ms, void 0), Al(this, ah, void 0), Al(this, ps, void 0), Al(this, xc, void 0), Al(this, oh, void 0), Al(this, lh, void 0), Al(this, rh, void 0), Al(this, hs, void 0), Al(this, un, 0), Al(this, ih, (l = performance.now()) => {
      eo(this, un, requestAnimationFrame(Gt(this, ih))), eo(this, xc, performance.now() - Gt(this, ps));
      let r = 1e3 / this.fps;
      if (Gt(this, xc) > r) {
        eo(this, ps, l - Gt(this, xc) % r);
        let i = 1e3 / ((l - Gt(this, ah)) / ++GB(this, oh)._), n = (l - Gt(this, lh)) / 1e3 / this.duration, u = Gt(this, rh) + n * this.playbackRate;
        u - Gt(this, ms).valueAsNumber > 0 ? eo(this, hs, this.playbackRate / this.duration / i) : (eo(this, hs, 0.995 * Gt(this, hs)), u = Gt(this, ms).valueAsNumber + Gt(this, hs)), this.callback(u);
      }
    }), eo(this, ms, t), this.callback = a, this.fps = o;
  }
  start() {
    Gt(this, un) === 0 && (eo(this, ps, performance.now()), eo(this, ah, Gt(this, ps)), eo(this, oh, 0), Gt(this, ih).call(this));
  }
  stop() {
    Gt(this, un) !== 0 && (cancelAnimationFrame(Gt(this, un)), eo(this, un, 0));
  }
  update({ start: t, duration: a, playbackRate: o }) {
    let l = t - Gt(this, ms).valueAsNumber, r = Math.abs(a - this.duration);
    (l > 0 || l < -0.5 / a || r >= 0.5) && this.callback(t), eo(this, rh, t), eo(this, lh, performance.now()), this.duration = a, this.playbackRate = o;
  }
};
ms = /* @__PURE__ */ new WeakMap();
ah = /* @__PURE__ */ new WeakMap();
ps = /* @__PURE__ */ new WeakMap();
xc = /* @__PURE__ */ new WeakMap();
oh = /* @__PURE__ */ new WeakMap();
lh = /* @__PURE__ */ new WeakMap();
rh = /* @__PURE__ */ new WeakMap();
hs = /* @__PURE__ */ new WeakMap();
un = /* @__PURE__ */ new WeakMap();
ih = /* @__PURE__ */ new WeakMap();
var lS = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, Je = (e, t, a) => (lS(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Ot = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, So = (e, t, a, o) => (lS(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), Co = (e, t, a) => (lS(e, t, "access private method"), a), gs, ii, dh, Cc, ch, sh, yc, Ec, vs, Ls, Sc, eS, Uw, tS, fh, rS, mh, iS, ph, nS, aS, Bw, Ic, hh, oS, Nw, XB = (e) => {
  let t = e.range, a = Qi(+Hw(e)), o = Qi(+e.mediaSeekableEnd), l = a && o ? U("{currentTime} of {totalTime}", { currentTime: a, totalTime: o }) : U("video not loaded, unknown time.");
  t.setAttribute("aria-valuetext", l);
};
function KB(e) {
  return `
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${b.MEDIA_PREVIEW_IMAGE}], [${b.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${b.MEDIA_PREVIEW_IMAGE}], [${b.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${b.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${b.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${b.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${b.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${b.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${b.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${b.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${b.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${b.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${b.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${b.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${b.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${ns.shadowRootOptions.mode}">
            ${ns.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `;
}
var uh = (e, t = e.mediaCurrentTime) => {
  let a = Number.isFinite(e.mediaSeekableStart) ? e.mediaSeekableStart : 0, o = Number.isFinite(e.mediaDuration) ? e.mediaDuration : e.mediaSeekableEnd;
  if (Number.isNaN(o)) return 0;
  let l = (t - a) / (o - a);
  return Math.max(0, Math.min(l, 1));
}, Hw = (e, t = e.range.valueAsNumber) => {
  let a = Number.isFinite(e.mediaSeekableStart) ? e.mediaSeekableStart : 0, o = Number.isFinite(e.mediaDuration) ? e.mediaDuration : e.mediaSeekableEnd;
  return Number.isNaN(o) ? 0 : t * (o - a) + a;
}, bs = class extends Xo {
  constructor() {
    super(), Ot(this, eS), Ot(this, fh), Ot(this, mh), Ot(this, ph), Ot(this, aS), Ot(this, Ic), Ot(this, oS), Ot(this, gs, null), Ot(this, ii, void 0), Ot(this, dh, void 0), Ot(this, Cc, void 0), Ot(this, ch, void 0), Ot(this, sh, void 0), Ot(this, yc, void 0), Ot(this, Ec, void 0), Ot(this, vs, void 0), Ot(this, Ls, void 0), Ot(this, Sc, () => {
      Co(this, eS, Uw).call(this) ? Je(this, ii).start() : Je(this, ii).stop();
    }), Ot(this, tS, (o) => {
      this.dragging || (Au(o) && (this.range.valueAsNumber = o), Je(this, Ls) || this.updateBar());
    }), this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin", '<div id="buffered" part="buffered"></div>'), So(this, dh, this.shadowRoot.querySelectorAll('[part~="box"]')), So(this, ch, this.shadowRoot.querySelector('[part~="preview-box"]')), So(this, sh, this.shadowRoot.querySelector('[part~="current-box"]'));
    let a = getComputedStyle(this);
    So(this, yc, parseInt(a.getPropertyValue("--media-box-padding-left"))), So(this, Ec, parseInt(a.getPropertyValue("--media-box-padding-right"))), So(this, ii, new nh(this.range, Je(this, tS), 60));
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_PAUSED, b.MEDIA_DURATION, b.MEDIA_SEEKABLE, b.MEDIA_CURRENT_TIME, b.MEDIA_PREVIEW_IMAGE, b.MEDIA_PREVIEW_TIME, b.MEDIA_PREVIEW_CHAPTER, b.MEDIA_BUFFERED, b.MEDIA_PLAYBACK_RATE, b.MEDIA_LOADING, b.MEDIA_ENDED];
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), this.range.setAttribute("aria-label", U("seek")), Je(this, Sc).call(this), So(this, gs, this.getRootNode()), (t = Je(this, gs)) == null || t.addEventListener("transitionstart", this);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), Je(this, ii).stop(), (t = Je(this, gs)) == null || t.removeEventListener("transitionstart", this), So(this, gs, null);
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), a != o && (t === b.MEDIA_CURRENT_TIME || t === b.MEDIA_PAUSED || t === b.MEDIA_ENDED || t === b.MEDIA_LOADING || t === b.MEDIA_DURATION || t === b.MEDIA_SEEKABLE ? (Je(this, ii).update({ start: uh(this), duration: this.mediaSeekableEnd - this.mediaSeekableStart, playbackRate: this.mediaPlaybackRate }), Je(this, Sc).call(this), XB(this)) : t === b.MEDIA_BUFFERED && this.updateBufferedBar(), (t === b.MEDIA_DURATION || t === b.MEDIA_SEEKABLE) && (this.mediaChaptersCues = Je(this, vs), this.updateBar()));
  }
  get mediaChaptersCues() {
    return Je(this, vs);
  }
  set mediaChaptersCues(t) {
    var a;
    So(this, vs, t), this.updateSegments((a = Je(this, vs)) == null ? void 0 : a.map((o) => ({ start: uh(this, o.startTime), end: uh(this, o.endTime) })));
  }
  get mediaPaused() {
    return X(this, b.MEDIA_PAUSED);
  }
  set mediaPaused(t) {
    K(this, b.MEDIA_PAUSED, t);
  }
  get mediaLoading() {
    return X(this, b.MEDIA_LOADING);
  }
  set mediaLoading(t) {
    K(this, b.MEDIA_LOADING, t);
  }
  get mediaDuration() {
    return xe(this, b.MEDIA_DURATION);
  }
  set mediaDuration(t) {
    Be(this, b.MEDIA_DURATION, t);
  }
  get mediaCurrentTime() {
    return xe(this, b.MEDIA_CURRENT_TIME);
  }
  set mediaCurrentTime(t) {
    Be(this, b.MEDIA_CURRENT_TIME, t);
  }
  get mediaPlaybackRate() {
    return xe(this, b.MEDIA_PLAYBACK_RATE, 1);
  }
  set mediaPlaybackRate(t) {
    Be(this, b.MEDIA_PLAYBACK_RATE, t);
  }
  get mediaBuffered() {
    let t = this.getAttribute(b.MEDIA_BUFFERED);
    return t ? t.split(" ").map((a) => a.split(":").map((o) => +o)) : [];
  }
  set mediaBuffered(t) {
    if (!t) {
      this.removeAttribute(b.MEDIA_BUFFERED);
      return;
    }
    let a = t.map((o) => o.join(":")).join(" ");
    this.setAttribute(b.MEDIA_BUFFERED, a);
  }
  get mediaSeekable() {
    let t = this.getAttribute(b.MEDIA_SEEKABLE);
    if (t) return t.split(":").map((a) => +a);
  }
  set mediaSeekable(t) {
    if (t == null) {
      this.removeAttribute(b.MEDIA_SEEKABLE);
      return;
    }
    this.setAttribute(b.MEDIA_SEEKABLE, t.join(":"));
  }
  get mediaSeekableEnd() {
    var t;
    let [, a = this.mediaDuration] = (t = this.mediaSeekable) != null ? t : [];
    return a;
  }
  get mediaSeekableStart() {
    var t;
    let [a = 0] = (t = this.mediaSeekable) != null ? t : [];
    return a;
  }
  get mediaPreviewImage() {
    return ie(this, b.MEDIA_PREVIEW_IMAGE);
  }
  set mediaPreviewImage(t) {
    oe(this, b.MEDIA_PREVIEW_IMAGE, t);
  }
  get mediaPreviewTime() {
    return xe(this, b.MEDIA_PREVIEW_TIME);
  }
  set mediaPreviewTime(t) {
    Be(this, b.MEDIA_PREVIEW_TIME, t);
  }
  get mediaEnded() {
    return X(this, b.MEDIA_ENDED);
  }
  set mediaEnded(t) {
    K(this, b.MEDIA_ENDED, t);
  }
  updateBar() {
    super.updateBar(), this.updateBufferedBar(), this.updateCurrentBox();
  }
  updateBufferedBar() {
    var t;
    let a = this.mediaBuffered;
    if (!a.length) return;
    let o;
    if (this.mediaEnded) o = 1;
    else {
      let r = this.mediaCurrentTime, [, i = this.mediaSeekableStart] = (t = a.find(([n, u]) => n <= r && r <= u)) != null ? t : [];
      o = uh(this, i);
    }
    let { style: l } = ze(this.shadowRoot, "#buffered");
    l.setProperty("width", `${o * 100}%`);
  }
  updateCurrentBox() {
    if (!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length) return;
    let a = ze(this.shadowRoot, "#current-rail"), o = ze(this.shadowRoot, '[part~="current-box"]'), l = Co(this, fh, rS).call(this, Je(this, sh)), r = Co(this, mh, iS).call(this, l, this.range.valueAsNumber), i = Co(this, ph, nS).call(this, l, this.range.valueAsNumber);
    a.style.transform = `translateX(${r})`, a.style.setProperty("--_range-width", `${l.range.width}`), o.style.setProperty("--_box-shift", `${i}`), o.style.setProperty("--_box-width", `${l.box.width}px`), o.style.setProperty("visibility", "initial");
  }
  handleEvent(t) {
    switch (super.handleEvent(t), t.type) {
      case "input":
        Co(this, oS, Nw).call(this);
        break;
      case "pointermove":
        Co(this, aS, Bw).call(this, t);
        break;
      case "pointerup":
        Je(this, Ls) && So(this, Ls, false);
        break;
      case "pointerdown":
        So(this, Ls, true);
        break;
      case "pointerleave":
        Co(this, Ic, hh).call(this, null);
        break;
      case "transitionstart":
        gl(t.target, this) && setTimeout(() => Je(this, Sc).call(this), 0);
        break;
    }
  }
};
gs = /* @__PURE__ */ new WeakMap();
ii = /* @__PURE__ */ new WeakMap();
dh = /* @__PURE__ */ new WeakMap();
Cc = /* @__PURE__ */ new WeakMap();
ch = /* @__PURE__ */ new WeakMap();
sh = /* @__PURE__ */ new WeakMap();
yc = /* @__PURE__ */ new WeakMap();
Ec = /* @__PURE__ */ new WeakMap();
vs = /* @__PURE__ */ new WeakMap();
Ls = /* @__PURE__ */ new WeakMap();
Sc = /* @__PURE__ */ new WeakMap();
eS = /* @__PURE__ */ new WeakSet();
Uw = function() {
  return this.isConnected && !this.mediaPaused && !this.mediaLoading && !this.mediaEnded && this.mediaSeekableEnd > 0 && lp(this);
};
tS = /* @__PURE__ */ new WeakMap();
fh = /* @__PURE__ */ new WeakSet();
rS = function(e) {
  var t;
  let o = ((t = this.getAttribute("bounds") ? Yr(this, `#${this.getAttribute("bounds")}`) : this.parentElement) != null ? t : this).getBoundingClientRect(), l = this.range.getBoundingClientRect(), r = e.offsetWidth, i = -(l.left - o.left - r / 2), n = o.right - l.left - r / 2;
  return { box: { width: r, min: i, max: n }, bounds: o, range: l };
};
mh = /* @__PURE__ */ new WeakSet();
iS = function(e, t) {
  let a = `${t * 100}%`, { width: o, min: l, max: r } = e.box;
  if (!o) return a;
  if (Number.isNaN(l) || (a = `max(${`calc(1 / var(--_range-width) * 100 * ${l}% + var(--media-box-padding-left))`}, ${a})`), !Number.isNaN(r)) {
    let n = `calc(1 / var(--_range-width) * 100 * ${r}% - var(--media-box-padding-right))`;
    a = `min(${a}, ${n})`;
  }
  return a;
};
ph = /* @__PURE__ */ new WeakSet();
nS = function(e, t) {
  let { width: a, min: o, max: l } = e.box, r = t * e.range.width;
  if (r < o + Je(this, yc)) {
    let i = e.range.left - e.bounds.left - Je(this, yc);
    return `${r - a / 2 + i}px`;
  }
  if (r > l - Je(this, Ec)) {
    let i = e.bounds.right - e.range.right - Je(this, Ec);
    return `${r + a / 2 - i - e.range.width}px`;
  }
  return 0;
};
aS = /* @__PURE__ */ new WeakSet();
Bw = function(e) {
  let t = [...Je(this, dh)].some((c) => e.composedPath().includes(c));
  if (!this.dragging && (t || !e.composedPath().includes(this))) {
    Co(this, Ic, hh).call(this, null);
    return;
  }
  let a = this.mediaSeekableEnd;
  if (!a) return;
  let o = ze(this.shadowRoot, "#preview-rail"), l = ze(this.shadowRoot, '[part~="preview-box"]'), r = Co(this, fh, rS).call(this, Je(this, ch)), i = (e.clientX - r.range.left) / r.range.width;
  i = Math.max(0, Math.min(1, i));
  let n = Co(this, mh, iS).call(this, r, i), u = Co(this, ph, nS).call(this, r, i);
  o.style.transform = `translateX(${n})`, o.style.setProperty("--_range-width", `${r.range.width}`), l.style.setProperty("--_box-shift", `${u}`), l.style.setProperty("--_box-width", `${r.box.width}px`);
  let d = Math.round(Je(this, Cc)) - Math.round(i * a);
  Math.abs(d) < 1 && i > 0.01 && i < 0.99 || (So(this, Cc, i * a), Co(this, Ic, hh).call(this, Je(this, Cc)));
};
Ic = /* @__PURE__ */ new WeakSet();
hh = function(e) {
  this.dispatchEvent(new y.CustomEvent(P.MEDIA_PREVIEW_REQUEST, { composed: true, bubbles: true, detail: e }));
};
oS = /* @__PURE__ */ new WeakSet();
Nw = function() {
  Je(this, ii).stop();
  let e = Hw(this);
  this.dispatchEvent(new y.CustomEvent(P.MEDIA_SEEK_REQUEST, { composed: true, bubbles: true, detail: e }));
};
bs.shadowRootOptions = { mode: "open" };
bs.getContainerTemplateHTML = KB;
y.customElements.get("media-time-range") || y.customElements.define("media-time-range", bs);
var uS = bs;
var WB = (e, t, a) => {
  if (!t.has(e)) throw TypeError("Cannot " + a);
}, qw = (e, t, a) => (WB(e, t, "read from private field"), a ? a.call(e) : t.get(e)), YB = (e, t, a) => {
  if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, gh, jB = 1, QB = (e) => e.mediaMuted ? 0 : e.mediaVolume, ZB = (e) => `${Math.round(e * 100)}%`, vh = class extends Xo {
  constructor() {
    super(...arguments), YB(this, gh, () => {
      let t = this.range.value, a = new y.CustomEvent(P.MEDIA_VOLUME_REQUEST, { composed: true, bubbles: true, detail: t });
      this.dispatchEvent(a);
    });
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_VOLUME, b.MEDIA_MUTED, b.MEDIA_VOLUME_UNAVAILABLE];
  }
  connectedCallback() {
    super.connectedCallback(), this.range.setAttribute("aria-label", U("volume")), this.range.addEventListener("input", qw(this, gh));
  }
  disconnectedCallback() {
    this.range.removeEventListener("input", qw(this, gh)), super.disconnectedCallback();
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), (t === b.MEDIA_VOLUME || t === b.MEDIA_MUTED) && (this.range.valueAsNumber = QB(this), this.range.setAttribute("aria-valuetext", ZB(this.range.valueAsNumber)), this.updateBar());
  }
  get mediaVolume() {
    return xe(this, b.MEDIA_VOLUME, jB);
  }
  set mediaVolume(t) {
    Be(this, b.MEDIA_VOLUME, t);
  }
  get mediaMuted() {
    return X(this, b.MEDIA_MUTED);
  }
  set mediaMuted(t) {
    K(this, b.MEDIA_MUTED, t);
  }
  get mediaVolumeUnavailable() {
    return ie(this, b.MEDIA_VOLUME_UNAVAILABLE);
  }
  set mediaVolumeUnavailable(t) {
    oe(this, b.MEDIA_VOLUME_UNAVAILABLE, t);
  }
};
gh = /* @__PURE__ */ new WeakMap();
y.customElements.get("media-volume-range") || y.customElements.define("media-volume-range", vh);
var sS = vh;
function JB(e) {
  return `
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${b.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `;
}
function $B() {
  return U("Loop");
}
var xs = class extends Se {
  constructor() {
    super(...arguments), this.container = null;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, b.MEDIA_LOOP];
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), this.container = ((t = this.shadowRoot) == null ? void 0 : t.querySelector("#icon")) || null, this.container && (this.container.textContent = U("Loop"));
  }
  attributeChangedCallback(t, a, o) {
    super.attributeChangedCallback(t, a, o), t === b.MEDIA_LOOP && this.container && this.setAttribute("aria-checked", this.mediaLoop ? "true" : "false");
  }
  get mediaLoop() {
    return X(this, b.MEDIA_LOOP);
  }
  set mediaLoop(t) {
    K(this, b.MEDIA_LOOP, t);
  }
  handleClick() {
    let t = !this.mediaLoop, a = new y.CustomEvent(P.MEDIA_LOOP_REQUEST, { composed: true, bubbles: true, detail: t });
    this.dispatchEvent(a);
  }
};
xs.getSlotTemplateHTML = JB;
xs.getTooltipContentHTML = $B;
y.customElements.get("media-loop-button") || y.customElements.define("media-loop-button", xs);
var dS = xs;
function Ce(e) {
  if (typeof e == "boolean") return e ? "" : void 0;
  if (typeof e == "function") return;
  let t = (a) => typeof a == "string" || typeof a == "number" || typeof a == "boolean";
  if (Array.isArray(e) && e.every(t)) return e.join(" ");
  if (!(typeof e == "object" && e !== null)) return e;
}
var FV = pe({ tagName: "media-gesture-receiver", elementClass: wu, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), zV = pe({ tagName: "media-container", elementClass: Fb, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), VV = pe({ tagName: "media-chrome-dialog", elementClass: Qb, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), GV = pe({ tagName: "media-keyboard-shortcuts-dialog", elementClass: Zb, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Fw = pe({ tagName: "media-controller", elementClass: sx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), XV = pe({ tagName: "media-tooltip", elementClass: Gu, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), KV = pe({ tagName: "media-chrome-button", elementClass: mx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), WV = pe({ tagName: "media-airplay-button", elementClass: px, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), YV = pe({ tagName: "media-captions-button", elementClass: hx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), jV = pe({ tagName: "media-cast-button", elementClass: gx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), QV = pe({ tagName: "media-chrome-range", elementClass: Ax, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), zw = pe({ tagName: "media-control-bar", elementClass: Tx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), ZV = pe({ tagName: "media-text-display", elementClass: _x, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), JV = pe({ tagName: "media-duration-display", elementClass: wx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), $V = pe({ tagName: "media-error-dialog", elementClass: Mx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Vw = pe({ tagName: "media-fullscreen-button", elementClass: Rx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), e9 = pe({ tagName: "media-live-button", elementClass: kx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), t9 = pe({ tagName: "media-loading-indicator", elementClass: Dx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Gw = pe({ tagName: "media-mute-button", elementClass: Ox, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), a9 = pe({ tagName: "media-pip-button", elementClass: Px, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Xw = pe({ tagName: "media-playback-rate-button", elementClass: Nx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Kw = pe({ tagName: "media-play-button", elementClass: Hx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), o9 = pe({ tagName: "media-poster-image", elementClass: qx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), l9 = pe({ tagName: "media-preview-chapter-display", elementClass: Fx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), r9 = pe({ tagName: "media-preview-thumbnail", elementClass: ns, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), i9 = pe({ tagName: "media-preview-time-display", elementClass: zx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), n9 = pe({ tagName: "media-seek-backward-button", elementClass: Gx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), u9 = pe({ tagName: "media-seek-forward-button", elementClass: Kx, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Ww = pe({ tagName: "media-time-display", elementClass: $x, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), Yw = pe({ tagName: "media-time-range", elementClass: uS, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), jw = pe({ tagName: "media-volume-range", elementClass: sS, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } }), s9 = pe({ tagName: "media-loop-button", elementClass: dS, react: he.default, toAttributeValue: Ce, defaultProps: { suppressHydrationWarning: true } });
var fe = N(Q(), 1);
var tN = Object.defineProperty, aN = (e, t) => tN(e, "name", { value: t, configurable: true });
function Ac(e, [t, a]) {
  return Math.min(a, Math.max(t, e));
}
aN(Ac, "clamp");
var tt = N(Te(), 1), oN = Object.defineProperty, ge = (e, t) => oN(e, "name", { value: t, configurable: true }), Qw = { Vertical: "vertical", Horizontal: "horizontal" }, lN = { LTR: "ltr", RTL: "rtl" }, $w = ["PageUp", "PageDown"], eM = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], tM = { "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"], "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"], "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"], "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"] }, _c = "Slider", [fS, rN, iN] = Bd(_c), [mS, S9] = La(_c, [iN]), [nN, Ss] = mS(_c), wc = fe.forwardRef(ge(function(t, a) {
  let { name: o, min: l = 0, max: r = 100, step: i = 1, orientation: n = Qw.Horizontal, disabled: u = false, minStepsBetweenThumbs: d = 0, preserveThumbOrder: c = false, defaultValue: h = [l], value: s, onValueChange: f = ge(() => {
  }, "onValueChange"), onValueCommit: v = ge(() => {
  }, "onValueCommit"), inverted: L = false, form: x, ...p } = t, m = fe.useRef(/* @__PURE__ */ new Set()), g = fe.useRef(0), S = fe.useRef(false), [E, A] = fe.useState(null), T = n === Qw.Horizontal ? uN : sN, [w, k] = fe.useState(null), F = De(a, k), [V = [], $] = Po({ prop: s, defaultProp: h, onChange: ge((Y) => {
    [...m.current][g.current]?.focus({ preventScroll: true, focusVisible: S.current }), S.current = false, f(Y);
  }, "onChange") }), ee = fe.useRef(V), me = fe.useRef(V);
  fe.useEffect(() => {
    let Y = x ? w?.ownerDocument.getElementById(x) : w?.closest("form");
    if (Y instanceof HTMLFormElement) {
      let ae = ge(() => $(me.current), "reset");
      return Y.addEventListener("reset", ae), () => Y.removeEventListener("reset", ae);
    }
  }, [w, x, $]);
  function we(Y) {
    let ae = dM(V, Y);
    Ge(Y, ae);
  }
  ge(we, "handleSlideStart");
  function je(Y) {
    Ge(Y, g.current);
  }
  ge(je, "handleSlideMove");
  function Ve() {
    String(V) !== String(ee.current) && v(V);
  }
  ge(Ve, "handleSlideEnd");
  function Ge(Y, ae, { commit: sa } = { commit: false }) {
    let Ca = hS(i), Tl = Tc(Math.round((Y - l) / i) * i + l, Ca), yo = Ac(Tl, [l, r]), pt = d * i;
    function Pt(Et) {
      let Ut = c ? Ac(yo, [Et[ae - 1] === void 0 ? l : Et[ae - 1] + pt, Et[ae + 1] === void 0 ? r : Et[ae + 1] - pt]) : yo, ct = uM(Et, Ut, ae);
      return mM(ct, pt) ? { nextValues: ct, changedIndex: c ? ae : ct.indexOf(Ut), hasChanged: String(ct) !== String(Et) } : null;
    }
    ge(Pt, "getNextValues");
    let at = Pt(V);
    at?.hasChanged && A(at.nextValues), $((Et = []) => {
      let Ut = Pt(Et);
      return Ut ? (g.current = Ut.changedIndex, Ut.hasChanged && sa && v(Ut.nextValues), Ut.hasChanged ? Ut.nextValues : Et) : Et;
    });
  }
  return ge(Ge, "updateValues"), (0, tt.jsx)(nN, { scope: t.__scopeSlider, name: o, disabled: u, min: l, max: r, valueIndexToChangeRef: g, thumbs: m.current, values: V, orientation: n, form: x, userRequestedValues: E, children: (0, tt.jsx)(fS.Provider, { scope: t.__scopeSlider, children: (0, tt.jsx)(fS.Slot, { scope: t.__scopeSlider, children: (0, tt.jsx)(T, { "aria-disabled": u, "data-disabled": u ? "" : void 0, ...p, ref: F, onPointerDown: be(p.onPointerDown, () => {
    u || (ee.current = V, S.current = false);
  }), min: l, max: r, inverted: L, onSlideStart: u ? void 0 : we, onSlideMove: u ? void 0 : je, onSlideEnd: u ? void 0 : Ve, onHomeKeyDown: () => {
    u || (S.current = true, Ge(l, 0, { commit: true }));
  }, onEndKeyDown: () => {
    u || (S.current = true, Ge(r, V.length - 1, { commit: true }));
  }, onStepKeyDown: ({ event: Y, direction: ae }) => {
    if (!u) {
      S.current = true;
      let Tl = $w.includes(Y.key) || Y.shiftKey && eM.includes(Y.key) ? 10 : 1, yo = g.current, pt = V[yo], Pt = pM(pt, { min: l, step: i, direction: ae, multiplier: Tl });
      Ge(Pt, yo, { commit: true });
    }
  } }) }) }) });
}, "Slider")), [aM, oM] = mS(_c, { startEdge: "left", endEdge: "right", size: "width", direction: 1 }), uN = fe.forwardRef(ge(function(t, a) {
  let { min: o, max: l, dir: r, inverted: i, onSlideStart: n, onSlideMove: u, onSlideEnd: d, onStepKeyDown: c, ...h } = t, [s, f] = fe.useState(null), v = De(a, f), L = fe.useRef(void 0), x = Vi(r), p = x === lN.LTR, m = p && !i || !p && i;
  function g(S) {
    let E = L.current || s.getBoundingClientRect(), A = [0, E.width], T = Lh(A, m ? [o, l] : [l, o]);
    return L.current = E, T(S - E.left);
  }
  return ge(g, "getValueFromPointer"), (0, tt.jsx)(aM, { scope: t.__scopeSlider, startEdge: m ? "left" : "right", endEdge: m ? "right" : "left", direction: m ? 1 : -1, size: "width", children: (0, tt.jsx)(lM, { dir: x, "data-orientation": "horizontal", ...h, ref: v, style: { ...h.style, "--radix-slider-thumb-transform": "translateX(-50%)" }, onSlideStart: (S) => {
    let E = g(S.clientX);
    n?.(E);
  }, onSlideMove: (S) => {
    let E = g(S.clientX);
    u?.(E);
  }, onSlideEnd: () => {
    L.current = void 0, d?.();
  }, onStepKeyDown: (S) => {
    let A = tM[m ? "from-left" : "from-right"].includes(S.key);
    c?.({ event: S, direction: A ? -1 : 1 });
  } }) });
}, "SliderHorizontal")), sN = fe.forwardRef(ge(function(t, a) {
  let { min: o, max: l, inverted: r, onSlideStart: i, onSlideMove: n, onSlideEnd: u, onStepKeyDown: d, ...c } = t, h = fe.useRef(null), s = De(a, h), f = fe.useRef(void 0), v = !r;
  function L(x) {
    let p = f.current || h.current.getBoundingClientRect(), m = [0, p.height], S = Lh(m, v ? [l, o] : [o, l]);
    return f.current = p, S(x - p.top);
  }
  return ge(L, "getValueFromPointer"), (0, tt.jsx)(aM, { scope: t.__scopeSlider, startEdge: v ? "bottom" : "top", endEdge: v ? "top" : "bottom", size: "height", direction: v ? 1 : -1, children: (0, tt.jsx)(lM, { "data-orientation": "vertical", ...c, ref: s, style: { ...c.style, "--radix-slider-thumb-transform": "translateY(50%)" }, onSlideStart: (x) => {
    let p = L(x.clientY);
    i?.(p);
  }, onSlideMove: (x) => {
    let p = L(x.clientY);
    n?.(p);
  }, onSlideEnd: () => {
    f.current = void 0, u?.();
  }, onStepKeyDown: (x) => {
    let m = tM[v ? "from-bottom" : "from-top"].includes(x.key);
    d?.({ event: x, direction: m ? -1 : 1 });
  } }) });
}, "SliderVertical")), lM = fe.forwardRef(ge(function(t, a) {
  let { __scopeSlider: o, onSlideStart: l, onSlideMove: r, onSlideEnd: i, onHomeKeyDown: n, onEndKeyDown: u, onStepKeyDown: d, ...c } = t, h = Ss(_c, o);
  return (0, tt.jsx)(Oe.span, { ...c, ref: a, onKeyDown: be(t.onKeyDown, (s) => {
    s.key === "Home" ? (n(s), s.preventDefault()) : s.key === "End" ? (u(s), s.preventDefault()) : $w.concat(eM).includes(s.key) && (d(s), s.preventDefault());
  }), onPointerDown: be(t.onPointerDown, (s) => {
    let f = s.target;
    f.setPointerCapture(s.pointerId), s.preventDefault(), h.thumbs.has(f) ? f.focus({ preventScroll: true, focusVisible: false }) : l(s);
  }), onPointerMove: be(t.onPointerMove, (s) => {
    s.target.hasPointerCapture(s.pointerId) && r(s);
  }), onPointerUp: be(t.onPointerUp, (s) => {
    let f = s.target;
    f.hasPointerCapture(s.pointerId) && (f.releasePointerCapture(s.pointerId), i(s));
  }) });
}, "SliderImpl")), dN = "SliderTrack", Mc = fe.forwardRef(ge(function(t, a) {
  let { __scopeSlider: o, ...l } = t, r = Ss(dN, o);
  return (0, tt.jsx)(Oe.span, { "data-disabled": r.disabled ? "" : void 0, "data-orientation": r.orientation, ...l, ref: a });
}, "SliderTrack")), Zw = "SliderRange", rM = fe.forwardRef(ge(function(t, a) {
  let { __scopeSlider: o, ...l } = t, r = Ss(Zw, o), i = oM(Zw, o), n = fe.useRef(null), u = De(a, n), d = r.values.length, c = r.values.map((f) => pS(f, r.min, r.max)), h = d > 1 ? Math.min(...c) : 0, s = 100 - Math.max(...c);
  return (0, tt.jsx)(Oe.span, { "data-orientation": r.orientation, "data-disabled": r.disabled ? "" : void 0, ...l, ref: u, style: { ...t.style, [i.startEdge]: h + "%", [i.endEdge]: s + "%" } });
}, "SliderRange")), cN = "SliderThumb", [fN, iM] = mS(cN), mN = "SliderThumbProvider";
function nM(e) {
  let { __scopeSlider: t, name: a, children: o, internal_do_not_use_render: l } = e, r = Ss(mN, t), i = rN(t), [n, u] = fe.useState(null), d = fe.useMemo(() => n ? i().findIndex((x) => x.ref.current === n) : -1, [i, n]), c = Gd(n), h = n ? !!r.form || !!n.closest("form") : true, s = r.values[d], f = a ?? (r.name ? r.name + (r.values.length > 1 ? "[]" : "") : void 0), v = s === void 0 ? 0 : pS(s, r.min, r.max);
  fe.useEffect(() => {
    if (n) return r.thumbs.add(n), () => {
      r.thumbs.delete(n);
    };
  }, [n, r.thumbs]);
  let L = { value: s, name: f, form: r.form, isFormControl: h, index: d, thumb: n, onThumbChange: u, percent: v, size: c };
  return (0, tt.jsx)(fN, { scope: t, ...L, children: hM(l) ? l(L) : o });
}
ge(nM, "SliderThumbProvider");
var cS = "SliderThumbTrigger", pN = fe.forwardRef(ge(function(t, a) {
  let { __scopeSlider: o, ...l } = t, r = Ss(cS, o), i = oM(cS, o), { index: n, value: u, percent: d, size: c, onThumbChange: h } = iM(cS, o), s = De(a, h), f = sM(n, r.values.length), v = c?.[i.size], L = v ? cM(v, d, i.direction) : 0;
  return (0, tt.jsx)("span", { style: { transform: "var(--radix-slider-thumb-transform)", position: "absolute", [i.startEdge]: `calc(${d}% + ${L}px)` }, children: (0, tt.jsx)(fS.ItemSlot, { scope: o, children: (0, tt.jsx)(Oe.span, { role: "slider", "aria-label": t["aria-label"] || f, "aria-valuemin": r.min, "aria-valuenow": u, "aria-valuemax": r.max, "aria-orientation": r.orientation, "data-orientation": r.orientation, "data-disabled": r.disabled ? "" : void 0, tabIndex: r.disabled ? void 0 : 0, ...l, ref: s, style: u === void 0 ? { display: "none" } : t.style, onFocus: be(t.onFocus, () => {
    r.valueIndexToChangeRef.current = n;
  }) }) }) });
}, "SliderThumbTrigger")), Rc = fe.forwardRef(ge(function(t, a) {
  let { __scopeSlider: o, name: l, ...r } = t;
  return (0, tt.jsx)(nM, { __scopeSlider: o, name: l, internal_do_not_use_render: ({ index: i, isFormControl: n }) => (0, tt.jsxs)(tt.Fragment, { children: [(0, tt.jsx)(pN, { ...r, ref: a, __scopeSlider: o }), n ? (0, tt.jsx)(hN, { __scopeSlider: o }, i) : null] }) });
}, "SliderThumb")), Jw = "SliderBubbleInput", hN = fe.forwardRef(ge(function({ __scopeSlider: t, onInput: a, ...o }, l) {
  let { index: r, value: i, name: n, form: u } = iM(Jw, t), { userRequestedValues: d } = Ss(Jw, t), c = fe.useRef(null), h = De(c, l), s = fe.useRef(false), f = fe.useRef(i), v = fe.useRef(d), L = fe.useRef(d);
  return fe.useEffect(() => {
    let x = c.current;
    if (!x) return;
    let p = window.HTMLInputElement.prototype, g = Object.getOwnPropertyDescriptor(p, "value").set, S = f.current, E = S !== i;
    f.current = i;
    let A = d !== L.current;
    if (L.current = d, E && g) {
      let I = d !== v.current;
      v.current = d;
      let T = d?.[r], w = I && (A && T !== S || T === i);
      s.current = !w;
      let k = new Event("input", { bubbles: true });
      g.call(x, i), x.dispatchEvent(k), s.current = false;
    }
  }, [r, i, d]), (0, tt.jsx)(Oe.input, { style: { display: "none" }, name: n, form: u, ...o, ref: h, defaultValue: i, onInput: be(a, (x) => {
    s.current && x.stopPropagation();
  }) });
}, "SliderBubbleInput"));
function uM(e = [], t, a) {
  let o = [...e];
  return o[a] = t, o.sort((l, r) => l - r);
}
ge(uM, "getNextSortedValues");
function pS(e, t, a) {
  let r = 100 / (a - t) * (e - t);
  return Ac(r, [0, 100]);
}
ge(pS, "convertValueToPercentage");
function sM(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
ge(sM, "getLabel");
function dM(e, t) {
  if (e.length === 1) return 0;
  let a = e.map((l) => Math.abs(l - t)), o = Math.min(...a);
  return a.indexOf(o);
}
ge(dM, "getClosestValueIndex");
function cM(e, t, a) {
  let o = e / 2, r = Lh([0, 50], [0, o]);
  return (o - r(t) * a) * a;
}
ge(cM, "getThumbInBoundsOffset");
function fM(e) {
  return e.slice(0, -1).map((t, a) => e[a + 1] - t);
}
ge(fM, "getStepsBetweenValues");
function mM(e, t) {
  if (t > 0) {
    let a = fM(e);
    return Math.min(...a) >= t;
  }
  return true;
}
ge(mM, "hasMinStepsBetweenValues");
function Lh(e, t) {
  return (a) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    let o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (a - e[0]);
  };
}
ge(Lh, "linearScale");
function hS(e) {
  if (!Number.isFinite(e)) return 0;
  let t = e.toString();
  if (t.includes("e")) {
    let [o, l] = t.split("e"), r = o.split(".")[1] || "", i = Number(l);
    return Math.max(0, r.length - i);
  }
  let a = t.split(".")[1];
  return a ? a.length : 0;
}
ge(hS, "getDecimalCount");
function Tc(e, t) {
  let a = Math.pow(10, t);
  return Math.round(e * a) / a;
}
ge(Tc, "roundValue");
function pM(e, { min: t, step: a, direction: o, multiplier: l }) {
  let r = hS(a), i = (e - t) / a, n = Math.round(i), u = Tc(n * a + t, r) === Tc(e, r), d;
  return u ? d = n + l * o : o > 0 ? d = Math.ceil(i) : d = Math.floor(i), Tc(d * a + t, r);
}
ge(pM, "getNextStepValue");
function hM(e) {
  return typeof e == "function";
}
ge(hM, "isFunction");
var sn = N(Q(), 1);
var Wo = N(Te(), 1);
function gN(e, t, a) {
  let { width: o, height: l } = e.getBoundingClientRect();
  if (o <= 0 || l <= 0) return;
  let r = Math.min(window.devicePixelRatio || 1, 2, 8192 / o);
  e.width = Math.max(1, Math.round(o * r)), e.height = Math.max(1, Math.round(l * r));
  let i = e.getContext("2d");
  if (!i) return;
  i.setTransform(e.width / o, 0, 0, e.height / l, 0, 0), i.fillStyle = getComputedStyle(e).getPropertyValue("--waveform-ink").trim();
  let n = Math.max(1, Math.floor(o / 3)), u = o / n, d = a || t.duration;
  for (let c = 0; c < n; c += 1) {
    let h = Math.floor(c / n * d / t.interval);
    if (h >= t.peaks.length) break;
    let s = Math.min(t.peaks.length, Math.ceil((c + 1) / n * d / t.interval)), f = 0;
    for (let L = h; L < s; L += 1) f = Math.max(f, t.peaks[L]);
    if (!f) continue;
    let v = Math.max(1, Math.sqrt(f / 255) * (l - 8));
    i.fillRect(c * u, (l - v) / 2, Math.max(1, u - 1), v);
  }
}
function vM({ track: e, muted: t, canMute: a, toggleMute: o }) {
  return (0, Wo.jsxs)("div", { className: "timeline-track-label audio-label audio-label--" + e.id, title: e.label, children: [(0, Wo.jsx)(Xa, { size: 14, "aria-hidden": "true" }), (0, Wo.jsx)("span", { children: e.label }), e.id === "original" && (0, Wo.jsx)(St, { icon: t ? Ud : zi, label: t ? "恢复原声预览" : "静音原声预览", "aria-pressed": t, className: t ? "is-on" : "", disabled: !a, onClick: o })] });
}
function LM({ track: e, duration: t, time: a, seek: o, muted: l }) {
  let [r, i] = (0, sn.useState)(null), n = (0, sn.useRef)(null), u = e.waveform, d = r?.request === u ? r : null, c = d?.waveform;
  (0, sn.useEffect)(() => {
    let s = new AbortController();
    return fetch(u, { signal: s.signal }).then((f) => {
      if (!f.ok) throw new Error("waveform");
      return f.json();
    }).then((f) => {
      s.signal.aborted || i({ request: u, waveform: f });
    }).catch(() => {
      s.signal.aborted || i({ request: u, failed: true });
    }), () => s.abort();
  }, [u]), (0, sn.useEffect)(() => {
    if (!c?.available || !n.current) return;
    let s = n.current, f = () => gN(s, c, t), v = new ResizeObserver(f);
    return v.observe(s), f(), () => v.disconnect();
  }, [c, t]);
  let h = d?.failed ? "无法读取波形" : c ? c.available ? "" : "媒体无音轨" : "正在读取音频波形…";
  return (0, Wo.jsxs)(wc, { className: "audio-lane audio-lane--" + e.id + (l ? " audio-muted" : ""), "data-track": e.id, "data-waveform": c?.available ? "ready" : d ? "unavailable" : "loading", title: e.label + " · 点击波形定位原片", value: [Math.min(t, a)], min: 0, max: t || 0.01, step: 0.01, disabled: !t || c?.available === false, onValueChange: ([s]) => o(s), children: [c?.available && (0, Wo.jsx)("canvas", { ref: n, className: "audio-waveform", "aria-hidden": "true" }), h && (0, Wo.jsx)("span", { className: "audio-message", children: h }), (0, Wo.jsx)(Mc, { className: "audio-hit-track" }), (0, Wo.jsx)(Rc, { className: "audio-hit-thumb", "aria-label": "定位" + e.label + "音频", "aria-valuetext": kt(a, true) })] });
}
var B = N(Te(), 1);
function bM(e, t) {
  return { onDragOver(a) {
    a.dataTransfer.types.includes("Files") && (a.preventDefault(), a.stopPropagation(), a.dataTransfer.dropEffect = "copy", t(true));
  }, onDragLeave(a) {
    (!(a.relatedTarget instanceof Node) || !a.currentTarget.contains(a.relatedTarget)) && t(false);
  }, onDrop(a) {
    a.preventDefault(), a.stopPropagation(), t(false), a.dataTransfer.files.length && e(a.dataTransfer.files[0]);
  } };
}
function xM({ source: e, playback: t, videoRef: a, onTime: o, onMetadata: l, onImport: r, onPick: i, onPreview: n, onPreviewProblem: u, preparingPreview: d, onOriginal: c, onVolume: h, caption: s, captions: f, setCaptions: v, upload: L, disabled: x, metadata: p }) {
  let [m, g] = (0, Sa.useState)(false), [S, E] = (0, Sa.useState)(null), [A, I] = (0, Sa.useState)(true), T = (0, Sa.useRef)(0), w = t?.url, k = !!(w && S === w), F = !!(w && !t?.override && !e?.missing && !e?.compatible), V = e?.poster && !t?.override, $ = p.width && p.height ? p.width + " × " + p.height : "";
  (0, Sa.useEffect)(() => {
    E(null), I(true);
  }, [w]);
  function ee(we) {
    E(w), F && u(w, we);
  }
  function me(we) {
    o(we);
    let je = we.currentTarget;
    F && !je.paused && !je.seeking && je.currentTime > 0.6 && document.visibilityState === "visible" && performance.now() - T.current > 1200 && (!je.videoWidth || je.getVideoPlaybackQuality?.().totalVideoFrames === 0) && ee(je);
  }
  return (0, B.jsxs)("section", { className: "viewer", "aria-label": "视频预览", children: [(0, B.jsxs)("div", { className: "panel-head viewer-head", children: [(0, B.jsxs)("div", { className: "panel-heading", children: [(0, B.jsx)(vN, {}), (0, B.jsx)("h2", { children: t?.override ? t.label : e?.compatible ? "兼容预览" : "原片预览" })] }), (0, B.jsxs)("div", { className: "viewer-actions", children: [$ && !t?.override && (0, B.jsx)("span", { className: "media-spec", children: $ }), t?.override && (0, B.jsx)(D, { kind: "ghost", icon: qi, onClick: c, children: "回到原片" }), F && !k && (0, B.jsx)(D, { kind: "ghost", icon: $t, disabled: x, onClick: n, children: d ? "正在生成预览…" : "兼容预览" }), !t?.override && w && (0, B.jsx)(St, { icon: va, label: "预览字幕", disabled: f === null, className: f ? "is-on" : "", "aria-pressed": f, onClick: () => v(!f) }), (0, B.jsx)(St, { icon: qe, label: "选择参考视频", onClick: i, disabled: x })] })] }), (0, B.jsxs)("div", { className: "media-stage" + (m ? " is-dragover" : ""), ...bM(r, g), children: [w && !k ? (0, B.jsxs)(Fw, { className: "media-controller", hotkeys: "noarrowleft noarrowright", children: [(0, B.jsx)("video", { slot: "media", src: w, poster: V ? e.poster : void 0, preload: "auto", ref: a, playsInline: true, onLoadedMetadata: l, onTimeUpdate: me, onVolumeChange: h, onSeeked: o, onPlay: () => {
    T.current = performance.now(), I(false);
  }, onPause: () => I(true), onError: (we) => ee(we.currentTarget) }), A && (0, B.jsx)("button", { className: "center-play", type: "button", "aria-label": "播放视频", onClick: () => a.current?.play().catch(() => {
  }), children: (0, B.jsx)(mo, { size: 22, fill: "currentColor" }) }), s && !t?.override && (0, B.jsx)("div", { className: "preview-captions", children: s }), (0, B.jsxs)(zw, { className: "media-controls", children: [(0, B.jsx)(Kw, { "aria-label": "播放或暂停" }), (0, B.jsx)(Ww, { showDuration: true, "aria-label": "播放时间" }), (0, B.jsx)(Yw, { "aria-label": "拖动播放进度" }), (0, B.jsx)(Xw, { rates: "0.5 1 1.5 2", "aria-label": "播放速度" }), (0, B.jsx)(Gw, { "aria-label": "静音" }), (0, B.jsx)(jw, { "aria-label": "音量" }), (0, B.jsx)(Vw, { "aria-label": "全屏预览" })] })] }, w) : (0, B.jsxs)("div", { className: "media-empty", children: [V && (0, B.jsx)("img", { className: "preview-fallback", src: e.poster, alt: "" }), (0, B.jsxs)("div", { className: "upload-zone", children: [(0, B.jsx)("span", { className: "upload-icon", children: e ? (0, B.jsx)(Br, { size: 27 }) : (0, B.jsx)(Pd, { size: 27 }) }), (0, B.jsx)("h3", { children: e?.missing ? "原片已移动" : d ? "正在生成兼容预览" : k ? "预览无法播放" : "拖入参考视频" }), (0, B.jsx)("p", { children: e?.missing ? "可继续浏览分镜。原片可在高级工具中重新定位。" : k ? F ? "可生成一份兼容预览。" : "请查看任务日志或选择其他视频。" : "MP4、MOV、MKV、WebM 等常用格式" }), !d && (0, B.jsx)(D, { kind: "primary", icon: k && F ? $t : qe, disabled: x, onClick: k && F ? n : i, children: k && F ? "生成兼容预览" : "选择视频" })] })] }), (m || L != null) && (0, B.jsxs)("div", { className: "drop-overlay", children: [(0, B.jsx)(Pr, { size: 25 }), (0, B.jsx)("strong", { children: L != null ? "正在导入 · " + L + "%" : "松开以导入视频" })] })] })] });
}
function vN() {
  return (0, B.jsx)($t, { size: 17, "aria-hidden": true });
}
function LN({ shot: e, position: t, duration: a, selected: o, playing: l, select: r, importFile: i }) {
  let [n, u] = (0, Sa.useState)(false), d = Math.max(0, e.start / a * 100), c = Math.max(0.15, Math.min(100 - d, (e.end - e.start) / a * 100));
  return (0, B.jsxs)("button", { type: "button", className: "shot-clip" + (o ? " selected" : "") + (l ? " playing" : "") + (n ? " drop-target" : ""), style: { left: d + "%", width: c + "%" }, onClick: () => r(e), "aria-pressed": o, "aria-label": "定位镜头 " + t, "data-shot": e.id, title: "镜头 " + t + " · " + e.label + " · " + kt(e.start, true), ...bM((h) => i(h, e.id), u), children: [e.thumb && (0, B.jsx)("img", { src: e.thumb, draggable: false, alt: "" }), (0, B.jsx)("span", { className: "clip-index", children: String(t).padStart(2, "0") }), (0, B.jsx)("span", { className: "clip-title", children: e.replacement_name ? "已替换" : e.label })] });
}
function bN(e, t) {
  if (!e) return [];
  let a = e / (7 * t), o = 10 ** Math.floor(Math.log10(a)), l = ([1, 2, 5, 10].find((i) => i * o >= a) || 10) * o, r = Math.min(90, Math.floor(e / l));
  return Array.from({ length: r + 1 }, (i, n) => n * l);
}
function SM({ shots: e, source: t, duration: a, time: o, selected: l, current: r, select: i, seek: n, importFile: u, audioTracks: d, muted: c, canMute: h, toggleMute: s, openMixer: f }) {
  let [v, L] = (0, Sa.useState)(1), [x, p] = (0, Sa.useState)(false), m = (0, Sa.useRef)(null), g = (0, Sa.useMemo)(() => bN(a, v), [a, v]), S = Math.max(0.01, a || 0), E = Math.min(100, o / S * 100), A = d.some((T) => T.id === "vocals" || T.id === "music"), I = d.filter((T) => T.id === "original" || T.id === "external" || x);
  return (0, Sa.useEffect)(() => {
    let T = m.current;
    if (!T || v === 1) return;
    let w = T.firstElementChild.offsetWidth * E / 100;
    (w < T.scrollLeft || w > T.scrollLeft + T.clientWidth - 12) && (T.scrollLeft = Math.max(0, w - T.clientWidth * 0.4));
  }, [E, v]), (0, B.jsxs)("section", { className: "timeline", "aria-label": "分镜时间线", children: [(0, B.jsxs)("div", { className: "panel-head timeline-head", children: [(0, B.jsxs)("div", { className: "panel-heading", children: [(0, B.jsx)(fl, { size: 17 }), (0, B.jsx)("h2", { children: "分镜时间线" }), e.length > 0 && (0, B.jsxs)("span", { className: "count", children: [e.length, " 个镜头"] })] }), (0, B.jsxs)("div", { className: "timeline-actions", children: [t && !t.missing && (0, B.jsx)(St, { icon: Od, label: "音轨混音", onClick: f }), A && (0, B.jsx)(D, { kind: "ghost", className: "timeline-stems", icon: Xa, "aria-pressed": x, title: x ? "收起分离音轨" : "展开分离音轨", onClick: () => p(!x), children: x ? "收起分轨" : "展开分轨" }), (0, B.jsxs)("span", { className: "time-readout", children: [kt(o, true), " ", (0, B.jsxs)("span", { children: ["/ ", kt(a)] })] }), (0, B.jsxs)("div", { className: "zoom-controls", children: [(0, B.jsx)(St, { icon: Dd, label: "缩小时间线", disabled: v <= 1, onClick: () => L(Math.max(1, v - 0.5)) }), (0, B.jsxs)(wc, { className: "zoom-slider", min: 1, max: 4, step: 0.25, value: [v], onValueChange: ([T]) => L(T), children: [(0, B.jsx)(Mc, { className: "slider-track", children: (0, B.jsx)(rM, { className: "slider-fill" }) }), (0, B.jsx)(Rc, { className: "slider-thumb", "aria-label": "时间线缩放" })] }), (0, B.jsx)(St, { icon: Hi, label: "放大时间线", disabled: v >= 4, onClick: () => L(Math.min(4, v + 0.5)) })] }), (0, B.jsx)(St, { icon: Hr, label: "适应时间线宽度", onClick: () => {
    L(1), m.current && (m.current.scrollLeft = 0);
  } })] })] }), (0, B.jsxs)("div", { className: "timeline-lanes", children: [(0, B.jsxs)("div", { className: "timeline-labels", "aria-label": "轨道", children: [(0, B.jsx)("div", { className: "timeline-label-title", children: "轨道" }), (0, B.jsxs)("div", { className: "timeline-track-label video-label", children: [(0, B.jsx)($t, { size: 14, "aria-hidden": "true" }), (0, B.jsx)("span", { children: "分镜" })] }), I.map((T) => (0, B.jsx)(vM, { track: T, muted: c, canMute: h, toggleMute: s }, T.id))] }), (0, B.jsx)("div", { className: "timeline-content", ref: m, children: (0, B.jsxs)("div", { className: "track", style: { width: v * 100 + "%" }, children: [(0, B.jsxs)("div", { className: "time-ruler", children: [g.map((T) => (0, B.jsx)("span", { className: T / S > 0.91 ? "tick-end" : void 0, style: { left: T / S * 100 + "%" }, children: kt(T, a < 12) }, T)), a > 0 && (0, B.jsxs)(wc, { className: "scrubber", value: [Math.min(S, o)], min: 0, max: S, step: 0.01, onValueChange: ([T]) => n(T), children: [(0, B.jsx)(Mc, { className: "scrub-track" }), (0, B.jsx)(Rc, { className: "scrub-thumb", "aria-label": "时间线播放位置" })] })] }), (0, B.jsxs)("div", { className: "shot-track", children: [e.map((T, w) => (0, B.jsx)(LN, { shot: T, position: w + 1, duration: S, selected: T.id === l, playing: T.id === r, select: i, importFile: u }, T.id)), !e.length && (0, B.jsxs)("div", { className: "track-empty", children: [(0, B.jsx)(Ka, { size: 17 }), t ? "拆解完成后，镜头会按原片时间排在这里。" : "导入视频后开始拆解。"] })] }), I.map((T) => (0, B.jsx)(LM, { track: T, duration: a, time: o, seek: n, muted: T.id === "original" && c }, T.id)), a > 0 && (0, B.jsx)("div", { className: "playhead", style: { left: E + "%" } })] }) })] })] });
}
var _ = N(Te(), 1), yM = "视频拆解工作台";
function xN({ state: e, options: t, disabled: a, command: o, showExport: l }) {
  let r = e.project?.name || e.source?.name || "新建项目";
  return (0, _.jsxs)("header", { className: "appbar", children: [(0, _.jsxs)("div", { className: "brand", children: [(0, _.jsx)("span", { className: "brand-mark", children: (0, _.jsx)(fl, { size: 20 }) }), (0, _.jsx)("strong", { children: yM })] }), (0, _.jsxs)("div", { className: "breadcrumb", title: r, children: [(0, _.jsx)(fu, { size: 15 }), (0, _.jsx)("span", { children: Ab(r) })] }), (0, _.jsxs)("div", { className: "header-actions", children: [(0, _.jsx)(D, { kind: "ghost", icon: qe, disabled: a, onClick: () => o("pick_project"), children: "打开项目" }), e.project?.report && (0, _.jsx)(D, { icon: fo, onClick: () => o("open_report"), children: "打开报告" }), e.project ? (0, _.jsx)(D, { kind: "primary", icon: Pr, disabled: a || e.source?.missing, onClick: l, children: "导出成片" }) : (0, _.jsx)(D, { kind: "primary", icon: Ka, disabled: a || !e.source?.url, onClick: () => o("analyze", { options: t }), children: "开始拆解" })] })] });
}
function SN({ state: e, tab: t, onTab: a, command: o, onNew: l, onRecent: r, openSettings: i, openAdvanced: n, advanced: u, disabled: d }) {
  return (0, _.jsxs)("aside", { className: "sidebar", "aria-label": "项目和工作区", children: [(0, _.jsxs)("div", { className: "sidebar-main", children: [(0, _.jsx)(D, { className: "new-project wide", icon: Hi, title: "新建拆解", onClick: l, disabled: d, children: "新建拆解" }), (0, _.jsx)("nav", { className: "side-nav", "aria-label": "工作区", children: Tb.map(({ id: c, label: h, icon: s }) => (0, _.jsxs)("button", { type: "button", title: h, className: !u && t === c ? "nav-item active" : "nav-item", "aria-pressed": !u && t === c, onClick: () => a(c), children: [(0, _.jsx)(s, { size: 18 }), (0, _.jsx)("span", { children: c === "shot" ? "分镜剪辑" : c === "subtitles" ? "字幕与声音" : c === "analysis" ? "视频拆解" : "提示词" })] }, c)) }), (0, _.jsxs)("div", { className: "recent", children: [(0, _.jsxs)("div", { className: "sidebar-section-title", children: [(0, _.jsx)("h2", { children: "最近项目" }), (0, _.jsx)(St, { icon: qe, label: "浏览项目文件", disabled: d, onClick: () => o("pick_project") })] }), e.recent.length ? e.recent.map((c) => (0, _.jsxs)("button", { type: "button", className: e.project?.id === c.id ? "recent-row current" : "recent-row", title: c.name, disabled: d, onClick: () => r(c.id), children: [(0, _.jsx)(Gr, { src: c.thumb }), (0, _.jsxs)("span", { className: "recent-text", children: [(0, _.jsx)("strong", { children: Ab(c.name) }), (0, _.jsxs)("small", { children: [c.shots, " 个镜头 · ", kt(c.duration)] })] })] }, c.id)) : (0, _.jsx)("p", { className: "empty-recent", children: "完成拆解后，项目会出现在这里。" })] })] }), (0, _.jsxs)("div", { className: "side-bottom", children: [(0, _.jsxs)("button", { type: "button", className: "nav-item", title: "设置", onClick: i, children: [(0, _.jsx)(Fi, { size: 18 }), (0, _.jsx)("span", { children: "设置" })] }), (0, _.jsxs)("button", { type: "button", className: u ? "nav-item active" : "nav-item", title: "高级工具", "aria-pressed": u, onClick: () => n("tools"), children: [(0, _.jsx)(po, { size: 18 }), (0, _.jsx)("span", { children: "高级工具" })] })] })] });
}
function CN({ state: e, command: t, open: a, close: o, checkRuntime: l, disabled: r }) {
  let [i, n] = (0, j.useState)({});
  (0, j.useEffect)(() => {
    a && n({ base: e.settings.base, model: e.settings.model, engine: e.settings.engine, key: "" });
  }, [a]);
  let u = [["base", "服务地址", "https://…/v1"], ["model", "模型名", "支持视频或图像的模型"], ["key", "本次会话密钥", e.settings.has_key ? "已填写 · 输入新密钥可替换" : "API Key"]];
  return (0, _.jsxs)(hl, { open: a, onClose: o, title: "工作台设置", children: [(0, _.jsxs)("div", { className: "modal-content settings-fields", children: [(0, _.jsx)("label", { children: "项目保存位置" }), (0, _.jsxs)("button", { type: "button", className: "path-button", onClick: () => t("pick_output"), title: e.settings.output, children: [(0, _.jsx)(qe, { size: 16 }), (0, _.jsx)("span", { children: e.settings.output }), (0, _.jsx)(fu, { size: 14 })] }), e.tools && (0, _.jsx)(Kd, { label: "平台元数据 JSON", value: e.tools.inputs.meta, disabled: r, choose: () => t("tool_pick", { field: "meta" }), clear: () => t("tool_clear_input", { field: "meta" }) }), (0, _.jsx)("h3", { children: "多模态分析" }), u.map(([d, c, h]) => (0, _.jsxs)("label", { className: "field", children: [(0, _.jsx)("span", { children: c }), (0, _.jsx)("input", { type: d === "key" ? "password" : "text", autoComplete: "off", placeholder: h, value: i[d] ?? "", onChange: (s) => n({ ...i, [d]: s.target.value }) })] }, d)), (0, _.jsxs)("div", { className: "button-row", children: [(0, _.jsx)(D, { icon: qe, onClick: () => t("pick_env"), children: e.settings.env ? Wm(e.settings.env) : "选择 .env 配置" }), e.settings.env && (0, _.jsx)(D, { kind: "ghost", onClick: () => t("settings", { clear_env: true }), children: "取消使用 .env" })] }), (0, _.jsx)("p", { className: "field-hint", children: "开启多模态分析后，画面和音轨素材会发送给所配置的服务。" }), e.tools && (0, _.jsxs)(_.Fragment, { children: [(0, _.jsx)("h3", { children: "自动视频生成" }), (0, _.jsx)(Kd, { label: "生成后端目录", value: e.settings.capsule_root, disabled: r, placeholder: "选择已配置的 capsule-cinema 文件夹…", choose: () => t("tool_pick", { field: "capsule_root" }), clear: () => t("tool_clear_input", { field: "capsule_root" }) }), (0, _.jsx)(Kd, { label: "后端 Python", value: e.settings.capsule_python, disabled: r, placeholder: "使用后端目录的默认 Python", choose: () => t("tool_pick", { field: "capsule_python" }), clear: () => t("tool_clear_input", { field: "capsule_python" }) })] }), (0, _.jsxs)("label", { className: "field", children: [(0, _.jsx)("span", { children: "默认生成引擎" }), (0, _.jsx)("input", { value: i.engine ?? "", placeholder: "例如 seedance2.0", onChange: (d) => n({ ...i, engine: d.target.value }) })] })] }), (0, _.jsxs)("div", { className: "modal-actions", children: [e.tools && (0, _.jsx)(D, { kind: "ghost", icon: Kl, disabled: r, onClick: l, children: "检查本机运行环境" }), (0, _.jsx)(D, { kind: "ghost", onClick: o, children: "关闭" }), (0, _.jsx)(D, { kind: "primary", icon: na, disabled: r, onClick: async () => {
    await t("settings", i) !== void 0 && o();
  }, children: "保存设置" })] })] });
}
function yN({ state: e, open: t, close: a, command: o, openMixer: l }) {
  let [r, i] = (0, j.useState)("mix"), [n, u] = (0, j.useState)(true), [d, c] = (0, j.useState)(false), h = (e.audio_tracks || []).filter((f) => e.audio_mix?.[f.id]?.enabled && e.audio_mix[f.id].volume > 0);
  function s() {
    c(false), a();
  }
  return (0, _.jsxs)(hl, { open: t, onClose: s, title: "导出时间线成片", description: e.project?.shots.length + " 个镜头 · 已替换 " + e.project?.shots.filter((f) => f.replacement_name).length + " 个", children: [(0, _.jsxs)("div", { className: "modal-content", children: [(0, _.jsxs)("div", { className: "tool-field", children: [(0, _.jsx)("span", { children: "保存到" }), (0, _.jsxs)("button", { type: "button", className: "path-button export-path", "aria-label": "更改成片保存位置", title: e.settings.movie_output, disabled: e.active, onClick: () => o("pick_movie_output"), children: [(0, _.jsx)(qe, { size: 16 }), (0, _.jsx)("span", { children: e.settings.movie_output }), (0, _.jsx)("strong", { children: "更改" })] })] }), (0, _.jsx)(bo, { checked: n, onChange: u, hint: "把识别出的字幕、标题和花字叠到替换镜头", children: "恢复剪辑包装" }), (0, _.jsx)("label", { className: "field-label", children: "成片音轨" }), (0, _.jsx)(Kr, { values: [["mix", "工程音轨"], ["original", "沿用原片"], ["mute", "静音"], ["custom", "替换音频"]], value: r, onChange: i, label: "导出音轨" }), r === "mix" && (0, _.jsxs)("div", { className: "mix-export-summary", children: [(0, _.jsx)("span", { children: h.length ? h.map((f) => f.label + " " + e.audio_mix[f.id].volume + "%").join(" · ") : "静音输出" }), (0, _.jsx)(D, { kind: "ghost", onClick: l, children: "调整混音" })] }), (0, _.jsx)(bo, { checked: d, onChange: c, children: "同时导出对比视频" })] }), (0, _.jsxs)("div", { className: "modal-actions", children: [(0, _.jsx)(D, { kind: "ghost", onClick: s, children: "取消" }), (0, _.jsx)(D, { kind: "primary", icon: Pr, disabled: e.active, onClick: async () => {
    await o("assemble", { audio: r, overlays: n, compare: d }) !== void 0 && s();
  }, children: "开始导出" })] })] });
}
function EN({ state: e, open: t, close: a, command: o }) {
  let l = (0, j.useRef)(null);
  return (0, j.useEffect)(() => {
    l.current && (l.current.scrollTop = l.current.scrollHeight);
  }, [e.logs.length, t]), (0, _.jsxs)(hl, { open: t, onClose: a, title: "任务日志", className: "logs-modal", children: [(0, _.jsx)("div", { className: "modal-content", children: (0, _.jsx)("pre", { className: "log-output", ref: l, children: e.logs.join(`
`) || "暂无任务记录。" }) }), (0, _.jsxs)("div", { className: "modal-actions", children: [e.active && (0, _.jsx)(D, { icon: hu, onClick: () => o("stop"), children: "停止任务" }), (0, _.jsx)(D, { kind: "ghost", onClick: a, children: "关闭" })] })] });
}
function gS(e) {
  return e ? { time: e.currentTime, playing: !e.paused && !e.ended, volume: e.volume, muted: e.muted, rate: e.playbackRate } : null;
}
function IN() {
  let [e, t] = (0, j.useState)(null), [a, o] = (0, j.useState)(""), [l, r] = (0, j.useState)("analysis"), [i, n] = (0, j.useState)(null), [u, d] = (0, j.useState)(null), [c, h] = (0, j.useState)(null), [s, f] = (0, j.useState)(null), [v, L] = (0, j.useState)(0), [x, p] = (0, j.useState)({}), [m, g] = (0, j.useState)(false), [S, E] = (0, j.useState)(null), [A, I] = (0, j.useState)(null), [T, w] = (0, j.useState)(null), [k, F] = (0, j.useState)(null), [V, $] = (0, j.useState)(false), [ee, me] = (0, j.useState)(null), [we, je] = (0, j.useState)(null), Ve = (0, j.useRef)(null), Ge = (0, j.useRef)(null), Y = (0, j.useRef)(null), ae = (0, j.useRef)(null), sa = (0, j.useRef)(0), Ca = (0, j.useRef)(null), Tl = (0, j.useRef)(void 0), yo = (0, j.useRef)(false), pt = (0, j.useCallback)((q, G = false) => {
    clearTimeout(Ca.current), F({ message: q, error: G }), Ca.current = setTimeout(() => F(null), G ? 6900 : 3600);
  }, []), Pt = (0, j.useCallback)(async () => {
    let q = ++sa.current, G = await NT();
    return q === sa.current && (t(G), d((Xt) => Xt || G.options)), G;
  }, []), at = (0, j.useCallback)(async (q, G) => {
    try {
      let Xt = await Uo(q, G);
      return await Pt(), Xt;
    } catch (Xt) {
      pt(Xt.message, true);
      return;
    }
  }, [pt, Pt]);
  (0, j.useEffect)(() => {
    Pt().catch((q) => o(q.message));
  }, [Pt]);
  let Et = e?.active || e?.importing;
  (0, j.useEffect)(() => {
    if (!Et) return;
    let q = setInterval(() => Pt().catch(() => {
    }), 500);
    return () => clearInterval(q);
  }, [Et, Pt]), (0, j.useEffect)(() => {
    e && (yo.current && !e.active && pt(e.error || e.status, !!e.error), yo.current = e.active);
  }, [e, pt]);
  let Ut = e?.project?.id, ct = e?.source, It = ct?.path, Yo = ct?.url, ni = ct?.missing, ui = ct?.needs_preview, tr = ct?.compatible;
  (0, j.useEffect)(() => {
    e && (Tl.current !== Ut && (r(Ut ? "shot" : "analysis"), f(null), Tl.current = Ut), L(0), p({}), I(null), Ge.current = null);
  }, [Ut, It]), (0, j.useEffect)(() => {
    Y.current = null, ae.current = null, E(null);
  }, [It]), (0, j.useEffect)(() => {
    tr && (Y.current = null);
  }, [tr]), (0, j.useEffect)(() => {
    It && !ni && ui == null && Uo("inspect_source", { path: It }).then(Pt).catch(() => {
    });
  }, [It, ni, ui, Pt]);
  let dn = (0, j.useCallback)(async (q, G, Xt) => {
    Y.current = q;
    let Is = { path: q, url: G, position: Xt };
    ae.current = Is, await at("preview", { path: q }) === void 0 && ae.current === Is && (ae.current = null);
  }, [at]);
  (0, j.useEffect)(() => {
    if (!It || !Yo || ni || tr || Et || T != null || i || A || Y.current === It) return;
    let q = S?.url === Yo ? S : null;
    (ui || q) && dn(It, Yo, q ? q.position : gS(Ve.current));
  }, [It, Yo, ni, tr, ui, Et, T, i, A, S, dn]);
  let cn = Ut || It, Cs = e?.tracks || [], si = ee && ee.source === cn && Cs.some((q) => q.id === ee.id) ? ee.id : Cs[0]?.id, ve = si ? JSON.stringify([cn, si]) : null, ar = we?.key === ve ? we.items : [];
  if ((0, j.useEffect)(() => {
    if (!si) return;
    let q = false;
    return Uo("read_track", { track: si }).then((G) => {
      q || je({ key: ve, items: G });
    }).catch((G) => {
      q || pt(G.message, true);
    }), () => {
      q = true;
    };
  }, [si, ve, e?.active, e?.subtitle_revision, pt]), (0, j.useEffect)(() => {
    let q = (G) => {
      G.dataTransfer?.types.includes("Files") && G.preventDefault();
    };
    return window.addEventListener("dragover", q), window.addEventListener("drop", q), () => {
      window.removeEventListener("dragover", q), window.removeEventListener("drop", q);
    };
  }, []), !e || !u) return (0, _.jsxs)("div", { className: "boot", children: [(0, _.jsx)("span", { className: "brand-mark", children: (0, _.jsx)(fl, { size: 21 }) }), (0, _.jsx)("strong", { children: yM }), a ? (0, _.jsxs)(_.Fragment, { children: [(0, _.jsx)("p", { children: a }), (0, _.jsx)(D, { icon: qe, onClick: () => location.reload(), children: "重新加载" })] }) : (0, _.jsx)("span", { children: "正在读取工作区…" })] });
  let di = e.project?.shots || [], kc = di.find((q) => v >= q.start && v < q.end), fn = di.find((q) => q.id === s) || kc || di[0], ys = ct?.duration || x.duration, Es = Number.isFinite(ys) && ys > 0 ? ys : 0, bh = A || ct, jo = !!(Et || T != null), da = V ? ar.find((q) => v >= q.start && v < q.end)?.text : "", ht = { width: ct?.width || x.width, height: ct?.height || x.height }, ci = (q) => d((G) => ({ ...G, ...q })), Ie = () => h(null);
  function ot() {
    Ve.current?.pause(), h("mix");
  }
  function ca(q) {
    if (!e.tools) {
      pt("请重新打开工作台以加载新版高级工具。", true);
      return;
    }
    Ve.current?.pause(), n(q);
  }
  function xh(q, G) {
    n(null), r(q), G && (f(G.id), Dc(G.start));
  }
  function Dc(q) {
    let G = Math.max(0, Math.min(Es || q, q));
    L(G);
    let Xt = Ve.current;
    !A && Xt?.readyState ? Xt.currentTime = G : (Ge.current = G, A && I(null));
  }
  function EM(q) {
    let G = q.currentTarget;
    if (vS(q), A) return;
    p({ duration: G.duration, width: G.videoWidth, height: G.videoHeight });
    let Xt = ae.current;
    if (tr && Xt?.path === It && Xt.url !== Yo && (ae.current = null, Xt.position)) {
      let { time: Is, playing: bS, volume: _M, muted: wM, rate: MM } = Xt.position;
      G.currentTime = Math.min(G.duration || Is, Is), G.volume = _M, G.muted = wM, G.playbackRate = MM, bS && G.play().catch(() => {
      });
    }
    Ge.current != null && (G.currentTime = Math.min(G.duration || Ge.current, Ge.current), Ge.current = null);
  }
  function vS(q) {
    let G = q.currentTarget;
    g(G.muted || G.volume === 0);
  }
  function IM() {
    let q = Ve.current;
    if (!q || A) return;
    let G = q.muted || q.volume === 0;
    G && q.volume === 0 && (q.volume = 0.75), q.muted = !G;
  }
  function AM(q) {
    f(q.id), Dc(q.start), l === "analysis" && r("shot");
  }
  async function LS(q, G) {
    if (!jo) {
      w(0);
      try {
        await HT(q, G, w), await Pt(), G && f(G), pt(G ? "镜头替换素材已导入" : "参考视频已导入");
      } catch (Xt) {
        pt(Xt.message, true);
      } finally {
        w(null);
      }
    }
  }
  async function TM() {
    await at("new") !== void 0 && xh("analysis");
  }
  return (0, _.jsxs)("div", { className: "studio", children: [(0, _.jsx)(xN, { state: e, options: u, disabled: jo, command: at, showExport: () => h("export") }), (0, _.jsxs)("div", { className: "shell", children: [(0, _.jsx)(SN, { state: e, tab: l, onTab: xh, command: at, disabled: jo, openSettings: () => h("settings"), onNew: TM, advanced: !!i, openAdvanced: ca, onRecent: async (q) => {
    await at("open_recent", { id: q }) !== void 0 && n(null);
  } }), (0, _.jsxs)("main", { className: "workarea", hidden: !!i, children: [(0, _.jsx)(xM, { source: ct, playback: bh, videoRef: Ve, onTime: (q) => !A && L(q.currentTarget.currentTime), onMetadata: EM, onImport: LS, onPick: () => at("pick_source"), onVolume: vS, onPreview: () => dn(It, Yo, S?.url === Yo ? S.position : gS(Ve.current)), onPreviewProblem: (q, G) => E({ url: q, position: gS(G) }), preparingPreview: e.active && e.status === "正在生成兼容预览", onOriginal: () => {
    Ge.current = v, I(null);
  }, caption: da, captions: e.tracks.length ? V : null, setCaptions: $, upload: T, disabled: jo, metadata: ht }), (0, _.jsx)(SM, { shots: di, source: ct, duration: Es, time: v, selected: fn?.id, current: kc?.id, select: AM, seek: Dc, importFile: LS, audioTracks: e.audio_tracks || [], muted: m, canMute: !!(!A && ct?.url && Es > 0), toggleMute: IM, openMixer: ot })] }), (0, _.jsx)(zT, { tab: l, onTab: r, state: e, options: u, setOption: ci, command: at, hidden: !!i, openAdvanced: ca, openSettings: () => h("settings"), shot: fn, shotIndex: di.indexOf(fn), disabled: jo, playback: I, track: si, setTrack: (q) => me({ source: cn, id: q }), cues: ar, time: v, seek: Dc, notify: pt }), i && (0, _.jsx)(XT, { page: i, setPage: n, close: () => n(null), state: e, options: u, setOption: ci, command: at, disabled: jo, initialShot: fn?.id, openSettings: () => h("settings"), onEditor: xh, onExport: () => h("export"), notify: pt, onPreview: (q) => {
    n(null), I({ ...q, override: true });
  } })] }), (0, _.jsxs)("footer", { className: "statusbar" + (e.active ? " working" : ""), children: [(0, _.jsxs)("div", { className: "status-copy", children: [(0, _.jsx)("span", { className: e.error ? "status-dot problem" : "status-dot" }), (0, _.jsx)("span", { "aria-live": "polite", children: T != null ? "正在导入视频" : e.status }), e.active && (0, _.jsx)("span", { className: "status-detail", title: e.logs.at(-1), children: e.logs.at(-1) })] }), (0, _.jsxs)("div", { className: "status-actions", children: [e.project?.exports.length > 0 && (0, _.jsx)(D, { icon: qe, title: e.project.exports[0].name, onClick: () => at("tool_open_exports"), children: "打开成片位置" }), e.project && (0, _.jsx)(D, { kind: "ghost", icon: qe, onClick: () => at("open_folder"), children: "项目文件夹" }), e.active && (0, _.jsx)(D, { kind: "ghost", icon: hu, onClick: () => at("stop"), children: "停止" }), (0, _.jsx)(D, { kind: "ghost", icon: Kl, onClick: () => h("logs"), children: "任务日志" })] })] }), (0, _.jsx)(CN, { open: c === "settings", close: Ie, command: at, state: e, disabled: jo, checkRuntime: () => {
    Ie(), ca("tools"), at("tool_runtime");
  } }), e.project && (0, _.jsx)(yN, { open: c === "export", close: Ie, command: at, state: e, openMixer: ot }), (0, _.jsx)(KT, { open: c === "mix", close: Ie, command: at, state: e, time: v, disabled: jo }), (0, _.jsx)(EN, { open: c === "logs", close: Ie, command: at, state: e }), k && (0, _.jsxs)("div", { className: k.error ? "toast error" : "toast", role: k.error ? "alert" : "status", children: [k.error ? (0, _.jsx)(Mo, { size: 18 }) : (0, _.jsx)(na, { size: 18 }), (0, _.jsx)("span", { children: k.message }), (0, _.jsx)(St, { icon: Wa, label: "关闭提示", onClick: () => F(null) })] })] });
}
(0, CM.createRoot)(document.getElementById("root")).render((0, _.jsx)(IN, {}));
/*! For license information please see studio.js.LEGAL.txt */
