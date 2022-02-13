var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// node_modules/svelte/internal/index.mjs
function noop() {
}
var identity = (x) => x;
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
var is_client = typeof window !== "undefined";
var now = is_client ? () => window.performance.now() : () => Date.now();
var raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
var tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
var is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function append(target, node) {
  target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var managed_styles = /* @__PURE__ */ new Map();
var active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1);
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info) => {
      const { stylesheet } = info;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      info.rules = {};
    });
    managed_styles.clear();
  });
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var seen_callbacks = /* @__PURE__ */ new Set();
var flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
var outroing = /* @__PURE__ */ new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
var null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick2(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick2(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick2(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
function destroy_block(block, lookup) {
  block.d(1);
  lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
  transition_out(block, 1, 1, () => {
    lookup.delete(block.key);
  });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block4, next, get_context) {
  let o = old_blocks.length;
  let n = list.length;
  let i = o;
  const old_indexes = {};
  while (i--)
    old_indexes[old_blocks[i].key] = i;
  const new_blocks = [];
  const new_lookup = /* @__PURE__ */ new Map();
  const deltas = /* @__PURE__ */ new Map();
  i = n;
  while (i--) {
    const child_ctx = get_context(ctx, list, i);
    const key = get_key(child_ctx);
    let block = lookup.get(key);
    if (!block) {
      block = create_each_block4(key, child_ctx);
      block.c();
    } else if (dynamic) {
      block.p(child_ctx, dirty);
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes)
      deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  const will_move = /* @__PURE__ */ new Set();
  const did_move = /* @__PURE__ */ new Set();
  function insert2(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }
  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.key;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert2(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert2(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block.key))
      destroy(old_block, lookup);
  }
  while (n)
    insert2(new_blocks[n - 1]);
  return new_blocks;
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance5, create_fragment5, not_equal, props, append_styles2, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles2 && append_styles2($$.root);
  let ready = false;
  $$.ctx = instance5 ? instance5(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment5 ? create_fragment5($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};

// node_modules/svelte/store/index.mjs
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}

// node_modules/nanoid/index.prod.js
if (false) {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative" && typeof crypto === "undefined") {
    throw new Error("React Native does not have a built-in secure random generator. If you don\u2019t need unpredictable IDs use `nanoid/non-secure`. For secure IDs, import `react-native-get-random-values` before Nano ID.");
  }
  if (typeof msCrypto !== "undefined" && typeof crypto === "undefined") {
    throw new Error("Import file with `if (!window.crypto) window.crypto = window.msCrypto` before importing Nano ID to fix IE 11 support");
  }
  if (typeof crypto === "undefined") {
    throw new Error("Your browser does not have secure random generator. If you don\u2019t need unpredictable IDs, you can use nanoid/non-secure.");
  }
}
var random = (bytes) => crypto.getRandomValues(new Uint8Array(bytes));
var customRandom = (alphabet, size, getRandom) => {
  let mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
  let step = -~(1.6 * mask * size / alphabet.length);
  return () => {
    let id = "";
    while (true) {
      let bytes = getRandom(step);
      let j = step;
      while (j--) {
        id += alphabet[bytes[j] & mask] || "";
        if (id.length === size)
          return id;
      }
    }
  };
};
var customAlphabet = (alphabet, size) => customRandom(alphabet, size, random);

// src/store.ts
var nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz0123456789", 6);
var initialElements = [
  {
    name: "GOLD",
    price: 0
  },
  {
    name: "SILVER",
    price: 0
  },
  {
    name: "PLATIN",
    price: 0
  },
  {
    name: "IRON",
    price: 0
  },
  {
    name: "COPPER",
    price: 0
  }
];
var metaller = writable(initialElements);
var comperators = writable(["LESS", "EQUAL", "GREATOR"]);
var createUsers = (initial) => {
  const { subscribe: subscribe2, set, update: update2 } = writable(initial);
  return {
    subscribe: subscribe2,
    set,
    update: update2,
    addUser: (name) => update2((a) => {
      let newUserId = nanoid();
      let newUsers = __spreadValues({}, a);
      newUsers[newUserId] = {
        id: newUserId,
        name,
        alarms: {}
      };
      return newUsers;
    }),
    removeUser: (userId) => update2((a) => {
      let newUsers = __spreadValues({}, a);
      delete newUsers[userId];
      return newUsers;
    }),
    addAlarm: ({ userId, alarmName }) => update2((a) => {
      let newAlarmId = nanoid();
      let newUsers = __spreadValues({}, a);
      newUsers[userId].alarms = __spreadProps(__spreadValues({}, newUsers[userId].alarms), {
        [newAlarmId]: {
          id: newAlarmId,
          name: alarmName,
          conditions: {}
        }
      });
      return newUsers;
    }),
    removeAlarm: ({ userId, alarmId }) => update2((a) => {
      let newUsers = __spreadValues({}, a);
      delete newUsers[userId].alarms[alarmId];
      return newUsers;
    }),
    addCondition: ({ userId, alarmId, condition }) => update2((a) => {
      let newConditionId = nanoid();
      let newUsers = __spreadValues({}, a);
      newUsers[userId].alarms[alarmId].conditions = __spreadProps(__spreadValues({}, newUsers[userId].alarms[alarmId].conditions), {
        [newConditionId]: condition
      });
      return newUsers;
    }),
    removeCondition: ({ userId, alarmId, conditionId }) => update2((a) => {
      let newUsers = __spreadValues({}, a);
      delete newUsers[userId].alarms[alarmId].conditions[conditionId];
      return newUsers;
    }),
    reset: () => set(initial)
  };
};
var users = createUsers({});

// node_modules/svelte/easing/index.mjs
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function expoOut(t) {
  return t === 1 ? t : 1 - Math.pow(2, -10 * t);
}

// node_modules/svelte/transition/index.mjs
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}

// src/components/parts/ButtonAddInput.svelte
function add_css(target) {
  append_styles(target, "svelte-1mvmfdl", '.addInput.svelte-1mvmfdl{flex:1;min-width:0;margin:0;margin-right:10px}input[type="button"].svelte-1mvmfdl{cursor:pointer;background:crimson;color:white;font-size:12px;border-radius:4px;font-weight:300;padding:4px 10px;margin:0px}input[type="text"].svelte-1mvmfdl::placeholder{font-size:14px}input[type="text"].svelte-1mvmfdl::placeholder{font-size:14px}.blue.svelte-1mvmfdl{background:steelblue !important}');
}
function create_else_block(ctx) {
  let input;
  let input_value_value;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      attr(input, "type", "button");
      input.value = input_value_value = ctx[0].begin;
      attr(input, "class", "svelte-1mvmfdl");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      if (!mounted) {
        dispose = listen(input, "click", ctx[3]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 1 && input_value_value !== (input_value_value = ctx2[0].begin)) {
        input.value = input_value_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block(ctx) {
  let input0;
  let input0_placeholder_value;
  let t0;
  let input1;
  let input1_value_value;
  let t1;
  let input2;
  let input2_value_value;
  let mounted;
  let dispose;
  return {
    c() {
      input0 = element("input");
      t0 = space();
      input1 = element("input");
      t1 = space();
      input2 = element("input");
      attr(input0, "type", "text");
      attr(input0, "class", "addInput svelte-1mvmfdl");
      attr(input0, "placeholder", input0_placeholder_value = ctx[0].placeholder);
      attr(input1, "type", "button");
      attr(input1, "class", "blue svelte-1mvmfdl");
      input1.value = input1_value_value = ctx[0].confirm;
      attr(input2, "type", "button");
      input2.value = input2_value_value = ctx[0].cancel;
      attr(input2, "class", "svelte-1mvmfdl");
    },
    m(target, anchor) {
      insert(target, input0, anchor);
      ctx[7](input0);
      insert(target, t0, anchor);
      insert(target, input1, anchor);
      insert(target, t1, anchor);
      insert(target, input2, anchor);
      if (!mounted) {
        dispose = [
          listen(input0, "keypress", ctx[6]),
          listen(input1, "click", ctx[4]),
          listen(input2, "click", ctx[5])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 1 && input0_placeholder_value !== (input0_placeholder_value = ctx2[0].placeholder)) {
        attr(input0, "placeholder", input0_placeholder_value);
      }
      if (dirty & 1 && input1_value_value !== (input1_value_value = ctx2[0].confirm)) {
        input1.value = input1_value_value;
      }
      if (dirty & 1 && input2_value_value !== (input2_value_value = ctx2[0].cancel)) {
        input2.value = input2_value_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(input0);
      ctx[7](null);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(input1);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(input2);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[2])
      return create_if_block;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  const dispatch2 = createEventDispatcher();
  let { text: text2 } = $$props;
  let inputRef;
  let isAdding = false;
  const handleAddNewClick = () => {
    dispatch2("addNewClicked");
    $$invalidate(2, isAdding = true);
    setTimeout(() => {
      inputRef.focus();
    }, 0);
  };
  const handleConfirmClick = () => {
    if (inputRef.value) {
      dispatch2("confirmClicked", { text: inputRef.value });
      $$invalidate(2, isAdding = false);
    } else {
      $$invalidate(1, inputRef.placeholder = text2.ifEmptyPlaceholder, inputRef);
    }
  };
  const handleCancelClick = () => {
    dispatch2("cancelClicked");
    $$invalidate(1, inputRef.value = "", inputRef);
    $$invalidate(2, isAdding = false);
  };
  const handleKeypress = (e) => {
    if (e.which == 13 || e.charCode == 13 || e.keyCode == 13) {
      handleConfirmClick();
      return;
    }
  };
  function input0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      inputRef = $$value;
      $$invalidate(1, inputRef);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("text" in $$props2)
      $$invalidate(0, text2 = $$props2.text);
  };
  return [
    text2,
    inputRef,
    isAdding,
    handleAddNewClick,
    handleConfirmClick,
    handleCancelClick,
    handleKeypress,
    input0_binding
  ];
}
var ButtonAddInput = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { text: 0 }, add_css);
  }
};
var ButtonAddInput_default = ButtonAddInput;

// src/components/parts/ButtonAddCondition.svelte
function add_css2(target) {
  append_styles(target, "svelte-vnty6q", 'input[type="button"].svelte-vnty6q{cursor:pointer;background:crimson;color:white;font-size:12px;border-radius:4px;font-weight:300;padding:4px 10px;margin:0px}input[type="number"].svelte-vnty6q{max-width:88px;text-align:center}.blue.svelte-vnty6q{background:steelblue !important}');
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[18] = list[i];
  return child_ctx;
}
function create_else_block2(ctx) {
  let input;
  let input_value_value;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      attr(input, "type", "button");
      input.value = input_value_value = ctx[0].begin;
      attr(input, "class", "svelte-vnty6q");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      if (!mounted) {
        dispose = listen(input, "click", ctx[7]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 1 && input_value_value !== (input_value_value = ctx2[0].begin)) {
        input.value = input_value_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block2(ctx) {
  let select0;
  let each_blocks_1 = [];
  let each0_lookup = /* @__PURE__ */ new Map();
  let t0;
  let select1;
  let each_blocks = [];
  let each1_lookup = /* @__PURE__ */ new Map();
  let t1;
  let input0;
  let input0_value_value;
  let t2;
  let input1;
  let input1_value_value;
  let t3;
  let input2;
  let input2_value_value;
  let mounted;
  let dispose;
  let each_value_1 = ctx[1];
  const get_key = (ctx2) => ctx2[18];
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
  }
  let each_value = ctx[2];
  const get_key_1 = (ctx2) => ctx2[15];
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key_1(child_ctx);
    each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  return {
    c() {
      select0 = element("select");
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      t0 = space();
      select1 = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t1 = space();
      input0 = element("input");
      t2 = space();
      input1 = element("input");
      t3 = space();
      input2 = element("input");
      attr(input0, "type", "number");
      input0.value = input0_value_value = 0;
      attr(input0, "class", "svelte-vnty6q");
      attr(input1, "type", "button");
      attr(input1, "class", "blue svelte-vnty6q");
      input1.value = input1_value_value = ctx[0].confirm;
      attr(input2, "type", "button");
      input2.value = input2_value_value = ctx[0].cancel;
      attr(input2, "class", "svelte-vnty6q");
    },
    m(target, anchor) {
      insert(target, select0, anchor);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(select0, null);
      }
      ctx[11](select0);
      insert(target, t0, anchor);
      insert(target, select1, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select1, null);
      }
      ctx[12](select1);
      insert(target, t1, anchor);
      insert(target, input0, anchor);
      ctx[13](input0);
      insert(target, t2, anchor);
      insert(target, input1, anchor);
      insert(target, t3, anchor);
      insert(target, input2, anchor);
      if (!mounted) {
        dispose = [
          listen(input0, "keypress", ctx[10]),
          listen(input1, "click", ctx[8]),
          listen(input2, "click", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2) {
        each_value_1 = ctx2[1];
        each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx2, each_value_1, each0_lookup, select0, destroy_block, create_each_block_1, null, get_each_context_1);
      }
      if (dirty & 4) {
        each_value = ctx2[2];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx2, each_value, each1_lookup, select1, destroy_block, create_each_block, null, get_each_context);
      }
      if (dirty & 1 && input1_value_value !== (input1_value_value = ctx2[0].confirm)) {
        input1.value = input1_value_value;
      }
      if (dirty & 1 && input2_value_value !== (input2_value_value = ctx2[0].cancel)) {
        input2.value = input2_value_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(select0);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].d();
      }
      ctx[11](null);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(select1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[12](null);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(input0);
      ctx[13](null);
      if (detaching)
        detach(t2);
      if (detaching)
        detach(input1);
      if (detaching)
        detach(t3);
      if (detaching)
        detach(input2);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block_1(key_1, ctx) {
  let option;
  let t_value = ctx[18] + "";
  let t;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[18];
      option.value = option.__value;
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t_value !== (t_value = ctx[18] + ""))
        set_data(t, t_value);
      if (dirty & 2 && option_value_value !== (option_value_value = ctx[18])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_each_block(key_1, ctx) {
  let option;
  let t_value = ctx[15] + "";
  let t;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[15];
      option.value = option.__value;
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && t_value !== (t_value = ctx[15] + ""))
        set_data(t, t_value);
      if (dirty & 4 && option_value_value !== (option_value_value = ctx[15])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_fragment2(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[6])
      return create_if_block2;
    return create_else_block2;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance2($$self, $$props, $$invalidate) {
  const dispatch2 = createEventDispatcher();
  let { text: text2 } = $$props;
  let { elements } = $$props;
  let { comperators: comperators2 } = $$props;
  let selectMetalRef;
  let selectComperatorRef;
  let selectPriceRef;
  let isAdding = false;
  const handleAddNewClick = () => {
    dispatch2("addNewClicked");
    $$invalidate(6, isAdding = true);
  };
  const handleConfirmClick = () => {
    var _a, _b;
    if ((_b = (_a = selectMetalRef.value) !== null && _a !== void 0 ? _a : selectComperatorRef.value) !== null && _b !== void 0 ? _b : parseInt(selectPriceRef.value)) {
      dispatch2("confirmClicked", {
        condition: {
          element: selectMetalRef.value,
          comperator: selectComperatorRef.value,
          price: parseInt(selectPriceRef.value)
        }
      });
      $$invalidate(6, isAdding = false);
    }
  };
  const handleCancelClick = () => {
    dispatch2("cancelClicked");
    $$invalidate(6, isAdding = false);
  };
  const handleKeypress = (e) => {
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    } else if (e.which == 13 || e.charCode == 13 || e.keyCode == 13) {
      handleConfirmClick();
      return;
    }
  };
  function select0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      selectMetalRef = $$value;
      $$invalidate(3, selectMetalRef);
      $$invalidate(1, elements);
    });
  }
  function select1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      selectComperatorRef = $$value;
      $$invalidate(4, selectComperatorRef);
      $$invalidate(2, comperators2);
    });
  }
  function input0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      selectPriceRef = $$value;
      $$invalidate(5, selectPriceRef);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("text" in $$props2)
      $$invalidate(0, text2 = $$props2.text);
    if ("elements" in $$props2)
      $$invalidate(1, elements = $$props2.elements);
    if ("comperators" in $$props2)
      $$invalidate(2, comperators2 = $$props2.comperators);
  };
  return [
    text2,
    elements,
    comperators2,
    selectMetalRef,
    selectComperatorRef,
    selectPriceRef,
    isAdding,
    handleAddNewClick,
    handleConfirmClick,
    handleCancelClick,
    handleKeypress,
    select0_binding,
    select1_binding,
    input0_binding
  ];
}
var ButtonAddCondition = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance2, create_fragment2, safe_not_equal, { text: 0, elements: 1, comperators: 2 }, add_css2);
  }
};
var ButtonAddCondition_default = ButtonAddCondition;

// src/components/Clients.svelte
function add_css3(target) {
  append_styles(target, "svelte-dr2yim", '.wrapper.svelte-dr2yim{display:flex;flex-direction:column;padding:10px 4px 40px;overflow:hidden auto;max-height:65vh}.add-user.svelte-dr2yim{display:flex;justify-content:center;align-items:center;padding:20px 10px 0}input[type="button"].svelte-dr2yim{cursor:pointer;background:crimson;color:white;font-size:12px;border-radius:4px;font-weight:300;padding:4px 10px;margin:0px}.user.svelte-dr2yim{padding:4px;background:linen;margin-bottom:10px;border-radius:4px;border:2px solid cornflowerblue}.title.svelte-dr2yim{display:flex;align-items:center;background:lightsteelblue;border-radius:2px;padding:4px}.text.svelte-dr2yim{flex:1;padding:0 8px}.grey-id.svelte-dr2yim{font-size:10px;color:grey}.user-id.svelte-dr2yim,.alarm-id.svelte-dr2yim{padding-right:20px}.alarms-wrapper.svelte-dr2yim{padding:0 20px}.add-alarm.svelte-dr2yim{text-align:center;margin:20px 0}.alarms-title.svelte-dr2yim,.conditions-title.svelte-dr2yim{font-size:12px;font-weight:700;padding:8px 0}.alarms.svelte-dr2yim{display:grid;grid-template-columns:1fr;gap:10px}.alarm.svelte-dr2yim{min-height:60px;background:lavender}.conditions-wrapper.svelte-dr2yim{padding:0 10px}.add-condition.svelte-dr2yim{margin:10px 0}.condition.svelte-dr2yim{display:grid;grid-template-columns:40px repeat(3, 1fr) 20px;align-items:center;gap:8px}.condition.svelte-dr2yim:hover{background:white}.condition-id.svelte-dr2yim,.condition-price.svelte-dr2yim{font-family:monospace}.condition-price.svelte-dr2yim{text-align:right;padding-right:10px}.delete.svelte-dr2yim{text-align:center;padding:0 1px 2px;cursor:pointer}.delete.svelte-dr2yim:hover{background:crimson;color:white;font-weight:700;border-radius:2px}.sky.svelte-dr2yim{background:skyblue}');
}
function get_each_context2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function get_each_context_12(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
}
function create_each_block_2(key_1, ctx) {
  let div5;
  let div0;
  let t0_value = ctx[15] + "";
  let t0;
  let t1;
  let div1;
  let t2_value = ctx[12].conditions[ctx[15]].element + "";
  let t2;
  let t3;
  let div2;
  let t4_value = ctx[12].conditions[ctx[15]].comperator + "";
  let t4;
  let t5;
  let div3;
  let t6_value = ctx[12].conditions[ctx[15]].price + "";
  let t6;
  let t7;
  let div4;
  let t9;
  let mounted;
  let dispose;
  function click_handler_2() {
    return ctx[5](ctx[9], ctx[12], ctx[15]);
  }
  return {
    key: key_1,
    first: null,
    c() {
      div5 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      t4 = text(t4_value);
      t5 = space();
      div3 = element("div");
      t6 = text(t6_value);
      t7 = space();
      div4 = element("div");
      div4.textContent = "x";
      t9 = space();
      attr(div0, "class", "condition-id grey-id svelte-dr2yim");
      attr(div1, "class", "condition-name");
      attr(div2, "class", "condition-comperator");
      attr(div3, "class", "condition-price svelte-dr2yim");
      attr(div4, "class", "delete svelte-dr2yim");
      attr(div5, "class", "condition svelte-dr2yim");
      this.first = div5;
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div0);
      append(div0, t0);
      append(div5, t1);
      append(div5, div1);
      append(div1, t2);
      append(div5, t3);
      append(div5, div2);
      append(div2, t4);
      append(div5, t5);
      append(div5, div3);
      append(div3, t6);
      append(div5, t7);
      append(div5, div4);
      append(div5, t9);
      if (!mounted) {
        dispose = listen(div4, "click", click_handler_2);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t0_value !== (t0_value = ctx[15] + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && t2_value !== (t2_value = ctx[12].conditions[ctx[15]].element + ""))
        set_data(t2, t2_value);
      if (dirty & 1 && t4_value !== (t4_value = ctx[12].conditions[ctx[15]].comperator + ""))
        set_data(t4, t4_value);
      if (dirty & 1 && t6_value !== (t6_value = ctx[12].conditions[ctx[15]].price + ""))
        set_data(t6, t6_value);
    },
    d(detaching) {
      if (detaching)
        detach(div5);
      mounted = false;
      dispose();
    }
  };
}
function create_each_block_12(key_1, ctx) {
  let div9;
  let div3;
  let div0;
  let t0_value = ctx[12].name + "";
  let t0;
  let t1;
  let div1;
  let t2_value = ctx[12].id + "";
  let t2;
  let t3;
  let div2;
  let input;
  let t4;
  let div8;
  let div5;
  let t6;
  let div6;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t7;
  let div7;
  let buttonaddcondition;
  let t8;
  let current;
  let mounted;
  let dispose;
  function click_handler_1() {
    return ctx[4](ctx[9], ctx[12]);
  }
  let each_value_2 = Object.keys(ctx[12].conditions);
  const get_key = (ctx2) => ctx2[15];
  for (let i = 0; i < each_value_2.length; i += 1) {
    let child_ctx = get_each_context_2(ctx, each_value_2, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
  }
  function confirmClicked_handler(...args) {
    return ctx[6](ctx[9], ctx[12], ...args);
  }
  buttonaddcondition = new ButtonAddCondition_default({
    props: {
      text: {
        begin: "ADD CONDITION",
        confirm: "SAVE",
        cancel: "CANCEL"
      },
      elements: ctx[1].map(func),
      comperators: ctx[2]
    }
  });
  buttonaddcondition.$on("confirmClicked", confirmClicked_handler);
  return {
    key: key_1,
    first: null,
    c() {
      div9 = element("div");
      div3 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      input = element("input");
      t4 = space();
      div8 = element("div");
      div5 = element("div");
      div5.innerHTML = `<div class="conditions-text">CONDITIONS</div>`;
      t6 = space();
      div6 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t7 = space();
      div7 = element("div");
      create_component(buttonaddcondition.$$.fragment);
      t8 = space();
      attr(div0, "class", "text svelte-dr2yim");
      attr(div1, "class", "alarm-id grey-id svelte-dr2yim");
      attr(input, "type", "button");
      input.value = "DEL";
      attr(input, "class", "svelte-dr2yim");
      attr(div2, "class", "delete svelte-dr2yim");
      attr(div3, "class", "title svelte-dr2yim");
      attr(div5, "class", "conditions-title svelte-dr2yim");
      attr(div6, "class", "conditions");
      attr(div7, "class", "add-condition svelte-dr2yim");
      attr(div8, "class", "conditions-wrapper svelte-dr2yim");
      attr(div9, "class", "alarm svelte-dr2yim");
      this.first = div9;
    },
    m(target, anchor) {
      insert(target, div9, anchor);
      append(div9, div3);
      append(div3, div0);
      append(div0, t0);
      append(div3, t1);
      append(div3, div1);
      append(div1, t2);
      append(div3, t3);
      append(div3, div2);
      append(div2, input);
      append(div9, t4);
      append(div9, div8);
      append(div8, div5);
      append(div8, t6);
      append(div8, div6);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div6, null);
      }
      append(div8, t7);
      append(div8, div7);
      mount_component(buttonaddcondition, div7, null);
      append(div9, t8);
      current = true;
      if (!mounted) {
        dispose = listen(input, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & 1) && t0_value !== (t0_value = ctx[12].name + ""))
        set_data(t0, t0_value);
      if ((!current || dirty & 1) && t2_value !== (t2_value = ctx[12].id + ""))
        set_data(t2, t2_value);
      if (dirty & 1) {
        each_value_2 = Object.keys(ctx[12].conditions);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div6, destroy_block, create_each_block_2, null, get_each_context_2);
      }
      const buttonaddcondition_changes = {};
      if (dirty & 2)
        buttonaddcondition_changes.elements = ctx[1].map(func);
      if (dirty & 4)
        buttonaddcondition_changes.comperators = ctx[2];
      buttonaddcondition.$set(buttonaddcondition_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(buttonaddcondition.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(buttonaddcondition.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div9);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(buttonaddcondition);
      mounted = false;
      dispose();
    }
  };
}
function create_each_block2(key_1, ctx) {
  let div9;
  let div3;
  let div0;
  let t0_value = ctx[9].name + "";
  let t0;
  let t1;
  let div1;
  let t2_value = ctx[9].id + "";
  let t2;
  let t3;
  let div2;
  let input;
  let t4;
  let div8;
  let div5;
  let t6;
  let div6;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t7;
  let div7;
  let buttonaddinput;
  let div9_transition;
  let current;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[9]);
  }
  let each_value_1 = Object.values(ctx[9].alarms);
  const get_key = (ctx2) => ctx2[12].id;
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_12(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_12(key, child_ctx));
  }
  function confirmClicked_handler_1(...args) {
    return ctx[7](ctx[9], ...args);
  }
  buttonaddinput = new ButtonAddInput_default({
    props: {
      text: {
        begin: "ADD NEW ALARM",
        confirm: "SAVE",
        cancel: "CANCEL",
        placeholder: "Alarm Name",
        ifEmptyPlaceholder: "Alarm Name can not be empty!"
      }
    }
  });
  buttonaddinput.$on("confirmClicked", confirmClicked_handler_1);
  return {
    key: key_1,
    first: null,
    c() {
      div9 = element("div");
      div3 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      input = element("input");
      t4 = space();
      div8 = element("div");
      div5 = element("div");
      div5.innerHTML = `<div class="alarms-text">ALARMS</div>`;
      t6 = space();
      div6 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t7 = space();
      div7 = element("div");
      create_component(buttonaddinput.$$.fragment);
      attr(div0, "class", "text svelte-dr2yim");
      attr(div1, "class", "user-id grey-id svelte-dr2yim");
      attr(input, "type", "button");
      input.value = "DEL";
      attr(input, "class", "svelte-dr2yim");
      attr(div2, "class", "delete svelte-dr2yim");
      attr(div3, "class", "title sky svelte-dr2yim");
      attr(div5, "class", "alarms-title svelte-dr2yim");
      attr(div6, "class", "alarms svelte-dr2yim");
      attr(div7, "class", "add-alarm svelte-dr2yim");
      attr(div8, "class", "alarms-wrapper svelte-dr2yim");
      attr(div9, "class", "user svelte-dr2yim");
      this.first = div9;
    },
    m(target, anchor) {
      insert(target, div9, anchor);
      append(div9, div3);
      append(div3, div0);
      append(div0, t0);
      append(div3, t1);
      append(div3, div1);
      append(div1, t2);
      append(div3, t3);
      append(div3, div2);
      append(div2, input);
      append(div9, t4);
      append(div9, div8);
      append(div8, div5);
      append(div8, t6);
      append(div8, div6);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div6, null);
      }
      append(div8, t7);
      append(div8, div7);
      mount_component(buttonaddinput, div7, null);
      current = true;
      if (!mounted) {
        dispose = listen(input, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & 1) && t0_value !== (t0_value = ctx[9].name + ""))
        set_data(t0, t0_value);
      if ((!current || dirty & 1) && t2_value !== (t2_value = ctx[9].id + ""))
        set_data(t2, t2_value);
      if (dirty & 7) {
        each_value_1 = Object.values(ctx[9].alarms);
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div6, outro_and_destroy_block, create_each_block_12, null, get_each_context_12);
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(buttonaddinput.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!div9_transition)
            div9_transition = create_bidirectional_transition(div9, scale, { duration: 200, easing: expoOut }, true);
          div9_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(buttonaddinput.$$.fragment, local);
      if (local) {
        if (!div9_transition)
          div9_transition = create_bidirectional_transition(div9, scale, { duration: 200, easing: expoOut }, false);
        div9_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div9);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(buttonaddinput);
      if (detaching && div9_transition)
        div9_transition.end();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment3(ctx) {
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t;
  let div0;
  let buttonaddinput;
  let current;
  let each_value = Object.values(ctx[0]);
  const get_key = (ctx2) => ctx2[9].id;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block2(key, child_ctx));
  }
  buttonaddinput = new ButtonAddInput_default({
    props: {
      text: {
        begin: "ADD NEW USER",
        confirm: "SAVE",
        cancel: "CANCEL",
        placeholder: "User Name",
        ifEmptyPlaceholder: "User Name can not be empty!"
      }
    }
  });
  buttonaddinput.$on("confirmClicked", ctx[8]);
  return {
    c() {
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      div0 = element("div");
      create_component(buttonaddinput.$$.fragment);
      attr(div0, "class", "add-user svelte-dr2yim");
      attr(div1, "class", "wrapper svelte-dr2yim");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div1, null);
      }
      append(div1, t);
      append(div1, div0);
      mount_component(buttonaddinput, div0, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 7) {
        each_value = Object.values(ctx2[0]);
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block2, t, get_each_context2);
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(buttonaddinput.$$.fragment, local);
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(buttonaddinput.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(buttonaddinput);
    }
  };
}
var func = (metal) => metal.name;
function instance3($$self, $$props, $$invalidate) {
  let $users;
  let $metaller;
  let $comperators;
  component_subscribe($$self, users, ($$value) => $$invalidate(0, $users = $$value));
  component_subscribe($$self, metaller, ($$value) => $$invalidate(1, $metaller = $$value));
  component_subscribe($$self, comperators, ($$value) => $$invalidate(2, $comperators = $$value));
  const click_handler = (user) => users.removeUser(user.id);
  const click_handler_1 = (user, alarm) => users.removeAlarm({ userId: user.id, alarmId: alarm.id });
  const click_handler_2 = (user, alarm, id) => users.removeCondition({
    userId: user.id,
    alarmId: alarm.id,
    conditionId: id
  });
  const confirmClicked_handler = (user, alarm, e) => {
    users.addCondition({
      userId: user.id,
      alarmId: alarm.id,
      condition: e.detail.condition
    });
  };
  const confirmClicked_handler_1 = (user, e) => users.addAlarm({
    userId: user.id,
    alarmName: e.detail.text
  });
  const confirmClicked_handler_2 = (e) => users.addUser(e.detail.text);
  return [
    $users,
    $metaller,
    $comperators,
    click_handler,
    click_handler_1,
    click_handler_2,
    confirmClicked_handler,
    confirmClicked_handler_1,
    confirmClicked_handler_2
  ];
}
var Clients = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance3, create_fragment3, safe_not_equal, {}, add_css3);
  }
};
var Clients_default = Clients;

// src/App.svelte
function add_css4(target) {
  append_styles(target, "svelte-17sg1p1", '.wrapper.svelte-17sg1p1{display:grid;grid-template-areas:"title title title"\n			"parite parite parite"\n			"clients servers workers";gap:10px;grid-template-columns:repeat(3, minmax(0, 1fr));padding:0 20px}.title.svelte-17sg1p1{grid-area:title;width:100%;font-size:22px;font-weight:300;text-align:center;color:white;background-color:crimson;padding:20px 0;border-bottom-left-radius:8px;border-bottom-right-radius:8px}.parite.svelte-17sg1p1{grid-area:parite;display:flex;align-items:center;font-family:monospace;font-size:16px;padding:10px}.metal-wrapper.svelte-17sg1p1{display:flex;align-items:center;padding-left:10px}.element.svelte-17sg1p1{display:grid;grid-template-columns:1fr auto;gap:10px;padding:0 10px}.parts-title.svelte-17sg1p1{font-size:12px;letter-spacing:2px;color:white;background:crimson;border-radius:2px;padding:4px 10px}.clients.svelte-17sg1p1{grid-area:clients;width:100%}.servers.svelte-17sg1p1{grid-area:servers;width:100%}.workers.svelte-17sg1p1{grid-area:workers;width:100%}');
}
function get_each_context3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[1] = list[i];
  return child_ctx;
}
function create_each_block3(key_1, ctx) {
  let div2;
  let div0;
  let t0_value = ctx[1].name + "";
  let t0;
  let t1;
  let t2;
  let div1;
  let t3_value = ctx[1].price + "";
  let t3;
  let t4;
  return {
    key: key_1,
    first: null,
    c() {
      div2 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = text(":");
      t2 = space();
      div1 = element("div");
      t3 = text(t3_value);
      t4 = space();
      attr(div2, "class", "element svelte-17sg1p1");
      this.first = div2;
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, t0);
      append(div0, t1);
      append(div2, t2);
      append(div2, div1);
      append(div1, t3);
      append(div2, t4);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t0_value !== (t0_value = ctx[1].name + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && t3_value !== (t3_value = ctx[1].price + ""))
        set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching)
        detach(div2);
    }
  };
}
function create_fragment4(ctx) {
  let div10;
  let div0;
  let t1;
  let div3;
  let div1;
  let t3;
  let div2;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t4;
  let div5;
  let div4;
  let t6;
  let clients;
  let t7;
  let div7;
  let t9;
  let div9;
  let current;
  let each_value = ctx[0];
  const get_key = (ctx2) => ctx2[1].name;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block3(key, child_ctx));
  }
  clients = new Clients_default({});
  return {
    c() {
      div10 = element("div");
      div0 = element("div");
      div0.textContent = "JOB DISTRIBUTOR ENGINE DEMO";
      t1 = space();
      div3 = element("div");
      div1 = element("div");
      div1.textContent = "PARITE";
      t3 = space();
      div2 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t4 = space();
      div5 = element("div");
      div4 = element("div");
      div4.textContent = "CLIENTS";
      t6 = space();
      create_component(clients.$$.fragment);
      t7 = space();
      div7 = element("div");
      div7.innerHTML = `<div class="parts-title svelte-17sg1p1">SERVERS</div>`;
      t9 = space();
      div9 = element("div");
      div9.innerHTML = `<div class="parts-title svelte-17sg1p1">WORKERS</div>`;
      attr(div0, "class", "title svelte-17sg1p1");
      attr(div1, "class", "parts-title svelte-17sg1p1");
      attr(div2, "class", "metal-wrapper svelte-17sg1p1");
      attr(div3, "class", "parite svelte-17sg1p1");
      attr(div4, "class", "parts-title svelte-17sg1p1");
      attr(div5, "class", "clients svelte-17sg1p1");
      attr(div7, "class", "servers svelte-17sg1p1");
      attr(div9, "class", "workers svelte-17sg1p1");
      attr(div10, "class", "wrapper svelte-17sg1p1");
    },
    m(target, anchor) {
      insert(target, div10, anchor);
      append(div10, div0);
      append(div10, t1);
      append(div10, div3);
      append(div3, div1);
      append(div3, t3);
      append(div3, div2);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div2, null);
      }
      append(div10, t4);
      append(div10, div5);
      append(div5, div4);
      append(div5, t6);
      mount_component(clients, div5, null);
      append(div10, t7);
      append(div10, div7);
      append(div10, t9);
      append(div10, div9);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        each_value = ctx2[0];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div2, destroy_block, create_each_block3, null, get_each_context3);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(clients.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(clients.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div10);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(clients);
    }
  };
}
function instance4($$self, $$props, $$invalidate) {
  let $metaller;
  component_subscribe($$self, metaller, ($$value) => $$invalidate(0, $metaller = $$value));
  return [$metaller];
}
var App = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance4, create_fragment4, safe_not_equal, {}, add_css4);
  }
};
var App_default = App;

// src/main.ts
var app = new App_default({
  target: document.body
});
var main_default = app;
export {
  main_default as default
};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9pbnRlcm5hbC9pbmRleC5tanMiLCAiLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zdG9yZS9pbmRleC5tanMiLCAiLi4vbm9kZV9tb2R1bGVzL25hbm9pZC9pbmRleC5wcm9kLmpzIiwgIi4uL3NyYy9zdG9yZS50cyIsICIuLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2Vhc2luZy9pbmRleC5tanMiLCAiLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS90cmFuc2l0aW9uL2luZGV4Lm1qcyIsICIuLi9zcmMvY29tcG9uZW50cy9wYXJ0cy9CdXR0b25BZGRJbnB1dC5zdmVsdGUiLCAiLi4vc3JjL2NvbXBvbmVudHMvcGFydHMvQnV0dG9uQWRkQ29uZGl0aW9uLnN2ZWx0ZSIsICIuLi9zcmMvY29tcG9uZW50cy9DbGllbnRzLnN2ZWx0ZSIsICIuLi9zcmMvQXBwLnN2ZWx0ZSIsICIuLi9zcmMvbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZnVuY3Rpb24gbm9vcCgpIHsgfVxuY29uc3QgaWRlbnRpdHkgPSB4ID0+IHg7XG5mdW5jdGlvbiBhc3NpZ24odGFyLCBzcmMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZm9yIChjb25zdCBrIGluIHNyYylcbiAgICAgICAgdGFyW2tdID0gc3JjW2tdO1xuICAgIHJldHVybiB0YXI7XG59XG5mdW5jdGlvbiBpc19wcm9taXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhZGRfbG9jYXRpb24oZWxlbWVudCwgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyKSB7XG4gICAgZWxlbWVudC5fX3N2ZWx0ZV9tZXRhID0ge1xuICAgICAgICBsb2M6IHsgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gcnVuKGZuKSB7XG4gICAgcmV0dXJuIGZuKCk7XG59XG5mdW5jdGlvbiBibGFua19vYmplY3QoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5mdW5jdGlvbiBydW5fYWxsKGZucykge1xuICAgIGZucy5mb3JFYWNoKHJ1bik7XG59XG5mdW5jdGlvbiBpc19mdW5jdGlvbih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBzYWZlX25vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGIgfHwgKChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbicpO1xufVxubGV0IHNyY191cmxfZXF1YWxfYW5jaG9yO1xuZnVuY3Rpb24gc3JjX3VybF9lcXVhbChlbGVtZW50X3NyYywgdXJsKSB7XG4gICAgaWYgKCFzcmNfdXJsX2VxdWFsX2FuY2hvcikge1xuICAgICAgICBzcmNfdXJsX2VxdWFsX2FuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG4gICAgc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZiA9IHVybDtcbiAgICByZXR1cm4gZWxlbWVudF9zcmMgPT09IHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWY7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9iYXNlKHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBzbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBpZiAoc2xvdF9jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY29udGV4dCA9IGdldF9zbG90X2NvbnRleHQoc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGdldF9zbG90X2NvbnRleHRfZm4pO1xuICAgICAgICBzbG90LnAoc2xvdF9jb250ZXh0LCBzbG90X2NoYW5nZXMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgdXBkYXRlX3Nsb3RfYmFzZShzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbn1cbmZ1bmN0aW9uIGdldF9hbGxfZGlydHlfZnJvbV9zY29wZSgkJHNjb3BlKSB7XG4gICAgaWYgKCQkc2NvcGUuY3R4Lmxlbmd0aCA+IDMyKSB7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gW107XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9ICQkc2NvcGUuY3R4Lmxlbmd0aCAvIDMyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkaXJ0eVtpXSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaXJ0eTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLy8gVHJhY2sgd2hpY2ggbm9kZXMgYXJlIGNsYWltZWQgZHVyaW5nIGh5ZHJhdGlvbi4gVW5jbGFpbWVkIG5vZGVzIGNhbiB0aGVuIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NXG4vLyBhdCB0aGUgZW5kIG9mIGh5ZHJhdGlvbiB3aXRob3V0IHRvdWNoaW5nIHRoZSByZW1haW5pbmcgbm9kZXMuXG5sZXQgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVuZF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG59XG5mdW5jdGlvbiB1cHBlcl9ib3VuZChsb3csIGhpZ2gsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBSZXR1cm4gZmlyc3QgaW5kZXggb2YgdmFsdWUgbGFyZ2VyIHRoYW4gaW5wdXQgdmFsdWUgaW4gdGhlIHJhbmdlIFtsb3csIGhpZ2gpXG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgY29uc3QgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSA+PiAxKTtcbiAgICAgICAgaWYgKGtleShtaWQpIDw9IHZhbHVlKSB7XG4gICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbG93O1xufVxuZnVuY3Rpb24gaW5pdF9oeWRyYXRlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuaHlkcmF0ZV9pbml0KVxuICAgICAgICByZXR1cm47XG4gICAgdGFyZ2V0Lmh5ZHJhdGVfaW5pdCA9IHRydWU7XG4gICAgLy8gV2Uga25vdyB0aGF0IGFsbCBjaGlsZHJlbiBoYXZlIGNsYWltX29yZGVyIHZhbHVlcyBzaW5jZSB0aGUgdW5jbGFpbWVkIGhhdmUgYmVlbiBkZXRhY2hlZCBpZiB0YXJnZXQgaXMgbm90IDxoZWFkPlxuICAgIGxldCBjaGlsZHJlbiA9IHRhcmdldC5jaGlsZE5vZGVzO1xuICAgIC8vIElmIHRhcmdldCBpcyA8aGVhZD4sIHRoZXJlIG1heSBiZSBjaGlsZHJlbiB3aXRob3V0IGNsYWltX29yZGVyXG4gICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIGNvbnN0IG15Q2hpbGRyZW4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG15Q2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG15Q2hpbGRyZW47XG4gICAgfVxuICAgIC8qXG4gICAgKiBSZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5LlxuICAgICogV2UgY2FuIHJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkgYnkgZmluZGluZyB0aGUgbG9uZ2VzdCBzdWJzZXF1ZW5jZSBvZlxuICAgICogbm9kZXMgdGhhdCBhcmUgYWxyZWFkeSBjbGFpbWVkIGluIG9yZGVyIGFuZCBvbmx5IG1vdmluZyB0aGUgcmVzdC4gVGhlIGxvbmdlc3RcbiAgICAqIHN1YnNlcXVlbmNlIHN1YnNlcXVlbmNlIG9mIG5vZGVzIHRoYXQgYXJlIGNsYWltZWQgaW4gb3JkZXIgY2FuIGJlIGZvdW5kIGJ5XG4gICAgKiBjb21wdXRpbmcgdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiAuY2xhaW1fb3JkZXIgdmFsdWVzLlxuICAgICpcbiAgICAqIFRoaXMgYWxnb3JpdGhtIGlzIG9wdGltYWwgaW4gZ2VuZXJhdGluZyB0aGUgbGVhc3QgYW1vdW50IG9mIHJlb3JkZXIgb3BlcmF0aW9uc1xuICAgICogcG9zc2libGUuXG4gICAgKlxuICAgICogUHJvb2Y6XG4gICAgKiBXZSBrbm93IHRoYXQsIGdpdmVuIGEgc2V0IG9mIHJlb3JkZXJpbmcgb3BlcmF0aW9ucywgdGhlIG5vZGVzIHRoYXQgZG8gbm90IG1vdmVcbiAgICAqIGFsd2F5cyBmb3JtIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2UsIHNpbmNlIHRoZXkgZG8gbm90IG1vdmUgYW1vbmcgZWFjaCBvdGhlclxuICAgICogbWVhbmluZyB0aGF0IHRoZXkgbXVzdCBiZSBhbHJlYWR5IG9yZGVyZWQgYW1vbmcgZWFjaCBvdGhlci4gVGh1cywgdGhlIG1heGltYWxcbiAgICAqIHNldCBvZiBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlIGZvcm0gYSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2UuXG4gICAgKi9cbiAgICAvLyBDb21wdXRlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIC8vIG06IHN1YnNlcXVlbmNlIGxlbmd0aCBqID0+IGluZGV4IGsgb2Ygc21hbGxlc3QgdmFsdWUgdGhhdCBlbmRzIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgbGVuZ3RoIGpcbiAgICBjb25zdCBtID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoICsgMSk7XG4gICAgLy8gUHJlZGVjZXNzb3IgaW5kaWNlcyArIDFcbiAgICBjb25zdCBwID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoKTtcbiAgICBtWzBdID0gLTE7XG4gICAgbGV0IGxvbmdlc3QgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGNoaWxkcmVuW2ldLmNsYWltX29yZGVyO1xuICAgICAgICAvLyBGaW5kIHRoZSBsYXJnZXN0IHN1YnNlcXVlbmNlIGxlbmd0aCBzdWNoIHRoYXQgaXQgZW5kcyBpbiBhIHZhbHVlIGxlc3MgdGhhbiBvdXIgY3VycmVudCB2YWx1ZVxuICAgICAgICAvLyB1cHBlcl9ib3VuZCByZXR1cm5zIGZpcnN0IGdyZWF0ZXIgdmFsdWUsIHNvIHdlIHN1YnRyYWN0IG9uZVxuICAgICAgICAvLyB3aXRoIGZhc3QgcGF0aCBmb3Igd2hlbiB3ZSBhcmUgb24gdGhlIGN1cnJlbnQgbG9uZ2VzdCBzdWJzZXF1ZW5jZVxuICAgICAgICBjb25zdCBzZXFMZW4gPSAoKGxvbmdlc3QgPiAwICYmIGNoaWxkcmVuW21bbG9uZ2VzdF1dLmNsYWltX29yZGVyIDw9IGN1cnJlbnQpID8gbG9uZ2VzdCArIDEgOiB1cHBlcl9ib3VuZCgxLCBsb25nZXN0LCBpZHggPT4gY2hpbGRyZW5bbVtpZHhdXS5jbGFpbV9vcmRlciwgY3VycmVudCkpIC0gMTtcbiAgICAgICAgcFtpXSA9IG1bc2VxTGVuXSArIDE7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IHNlcUxlbiArIDE7XG4gICAgICAgIC8vIFdlIGNhbiBndWFyYW50ZWUgdGhhdCBjdXJyZW50IGlzIHRoZSBzbWFsbGVzdCB2YWx1ZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZCBoYXZlIGdlbmVyYXRlZCBhIGxvbmdlciBzZXF1ZW5jZS5cbiAgICAgICAgbVtuZXdMZW5dID0gaTtcbiAgICAgICAgbG9uZ2VzdCA9IE1hdGgubWF4KG5ld0xlbiwgbG9uZ2VzdCk7XG4gICAgfVxuICAgIC8vIFRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgKGluaXRpYWxseSByZXZlcnNlZClcbiAgICBjb25zdCBsaXMgPSBbXTtcbiAgICAvLyBUaGUgcmVzdCBvZiB0aGUgbm9kZXMsIG5vZGVzIHRoYXQgd2lsbCBiZSBtb3ZlZFxuICAgIGNvbnN0IHRvTW92ZSA9IFtdO1xuICAgIGxldCBsYXN0ID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBjdXIgPSBtW2xvbmdlc3RdICsgMTsgY3VyICE9IDA7IGN1ciA9IHBbY3VyIC0gMV0pIHtcbiAgICAgICAgbGlzLnB1c2goY2hpbGRyZW5bY3VyIC0gMV0pO1xuICAgICAgICBmb3IgKDsgbGFzdCA+PSBjdXI7IGxhc3QtLSkge1xuICAgICAgICAgICAgdG9Nb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3QtLTtcbiAgICB9XG4gICAgZm9yICg7IGxhc3QgPj0gMDsgbGFzdC0tKSB7XG4gICAgICAgIHRvTW92ZS5wdXNoKGNoaWxkcmVuW2xhc3RdKTtcbiAgICB9XG4gICAgbGlzLnJldmVyc2UoKTtcbiAgICAvLyBXZSBzb3J0IHRoZSBub2RlcyBiZWluZyBtb3ZlZCB0byBndWFyYW50ZWUgdGhhdCB0aGVpciBpbnNlcnRpb24gb3JkZXIgbWF0Y2hlcyB0aGUgY2xhaW0gb3JkZXJcbiAgICB0b01vdmUuc29ydCgoYSwgYikgPT4gYS5jbGFpbV9vcmRlciAtIGIuY2xhaW1fb3JkZXIpO1xuICAgIC8vIEZpbmFsbHksIHdlIG1vdmUgdGhlIG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgdG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlIChqIDwgbGlzLmxlbmd0aCAmJiB0b01vdmVbaV0uY2xhaW1fb3JkZXIgPj0gbGlzW2pdLmNsYWltX29yZGVyKSB7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW5jaG9yID0gaiA8IGxpcy5sZW5ndGggPyBsaXNbal0gOiBudWxsO1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKHRvTW92ZVtpXSwgYW5jaG9yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX3N0eWxlcyh0YXJnZXQsIHN0eWxlX3NoZWV0X2lkLCBzdHlsZXMpIHtcbiAgICBjb25zdCBhcHBlbmRfc3R5bGVzX3RvID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKHRhcmdldCk7XG4gICAgaWYgKCFhcHBlbmRfc3R5bGVzX3RvLmdldEVsZW1lbnRCeUlkKHN0eWxlX3NoZWV0X2lkKSkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlLmlkID0gc3R5bGVfc2hlZXRfaWQ7XG4gICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgICBhcHBlbmRfc3R5bGVzaGVldChhcHBlbmRfc3R5bGVzX3RvLCBzdHlsZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUpXG4gICAgICAgIHJldHVybiBkb2N1bWVudDtcbiAgICBjb25zdCByb290ID0gbm9kZS5nZXRSb290Tm9kZSA/IG5vZGUuZ2V0Um9vdE5vZGUoKSA6IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBpZiAocm9vdCAmJiByb290Lmhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQ7XG59XG5mdW5jdGlvbiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSB7XG4gICAgY29uc3Qgc3R5bGVfZWxlbWVudCA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgYXBwZW5kX3N0eWxlc2hlZXQoZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpLCBzdHlsZV9lbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVfZWxlbWVudC5zaGVldDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9zdHlsZXNoZWV0KG5vZGUsIHN0eWxlKSB7XG4gICAgYXBwZW5kKG5vZGUuaGVhZCB8fCBub2RlLCBzdHlsZSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSkge1xuICAgIGlmIChpc19oeWRyYXRpbmcpIHtcbiAgICAgICAgaW5pdF9oeWRyYXRlKHRhcmdldCk7XG4gICAgICAgIGlmICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPT09IHVuZGVmaW5lZCkgfHwgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCkgJiYgKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLnBhcmVudEVsZW1lbnQgIT09IHRhcmdldCkpKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5maXJzdENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNraXAgbm9kZXMgb2YgdW5kZWZpbmVkIG9yZGVyaW5nXG4gICAgICAgIHdoaWxlICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgIT09IG51bGwpICYmICh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5jbGFpbV9vcmRlciA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZSAhPT0gdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpIHtcbiAgICAgICAgICAgIC8vIFdlIG9ubHkgaW5zZXJ0IGlmIHRoZSBvcmRlcmluZyBvZiB0aGlzIG5vZGUgc2hvdWxkIGJlIG1vZGlmaWVkIG9yIHRoZSBwYXJlbnQgbm9kZSBpcyBub3QgdGFyZ2V0XG4gICAgICAgICAgICBpZiAobm9kZS5jbGFpbV9vcmRlciAhPT0gdW5kZWZpbmVkIHx8IG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQgfHwgbm9kZS5uZXh0U2libGluZyAhPT0gbnVsbCkge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgaWYgKGlzX2h5ZHJhdGluZyAmJiAhYW5jaG9yKSB7XG4gICAgICAgIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQgfHwgbm9kZS5uZXh0U2libGluZyAhPSBhbmNob3IpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2VhY2goaXRlcmF0aW9ucywgZGV0YWNoaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpdGVyYXRpb25zW2ldKVxuICAgICAgICAgICAgaXRlcmF0aW9uc1tpXS5kKGRldGFjaGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBlbGVtZW50X2lzKG5hbWUsIGlzKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSwgeyBpcyB9KTtcbn1cbmZ1bmN0aW9uIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMob2JqLCBleGNsdWRlKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzX3Byb3Aob2JqLCBrKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgJiYgZXhjbHVkZS5pbmRleE9mKGspID09PSAtMSkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGFyZ2V0W2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBzdmdfZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBuYW1lKTtcbn1cbmZ1bmN0aW9uIHRleHQoZGF0YSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbn1cbmZ1bmN0aW9uIHNwYWNlKCkge1xuICAgIHJldHVybiB0ZXh0KCcgJyk7XG59XG5mdW5jdGlvbiBlbXB0eSgpIHtcbiAgICByZXR1cm4gdGV4dCgnJyk7XG59XG5mdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzZWxmKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJ1c3RlZChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgIGVsc2UgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKVxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHNldF9hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXyk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAoYXR0cmlidXRlc1trZXldID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmNzc1RleHQgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnX192YWx1ZScpIHtcbiAgICAgICAgICAgIG5vZGUudmFsdWUgPSBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRvcnNba2V5XSAmJiBkZXNjcmlwdG9yc1trZXldLnNldCkge1xuICAgICAgICAgICAgbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3ZnX2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEobm9kZSwgcHJvcCwgdmFsdWUpIHtcbiAgICBpZiAocHJvcCBpbiBub2RlKSB7XG4gICAgICAgIG5vZGVbcHJvcF0gPSB0eXBlb2Ygbm9kZVtwcm9wXSA9PT0gJ2Jvb2xlYW4nICYmIHZhbHVlID09PSAnJyA/IHRydWUgOiB2YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGF0dHIobm9kZSwgcHJvcCwgdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHhsaW5rX2F0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlKGdyb3VwLCBfX3ZhbHVlLCBjaGVja2VkKSB7XG4gICAgY29uc3QgdmFsdWUgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoZ3JvdXBbaV0uY2hlY2tlZClcbiAgICAgICAgICAgIHZhbHVlLmFkZChncm91cFtpXS5fX3ZhbHVlKTtcbiAgICB9XG4gICAgaWYgKCFjaGVja2VkKSB7XG4gICAgICAgIHZhbHVlLmRlbGV0ZShfX3ZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xufVxuZnVuY3Rpb24gdG9fbnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAnJyA/IG51bGwgOiArdmFsdWU7XG59XG5mdW5jdGlvbiB0aW1lX3Jhbmdlc190b19hcnJheShyYW5nZXMpIHtcbiAgICBjb25zdCBhcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGFycmF5LnB1c2goeyBzdGFydDogcmFuZ2VzLnN0YXJ0KGkpLCBlbmQ6IHJhbmdlcy5lbmQoaSkgfSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cbmZ1bmN0aW9uIGNoaWxkcmVuKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNoaWxkTm9kZXMpO1xufVxuZnVuY3Rpb24gaW5pdF9jbGFpbV9pbmZvKG5vZGVzKSB7XG4gICAgaWYgKG5vZGVzLmNsYWltX2luZm8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBub2Rlcy5jbGFpbV9pbmZvID0geyBsYXN0X2luZGV4OiAwLCB0b3RhbF9jbGFpbWVkOiAwIH07XG4gICAgfVxufVxuZnVuY3Rpb24gY2xhaW1fbm9kZShub2RlcywgcHJlZGljYXRlLCBwcm9jZXNzTm9kZSwgY3JlYXRlTm9kZSwgZG9udFVwZGF0ZUxhc3RJbmRleCA9IGZhbHNlKSB7XG4gICAgLy8gVHJ5IHRvIGZpbmQgbm9kZXMgaW4gYW4gb3JkZXIgc3VjaCB0aGF0IHdlIGxlbmd0aGVuIHRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2VcbiAgICBpbml0X2NsYWltX2luZm8obm9kZXMpO1xuICAgIGNvbnN0IHJlc3VsdE5vZGUgPSAoKCkgPT4ge1xuICAgICAgICAvLyBXZSBmaXJzdCB0cnkgdG8gZmluZCBhbiBlbGVtZW50IGFmdGVyIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBwcm9jZXNzTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlcGxhY2VtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRvbnRVcGRhdGVMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSB0cnkgdG8gZmluZCBvbmUgYmVmb3JlXG4gICAgICAgIC8vIFdlIGl0ZXJhdGUgaW4gcmV2ZXJzZSBzbyB0aGF0IHdlIGRvbid0IGdvIHRvbyBmYXIgYmFja1xuICAgICAgICBmb3IgKGxldCBpID0gbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHByb2Nlc3NOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZG9udFVwZGF0ZUxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdlIHNwbGljZWQgYmVmb3JlIHRoZSBsYXN0X2luZGV4LCB3ZSBkZWNyZWFzZSBpdFxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXgtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgY2FuJ3QgZmluZCBhbnkgbWF0Y2hpbmcgbm9kZSwgd2UgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICByZXR1cm4gY3JlYXRlTm9kZSgpO1xuICAgIH0pKCk7XG4gICAgcmVzdWx0Tm9kZS5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcbiAgICBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0Tm9kZTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgY3JlYXRlX2VsZW1lbnQpIHtcbiAgICByZXR1cm4gY2xhaW1fbm9kZShub2RlcywgKG5vZGUpID0+IG5vZGUubm9kZU5hbWUgPT09IG5hbWUsIChub2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbW92ZSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbm9kZS5hdHRyaWJ1dGVzW2pdO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZS5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW1vdmUuZm9yRWFjaCh2ID0+IG5vZGUucmVtb3ZlQXR0cmlidXRlKHYpKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9LCAoKSA9PiBjcmVhdGVfZWxlbWVudChuYW1lKSk7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgZWxlbWVudCk7XG59XG5mdW5jdGlvbiBjbGFpbV9zdmdfZWxlbWVudChub2RlcywgbmFtZSwgYXR0cmlidXRlcykge1xuICAgIHJldHVybiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIHN2Z19lbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGNsYWltX3RleHQobm9kZXMsIGRhdGEpIHtcbiAgICByZXR1cm4gY2xhaW1fbm9kZShub2RlcywgKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IDMsIChub2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGFTdHIgPSAnJyArIGRhdGE7XG4gICAgICAgIGlmIChub2RlLmRhdGEuc3RhcnRzV2l0aChkYXRhU3RyKSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuZGF0YS5sZW5ndGggIT09IGRhdGFTdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuc3BsaXRUZXh0KGRhdGFTdHIubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IGRhdGFTdHI7XG4gICAgICAgIH1cbiAgICB9LCAoKSA9PiB0ZXh0KGRhdGEpLCB0cnVlIC8vIFRleHQgbm9kZXMgc2hvdWxkIG5vdCB1cGRhdGUgbGFzdCBpbmRleCBzaW5jZSBpdCBpcyBsaWtlbHkgbm90IHdvcnRoIGl0IHRvIGVsaW1pbmF0ZSBhbiBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIGFjdHVhbCBlbGVtZW50c1xuICAgICk7XG59XG5mdW5jdGlvbiBjbGFpbV9zcGFjZShub2Rlcykge1xuICAgIHJldHVybiBjbGFpbV90ZXh0KG5vZGVzLCAnICcpO1xufVxuZnVuY3Rpb24gZmluZF9jb21tZW50KG5vZGVzLCB0ZXh0LCBzdGFydCkge1xuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogY29tbWVudCBub2RlICovICYmIG5vZGUudGV4dENvbnRlbnQudHJpbSgpID09PSB0ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoO1xufVxuZnVuY3Rpb24gY2xhaW1faHRtbF90YWcobm9kZXMpIHtcbiAgICAvLyBmaW5kIGh0bWwgb3BlbmluZyB0YWdcbiAgICBjb25zdCBzdGFydF9pbmRleCA9IGZpbmRfY29tbWVudChub2RlcywgJ0hUTUxfVEFHX1NUQVJUJywgMCk7XG4gICAgY29uc3QgZW5kX2luZGV4ID0gZmluZF9jb21tZW50KG5vZGVzLCAnSFRNTF9UQUdfRU5EJywgc3RhcnRfaW5kZXgpO1xuICAgIGlmIChzdGFydF9pbmRleCA9PT0gZW5kX2luZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbigpO1xuICAgIH1cbiAgICBpbml0X2NsYWltX2luZm8obm9kZXMpO1xuICAgIGNvbnN0IGh0bWxfdGFnX25vZGVzID0gbm9kZXMuc3BsaWNlKHN0YXJ0X2luZGV4LCBlbmRfaW5kZXggLSBzdGFydF9pbmRleCArIDEpO1xuICAgIGRldGFjaChodG1sX3RhZ19ub2Rlc1swXSk7XG4gICAgZGV0YWNoKGh0bWxfdGFnX25vZGVzW2h0bWxfdGFnX25vZGVzLmxlbmd0aCAtIDFdKTtcbiAgICBjb25zdCBjbGFpbWVkX25vZGVzID0gaHRtbF90YWdfbm9kZXMuc2xpY2UoMSwgaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMSk7XG4gICAgZm9yIChjb25zdCBuIG9mIGNsYWltZWRfbm9kZXMpIHtcbiAgICAgICAgbi5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcbiAgICAgICAgbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbihjbGFpbWVkX25vZGVzKTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhKHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCAhPT0gZGF0YSlcbiAgICAgICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X2lucHV0X3R5cGUoaW5wdXQsIHR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBpbnB1dC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdHlsZShub2RlLCBrZXksIHZhbHVlLCBpbXBvcnRhbnQpIHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQgPyAnaW1wb3J0YW50JyA6ICcnKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9uKHNlbGVjdCwgdmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdC5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW2ldO1xuICAgICAgICBpZiAob3B0aW9uLl9fdmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNlbGVjdC5zZWxlY3RlZEluZGV4ID0gLTE7IC8vIG5vIG9wdGlvbiBzaG91bGQgYmUgc2VsZWN0ZWRcbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb25zKHNlbGVjdCwgdmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdC5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW2ldO1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB+dmFsdWUuaW5kZXhPZihvcHRpb24uX192YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X3ZhbHVlKHNlbGVjdCkge1xuICAgIGNvbnN0IHNlbGVjdGVkX29wdGlvbiA9IHNlbGVjdC5xdWVyeVNlbGVjdG9yKCc6Y2hlY2tlZCcpIHx8IHNlbGVjdC5vcHRpb25zWzBdO1xuICAgIHJldHVybiBzZWxlY3RlZF9vcHRpb24gJiYgc2VsZWN0ZWRfb3B0aW9uLl9fdmFsdWU7XG59XG5mdW5jdGlvbiBzZWxlY3RfbXVsdGlwbGVfdmFsdWUoc2VsZWN0KSB7XG4gICAgcmV0dXJuIFtdLm1hcC5jYWxsKHNlbGVjdC5xdWVyeVNlbGVjdG9yQWxsKCc6Y2hlY2tlZCcpLCBvcHRpb24gPT4gb3B0aW9uLl9fdmFsdWUpO1xufVxuLy8gdW5mb3J0dW5hdGVseSB0aGlzIGNhbid0IGJlIGEgY29uc3RhbnQgYXMgdGhhdCB3b3VsZG4ndCBiZSB0cmVlLXNoYWtlYWJsZVxuLy8gc28gd2UgY2FjaGUgdGhlIHJlc3VsdCBpbnN0ZWFkXG5sZXQgY3Jvc3NvcmlnaW47XG5mdW5jdGlvbiBpc19jcm9zc29yaWdpbigpIHtcbiAgICBpZiAoY3Jvc3NvcmlnaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjcm9zc29yaWdpbiA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB2b2lkIHdpbmRvdy5wYXJlbnQuZG9jdW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjcm9zc29yaWdpbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyb3Nzb3JpZ2luO1xufVxuZnVuY3Rpb24gYWRkX3Jlc2l6ZV9saXN0ZW5lcihub2RlLCBmbikge1xuICAgIGNvbnN0IGNvbXB1dGVkX3N0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICAnb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTE7Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmcmFtZS50YWJJbmRleCA9IC0xO1xuICAgIGNvbnN0IGNyb3Nzb3JpZ2luID0gaXNfY3Jvc3NvcmlnaW4oKTtcbiAgICBsZXQgdW5zdWJzY3JpYmU7XG4gICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSBcImRhdGE6dGV4dC9odG1sLDxzY3JpcHQ+b25yZXNpemU9ZnVuY3Rpb24oKXtwYXJlbnQucG9zdE1lc3NhZ2UoMCwnKicpfTwvc2NyaXB0PlwiO1xuICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3Rlbih3aW5kb3csICdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBpZnJhbWUuY29udGVudFdpbmRvdylcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICBpZnJhbWUub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4oaWZyYW1lLmNvbnRlbnRXaW5kb3csICdyZXNpemUnLCBmbik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFwcGVuZChub2RlLCBpZnJhbWUpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1bnN1YnNjcmliZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXRhY2goaWZyYW1lKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdG9nZ2xlX2NsYXNzKGVsZW1lbnQsIG5hbWUsIHRvZ2dsZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0W3RvZ2dsZSA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xufVxuZnVuY3Rpb24gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCwgYnViYmxlcyA9IGZhbHNlKSB7XG4gICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGJ1YmJsZXMsIGZhbHNlLCBkZXRhaWwpO1xuICAgIHJldHVybiBlO1xufVxuZnVuY3Rpb24gcXVlcnlfc2VsZWN0b3JfYWxsKHNlbGVjdG9yLCBwYXJlbnQgPSBkb2N1bWVudC5ib2R5KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20ocGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbn1cbmNsYXNzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmUgPSB0aGlzLm4gPSBudWxsO1xuICAgIH1cbiAgICBjKGh0bWwpIHtcbiAgICAgICAgdGhpcy5oKGh0bWwpO1xuICAgIH1cbiAgICBtKGh0bWwsIHRhcmdldCwgYW5jaG9yID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZSkge1xuICAgICAgICAgICAgdGhpcy5lID0gZWxlbWVudCh0YXJnZXQubm9kZU5hbWUpO1xuICAgICAgICAgICAgdGhpcy50ID0gdGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy5jKGh0bWwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaShhbmNob3IpO1xuICAgIH1cbiAgICBoKGh0bWwpIHtcbiAgICAgICAgdGhpcy5lLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHRoaXMubiA9IEFycmF5LmZyb20odGhpcy5lLmNoaWxkTm9kZXMpO1xuICAgIH1cbiAgICBpKGFuY2hvcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5zZXJ0KHRoaXMudCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHAoaHRtbCkge1xuICAgICAgICB0aGlzLmQoKTtcbiAgICAgICAgdGhpcy5oKGh0bWwpO1xuICAgICAgICB0aGlzLmkodGhpcy5hKTtcbiAgICB9XG4gICAgZCgpIHtcbiAgICAgICAgdGhpcy5uLmZvckVhY2goZGV0YWNoKTtcbiAgICB9XG59XG5jbGFzcyBIdG1sVGFnSHlkcmF0aW9uIGV4dGVuZHMgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoY2xhaW1lZF9ub2Rlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmUgPSB0aGlzLm4gPSBudWxsO1xuICAgICAgICB0aGlzLmwgPSBjbGFpbWVkX25vZGVzO1xuICAgIH1cbiAgICBjKGh0bWwpIHtcbiAgICAgICAgaWYgKHRoaXMubCkge1xuICAgICAgICAgICAgdGhpcy5uID0gdGhpcy5sO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIuYyhodG1sKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpKGFuY2hvcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5zZXJ0X2h5ZHJhdGlvbih0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGF0dHJpYnV0ZV90b19vYmplY3QoYXR0cmlidXRlcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgcmVzdWx0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGdldF9jdXN0b21fZWxlbWVudHNfc2xvdHMoZWxlbWVudCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIHJlc3VsdFtub2RlLnNsb3QgfHwgJ2RlZmF1bHQnXSA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gd2UgbmVlZCB0byBzdG9yZSB0aGUgaW5mb3JtYXRpb24gZm9yIG11bHRpcGxlIGRvY3VtZW50cyBiZWNhdXNlIGEgU3ZlbHRlIGFwcGxpY2F0aW9uIGNvdWxkIGFsc28gY29udGFpbiBpZnJhbWVzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc3ZlbHRlanMvc3ZlbHRlL2lzc3Vlcy8zNjI0XG5jb25zdCBtYW5hZ2VkX3N0eWxlcyA9IG5ldyBNYXAoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zdHlsZV9pbmZvcm1hdGlvbihkb2MsIG5vZGUpIHtcbiAgICBjb25zdCBpbmZvID0geyBzdHlsZXNoZWV0OiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSwgcnVsZXM6IHt9IH07XG4gICAgbWFuYWdlZF9zdHlsZXMuc2V0KGRvYywgaW5mbyk7XG4gICAgcmV0dXJuIGluZm87XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGNvbnN0IGRvYyA9IGdldF9yb290X2Zvcl9zdHlsZShub2RlKTtcbiAgICBjb25zdCB7IHN0eWxlc2hlZXQsIHJ1bGVzIH0gPSBtYW5hZ2VkX3N0eWxlcy5nZXQoZG9jKSB8fCBjcmVhdGVfc3R5bGVfaW5mb3JtYXRpb24oZG9jLCBub2RlKTtcbiAgICBpZiAoIXJ1bGVzW25hbWVdKSB7XG4gICAgICAgIHJ1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBtYW5hZ2VkX3N0eWxlcy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBzdHlsZXNoZWV0IH0gPSBpbmZvO1xuICAgICAgICAgICAgbGV0IGkgPSBzdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pXG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldC5kZWxldGVSdWxlKGkpO1xuICAgICAgICAgICAgaW5mby5ydWxlcyA9IHt9O1xuICAgICAgICB9KTtcbiAgICAgICAgbWFuYWdlZF9zdHlsZXMuY2xlYXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlX2FuaW1hdGlvbihub2RlLCBmcm9tLCBmbiwgcGFyYW1zKSB7XG4gICAgaWYgKCFmcm9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGZyb20ubGVmdCA9PT0gdG8ubGVmdCAmJiBmcm9tLnJpZ2h0ID09PSB0by5yaWdodCAmJiBmcm9tLnRvcCA9PT0gdG8udG9wICYmIGZyb20uYm90dG9tID09PSB0by5ib3R0b20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogc2hvdWxkIHRoaXMgYmUgc2VwYXJhdGVkIGZyb20gZGVzdHJ1Y3R1cmluZz8gT3Igc3RhcnQvZW5kIGFkZGVkIHRvIHB1YmxpYyBhcGkgYW5kIGRvY3VtZW50YXRpb24/XG4gICAgc3RhcnQ6IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86XG4gICAgZW5kID0gc3RhcnRfdGltZSArIGR1cmF0aW9uLCB0aWNrID0gbm9vcCwgY3NzIH0gPSBmbihub2RlLCB7IGZyb20sIHRvIH0sIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgbGV0IG5hbWU7XG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgIG5hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRlbGF5KSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgbmFtZSk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgbG9vcChub3cgPT4ge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQgJiYgbm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkICYmIG5vdyA+PSBlbmQpIHtcbiAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBzdGFydF90aW1lO1xuICAgICAgICAgICAgY29uc3QgdCA9IDAgKyAxICogZWFzaW5nKHAgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICBzdGFydCgpO1xuICAgIHRpY2soMCwgMSk7XG4gICAgcmV0dXJuIHN0b3A7XG59XG5mdW5jdGlvbiBmaXhfcG9zaXRpb24obm9kZSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoc3R5bGUucG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBzdHlsZTtcbiAgICAgICAgY29uc3QgYSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBub2RlLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZF90cmFuc2Zvcm0obm9kZSwgYSkge1xuICAgIGNvbnN0IGIgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChhLmxlZnQgIT09IGIubGVmdCB8fCBhLnRvcCAhPT0gYi50b3ApIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IGAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7YS5sZWZ0IC0gYi5sZWZ0fXB4LCAke2EudG9wIC0gYi50b3B9cHgpYDtcbiAgICB9XG59XG5cbmxldCBjdXJyZW50X2NvbXBvbmVudDtcbmZ1bmN0aW9uIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICBjdXJyZW50X2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGdldF9jdXJyZW50X2NvbXBvbmVudCgpIHtcbiAgICBpZiAoIWN1cnJlbnRfY29tcG9uZW50KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Z1bmN0aW9uIGNhbGxlZCBvdXRzaWRlIGNvbXBvbmVudCBpbml0aWFsaXphdGlvbicpO1xuICAgIHJldHVybiBjdXJyZW50X2NvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmJlZm9yZV91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbk1vdW50KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fbW91bnQucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmFmdGVyX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIG9uRGVzdHJveShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX2Rlc3Ryb3kucHVzaChmbik7XG59XG5mdW5jdGlvbiBjcmVhdGVFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgcmV0dXJuICh0eXBlLCBkZXRhaWwpID0+IHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1t0eXBlXTtcbiAgICAgICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAgICAgLy8gVE9ETyBhcmUgdGhlcmUgc2l0dWF0aW9ucyB3aGVyZSBldmVudHMgY291bGQgYmUgZGlzcGF0Y2hlZFxuICAgICAgICAgICAgLy8gaW4gYSBzZXJ2ZXIgKG5vbi1ET00pIGVudmlyb25tZW50P1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY29tcG9uZW50LCBldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBzZXRDb250ZXh0KGtleSwgY29udGV4dCkge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuc2V0KGtleSwgY29udGV4dCk7XG59XG5mdW5jdGlvbiBnZXRDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmdldChrZXkpO1xufVxuZnVuY3Rpb24gZ2V0QWxsQ29udGV4dHMoKSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQ7XG59XG5mdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmhhcyhrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiBmbi5jYWxsKHRoaXMsIGV2ZW50KSk7XG4gICAgfVxufVxuXG5jb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5jb25zdCBpbnRyb3MgPSB7IGVuYWJsZWQ6IGZhbHNlIH07XG5jb25zdCBiaW5kaW5nX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVuZGVyX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgZmx1c2hfY2FsbGJhY2tzID0gW107XG5jb25zdCByZXNvbHZlZF9wcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuICAgIGlmICghdXBkYXRlX3NjaGVkdWxlZCkge1xuICAgICAgICB1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZWRfcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0aWNrKCkge1xuICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgIHJldHVybiByZXNvbHZlZF9wcm9taXNlO1xufVxuZnVuY3Rpb24gYWRkX3JlbmRlcl9jYWxsYmFjayhmbikge1xuICAgIHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcbiAgICBmbHVzaF9jYWxsYmFja3MucHVzaChmbik7XG59XG4vLyBmbHVzaCgpIGNhbGxzIGNhbGxiYWNrcyBpbiB0aGlzIG9yZGVyOlxuLy8gMS4gQWxsIGJlZm9yZVVwZGF0ZSBjYWxsYmFja3MsIGluIG9yZGVyOiBwYXJlbnRzIGJlZm9yZSBjaGlsZHJlblxuLy8gMi4gQWxsIGJpbmQ6dGhpcyBjYWxsYmFja3MsIGluIHJldmVyc2Ugb3JkZXI6IGNoaWxkcmVuIGJlZm9yZSBwYXJlbnRzLlxuLy8gMy4gQWxsIGFmdGVyVXBkYXRlIGNhbGxiYWNrcywgaW4gb3JkZXI6IHBhcmVudHMgYmVmb3JlIGNoaWxkcmVuLiBFWENFUFRcbi8vICAgIGZvciBhZnRlclVwZGF0ZXMgY2FsbGVkIGR1cmluZyB0aGUgaW5pdGlhbCBvbk1vdW50LCB3aGljaCBhcmUgY2FsbGVkIGluXG4vLyAgICByZXZlcnNlIG9yZGVyOiBjaGlsZHJlbiBiZWZvcmUgcGFyZW50cy5cbi8vIFNpbmNlIGNhbGxiYWNrcyBtaWdodCB1cGRhdGUgY29tcG9uZW50IHZhbHVlcywgd2hpY2ggY291bGQgdHJpZ2dlciBhbm90aGVyXG4vLyBjYWxsIHRvIGZsdXNoKCksIHRoZSBmb2xsb3dpbmcgc3RlcHMgZ3VhcmQgYWdhaW5zdCB0aGlzOlxuLy8gMS4gRHVyaW5nIGJlZm9yZVVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuLy8gICAgZGlydHlfY29tcG9uZW50cyBhcnJheSBhbmQgd2lsbCBjYXVzZSBhIHJlZW50cmFudCBjYWxsIHRvIGZsdXNoKCkuIEJlY2F1c2Vcbi8vICAgIHRoZSBmbHVzaCBpbmRleCBpcyBrZXB0IG91dHNpZGUgdGhlIGZ1bmN0aW9uLCB0aGUgcmVlbnRyYW50IGNhbGwgd2lsbCBwaWNrXG4vLyAgICB1cCB3aGVyZSB0aGUgZWFybGllciBjYWxsIGxlZnQgb2ZmIGFuZCBnbyB0aHJvdWdoIGFsbCBkaXJ0eSBjb21wb25lbnRzLiBUaGVcbi8vICAgIGN1cnJlbnRfY29tcG9uZW50IHZhbHVlIGlzIHNhdmVkIGFuZCByZXN0b3JlZCBzbyB0aGF0IHRoZSByZWVudHJhbnQgY2FsbCB3aWxsXG4vLyAgICBub3QgaW50ZXJmZXJlIHdpdGggdGhlIFwicGFyZW50XCIgZmx1c2goKSBjYWxsLlxuLy8gMi4gYmluZDp0aGlzIGNhbGxiYWNrcyBjYW5ub3QgdHJpZ2dlciBuZXcgZmx1c2goKSBjYWxscy5cbi8vIDMuIER1cmluZyBhZnRlclVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIE5PVCBoYXZlIHRoZWlyIGFmdGVyVXBkYXRlXG4vLyAgICBjYWxsYmFjayBjYWxsZWQgYSBzZWNvbmQgdGltZTsgdGhlIHNlZW5fY2FsbGJhY2tzIHNldCwgb3V0c2lkZSB0aGUgZmx1c2goKVxuLy8gICAgZnVuY3Rpb24sIGd1YXJhbnRlZXMgdGhpcyBiZWhhdmlvci5cbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xubGV0IGZsdXNoaWR4ID0gMDsgLy8gRG8gKm5vdCogbW92ZSB0aGlzIGluc2lkZSB0aGUgZmx1c2goKSBmdW5jdGlvblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgY29uc3Qgc2F2ZWRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgZG8ge1xuICAgICAgICAvLyBmaXJzdCwgY2FsbCBiZWZvcmVVcGRhdGUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuICAgICAgICB3aGlsZSAoZmx1c2hpZHggPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gZGlydHlfY29tcG9uZW50c1tmbHVzaGlkeF07XG4gICAgICAgICAgICBmbHVzaGlkeCsrO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoY29tcG9uZW50LiQkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgZmx1c2hpZHggPSAwO1xuICAgICAgICB3aGlsZSAoYmluZGluZ19jYWxsYmFja3MubGVuZ3RoKVxuICAgICAgICAgICAgYmluZGluZ19jYWxsYmFja3MucG9wKCkoKTtcbiAgICAgICAgLy8gdGhlbiwgb25jZSBjb21wb25lbnRzIGFyZSB1cGRhdGVkLCBjYWxsXG4gICAgICAgIC8vIGFmdGVyVXBkYXRlIGZ1bmN0aW9ucy4gVGhpcyBtYXkgY2F1c2VcbiAgICAgICAgLy8gc3Vic2VxdWVudCB1cGRhdGVzLi4uXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSByZW5kZXJfY2FsbGJhY2tzW2ldO1xuICAgICAgICAgICAgaWYgKCFzZWVuX2NhbGxiYWNrcy5oYXMoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgLy8gLi4uc28gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBsb29wc1xuICAgICAgICAgICAgICAgIHNlZW5fY2FsbGJhY2tzLmFkZChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW5kZXJfY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gICAgfSB3aGlsZSAoZGlydHlfY29tcG9uZW50cy5sZW5ndGgpO1xuICAgIHdoaWxlIChmbHVzaF9jYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgIGZsdXNoX2NhbGxiYWNrcy5wb3AoKSgpO1xuICAgIH1cbiAgICB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG4gICAgc2Vlbl9jYWxsYmFja3MuY2xlYXIoKTtcbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQoc2F2ZWRfY29tcG9uZW50KTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgkJCkge1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAkJC51cGRhdGUoKTtcbiAgICAgICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAgICAgY29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcbiAgICAgICAgJCQuZGlydHkgPSBbLTFdO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5wKCQkLmN0eCwgZGlydHkpO1xuICAgICAgICAkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbiAgICB9XG59XG5cbmxldCBwcm9taXNlO1xuZnVuY3Rpb24gd2FpdCgpIHtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGRpc3BhdGNoKG5vZGUsIGRpcmVjdGlvbiwga2luZCkge1xuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQoYCR7ZGlyZWN0aW9uID8gJ2ludHJvJyA6ICdvdXRybyd9JHtraW5kfWApKTtcbn1cbmNvbnN0IG91dHJvaW5nID0gbmV3IFNldCgpO1xubGV0IG91dHJvcztcbmZ1bmN0aW9uIGdyb3VwX291dHJvcygpIHtcbiAgICBvdXRyb3MgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGM6IFtdLFxuICAgICAgICBwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNoZWNrX291dHJvcygpIHtcbiAgICBpZiAoIW91dHJvcy5yKSB7XG4gICAgICAgIHJ1bl9hbGwob3V0cm9zLmMpO1xuICAgIH1cbiAgICBvdXRyb3MgPSBvdXRyb3MucDtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25faW4oYmxvY2ssIGxvY2FsKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLmkpIHtcbiAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgYmxvY2suaShsb2NhbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9vdXQoYmxvY2ssIGxvY2FsLCBkZXRhY2gsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcbiAgICAgICAgaWYgKG91dHJvaW5nLmhhcyhibG9jaykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG91dHJvaW5nLmFkZChibG9jayk7XG4gICAgICAgIG91dHJvcy5jLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChkZXRhY2gpXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmQoMSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLm8obG9jYWwpO1xuICAgIH1cbn1cbmNvbnN0IG51bGxfdHJhbnNpdGlvbiA9IHsgZHVyYXRpb246IDAgfTtcbmZ1bmN0aW9uIGNyZWF0ZV9pbl90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBsZXQgdGFzaztcbiAgICBsZXQgdWlkID0gMDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKCkge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG4gICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgaWYgKHRhc2spXG4gICAgICAgICAgICB0YXNrLmFib3J0KCk7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIHRydWUsICdzdGFydCcpKTtcbiAgICAgICAgdGFzayA9IGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBlbmRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCB0cnVlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbihnbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX291dF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGNvbnN0IGdyb3VwID0gb3V0cm9zO1xuICAgIGdyb3VwLnIgKz0gMTtcbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMSwgMCwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWdyb3VwLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwoZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSAtIHQsIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICBnbygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdvKCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGVuZChyZXNldCkge1xuICAgICAgICAgICAgaWYgKHJlc2V0ICYmIGNvbmZpZy50aWNrKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnRpY2soMSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMsIGludHJvKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHQgPSBpbnRybyA/IDAgOiAxO1xuICAgIGxldCBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gY2xlYXJfYW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluaXQocHJvZ3JhbSwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgZCA9IChwcm9ncmFtLmIgLSB0KTtcbiAgICAgICAgZHVyYXRpb24gKj0gTWF0aC5hYnMoZCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhOiB0LFxuICAgICAgICAgICAgYjogcHJvZ3JhbS5iLFxuICAgICAgICAgICAgZCxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgc3RhcnQ6IHByb2dyYW0uc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHByb2dyYW0uc3RhcnQgKyBkdXJhdGlvbixcbiAgICAgICAgICAgIGdyb3VwOiBwcm9ncmFtLmdyb3VwXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKGIpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiBub3coKSArIGRlbGF5LFxuICAgICAgICAgICAgYlxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWIpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICBwcm9ncmFtLmdyb3VwID0gb3V0cm9zO1xuICAgICAgICAgICAgb3V0cm9zLnIgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYW4gaW50cm8sIGFuZCB0aGVyZSdzIGEgZGVsYXksIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFuIGluaXRpYWwgdGljayBhbmQvb3IgYXBwbHkgQ1NTIGFuaW1hdGlvbiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgYiwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYilcbiAgICAgICAgICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwcm9ncmFtLCBkdXJhdGlvbik7XG4gICAgICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIGIsICdzdGFydCcpKTtcbiAgICAgICAgICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGVuZGluZ19wcm9ncmFtICYmIG5vdyA+IHBlbmRpbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBpbml0KHBlbmRpbmdfcHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCBydW5uaW5nX3Byb2dyYW0uYiwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCB0LCBydW5uaW5nX3Byb2dyYW0uYiwgcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uLCAwLCBlYXNpbmcsIGNvbmZpZy5jc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQgPSBydW5uaW5nX3Byb2dyYW0uYiwgMSAtIHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0uYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRybyBcdTIwMTQgd2UgY2FuIHRpZHkgdXAgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvdXRybyBcdTIwMTQgbmVlZHMgdG8gYmUgY29vcmRpbmF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEtLXJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuX2FsbChydW5uaW5nX3Byb2dyYW0uZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwID0gbm93IC0gcnVubmluZ19wcm9ncmFtLnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdCA9IHJ1bm5pbmdfcHJvZ3JhbS5hICsgcnVubmluZ19wcm9ncmFtLmQgKiBlYXNpbmcocCAvIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gISEocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBydW4oYikge1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZCgpIHtcbiAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGhhbmRsZV9wcm9taXNlKHByb21pc2UsIGluZm8pIHtcbiAgICBjb25zdCB0b2tlbiA9IGluZm8udG9rZW4gPSB7fTtcbiAgICBmdW5jdGlvbiB1cGRhdGUodHlwZSwgaW5kZXgsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGluZm8udG9rZW4gIT09IHRva2VuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpbmZvLnJlc29sdmVkID0gdmFsdWU7XG4gICAgICAgIGxldCBjaGlsZF9jdHggPSBpbmZvLmN0eDtcbiAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGlsZF9jdHggPSBjaGlsZF9jdHguc2xpY2UoKTtcbiAgICAgICAgICAgIGNoaWxkX2N0eFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmxvY2sgPSB0eXBlICYmIChpbmZvLmN1cnJlbnQgPSB0eXBlKShjaGlsZF9jdHgpO1xuICAgICAgICBsZXQgbmVlZHNfZmx1c2ggPSBmYWxzZTtcbiAgICAgICAgaWYgKGluZm8uYmxvY2spIHtcbiAgICAgICAgICAgIGlmIChpbmZvLmJsb2Nrcykge1xuICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzLmZvckVhY2goKGJsb2NrLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBpbmRleCAmJiBibG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBfb3V0cm9zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uX291dChibG9jaywgMSwgMSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmJsb2Nrc1tpXSA9PT0gYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5ibG9ja3NbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tfb3V0cm9zKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZm8uYmxvY2suZCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICAgICAgYmxvY2subShpbmZvLm1vdW50KCksIGluZm8uYW5jaG9yKTtcbiAgICAgICAgICAgIG5lZWRzX2ZsdXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLmJsb2NrID0gYmxvY2s7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrcylcbiAgICAgICAgICAgIGluZm8uYmxvY2tzW2luZGV4XSA9IGJsb2NrO1xuICAgICAgICBpZiAobmVlZHNfZmx1c2gpIHtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzX3Byb21pc2UocHJvbWlzZSkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF9jb21wb25lbnQgPSBnZXRfY3VycmVudF9jb21wb25lbnQoKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjdXJyZW50X2NvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjdXJyZW50X2NvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby5jYXRjaCwgMiwgaW5mby5lcnJvciwgZXJyb3IpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICAgICAgaWYgKCFpbmZvLmhhc0NhdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBpZiB3ZSBwcmV2aW91c2x5IGhhZCBhIHRoZW4vY2F0Y2ggYmxvY2ssIGRlc3Ryb3kgaXRcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby5wZW5kaW5nKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby5wZW5kaW5nLCAwKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnRoZW4pIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnRoZW4sIDEsIGluZm8udmFsdWUsIHByb21pc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHByb21pc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlX2F3YWl0X2Jsb2NrX2JyYW5jaChpbmZvLCBjdHgsIGRpcnR5KSB7XG4gICAgY29uc3QgY2hpbGRfY3R4ID0gY3R4LnNsaWNlKCk7XG4gICAgY29uc3QgeyByZXNvbHZlZCB9ID0gaW5mbztcbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLnRoZW4pIHtcbiAgICAgICAgY2hpbGRfY3R4W2luZm8udmFsdWVdID0gcmVzb2x2ZWQ7XG4gICAgfVxuICAgIGlmIChpbmZvLmN1cnJlbnQgPT09IGluZm8uY2F0Y2gpIHtcbiAgICAgICAgY2hpbGRfY3R4W2luZm8uZXJyb3JdID0gcmVzb2x2ZWQ7XG4gICAgfVxuICAgIGluZm8uYmxvY2sucChjaGlsZF9jdHgsIGRpcnR5KTtcbn1cblxuY29uc3QgZ2xvYmFscyA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgID8gd2luZG93XG4gICAgOiB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyBnbG9iYWxUaGlzXG4gICAgICAgIDogZ2xvYmFsKTtcblxuZnVuY3Rpb24gZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZCgxKTtcbiAgICBsb29rdXAuZGVsZXRlKGJsb2NrLmtleSk7XG59XG5mdW5jdGlvbiBvdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZml4X2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmYoKTtcbiAgICBvdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZV9rZXllZF9lYWNoKG9sZF9ibG9ja3MsIGRpcnR5LCBnZXRfa2V5LCBkeW5hbWljLCBjdHgsIGxpc3QsIGxvb2t1cCwgbm9kZSwgZGVzdHJveSwgY3JlYXRlX2VhY2hfYmxvY2ssIG5leHQsIGdldF9jb250ZXh0KSB7XG4gICAgbGV0IG8gPSBvbGRfYmxvY2tzLmxlbmd0aDtcbiAgICBsZXQgbiA9IGxpc3QubGVuZ3RoO1xuICAgIGxldCBpID0gbztcbiAgICBjb25zdCBvbGRfaW5kZXhlcyA9IHt9O1xuICAgIHdoaWxlIChpLS0pXG4gICAgICAgIG9sZF9pbmRleGVzW29sZF9ibG9ja3NbaV0ua2V5XSA9IGk7XG4gICAgY29uc3QgbmV3X2Jsb2NrcyA9IFtdO1xuICAgIGNvbnN0IG5ld19sb29rdXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgZGVsdGFzID0gbmV3IE1hcCgpO1xuICAgIGkgPSBuO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgY29uc3QgY2hpbGRfY3R4ID0gZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKTtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShjaGlsZF9jdHgpO1xuICAgICAgICBsZXQgYmxvY2sgPSBsb29rdXAuZ2V0KGtleSk7XG4gICAgICAgIGlmICghYmxvY2spIHtcbiAgICAgICAgICAgIGJsb2NrID0gY3JlYXRlX2VhY2hfYmxvY2soa2V5LCBjaGlsZF9jdHgpO1xuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR5bmFtaWMpIHtcbiAgICAgICAgICAgIGJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3X2xvb2t1cC5zZXQoa2V5LCBuZXdfYmxvY2tzW2ldID0gYmxvY2spO1xuICAgICAgICBpZiAoa2V5IGluIG9sZF9pbmRleGVzKVxuICAgICAgICAgICAgZGVsdGFzLnNldChrZXksIE1hdGguYWJzKGkgLSBvbGRfaW5kZXhlc1trZXldKSk7XG4gICAgfVxuICAgIGNvbnN0IHdpbGxfbW92ZSA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBkaWRfbW92ZSA9IG5ldyBTZXQoKTtcbiAgICBmdW5jdGlvbiBpbnNlcnQoYmxvY2spIHtcbiAgICAgICAgdHJhbnNpdGlvbl9pbihibG9jaywgMSk7XG4gICAgICAgIGJsb2NrLm0obm9kZSwgbmV4dCk7XG4gICAgICAgIGxvb2t1cC5zZXQoYmxvY2sua2V5LCBibG9jayk7XG4gICAgICAgIG5leHQgPSBibG9jay5maXJzdDtcbiAgICAgICAgbi0tO1xuICAgIH1cbiAgICB3aGlsZSAobyAmJiBuKSB7XG4gICAgICAgIGNvbnN0IG5ld19ibG9jayA9IG5ld19ibG9ja3NbbiAtIDFdO1xuICAgICAgICBjb25zdCBvbGRfYmxvY2sgPSBvbGRfYmxvY2tzW28gLSAxXTtcbiAgICAgICAgY29uc3QgbmV3X2tleSA9IG5ld19ibG9jay5rZXk7XG4gICAgICAgIGNvbnN0IG9sZF9rZXkgPSBvbGRfYmxvY2sua2V5O1xuICAgICAgICBpZiAobmV3X2Jsb2NrID09PSBvbGRfYmxvY2spIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgICAgIG5leHQgPSBuZXdfYmxvY2suZmlyc3Q7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgICAgICBuLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIW5ld19sb29rdXAuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgb2xkIGJsb2NrXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbG9va3VwLmhhcyhuZXdfa2V5KSB8fCB3aWxsX21vdmUuaGFzKG5ld19rZXkpKSB7XG4gICAgICAgICAgICBpbnNlcnQobmV3X2Jsb2NrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaWRfbW92ZS5oYXMob2xkX2tleSkpIHtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZWx0YXMuZ2V0KG5ld19rZXkpID4gZGVsdGFzLmdldChvbGRfa2V5KSkge1xuICAgICAgICAgICAgZGlkX21vdmUuYWRkKG5ld19rZXkpO1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aWxsX21vdmUuYWRkKG9sZF9rZXkpO1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChvLS0pIHtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvXTtcbiAgICAgICAgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfYmxvY2sua2V5KSlcbiAgICAgICAgICAgIGRlc3Ryb3kob2xkX2Jsb2NrLCBsb29rdXApO1xuICAgIH1cbiAgICB3aGlsZSAobilcbiAgICAgICAgaW5zZXJ0KG5ld19ibG9ja3NbbiAtIDFdKTtcbiAgICByZXR1cm4gbmV3X2Jsb2Nrcztcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfa2V5cyhjdHgsIGxpc3QsIGdldF9jb250ZXh0LCBnZXRfa2V5KSB7XG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShnZXRfY29udGV4dChjdHgsIGxpc3QsIGkpKTtcbiAgICAgICAgaWYgKGtleXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGhhdmUgZHVwbGljYXRlIGtleXMgaW4gYSBrZXllZCBlYWNoJyk7XG4gICAgICAgIH1cbiAgICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldF9zcHJlYWRfdXBkYXRlKGxldmVscywgdXBkYXRlcykge1xuICAgIGNvbnN0IHVwZGF0ZSA9IHt9O1xuICAgIGNvbnN0IHRvX251bGxfb3V0ID0ge307XG4gICAgY29uc3QgYWNjb3VudGVkX2ZvciA9IHsgJCRzY29wZTogMSB9O1xuICAgIGxldCBpID0gbGV2ZWxzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IG8gPSBsZXZlbHNbaV07XG4gICAgICAgIGNvbnN0IG4gPSB1cGRhdGVzW2ldO1xuICAgICAgICBpZiAobikge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBuKSlcbiAgICAgICAgICAgICAgICAgICAgdG9fbnVsbF9vdXRba2V5XSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBuKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhY2NvdW50ZWRfZm9yW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlW2tleV0gPSBuW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRlZF9mb3Jba2V5XSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV2ZWxzW2ldID0gbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHRvX251bGxfb3V0KSB7XG4gICAgICAgIGlmICghKGtleSBpbiB1cGRhdGUpKVxuICAgICAgICAgICAgdXBkYXRlW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGU7XG59XG5mdW5jdGlvbiBnZXRfc3ByZWFkX29iamVjdChzcHJlYWRfcHJvcHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHNwcmVhZF9wcm9wcyA9PT0gJ29iamVjdCcgJiYgc3ByZWFkX3Byb3BzICE9PSBudWxsID8gc3ByZWFkX3Byb3BzIDoge307XG59XG5cbi8vIHNvdXJjZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sXG5jb25zdCBib29sZWFuX2F0dHJpYnV0ZXMgPSBuZXcgU2V0KFtcbiAgICAnYWxsb3dmdWxsc2NyZWVuJyxcbiAgICAnYWxsb3dwYXltZW50cmVxdWVzdCcsXG4gICAgJ2FzeW5jJyxcbiAgICAnYXV0b2ZvY3VzJyxcbiAgICAnYXV0b3BsYXknLFxuICAgICdjaGVja2VkJyxcbiAgICAnY29udHJvbHMnLFxuICAgICdkZWZhdWx0JyxcbiAgICAnZGVmZXInLFxuICAgICdkaXNhYmxlZCcsXG4gICAgJ2Zvcm1ub3ZhbGlkYXRlJyxcbiAgICAnaGlkZGVuJyxcbiAgICAnaXNtYXAnLFxuICAgICdsb29wJyxcbiAgICAnbXVsdGlwbGUnLFxuICAgICdtdXRlZCcsXG4gICAgJ25vbW9kdWxlJyxcbiAgICAnbm92YWxpZGF0ZScsXG4gICAgJ29wZW4nLFxuICAgICdwbGF5c2lubGluZScsXG4gICAgJ3JlYWRvbmx5JyxcbiAgICAncmVxdWlyZWQnLFxuICAgICdyZXZlcnNlZCcsXG4gICAgJ3NlbGVjdGVkJ1xuXSk7XG5cbmNvbnN0IGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyID0gL1tcXHMnXCI+Lz1cXHV7RkREMH0tXFx1e0ZERUZ9XFx1e0ZGRkV9XFx1e0ZGRkZ9XFx1ezFGRkZFfVxcdXsxRkZGRn1cXHV7MkZGRkV9XFx1ezJGRkZGfVxcdXszRkZGRX1cXHV7M0ZGRkZ9XFx1ezRGRkZFfVxcdXs0RkZGRn1cXHV7NUZGRkV9XFx1ezVGRkZGfVxcdXs2RkZGRX1cXHV7NkZGRkZ9XFx1ezdGRkZFfVxcdXs3RkZGRn1cXHV7OEZGRkV9XFx1ezhGRkZGfVxcdXs5RkZGRX1cXHV7OUZGRkZ9XFx1e0FGRkZFfVxcdXtBRkZGRn1cXHV7QkZGRkV9XFx1e0JGRkZGfVxcdXtDRkZGRX1cXHV7Q0ZGRkZ9XFx1e0RGRkZFfVxcdXtERkZGRn1cXHV7RUZGRkV9XFx1e0VGRkZGfVxcdXtGRkZGRX1cXHV7RkZGRkZ9XFx1ezEwRkZGRX1cXHV7MTBGRkZGfV0vdTtcbi8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZXMtMlxuLy8gaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI25vbmNoYXJhY3RlclxuZnVuY3Rpb24gc3ByZWFkKGFyZ3MsIGF0dHJzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoYXR0cnNfdG9fYWRkKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXNfdG9fYWRkID0gYXR0cnNfdG9fYWRkLmNsYXNzZXM7XG4gICAgICAgIGNvbnN0IHN0eWxlc190b19hZGQgPSBhdHRyc190b19hZGQuc3R5bGVzO1xuICAgICAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLmNsYXNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3Nlc190b19hZGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzICs9ICcgJyArIGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzdHlsZXNfdG9fYWRkKSB7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy5zdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5zdHlsZSA9IHN0eWxlX29iamVjdF90b19zdHJpbmcoc3R5bGVzX3RvX2FkZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnN0eWxlID0gc3R5bGVfb2JqZWN0X3RvX3N0cmluZyhtZXJnZV9zc3Jfc3R5bGVzKGF0dHJpYnV0ZXMuc3R5bGUsIHN0eWxlc190b19hZGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke3ZhbHVlfVwiYDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBtZXJnZV9zc3Jfc3R5bGVzKHN0eWxlX2F0dHJpYnV0ZSwgc3R5bGVfZGlyZWN0aXZlKSB7XG4gICAgY29uc3Qgc3R5bGVfb2JqZWN0ID0ge307XG4gICAgZm9yIChjb25zdCBpbmRpdmlkdWFsX3N0eWxlIG9mIHN0eWxlX2F0dHJpYnV0ZS5zcGxpdCgnOycpKSB7XG4gICAgICAgIGNvbnN0IGNvbG9uX2luZGV4ID0gaW5kaXZpZHVhbF9zdHlsZS5pbmRleE9mKCc6Jyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBpbmRpdmlkdWFsX3N0eWxlLnNsaWNlKDAsIGNvbG9uX2luZGV4KS50cmltKCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5kaXZpZHVhbF9zdHlsZS5zbGljZShjb2xvbl9pbmRleCArIDEpLnRyaW0oKTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIHN0eWxlX29iamVjdFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gc3R5bGVfZGlyZWN0aXZlKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVfZGlyZWN0aXZlW25hbWVdO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHN0eWxlX29iamVjdFtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHN0eWxlX29iamVjdFtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3R5bGVfb2JqZWN0O1xufVxuY29uc3QgZXNjYXBlZCA9IHtcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0Oydcbn07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICAgIHJldHVybiBTdHJpbmcoaHRtbCkucmVwbGFjZSgvW1wiJyY8Pl0vZywgbWF0Y2ggPT4gZXNjYXBlZFttYXRjaF0pO1xufVxuZnVuY3Rpb24gZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gZXNjYXBlKHZhbHVlKSA6IHZhbHVlO1xufVxuZnVuY3Rpb24gZXNjYXBlX29iamVjdChvYmopIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlKG9ialtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGVhY2goaXRlbXMsIGZuKSB7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RyICs9IGZuKGl0ZW1zW2ldLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cbmNvbnN0IG1pc3NpbmdfY29tcG9uZW50ID0ge1xuICAgICQkcmVuZGVyOiAoKSA9PiAnJ1xufTtcbmZ1bmN0aW9uIHZhbGlkYXRlX2NvbXBvbmVudChjb21wb25lbnQsIG5hbWUpIHtcbiAgICBpZiAoIWNvbXBvbmVudCB8fCAhY29tcG9uZW50LiQkcmVuZGVyKSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnc3ZlbHRlOmNvbXBvbmVudCcpXG4gICAgICAgICAgICBuYW1lICs9ICcgdGhpcz17Li4ufSc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgPCR7bmFtZX0+IGlzIG5vdCBhIHZhbGlkIFNTUiBjb21wb25lbnQuIFlvdSBtYXkgbmVlZCB0byByZXZpZXcgeW91ciBidWlsZCBjb25maWcgdG8gZW5zdXJlIHRoYXQgZGVwZW5kZW5jaWVzIGFyZSBjb21waWxlZCwgcmF0aGVyIHRoYW4gaW1wb3J0ZWQgYXMgcHJlLWNvbXBpbGVkIG1vZHVsZXNgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGRlYnVnKGZpbGUsIGxpbmUsIGNvbHVtbiwgdmFsdWVzKSB7XG4gICAgY29uc29sZS5sb2coYHtAZGVidWd9ICR7ZmlsZSA/IGZpbGUgKyAnICcgOiAnJ30oJHtsaW5lfToke2NvbHVtbn0pYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKHZhbHVlcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIHJldHVybiAnJztcbn1cbmxldCBvbl9kZXN0cm95O1xuZnVuY3Rpb24gY3JlYXRlX3Nzcl9jb21wb25lbnQoZm4pIHtcbiAgICBmdW5jdGlvbiAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMsIGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgICAgICBjb25zdCAkJCA9IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3ksXG4gICAgICAgICAgICBjb250ZXh0OiBuZXcgTWFwKGNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBpbW1lZGlhdGVseSBkaXNjYXJkZWRcbiAgICAgICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KClcbiAgICAgICAgfTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHsgJCQgfSk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBmbihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMpO1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXI6IChwcm9wcyA9IHt9LCB7ICQkc2xvdHMgPSB7fSwgY29udGV4dCA9IG5ldyBNYXAoKSB9ID0ge30pID0+IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgdGl0bGU6ICcnLCBoZWFkOiAnJywgY3NzOiBuZXcgU2V0KCkgfTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCB7fSwgJCRzbG90cywgY29udGV4dCk7XG4gICAgICAgICAgICBydW5fYWxsKG9uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBBcnJheS5mcm9tKHJlc3VsdC5jc3MpLm1hcChjc3MgPT4gY3NzLmNvZGUpLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IG51bGwgLy8gVE9ET1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZDogcmVzdWx0LnRpdGxlICsgcmVzdWx0LmhlYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICQkcmVuZGVyXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZF9hdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAoYm9vbGVhbiAmJiAhdmFsdWUpKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGAgJHtuYW1lfSR7dmFsdWUgPT09IHRydWUgJiYgYm9vbGVhbl9hdHRyaWJ1dGVzLmhhcyhuYW1lKSA/ICcnIDogYD0ke3R5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBKU09OLnN0cmluZ2lmeShlc2NhcGUodmFsdWUpKSA6IGBcIiR7dmFsdWV9XCJgfWB9YDtcbn1cbmZ1bmN0aW9uIGFkZF9jbGFzc2VzKGNsYXNzZXMpIHtcbiAgICByZXR1cm4gY2xhc3NlcyA/IGAgY2xhc3M9XCIke2NsYXNzZXN9XCJgIDogJyc7XG59XG5mdW5jdGlvbiBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKHN0eWxlX29iamVjdCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzdHlsZV9vYmplY3QpXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+IHN0eWxlX29iamVjdFtrZXldKVxuICAgICAgICAubWFwKGtleSA9PiBgJHtrZXl9OiAke3N0eWxlX29iamVjdFtrZXldfTtgKVxuICAgICAgICAuam9pbignICcpO1xufVxuZnVuY3Rpb24gYWRkX3N0eWxlcyhzdHlsZV9vYmplY3QpIHtcbiAgICBjb25zdCBzdHlsZXMgPSBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKHN0eWxlX29iamVjdCk7XG4gICAgcmV0dXJuIHN0eWxlcyA/IGAgc3R5bGU9XCIke3N0eWxlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IsIGN1c3RvbUVsZW1lbnQpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBvbl9tb3VudCwgb25fZGVzdHJveSwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgaWYgKCFjdXN0b21FbGVtZW50KSB7XG4gICAgICAgIC8vIG9uTW91bnQgaGFwcGVucyBiZWZvcmUgdGhlIGluaXRpYWwgYWZ0ZXJVcGRhdGVcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICBpZiAob25fZGVzdHJveSkge1xuICAgICAgICAgICAgICAgIG9uX2Rlc3Ryb3kucHVzaCguLi5uZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFZGdlIGNhc2UgLSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseSxcbiAgICAgICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICAgICAgcnVuX2FsbChuZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gZGVzdHJveV9jb21wb25lbnQoY29tcG9uZW50LCBkZXRhY2hpbmcpIHtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJDtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgcnVuX2FsbCgkJC5vbl9kZXN0cm95KTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuZChkZXRhY2hpbmcpO1xuICAgICAgICAvLyBUT0RPIG51bGwgb3V0IG90aGVyIHJlZnMsIGluY2x1ZGluZyBjb21wb25lbnQuJCQgKGJ1dCBuZWVkIHRvXG4gICAgICAgIC8vIHByZXNlcnZlIGZpbmFsIHN0YXRlPylcbiAgICAgICAgJCQub25fZGVzdHJveSA9ICQkLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgJCQuY3R4ID0gW107XG4gICAgfVxufVxuZnVuY3Rpb24gbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpIHtcbiAgICBpZiAoY29tcG9uZW50LiQkLmRpcnR5WzBdID09PSAtMSkge1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgICAgIGNvbXBvbmVudC4kJC5kaXJ0eS5maWxsKDApO1xuICAgIH1cbiAgICBjb21wb25lbnQuJCQuZGlydHlbKGkgLyAzMSkgfCAwXSB8PSAoMSA8PCAoaSAlIDMxKSk7XG59XG5mdW5jdGlvbiBpbml0KGNvbXBvbmVudCwgb3B0aW9ucywgaW5zdGFuY2UsIGNyZWF0ZV9mcmFnbWVudCwgbm90X2VxdWFsLCBwcm9wcywgYXBwZW5kX3N0eWxlcywgZGlydHkgPSBbLTFdKSB7XG4gICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkID0ge1xuICAgICAgICBmcmFnbWVudDogbnVsbCxcbiAgICAgICAgY3R4OiBudWxsLFxuICAgICAgICAvLyBzdGF0ZVxuICAgICAgICBwcm9wcyxcbiAgICAgICAgdXBkYXRlOiBub29wLFxuICAgICAgICBub3RfZXF1YWwsXG4gICAgICAgIGJvdW5kOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgLy8gbGlmZWN5Y2xlXG4gICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgb25fZGVzdHJveTogW10sXG4gICAgICAgIG9uX2Rpc2Nvbm5lY3Q6IFtdLFxuICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgY29udGV4dDogbmV3IE1hcChvcHRpb25zLmNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlLFxuICAgICAgICByb290OiBvcHRpb25zLnRhcmdldCB8fCBwYXJlbnRfY29tcG9uZW50LiQkLnJvb3RcbiAgICB9O1xuICAgIGFwcGVuZF9zdHlsZXMgJiYgYXBwZW5kX3N0eWxlcygkJC5yb290KTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIHN0YXJ0X2h5ZHJhdGluZygpO1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IsIG9wdGlvbnMuY3VzdG9tRWxlbWVudCk7XG4gICAgICAgIGVuZF9oeWRyYXRpbmcoKTtcbiAgICAgICAgZmx1c2goKTtcbiAgICB9XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xufVxubGV0IFN2ZWx0ZUVsZW1lbnQ7XG5pZiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgU3ZlbHRlRWxlbWVudCA9IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb25fbW91bnQgfSA9IHRoaXMuJCQ7XG4gICAgICAgICAgICB0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QgPSBvbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodGhpcy4kJC5vbl9kaXNjb25uZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMuIFVzZWQgd2hlbiBkZXY9ZmFsc2UuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuNDYuNCcgfSwgZGV0YWlsKSwgdHJ1ZSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbl9kZXYodGFyZ2V0LCBub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSB9KTtcbiAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9kZXYobm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlJywgeyBub2RlIH0pO1xuICAgIGRldGFjaChub2RlKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9iZXR3ZWVuX2RldihiZWZvcmUsIGFmdGVyKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZyAmJiBiZWZvcmUubmV4dFNpYmxpbmcgIT09IGFmdGVyKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYmVmb3JlX2RldihhZnRlcikge1xuICAgIHdoaWxlIChhZnRlci5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihhZnRlci5wcmV2aW91c1NpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9hZnRlcl9kZXYoYmVmb3JlKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbGlzdGVuX2Rldihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucywgaGFzX3ByZXZlbnRfZGVmYXVsdCwgaGFzX3N0b3BfcHJvcGFnYXRpb24pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSBvcHRpb25zID09PSB0cnVlID8gWydjYXB0dXJlJ10gOiBvcHRpb25zID8gQXJyYXkuZnJvbShPYmplY3Qua2V5cyhvcHRpb25zKSkgOiBbXTtcbiAgICBpZiAoaGFzX3ByZXZlbnRfZGVmYXVsdClcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3ByZXZlbnREZWZhdWx0Jyk7XG4gICAgaWYgKGhhc19zdG9wX3Byb3BhZ2F0aW9uKVxuICAgICAgICBtb2RpZmllcnMucHVzaCgnc3RvcFByb3BhZ2F0aW9uJyk7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01BZGRFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgIGNvbnN0IGRpc3Bvc2UgPSBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyX2Rldihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSB9KTtcbiAgICBlbHNlXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0QXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUsIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gcHJvcF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldFByb3BlcnR5JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBkYXRhc2V0X2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlLmRhdGFzZXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhc2V0JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9kZXYodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQud2hvbGVUZXh0ID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhJywgeyBub2RlOiB0ZXh0LCBkYXRhIH0pO1xuICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50KGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnc3RyaW5nJyAmJiAhKGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiAnbGVuZ3RoJyBpbiBhcmcpKSB7XG4gICAgICAgIGxldCBtc2cgPSAneyNlYWNofSBvbmx5IGl0ZXJhdGVzIG92ZXIgYXJyYXktbGlrZSBvYmplY3RzLic7XG4gICAgICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIGFyZyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYXJnKSB7XG4gICAgICAgICAgICBtc2cgKz0gJyBZb3UgY2FuIHVzZSBhIHNwcmVhZCB0byBjb252ZXJ0IHRoaXMgaXRlcmFibGUgaW50byBhbiBhcnJheS4nO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3Nsb3RzKG5hbWUsIHNsb3QsIGtleXMpIHtcbiAgICBmb3IgKGNvbnN0IHNsb3Rfa2V5IG9mIE9iamVjdC5rZXlzKHNsb3QpKSB7XG4gICAgICAgIGlmICghfmtleXMuaW5kZXhPZihzbG90X2tleSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgPCR7bmFtZX0+IHJlY2VpdmVkIGFuIHVuZXhwZWN0ZWQgc2xvdCBcIiR7c2xvdF9rZXl9XCIuYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFN2ZWx0ZSBjb21wb25lbnRzIHdpdGggc29tZSBtaW5vciBkZXYtZW5oYW5jZW1lbnRzLiBVc2VkIHdoZW4gZGV2PXRydWUuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudERldiBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMgfHwgKCFvcHRpb25zLnRhcmdldCAmJiAhb3B0aW9ucy4kJGlubGluZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid0YXJnZXQnIGlzIGEgcmVxdWlyZWQgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAkY2FwdHVyZV9zdGF0ZSgpIHsgfVxuICAgICRpbmplY3Rfc3RhdGUoKSB7IH1cbn1cbi8qKlxuICogQmFzZSBjbGFzcyB0byBjcmVhdGUgc3Ryb25nbHkgdHlwZWQgU3ZlbHRlIGNvbXBvbmVudHMuXG4gKiBUaGlzIG9ubHkgZXhpc3RzIGZvciB0eXBpbmcgcHVycG9zZXMgYW5kIHNob3VsZCBiZSB1c2VkIGluIGAuZC50c2AgZmlsZXMuXG4gKlxuICogIyMjIEV4YW1wbGU6XG4gKlxuICogWW91IGhhdmUgY29tcG9uZW50IGxpYnJhcnkgb24gbnBtIGNhbGxlZCBgY29tcG9uZW50LWxpYnJhcnlgLCBmcm9tIHdoaWNoXG4gKiB5b3UgZXhwb3J0IGEgY29tcG9uZW50IGNhbGxlZCBgTXlDb21wb25lbnRgLiBGb3IgU3ZlbHRlK1R5cGVTY3JpcHQgdXNlcnMsXG4gKiB5b3Ugd2FudCB0byBwcm92aWRlIHR5cGluZ3MuIFRoZXJlZm9yZSB5b3UgY3JlYXRlIGEgYGluZGV4LmQudHNgOlxuICogYGBgdHNcbiAqIGltcG9ydCB7IFN2ZWx0ZUNvbXBvbmVudFR5cGVkIH0gZnJvbSBcInN2ZWx0ZVwiO1xuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50VHlwZWQ8e2Zvbzogc3RyaW5nfT4ge31cbiAqIGBgYFxuICogVHlwaW5nIHRoaXMgbWFrZXMgaXQgcG9zc2libGUgZm9yIElERXMgbGlrZSBWUyBDb2RlIHdpdGggdGhlIFN2ZWx0ZSBleHRlbnNpb25cbiAqIHRvIHByb3ZpZGUgaW50ZWxsaXNlbnNlIGFuZCB0byB1c2UgdGhlIGNvbXBvbmVudCBsaWtlIHRoaXMgaW4gYSBTdmVsdGUgZmlsZVxuICogd2l0aCBUeXBlU2NyaXB0OlxuICogYGBgc3ZlbHRlXG4gKiA8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICogXHRpbXBvcnQgeyBNeUNvbXBvbmVudCB9IGZyb20gXCJjb21wb25lbnQtbGlicmFyeVwiO1xuICogPC9zY3JpcHQ+XG4gKiA8TXlDb21wb25lbnQgZm9vPXsnYmFyJ30gLz5cbiAqIGBgYFxuICpcbiAqICMjIyMgV2h5IG5vdCBtYWtlIHRoaXMgcGFydCBvZiBgU3ZlbHRlQ29tcG9uZW50KERldilgP1xuICogQmVjYXVzZVxuICogYGBgdHNcbiAqIGNsYXNzIEFTdWJjbGFzc09mU3ZlbHRlQ29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50PHtmb286IHN0cmluZ30+IHt9XG4gKiBjb25zdCBjb21wb25lbnQ6IHR5cGVvZiBTdmVsdGVDb21wb25lbnQgPSBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudDtcbiAqIGBgYFxuICogd2lsbCB0aHJvdyBhIHR5cGUgZXJyb3IsIHNvIHdlIG5lZWQgdG8gc2VwYXJhdGUgdGhlIG1vcmUgc3RyaWN0bHkgdHlwZWQgY2xhc3MuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkIGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50RGV2IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBIdG1sVGFnSHlkcmF0aW9uLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlQ29tcG9uZW50VHlwZWQsIFN2ZWx0ZUVsZW1lbnQsIGFjdGlvbl9kZXN0cm95ZXIsIGFkZF9hdHRyaWJ1dGUsIGFkZF9jbGFzc2VzLCBhZGRfZmx1c2hfY2FsbGJhY2ssIGFkZF9sb2NhdGlvbiwgYWRkX3JlbmRlcl9jYWxsYmFjaywgYWRkX3Jlc2l6ZV9saXN0ZW5lciwgYWRkX3N0eWxlcywgYWRkX3RyYW5zZm9ybSwgYWZ0ZXJVcGRhdGUsIGFwcGVuZCwgYXBwZW5kX2RldiwgYXBwZW5kX2VtcHR5X3N0eWxlc2hlZXQsIGFwcGVuZF9oeWRyYXRpb24sIGFwcGVuZF9oeWRyYXRpb25fZGV2LCBhcHBlbmRfc3R5bGVzLCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBhdHRyaWJ1dGVfdG9fb2JqZWN0LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9odG1sX3RhZywgY2xhaW1fc3BhY2UsIGNsYWltX3N2Z19lbGVtZW50LCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjcmVhdGVFdmVudERpc3BhdGNoZXIsIGNyZWF0ZV9hbmltYXRpb24sIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24sIGNyZWF0ZV9jb21wb25lbnQsIGNyZWF0ZV9pbl90cmFuc2l0aW9uLCBjcmVhdGVfb3V0X3RyYW5zaXRpb24sIGNyZWF0ZV9zbG90LCBjcmVhdGVfc3NyX2NvbXBvbmVudCwgY3VycmVudF9jb21wb25lbnQsIGN1c3RvbV9ldmVudCwgZGF0YXNldF9kZXYsIGRlYnVnLCBkZXN0cm95X2Jsb2NrLCBkZXN0cm95X2NvbXBvbmVudCwgZGVzdHJveV9lYWNoLCBkZXRhY2gsIGRldGFjaF9hZnRlcl9kZXYsIGRldGFjaF9iZWZvcmVfZGV2LCBkZXRhY2hfYmV0d2Vlbl9kZXYsIGRldGFjaF9kZXYsIGRpcnR5X2NvbXBvbmVudHMsIGRpc3BhdGNoX2RldiwgZWFjaCwgZWxlbWVudCwgZWxlbWVudF9pcywgZW1wdHksIGVuZF9oeWRyYXRpbmcsIGVzY2FwZSwgZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZSwgZXNjYXBlX29iamVjdCwgZXNjYXBlZCwgZXhjbHVkZV9pbnRlcm5hbF9wcm9wcywgZml4X2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfcG9zaXRpb24sIGZsdXNoLCBnZXRBbGxDb250ZXh0cywgZ2V0Q29udGV4dCwgZ2V0X2FsbF9kaXJ0eV9mcm9tX3Njb3BlLCBnZXRfYmluZGluZ19ncm91cF92YWx1ZSwgZ2V0X2N1cnJlbnRfY29tcG9uZW50LCBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzLCBnZXRfcm9vdF9mb3Jfc3R5bGUsIGdldF9zbG90X2NoYW5nZXMsIGdldF9zcHJlYWRfb2JqZWN0LCBnZXRfc3ByZWFkX3VwZGF0ZSwgZ2V0X3N0b3JlX3ZhbHVlLCBnbG9iYWxzLCBncm91cF9vdXRyb3MsIGhhbmRsZV9wcm9taXNlLCBoYXNDb250ZXh0LCBoYXNfcHJvcCwgaWRlbnRpdHksIGluaXQsIGluc2VydCwgaW5zZXJ0X2RldiwgaW5zZXJ0X2h5ZHJhdGlvbiwgaW5zZXJ0X2h5ZHJhdGlvbl9kZXYsIGludHJvcywgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIsIGlzX2NsaWVudCwgaXNfY3Jvc3NvcmlnaW4sIGlzX2VtcHR5LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtZXJnZV9zc3Jfc3R5bGVzLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3JjX3VybF9lcXVhbCwgc3RhcnRfaHlkcmF0aW5nLCBzdG9wX3Byb3BhZ2F0aW9uLCBzdWJzY3JpYmUsIHN2Z19lbGVtZW50LCB0ZXh0LCB0aWNrLCB0aW1lX3Jhbmdlc190b19hcnJheSwgdG9fbnVtYmVyLCB0b2dnbGVfY2xhc3MsIHRyYW5zaXRpb25faW4sIHRyYW5zaXRpb25fb3V0LCB0cnVzdGVkLCB1cGRhdGVfYXdhaXRfYmxvY2tfYnJhbmNoLCB1cGRhdGVfa2V5ZWRfZWFjaCwgdXBkYXRlX3Nsb3QsIHVwZGF0ZV9zbG90X2Jhc2UsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHhsaW5rX2F0dHIgfTtcbiIsICJpbXBvcnQgeyBub29wLCBzYWZlX25vdF9lcXVhbCwgc3Vic2NyaWJlLCBydW5fYWxsLCBpc19mdW5jdGlvbiB9IGZyb20gJy4uL2ludGVybmFsL2luZGV4Lm1qcyc7XG5leHBvcnQgeyBnZXRfc3RvcmVfdmFsdWUgYXMgZ2V0IH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcblxuY29uc3Qgc3Vic2NyaWJlcl9xdWV1ZSA9IFtdO1xuLyoqXG4gKiBDcmVhdGVzIGEgYFJlYWRhYmxlYCBzdG9yZSB0aGF0IGFsbG93cyByZWFkaW5nIGJ5IHN1YnNjcmlwdGlvbi5cbiAqIEBwYXJhbSB2YWx1ZSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0ge1N0YXJ0U3RvcE5vdGlmaWVyfXN0YXJ0IHN0YXJ0IGFuZCBzdG9wIG5vdGlmaWNhdGlvbnMgZm9yIHN1YnNjcmlwdGlvbnNcbiAqL1xuZnVuY3Rpb24gcmVhZGFibGUodmFsdWUsIHN0YXJ0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlOiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQpLnN1YnNjcmliZVxuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZSBhIGBXcml0YWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgYm90aCB1cGRhdGluZyBhbmQgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKiBAcGFyYW0geyo9fXZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXI9fXN0YXJ0IHN0YXJ0IGFuZCBzdG9wIG5vdGlmaWNhdGlvbnMgZm9yIHN1YnNjcmlwdGlvbnNcbiAqL1xuZnVuY3Rpb24gd3JpdGFibGUodmFsdWUsIHN0YXJ0ID0gbm9vcCkge1xuICAgIGxldCBzdG9wO1xuICAgIGNvbnN0IHN1YnNjcmliZXJzID0gbmV3IFNldCgpO1xuICAgIGZ1bmN0aW9uIHNldChuZXdfdmFsdWUpIHtcbiAgICAgICAgaWYgKHNhZmVfbm90X2VxdWFsKHZhbHVlLCBuZXdfdmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG5ld192YWx1ZTtcbiAgICAgICAgICAgIGlmIChzdG9wKSB7IC8vIHN0b3JlIGlzIHJlYWR5XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuX3F1ZXVlID0gIXN1YnNjcmliZXJfcXVldWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NyaWJlciBvZiBzdWJzY3JpYmVycykge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyWzFdKCk7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWUucHVzaChzdWJzY3JpYmVyLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChydW5fcXVldWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJzY3JpYmVyX3F1ZXVlLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyX3F1ZXVlW2ldWzBdKHN1YnNjcmliZXJfcXVldWVbaSArIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyX3F1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVwZGF0ZShmbikge1xuICAgICAgICBzZXQoZm4odmFsdWUpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3Vic2NyaWJlKHJ1biwgaW52YWxpZGF0ZSA9IG5vb3ApIHtcbiAgICAgICAgY29uc3Qgc3Vic2NyaWJlciA9IFtydW4sIGludmFsaWRhdGVdO1xuICAgICAgICBzdWJzY3JpYmVycy5hZGQoc3Vic2NyaWJlcik7XG4gICAgICAgIGlmIChzdWJzY3JpYmVycy5zaXplID09PSAxKSB7XG4gICAgICAgICAgICBzdG9wID0gc3RhcnQoc2V0KSB8fCBub29wO1xuICAgICAgICB9XG4gICAgICAgIHJ1bih2YWx1ZSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5kZWxldGUoc3Vic2NyaWJlcik7XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgICAgICBzdG9wID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc2V0LCB1cGRhdGUsIHN1YnNjcmliZSB9O1xufVxuZnVuY3Rpb24gZGVyaXZlZChzdG9yZXMsIGZuLCBpbml0aWFsX3ZhbHVlKSB7XG4gICAgY29uc3Qgc2luZ2xlID0gIUFycmF5LmlzQXJyYXkoc3RvcmVzKTtcbiAgICBjb25zdCBzdG9yZXNfYXJyYXkgPSBzaW5nbGVcbiAgICAgICAgPyBbc3RvcmVzXVxuICAgICAgICA6IHN0b3JlcztcbiAgICBjb25zdCBhdXRvID0gZm4ubGVuZ3RoIDwgMjtcbiAgICByZXR1cm4gcmVhZGFibGUoaW5pdGlhbF92YWx1ZSwgKHNldCkgPT4ge1xuICAgICAgICBsZXQgaW5pdGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgICAgIGxldCBjbGVhbnVwID0gbm9vcDtcbiAgICAgICAgY29uc3Qgc3luYyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZm4oc2luZ2xlID8gdmFsdWVzWzBdIDogdmFsdWVzLCBzZXQpO1xuICAgICAgICAgICAgaWYgKGF1dG8pIHtcbiAgICAgICAgICAgICAgICBzZXQocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsZWFudXAgPSBpc19mdW5jdGlvbihyZXN1bHQpID8gcmVzdWx0IDogbm9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVycyA9IHN0b3Jlc19hcnJheS5tYXAoKHN0b3JlLCBpKSA9PiBzdWJzY3JpYmUoc3RvcmUsICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWVzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICBwZW5kaW5nICY9IH4oMSA8PCBpKTtcbiAgICAgICAgICAgIGlmIChpbml0ZWQpIHtcbiAgICAgICAgICAgICAgICBzeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgfD0gKDEgPDwgaSk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgaW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgc3luYygpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodW5zdWJzY3JpYmVycyk7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGRlcml2ZWQsIHJlYWRhYmxlLCB3cml0YWJsZSB9O1xuIiwgImltcG9ydCB7IHVybEFscGhhYmV0IH0gZnJvbSAnLi91cmwtYWxwaGFiZXQvaW5kZXguanMnXG5pZiAoZmFsc2UpIHtcbiAgaWYgKFxuICAgIHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmXG4gICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgJiZcbiAgICB0eXBlb2YgY3J5cHRvID09PSAndW5kZWZpbmVkJ1xuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnUmVhY3QgTmF0aXZlIGRvZXMgbm90IGhhdmUgYSBidWlsdC1pbiBzZWN1cmUgcmFuZG9tIGdlbmVyYXRvci4gJyArXG4gICAgICAgICdJZiB5b3UgZG9uXHUyMDE5dCBuZWVkIHVucHJlZGljdGFibGUgSURzIHVzZSBgbmFub2lkL25vbi1zZWN1cmVgLiAnICtcbiAgICAgICAgJ0ZvciBzZWN1cmUgSURzLCBpbXBvcnQgYHJlYWN0LW5hdGl2ZS1nZXQtcmFuZG9tLXZhbHVlc2AgJyArXG4gICAgICAgICdiZWZvcmUgTmFubyBJRC4nXG4gICAgKVxuICB9XG4gIGlmICh0eXBlb2YgbXNDcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjcnlwdG8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0ltcG9ydCBmaWxlIHdpdGggYGlmICghd2luZG93LmNyeXB0bykgd2luZG93LmNyeXB0byA9IHdpbmRvdy5tc0NyeXB0b2AnICtcbiAgICAgICAgJyBiZWZvcmUgaW1wb3J0aW5nIE5hbm8gSUQgdG8gZml4IElFIDExIHN1cHBvcnQnXG4gICAgKVxuICB9XG4gIGlmICh0eXBlb2YgY3J5cHRvID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdZb3VyIGJyb3dzZXIgZG9lcyBub3QgaGF2ZSBzZWN1cmUgcmFuZG9tIGdlbmVyYXRvci4gJyArXG4gICAgICAgICdJZiB5b3UgZG9uXHUyMDE5dCBuZWVkIHVucHJlZGljdGFibGUgSURzLCB5b3UgY2FuIHVzZSBuYW5vaWQvbm9uLXNlY3VyZS4nXG4gICAgKVxuICB9XG59XG5sZXQgcmFuZG9tID0gYnl0ZXMgPT4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShieXRlcykpXG5sZXQgY3VzdG9tUmFuZG9tID0gKGFscGhhYmV0LCBzaXplLCBnZXRSYW5kb20pID0+IHtcbiAgbGV0IG1hc2sgPSAoMiA8PCAoTWF0aC5sb2coYWxwaGFiZXQubGVuZ3RoIC0gMSkgLyBNYXRoLkxOMikpIC0gMVxuICBsZXQgc3RlcCA9IC1+KCgxLjYgKiBtYXNrICogc2l6ZSkgLyBhbHBoYWJldC5sZW5ndGgpXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGlkID0gJydcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IGJ5dGVzID0gZ2V0UmFuZG9tKHN0ZXApXG4gICAgICBsZXQgaiA9IHN0ZXBcbiAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgaWQgKz0gYWxwaGFiZXRbYnl0ZXNbal0gJiBtYXNrXSB8fCAnJ1xuICAgICAgICBpZiAoaWQubGVuZ3RoID09PSBzaXplKSByZXR1cm4gaWRcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbmxldCBjdXN0b21BbHBoYWJldCA9IChhbHBoYWJldCwgc2l6ZSkgPT4gY3VzdG9tUmFuZG9tKGFscGhhYmV0LCBzaXplLCByYW5kb20pXG5sZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgYnl0ZXMgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KHNpemUpKVxuICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgbGV0IGJ5dGUgPSBieXRlc1tzaXplXSAmIDYzXG4gICAgaWYgKGJ5dGUgPCAzNikge1xuICAgICAgaWQgKz0gYnl0ZS50b1N0cmluZygzNilcbiAgICB9IGVsc2UgaWYgKGJ5dGUgPCA2Mikge1xuICAgICAgaWQgKz0gKGJ5dGUgLSAyNikudG9TdHJpbmcoMzYpLnRvVXBwZXJDYXNlKClcbiAgICB9IGVsc2UgaWYgKGJ5dGUgPCA2Mykge1xuICAgICAgaWQgKz0gJ18nXG4gICAgfSBlbHNlIHtcbiAgICAgIGlkICs9ICctJ1xuICAgIH1cbiAgfVxuICByZXR1cm4gaWRcbn1cbmV4cG9ydCB7IG5hbm9pZCwgY3VzdG9tQWxwaGFiZXQsIGN1c3RvbVJhbmRvbSwgdXJsQWxwaGFiZXQsIHJhbmRvbSB9XG4iLCAiaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCJcbmltcG9ydCB0eXBlIHsgV3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCJcblxuLy8gRVhURVJOQUwgTlBNIFBBQ0tBR0VTXG5pbXBvcnQgeyBjdXN0b21BbHBoYWJldCB9IGZyb20gXCJuYW5vaWRcIjtcblxuY29uc3QgbmFub2lkID0gY3VzdG9tQWxwaGFiZXQoXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCIsIDYpXG5cbnR5cGUgRWxlbWVudE5hbWUgPSBcIkdPTERcIiB8IFwiU0lMVkVSXCIgfCBcIlBMQVRJTlwiIHwgXCJJUk9OXCIgfCBcIkNPUFBFUlwiO1xuXG50eXBlIEVsZW1lbnQgPSB7XG4gIG5hbWU6IEVsZW1lbnROYW1lLFxuICBwcmljZTogbnVtYmVyLFxufVxuXG5sZXQgaW5pdGlhbEVsZW1lbnRzOiBFbGVtZW50W10gPSBbXG4gIHtcbiAgICBuYW1lOiBcIkdPTERcIixcbiAgICBwcmljZTogMCxcbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiU0lMVkVSXCIsXG4gICAgcHJpY2U6IDAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIlBMQVRJTlwiLFxuICAgIHByaWNlOiAwLFxuICB9LFxuICB7XG4gICAgbmFtZTogXCJJUk9OXCIsXG4gICAgcHJpY2U6IDAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIkNPUFBFUlwiLFxuICAgIHByaWNlOiAwLFxuICB9LFxuXVxuXG5leHBvcnQgY29uc3QgbWV0YWxsZXI6IFdyaXRhYmxlPEVsZW1lbnRbXT4gPSB3cml0YWJsZShpbml0aWFsRWxlbWVudHMpO1xuXG50eXBlIEFsYXJtID0ge1xuICBpZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IENvbmRpdGlvbnMgfCB7fSxcbn1cblxudHlwZSBVc2VyID0ge1xuICBpZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGFsYXJtczogQWxhcm1zIHwge30sXG59XG5cbnR5cGUgVXNlcnMgPSB7XG4gIFtpZDogc3RyaW5nXTogVXNlcixcbn1cblxudHlwZSBBbGFybXMgPSB7XG4gIFtpZDogc3RyaW5nXTogQWxhcm0sXG59XG5cbnR5cGUgQ29uZGl0aW9ucyA9IHtcbiAgW2lkOiBzdHJpbmddOiBDb25kaXRpb24sXG59XG5cbnR5cGUgQ29tcGVyYXRvciA9IFwiTEVTU1wiIHwgXCJFUVVBTFwiIHwgXCJHUkVBVE9SXCJcblxudHlwZSBDb25kaXRpb24gPSB7XG4gIGVsZW1lbnQ6IEVsZW1lbnROYW1lLFxuICBjb21wZXJhdG9yOiBDb21wZXJhdG9yLFxuICBwcmljZTogbnVtYmVyLFxufVxuXG5leHBvcnQgY29uc3QgY29tcGVyYXRvcnM6IFdyaXRhYmxlPENvbXBlcmF0b3JbXT4gPSB3cml0YWJsZShbXCJMRVNTXCIsIFwiRVFVQUxcIiwgXCJHUkVBVE9SXCJdKVxuXG5jb25zdCBjcmVhdGVVc2VycyA9IChpbml0aWFsKSA9PiB7XG5cbiAgY29uc3QgeyBzdWJzY3JpYmUsIHNldCwgdXBkYXRlIH0gPSB3cml0YWJsZShpbml0aWFsKTtcblxuICByZXR1cm4ge1xuICAgIHN1YnNjcmliZSxcbiAgICBzZXQsXG4gICAgdXBkYXRlLFxuICAgIGFkZFVzZXI6IChuYW1lOiBzdHJpbmcpID0+IHVwZGF0ZShhID0+IHtcbiAgICAgIGxldCBuZXdVc2VySWQgPSBuYW5vaWQoKTtcbiAgICAgIGxldCBuZXdVc2VycyA9IHsgLi4uYSB9XG4gICAgICBuZXdVc2Vyc1tuZXdVc2VySWRdID0ge1xuICAgICAgICBpZDogbmV3VXNlcklkLFxuICAgICAgICBuYW1lLFxuICAgICAgICBhbGFybXM6IHt9LFxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld1VzZXJzO1xuICAgIH0pLFxuICAgIHJlbW92ZVVzZXI6ICh1c2VySWQ6IHN0cmluZykgPT4gdXBkYXRlKGEgPT4ge1xuICAgICAgbGV0IG5ld1VzZXJzID0geyAuLi5hIH1cbiAgICAgIGRlbGV0ZSBuZXdVc2Vyc1t1c2VySWRdXG4gICAgICByZXR1cm4gbmV3VXNlcnM7XG4gICAgfSksXG4gICAgYWRkQWxhcm06ICh7IHVzZXJJZCwgYWxhcm1OYW1lIH0pID0+IHVwZGF0ZShhID0+IHtcbiAgICAgIGxldCBuZXdBbGFybUlkID0gbmFub2lkKCk7XG4gICAgICBsZXQgbmV3VXNlcnMgPSB7IC4uLmEgfVxuICAgICAgbmV3VXNlcnNbdXNlcklkXS5hbGFybXMgPSB7XG4gICAgICAgIC4uLm5ld1VzZXJzW3VzZXJJZF0uYWxhcm1zLFxuICAgICAgICBbbmV3QWxhcm1JZF06IHtcbiAgICAgICAgICBpZDogbmV3QWxhcm1JZCxcbiAgICAgICAgICBuYW1lOiBhbGFybU5hbWUsXG4gICAgICAgICAgY29uZGl0aW9uczoge30sXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdVc2VycztcbiAgICB9KSxcbiAgICByZW1vdmVBbGFybTogKHsgdXNlcklkLCBhbGFybUlkIH0pID0+IHVwZGF0ZShhID0+IHtcbiAgICAgIGxldCBuZXdVc2VycyA9IHsgLi4uYSB9XG4gICAgICBkZWxldGUgbmV3VXNlcnNbdXNlcklkXS5hbGFybXNbYWxhcm1JZF1cbiAgICAgIHJldHVybiBuZXdVc2VycztcbiAgICB9KSxcbiAgICBhZGRDb25kaXRpb246ICh7IHVzZXJJZCwgYWxhcm1JZCwgY29uZGl0aW9uIH0pID0+IHVwZGF0ZShhID0+IHtcbiAgICAgIGxldCBuZXdDb25kaXRpb25JZCA9IG5hbm9pZCgpO1xuICAgICAgbGV0IG5ld1VzZXJzID0geyAuLi5hIH1cbiAgICAgIG5ld1VzZXJzW3VzZXJJZF0uYWxhcm1zW2FsYXJtSWRdLmNvbmRpdGlvbnMgPSB7XG4gICAgICAgIC4uLm5ld1VzZXJzW3VzZXJJZF0uYWxhcm1zW2FsYXJtSWRdLmNvbmRpdGlvbnMsXG4gICAgICAgIFtuZXdDb25kaXRpb25JZF06IGNvbmRpdGlvbixcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdVc2VycztcbiAgICB9KSxcbiAgICByZW1vdmVDb25kaXRpb246ICh7IHVzZXJJZCwgYWxhcm1JZCwgY29uZGl0aW9uSWQgfSkgPT4gdXBkYXRlKGEgPT4ge1xuICAgICAgbGV0IG5ld1VzZXJzID0geyAuLi5hIH1cbiAgICAgIGRlbGV0ZSBuZXdVc2Vyc1t1c2VySWRdLmFsYXJtc1thbGFybUlkXS5jb25kaXRpb25zW2NvbmRpdGlvbklkXVxuICAgICAgcmV0dXJuIG5ld1VzZXJzO1xuICAgIH0pLFxuICAgIHJlc2V0OiAoKSA9PiBzZXQoaW5pdGlhbCksXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHVzZXJzOiBXcml0YWJsZTxVc2Vycz4gPSBjcmVhdGVVc2Vycyh7fSk7XG4iLCAiZXhwb3J0IHsgaWRlbnRpdHkgYXMgbGluZWFyIH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcblxuLypcbkFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0dGRlc2xcbkRpc3RyaWJ1dGVkIHVuZGVyIE1JVCBMaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0ZGVzbC9lYXNlcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4qL1xuZnVuY3Rpb24gYmFja0luT3V0KHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1OCAqIDEuNTI1O1xuICAgIGlmICgodCAqPSAyKSA8IDEpXG4gICAgICAgIHJldHVybiAwLjUgKiAodCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKSk7XG4gICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDIpO1xufVxuZnVuY3Rpb24gYmFja0luKHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1ODtcbiAgICByZXR1cm4gdCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKTtcbn1cbmZ1bmN0aW9uIGJhY2tPdXQodCkge1xuICAgIGNvbnN0IHMgPSAxLjcwMTU4O1xuICAgIHJldHVybiAtLXQgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAxO1xufVxuZnVuY3Rpb24gYm91bmNlT3V0KHQpIHtcbiAgICBjb25zdCBhID0gNC4wIC8gMTEuMDtcbiAgICBjb25zdCBiID0gOC4wIC8gMTEuMDtcbiAgICBjb25zdCBjID0gOS4wIC8gMTAuMDtcbiAgICBjb25zdCBjYSA9IDQzNTYuMCAvIDM2MS4wO1xuICAgIGNvbnN0IGNiID0gMzU0NDIuMCAvIDE4MDUuMDtcbiAgICBjb25zdCBjYyA9IDE2MDYxLjAgLyAxODA1LjA7XG4gICAgY29uc3QgdDIgPSB0ICogdDtcbiAgICByZXR1cm4gdCA8IGFcbiAgICAgICAgPyA3LjU2MjUgKiB0MlxuICAgICAgICA6IHQgPCBiXG4gICAgICAgICAgICA/IDkuMDc1ICogdDIgLSA5LjkgKiB0ICsgMy40XG4gICAgICAgICAgICA6IHQgPCBjXG4gICAgICAgICAgICAgICAgPyBjYSAqIHQyIC0gY2IgKiB0ICsgY2NcbiAgICAgICAgICAgICAgICA6IDEwLjggKiB0ICogdCAtIDIwLjUyICogdCArIDEwLjcyO1xufVxuZnVuY3Rpb24gYm91bmNlSW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41XG4gICAgICAgID8gMC41ICogKDEuMCAtIGJvdW5jZU91dCgxLjAgLSB0ICogMi4wKSlcbiAgICAgICAgOiAwLjUgKiBib3VuY2VPdXQodCAqIDIuMCAtIDEuMCkgKyAwLjU7XG59XG5mdW5jdGlvbiBib3VuY2VJbih0KSB7XG4gICAgcmV0dXJuIDEuMCAtIGJvdW5jZU91dCgxLjAgLSB0KTtcbn1cbmZ1bmN0aW9uIGNpcmNJbk91dCh0KSB7XG4gICAgaWYgKCh0ICo9IDIpIDwgMSlcbiAgICAgICAgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICByZXR1cm4gMC41ICogKE1hdGguc3FydCgxIC0gKHQgLT0gMikgKiB0KSArIDEpO1xufVxuZnVuY3Rpb24gY2lyY0luKHQpIHtcbiAgICByZXR1cm4gMS4wIC0gTWF0aC5zcXJ0KDEuMCAtIHQgKiB0KTtcbn1cbmZ1bmN0aW9uIGNpcmNPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoMSAtIC0tdCAqIHQpO1xufVxuZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjUgPyA0LjAgKiB0ICogdCAqIHQgOiAwLjUgKiBNYXRoLnBvdygyLjAgKiB0IC0gMi4wLCAzLjApICsgMS4wO1xufVxuZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gICAgcmV0dXJuIHQgKiB0ICogdDtcbn1cbmZ1bmN0aW9uIGN1YmljT3V0KHQpIHtcbiAgICBjb25zdCBmID0gdCAtIDEuMDtcbiAgICByZXR1cm4gZiAqIGYgKiBmICsgMS4wO1xufVxuZnVuY3Rpb24gZWxhc3RpY0luT3V0KHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNVxuICAgICAgICA/IDAuNSAqXG4gICAgICAgICAgICBNYXRoLnNpbigoKCsxMy4wICogTWF0aC5QSSkgLyAyKSAqIDIuMCAqIHQpICpcbiAgICAgICAgICAgIE1hdGgucG93KDIuMCwgMTAuMCAqICgyLjAgKiB0IC0gMS4wKSlcbiAgICAgICAgOiAwLjUgKlxuICAgICAgICAgICAgTWF0aC5zaW4oKCgtMTMuMCAqIE1hdGguUEkpIC8gMikgKiAoMi4wICogdCAtIDEuMCArIDEuMCkpICpcbiAgICAgICAgICAgIE1hdGgucG93KDIuMCwgLTEwLjAgKiAoMi4wICogdCAtIDEuMCkpICtcbiAgICAgICAgICAgIDEuMDtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNJbih0KSB7XG4gICAgcmV0dXJuIE1hdGguc2luKCgxMy4wICogdCAqIE1hdGguUEkpIC8gMikgKiBNYXRoLnBvdygyLjAsIDEwLjAgKiAodCAtIDEuMCkpO1xufVxuZnVuY3Rpb24gZWxhc3RpY091dCh0KSB7XG4gICAgcmV0dXJuIChNYXRoLnNpbigoLTEzLjAgKiAodCArIDEuMCkgKiBNYXRoLlBJKSAvIDIpICogTWF0aC5wb3coMi4wLCAtMTAuMCAqIHQpICsgMS4wKTtcbn1cbmZ1bmN0aW9uIGV4cG9Jbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPT09IDAuMCB8fCB0ID09PSAxLjBcbiAgICAgICAgPyB0XG4gICAgICAgIDogdCA8IDAuNVxuICAgICAgICAgICAgPyArMC41ICogTWF0aC5wb3coMi4wLCAyMC4wICogdCAtIDEwLjApXG4gICAgICAgICAgICA6IC0wLjUgKiBNYXRoLnBvdygyLjAsIDEwLjAgLSB0ICogMjAuMCkgKyAxLjA7XG59XG5mdW5jdGlvbiBleHBvSW4odCkge1xuICAgIHJldHVybiB0ID09PSAwLjAgPyB0IDogTWF0aC5wb3coMi4wLCAxMC4wICogKHQgLSAxLjApKTtcbn1cbmZ1bmN0aW9uIGV4cG9PdXQodCkge1xuICAgIHJldHVybiB0ID09PSAxLjAgPyB0IDogMS4wIC0gTWF0aC5wb3coMi4wLCAtMTAuMCAqIHQpO1xufVxuZnVuY3Rpb24gcXVhZEluT3V0KHQpIHtcbiAgICB0IC89IDAuNTtcbiAgICBpZiAodCA8IDEpXG4gICAgICAgIHJldHVybiAwLjUgKiB0ICogdDtcbiAgICB0LS07XG4gICAgcmV0dXJuIC0wLjUgKiAodCAqICh0IC0gMikgLSAxKTtcbn1cbmZ1bmN0aW9uIHF1YWRJbih0KSB7XG4gICAgcmV0dXJuIHQgKiB0O1xufVxuZnVuY3Rpb24gcXVhZE91dCh0KSB7XG4gICAgcmV0dXJuIC10ICogKHQgLSAyLjApO1xufVxuZnVuY3Rpb24gcXVhcnRJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjVcbiAgICAgICAgPyArOC4wICogTWF0aC5wb3codCwgNC4wKVxuICAgICAgICA6IC04LjAgKiBNYXRoLnBvdyh0IC0gMS4wLCA0LjApICsgMS4wO1xufVxuZnVuY3Rpb24gcXVhcnRJbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KHQsIDQuMCk7XG59XG5mdW5jdGlvbiBxdWFydE91dCh0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KHQgLSAxLjAsIDMuMCkgKiAoMS4wIC0gdCkgKyAxLjA7XG59XG5mdW5jdGlvbiBxdWludEluT3V0KHQpIHtcbiAgICBpZiAoKHQgKj0gMikgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogdCAqIHQgKiB0ICogdCAqIHQ7XG4gICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKTtcbn1cbmZ1bmN0aW9uIHF1aW50SW4odCkge1xuICAgIHJldHVybiB0ICogdCAqIHQgKiB0ICogdDtcbn1cbmZ1bmN0aW9uIHF1aW50T3V0KHQpIHtcbiAgICByZXR1cm4gLS10ICogdCAqIHQgKiB0ICogdCArIDE7XG59XG5mdW5jdGlvbiBzaW5lSW5PdXQodCkge1xuICAgIHJldHVybiAtMC41ICogKE1hdGguY29zKE1hdGguUEkgKiB0KSAtIDEpO1xufVxuZnVuY3Rpb24gc2luZUluKHQpIHtcbiAgICBjb25zdCB2ID0gTWF0aC5jb3ModCAqIE1hdGguUEkgKiAwLjUpO1xuICAgIGlmIChNYXRoLmFicyh2KSA8IDFlLTE0KVxuICAgICAgICByZXR1cm4gMTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiAxIC0gdjtcbn1cbmZ1bmN0aW9uIHNpbmVPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnNpbigodCAqIE1hdGguUEkpIC8gMik7XG59XG5cbmV4cG9ydCB7IGJhY2tJbiwgYmFja0luT3V0LCBiYWNrT3V0LCBib3VuY2VJbiwgYm91bmNlSW5PdXQsIGJvdW5jZU91dCwgY2lyY0luLCBjaXJjSW5PdXQsIGNpcmNPdXQsIGN1YmljSW4sIGN1YmljSW5PdXQsIGN1YmljT3V0LCBlbGFzdGljSW4sIGVsYXN0aWNJbk91dCwgZWxhc3RpY091dCwgZXhwb0luLCBleHBvSW5PdXQsIGV4cG9PdXQsIHF1YWRJbiwgcXVhZEluT3V0LCBxdWFkT3V0LCBxdWFydEluLCBxdWFydEluT3V0LCBxdWFydE91dCwgcXVpbnRJbiwgcXVpbnRJbk91dCwgcXVpbnRPdXQsIHNpbmVJbiwgc2luZUluT3V0LCBzaW5lT3V0IH07XG4iLCAiaW1wb3J0IHsgY3ViaWNJbk91dCwgbGluZWFyLCBjdWJpY091dCB9IGZyb20gJy4uL2Vhc2luZy9pbmRleC5tanMnO1xuaW1wb3J0IHsgaXNfZnVuY3Rpb24sIGFzc2lnbiB9IGZyb20gJy4uL2ludGVybmFsL2luZGV4Lm1qcyc7XG5cbi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcblxyXG5mdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cblxuZnVuY3Rpb24gYmx1cihub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljSW5PdXQsIGFtb3VudCA9IDUsIG9wYWNpdHkgPSAwIH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0YXJnZXRfb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IGYgPSBzdHlsZS5maWx0ZXIgPT09ICdub25lJyA/ICcnIDogc3R5bGUuZmlsdGVyO1xuICAgIGNvbnN0IG9kID0gdGFyZ2V0X29wYWNpdHkgKiAoMSAtIG9wYWNpdHkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IChfdCwgdSkgPT4gYG9wYWNpdHk6ICR7dGFyZ2V0X29wYWNpdHkgLSAob2QgKiB1KX07IGZpbHRlcjogJHtmfSBibHVyKCR7dSAqIGFtb3VudH1weCk7YFxuICAgIH07XG59XG5mdW5jdGlvbiBmYWRlKG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gbGluZWFyIH0gPSB7fSkge1xuICAgIGNvbnN0IG8gPSArZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5vcGFjaXR5O1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IHQgPT4gYG9wYWNpdHk6ICR7dCAqIG99YFxuICAgIH07XG59XG5mdW5jdGlvbiBmbHkobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCwgeCA9IDAsIHkgPSAwLCBvcGFjaXR5ID0gMCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3QgdGFyZ2V0X29wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgIGNvbnN0IG9kID0gdGFyZ2V0X29wYWNpdHkgKiAoMSAtIG9wYWNpdHkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6ICh0LCB1KSA9PiBgXG5cdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHsoMSAtIHQpICogeH1weCwgJHsoMSAtIHQpICogeX1weCk7XG5cdFx0XHRvcGFjaXR5OiAke3RhcmdldF9vcGFjaXR5IC0gKG9kICogdSl9YFxuICAgIH07XG59XG5mdW5jdGlvbiBzbGlkZShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljT3V0IH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCBvcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgaGVpZ2h0ID0gcGFyc2VGbG9hdChzdHlsZS5oZWlnaHQpO1xuICAgIGNvbnN0IHBhZGRpbmdfdG9wID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKTtcbiAgICBjb25zdCBwYWRkaW5nX2JvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSk7XG4gICAgY29uc3QgbWFyZ2luX3RvcCA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luVG9wKTtcbiAgICBjb25zdCBtYXJnaW5fYm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICAgIGNvbnN0IGJvcmRlcl90b3Bfd2lkdGggPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclRvcFdpZHRoKTtcbiAgICBjb25zdCBib3JkZXJfYm90dG9tX3dpZHRoID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJCb3R0b21XaWR0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogdCA9PiAnb3ZlcmZsb3c6IGhpZGRlbjsnICtcbiAgICAgICAgICAgIGBvcGFjaXR5OiAke01hdGgubWluKHQgKiAyMCwgMSkgKiBvcGFjaXR5fTtgICtcbiAgICAgICAgICAgIGBoZWlnaHQ6ICR7dCAqIGhlaWdodH1weDtgICtcbiAgICAgICAgICAgIGBwYWRkaW5nLXRvcDogJHt0ICogcGFkZGluZ190b3B9cHg7YCArXG4gICAgICAgICAgICBgcGFkZGluZy1ib3R0b206ICR7dCAqIHBhZGRpbmdfYm90dG9tfXB4O2AgK1xuICAgICAgICAgICAgYG1hcmdpbi10b3A6ICR7dCAqIG1hcmdpbl90b3B9cHg7YCArXG4gICAgICAgICAgICBgbWFyZ2luLWJvdHRvbTogJHt0ICogbWFyZ2luX2JvdHRvbX1weDtgICtcbiAgICAgICAgICAgIGBib3JkZXItdG9wLXdpZHRoOiAke3QgKiBib3JkZXJfdG9wX3dpZHRofXB4O2AgK1xuICAgICAgICAgICAgYGJvcmRlci1ib3R0b20td2lkdGg6ICR7dCAqIGJvcmRlcl9ib3R0b21fd2lkdGh9cHg7YFxuICAgIH07XG59XG5mdW5jdGlvbiBzY2FsZShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljT3V0LCBzdGFydCA9IDAsIG9wYWNpdHkgPSAwIH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0YXJnZXRfb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgY29uc3Qgc2QgPSAxIC0gc3RhcnQ7XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKF90LCB1KSA9PiBgXG5cdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSBzY2FsZSgkezEgLSAoc2QgKiB1KX0pO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfVxuXHRcdGBcbiAgICB9O1xufVxuZnVuY3Rpb24gZHJhdyhub2RlLCB7IGRlbGF5ID0gMCwgc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcgPSBjdWJpY0luT3V0IH0gPSB7fSkge1xuICAgIGxldCBsZW4gPSBub2RlLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChzdHlsZS5zdHJva2VMaW5lY2FwICE9PSAnYnV0dCcpIHtcbiAgICAgICAgbGVuICs9IHBhcnNlSW50KHN0eWxlLnN0cm9rZVdpZHRoKTtcbiAgICB9XG4gICAgaWYgKGR1cmF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHNwZWVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gODAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZHVyYXRpb24gPSBsZW4gLyBzcGVlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZHVyYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbihsZW4pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAodCwgdSkgPT4gYHN0cm9rZS1kYXNoYXJyYXk6ICR7dCAqIGxlbn0gJHt1ICogbGVufWBcbiAgICB9O1xufVxuZnVuY3Rpb24gY3Jvc3NmYWRlKF9hKSB7XG4gICAgdmFyIHsgZmFsbGJhY2sgfSA9IF9hLCBkZWZhdWx0cyA9IF9fcmVzdChfYSwgW1wiZmFsbGJhY2tcIl0pO1xuICAgIGNvbnN0IHRvX3JlY2VpdmUgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgdG9fc2VuZCA9IG5ldyBNYXAoKTtcbiAgICBmdW5jdGlvbiBjcm9zc2ZhZGUoZnJvbSwgbm9kZSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IGQgPT4gTWF0aC5zcXJ0KGQpICogMzAsIGVhc2luZyA9IGN1YmljT3V0IH0gPSBhc3NpZ24oYXNzaWduKHt9LCBkZWZhdWx0cyksIHBhcmFtcyk7XG4gICAgICAgIGNvbnN0IHRvID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgZHggPSBmcm9tLmxlZnQgLSB0by5sZWZ0O1xuICAgICAgICBjb25zdCBkeSA9IGZyb20udG9wIC0gdG8udG9wO1xuICAgICAgICBjb25zdCBkdyA9IGZyb20ud2lkdGggLyB0by53aWR0aDtcbiAgICAgICAgY29uc3QgZGggPSBmcm9tLmhlaWdodCAvIHRvLmhlaWdodDtcbiAgICAgICAgY29uc3QgZCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVsYXksXG4gICAgICAgICAgICBkdXJhdGlvbjogaXNfZnVuY3Rpb24oZHVyYXRpb24pID8gZHVyYXRpb24oZCkgOiBkdXJhdGlvbixcbiAgICAgICAgICAgIGVhc2luZyxcbiAgICAgICAgICAgIGNzczogKHQsIHUpID0+IGBcblx0XHRcdFx0b3BhY2l0eTogJHt0ICogb3BhY2l0eX07XG5cdFx0XHRcdHRyYW5zZm9ybS1vcmlnaW46IHRvcCBsZWZ0O1xuXHRcdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHt1ICogZHh9cHgsJHt1ICogZHl9cHgpIHNjYWxlKCR7dCArICgxIC0gdCkgKiBkd30sICR7dCArICgxIC0gdCkgKiBkaH0pO1xuXHRcdFx0YFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uKGl0ZW1zLCBjb3VudGVycGFydHMsIGludHJvKSB7XG4gICAgICAgIHJldHVybiAobm9kZSwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICBpdGVtcy5zZXQocGFyYW1zLmtleSwge1xuICAgICAgICAgICAgICAgIHJlY3Q6IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlcnBhcnRzLmhhcyhwYXJhbXMua2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJlY3QgfSA9IGNvdW50ZXJwYXJ0cy5nZXQocGFyYW1zLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJwYXJ0cy5kZWxldGUocGFyYW1zLmtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjcm9zc2ZhZGUocmVjdCwgbm9kZSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5vZGUgaXMgZGlzYXBwZWFyaW5nIGFsdG9nZXRoZXJcbiAgICAgICAgICAgICAgICAvLyAoaS5lLiB3YXNuJ3QgY2xhaW1lZCBieSB0aGUgb3RoZXIgbGlzdClcbiAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIG5lZWQgdG8gc3VwcGx5IGFuIG91dHJvXG4gICAgICAgICAgICAgICAgaXRlbXMuZGVsZXRlKHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxsYmFjayAmJiBmYWxsYmFjayhub2RlLCBwYXJhbXMsIGludHJvKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHRyYW5zaXRpb24odG9fc2VuZCwgdG9fcmVjZWl2ZSwgZmFsc2UpLFxuICAgICAgICB0cmFuc2l0aW9uKHRvX3JlY2VpdmUsIHRvX3NlbmQsIHRydWUpXG4gICAgXTtcbn1cblxuZXhwb3J0IHsgYmx1ciwgY3Jvc3NmYWRlLCBkcmF3LCBmYWRlLCBmbHksIHNjYWxlLCBzbGlkZSB9O1xuIiwgIjxzY3JpcHQgbGFuZz1cInRzXCI+aW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyIH0gZnJvbSBcInN2ZWx0ZVwiO1xuY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcbmV4cG9ydCBsZXQgdGV4dDtcbmxldCBpbnB1dFJlZjtcbmxldCBpc0FkZGluZyA9IGZhbHNlO1xuY29uc3QgaGFuZGxlQWRkTmV3Q2xpY2sgPSAoKSA9PiB7XG4gICAgZGlzcGF0Y2goXCJhZGROZXdDbGlja2VkXCIpO1xuICAgIGlzQWRkaW5nID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaW5wdXRSZWYuZm9jdXMoKTtcbiAgICB9LCAwKTsgLy8gYXNlbmtyb24gaVx1MDE1RmxlbWxlcmRlbiBzb25yYSBcdTAwRTdhbFx1MDEzMVx1MDE1RnNcdTAxMzFuIGRpeWVcbn07XG5jb25zdCBoYW5kbGVDb25maXJtQ2xpY2sgPSAoKSA9PiB7XG4gICAgaWYgKGlucHV0UmVmLnZhbHVlKSB7XG4gICAgICAgIGRpc3BhdGNoKFwiY29uZmlybUNsaWNrZWRcIiwge1xuICAgICAgICAgICAgdGV4dDogaW5wdXRSZWYudmFsdWUsXG4gICAgICAgIH0pO1xuICAgICAgICBpc0FkZGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW5wdXRSZWYucGxhY2Vob2xkZXIgPSB0ZXh0LmlmRW1wdHlQbGFjZWhvbGRlcjtcbiAgICB9XG59O1xuY29uc3QgaGFuZGxlQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgZGlzcGF0Y2goXCJjYW5jZWxDbGlja2VkXCIpO1xuICAgIGlucHV0UmVmLnZhbHVlID0gXCJcIjtcbiAgICBpc0FkZGluZyA9IGZhbHNlO1xufTtcbmNvbnN0IGhhbmRsZUtleXByZXNzID0gKGUpID0+IHtcbiAgICBpZiAoZS53aGljaCA9PSAxMyB8fCBlLmNoYXJDb2RlID09IDEzIHx8IGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBoYW5kbGVDb25maXJtQ2xpY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn07XG48L3NjcmlwdD5cblxueyNpZiBpc0FkZGluZ31cbiAgPGlucHV0XG4gICAgYmluZDp0aGlzPXtpbnB1dFJlZn1cbiAgICB0eXBlPVwidGV4dFwiXG4gICAgY2xhc3M9XCJhZGRJbnB1dFwiXG4gICAgcGxhY2Vob2xkZXI9e3RleHQucGxhY2Vob2xkZXJ9XG4gICAgb246a2V5cHJlc3M9e2hhbmRsZUtleXByZXNzfVxuICAvPlxuXG4gIDxpbnB1dFxuICAgIHR5cGU9XCJidXR0b25cIlxuICAgIGNsYXNzPVwiYmx1ZVwiXG4gICAgdmFsdWU9e3RleHQuY29uZmlybX1cbiAgICBvbjpjbGljaz17aGFuZGxlQ29uZmlybUNsaWNrfVxuICAvPlxuICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiIHZhbHVlPXt0ZXh0LmNhbmNlbH0gb246Y2xpY2s9e2hhbmRsZUNhbmNlbENsaWNrfSAvPlxuezplbHNlfVxuICA8aW5wdXQgdHlwZT1cImJ1dHRvblwiIHZhbHVlPXt0ZXh0LmJlZ2lufSBvbjpjbGljaz17aGFuZGxlQWRkTmV3Q2xpY2t9IC8+XG57L2lmfVxuXG48c3R5bGU+XG4gIC5hZGRJbnB1dCB7XG4gICAgZmxleDogMTtcbiAgICBtaW4td2lkdGg6IDA7XG4gICAgbWFyZ2luOiAwO1xuICAgIG1hcmdpbi1yaWdodDogMTBweDtcbiAgfVxuXG4gIGlucHV0W3R5cGU9XCJidXR0b25cIl0ge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBiYWNrZ3JvdW5kOiBjcmltc29uO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XG4gICAgcGFkZGluZzogNHB4IDEwcHg7XG4gICAgbWFyZ2luOiAwcHg7XG4gIH1cblxuICBpbnB1dFt0eXBlPVwidGV4dFwiXTo6cGxhY2Vob2xkZXIge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgfVxuXG4gIGlucHV0W3R5cGU9XCJ0ZXh0XCJdOjpwbGFjZWhvbGRlciB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICB9XG5cbiAgLmJsdWUge1xuICAgIGJhY2tncm91bmQ6IHN0ZWVsYmx1ZSAhaW1wb3J0YW50O1xuICB9XG48L3N0eWxlPlxuIiwgIjxzY3JpcHQgbGFuZz1cInRzXCI+aW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyIH0gZnJvbSBcInN2ZWx0ZVwiO1xuY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcbmV4cG9ydCBsZXQgdGV4dDtcbmV4cG9ydCBsZXQgZWxlbWVudHM7XG5leHBvcnQgbGV0IGNvbXBlcmF0b3JzO1xubGV0IHNlbGVjdE1ldGFsUmVmO1xubGV0IHNlbGVjdENvbXBlcmF0b3JSZWY7XG5sZXQgc2VsZWN0UHJpY2VSZWY7XG5sZXQgaXNBZGRpbmcgPSBmYWxzZTtcbmNvbnN0IGhhbmRsZUFkZE5ld0NsaWNrID0gKCkgPT4ge1xuICAgIGRpc3BhdGNoKFwiYWRkTmV3Q2xpY2tlZFwiKTtcbiAgICBpc0FkZGluZyA9IHRydWU7XG59O1xuY29uc3QgaGFuZGxlQ29uZmlybUNsaWNrID0gKCkgPT4ge1xuICAgIHZhciBfYSwgX2I7XG4gICAgaWYgKChfYiA9IChfYSA9IHNlbGVjdE1ldGFsUmVmLnZhbHVlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBzZWxlY3RDb21wZXJhdG9yUmVmLnZhbHVlKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBwYXJzZUludChzZWxlY3RQcmljZVJlZi52YWx1ZSkpIHtcbiAgICAgICAgZGlzcGF0Y2goXCJjb25maXJtQ2xpY2tlZFwiLCB7XG4gICAgICAgICAgICBjb25kaXRpb246IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBzZWxlY3RNZXRhbFJlZi52YWx1ZSxcbiAgICAgICAgICAgICAgICBjb21wZXJhdG9yOiBzZWxlY3RDb21wZXJhdG9yUmVmLnZhbHVlLFxuICAgICAgICAgICAgICAgIHByaWNlOiBwYXJzZUludChzZWxlY3RQcmljZVJlZi52YWx1ZSksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaXNBZGRpbmcgPSBmYWxzZTtcbiAgICB9XG59O1xuY29uc3QgaGFuZGxlQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgZGlzcGF0Y2goXCJjYW5jZWxDbGlja2VkXCIpO1xuICAgIGlzQWRkaW5nID0gZmFsc2U7XG59O1xuY29uc3QgaGFuZGxlS2V5cHJlc3MgPSAoZSkgPT4ge1xuICAgIGlmIChlLndoaWNoIDwgNDggfHwgZS53aGljaCA+IDU3KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS53aGljaCA9PSAxMyB8fCBlLmNoYXJDb2RlID09IDEzIHx8IGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgICBoYW5kbGVDb25maXJtQ2xpY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn07XG48L3NjcmlwdD5cblxueyNpZiBpc0FkZGluZ31cbiAgPCEtLSBHT0xEIHwgU0lMVkVSIHwgUExBVElOIHwgSVJPTiB8IENPUFBFUiAtLT5cbiAgPHNlbGVjdCBiaW5kOnRoaXM9e3NlbGVjdE1ldGFsUmVmfT5cbiAgICB7I2VhY2ggZWxlbWVudHMgYXMgZWxlbWVudCAoZWxlbWVudCl9XG4gICAgICA8b3B0aW9uIHZhbHVlPXtlbGVtZW50fT57ZWxlbWVudH08L29wdGlvbj5cbiAgICB7L2VhY2h9XG4gIDwvc2VsZWN0PlxuICA8IS0tIExFU1MgfCBFUVVBTCB8IEdSRUFURVIgLS0+XG4gIDxzZWxlY3QgYmluZDp0aGlzPXtzZWxlY3RDb21wZXJhdG9yUmVmfT5cbiAgICB7I2VhY2ggY29tcGVyYXRvcnMgYXMgY21wIChjbXApfVxuICAgICAgPG9wdGlvbiB2YWx1ZT17Y21wfT57Y21wfTwvb3B0aW9uPlxuICAgIHsvZWFjaH1cbiAgPC9zZWxlY3Q+XG4gIDxpbnB1dFxuICAgIHR5cGU9XCJudW1iZXJcIlxuICAgIGJpbmQ6dGhpcz17c2VsZWN0UHJpY2VSZWZ9XG4gICAgdmFsdWU9ezB9XG4gICAgb246a2V5cHJlc3M9e2hhbmRsZUtleXByZXNzfVxuICAvPlxuICA8aW5wdXRcbiAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICBjbGFzcz1cImJsdWVcIlxuICAgIHZhbHVlPXt0ZXh0LmNvbmZpcm19XG4gICAgb246Y2xpY2s9e2hhbmRsZUNvbmZpcm1DbGlja31cbiAgLz5cbiAgPGlucHV0IHR5cGU9XCJidXR0b25cIiB2YWx1ZT17dGV4dC5jYW5jZWx9IG9uOmNsaWNrPXtoYW5kbGVDYW5jZWxDbGlja30gLz5cbns6ZWxzZX1cbiAgPGlucHV0IHR5cGU9XCJidXR0b25cIiB2YWx1ZT17dGV4dC5iZWdpbn0gb246Y2xpY2s9e2hhbmRsZUFkZE5ld0NsaWNrfSAvPlxuey9pZn1cblxuPHN0eWxlPlxuICBpbnB1dFt0eXBlPVwiYnV0dG9uXCJdIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgYmFja2dyb3VuZDogY3JpbXNvbjtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBmb250LXdlaWdodDogMzAwO1xuICAgIHBhZGRpbmc6IDRweCAxMHB4O1xuICAgIG1hcmdpbjogMHB4O1xuICB9XG5cbiAgaW5wdXRbdHlwZT1cIm51bWJlclwiXSB7XG4gICAgbWF4LXdpZHRoOiA4OHB4O1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgfVxuXG4gIC5ibHVlIHtcbiAgICBiYWNrZ3JvdW5kOiBzdGVlbGJsdWUgIWltcG9ydGFudDtcbiAgfVxuPC9zdHlsZT5cbiIsICI8c2NyaXB0IGxhbmc9XCJ0c1wiPi8vIFNUT1JFXG5pbXBvcnQgeyB1c2VycywgbWV0YWxsZXIsIGNvbXBlcmF0b3JzIH0gZnJvbSBcIi4uL3N0b3JlXCI7XG4vLyBUUkFOU0lUSU9OXG5pbXBvcnQgeyBzY2FsZSB9IGZyb20gXCJzdmVsdGUvdHJhbnNpdGlvblwiO1xuaW1wb3J0IHsgZXhwb091dCB9IGZyb20gXCJzdmVsdGUvZWFzaW5nXCI7XG4vLyBDT01QT05FTlRTXG5pbXBvcnQgQnV0dG9uQWRkSW5wdXQgZnJvbSBcIi4vcGFydHMvQnV0dG9uQWRkSW5wdXQuc3ZlbHRlXCI7XG5pbXBvcnQgQnV0dG9uQWRkQ29uZGl0aW9uIGZyb20gXCIuL3BhcnRzL0J1dHRvbkFkZENvbmRpdGlvbi5zdmVsdGVcIjtcbjwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxuICB7I2VhY2ggT2JqZWN0LnZhbHVlcygkdXNlcnMpIGFzIHVzZXIgKHVzZXIuaWQpfVxuICAgIDxkaXZcbiAgICAgIGNsYXNzPVwidXNlclwiXG4gICAgICB0cmFuc2l0aW9uOnNjYWxlfGxvY2FsPXt7IGR1cmF0aW9uOiAyMDAsIGVhc2luZzogZXhwb091dCB9fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZSBza3lcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRleHRcIj57dXNlci5uYW1lfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pZCBncmV5LWlkXCI+e3VzZXIuaWR9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkZWxldGVcIj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgdmFsdWU9XCJERUxcIlxuICAgICAgICAgICAgb246Y2xpY2s9eygpID0+XG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHJlbW92ZVVzZXIgeW9rIGRpeW9yIGFtYSB2YXIuIFx1MDBGNm5lbXNpelxuICAgICAgICAgICAgICB1c2Vycy5yZW1vdmVVc2VyKHVzZXIuaWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiYWxhcm1zLXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFsYXJtcy10aXRsZVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbGFybXMtdGV4dFwiPkFMQVJNUzwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFsYXJtc1wiPlxuICAgICAgICAgIHsjZWFjaCBPYmplY3QudmFsdWVzKHVzZXIuYWxhcm1zKSBhcyBhbGFybSAoYWxhcm0uaWQpfVxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFsYXJtXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0XCI+e2FsYXJtLm5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFsYXJtLWlkIGdyZXktaWRcIj57YWxhcm0uaWR9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlbGV0ZVwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIkRFTFwiXG4gICAgICAgICAgICAgICAgICAgIG9uOmNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHJlbW92ZUFsYXJtIHlvayBkaXlvciBhbWEgdmFyLiBcdTAwRjZuZW1zaXpcbiAgICAgICAgICAgICAgICAgICAgICB1c2Vycy5yZW1vdmVBbGFybSh7IHVzZXJJZDogdXNlci5pZCwgYWxhcm1JZDogYWxhcm0uaWQgfSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbmRpdGlvbnMtd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb25kaXRpb25zLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29uZGl0aW9ucy10ZXh0XCI+Q09ORElUSU9OUzwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb25kaXRpb25zXCI+XG4gICAgICAgICAgICAgICAgICB7I2VhY2ggT2JqZWN0LmtleXMoYWxhcm0uY29uZGl0aW9ucykgYXMgaWQgKGlkKX1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbmRpdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb25kaXRpb24taWQgZ3JleS1pZFwiPntpZH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29uZGl0aW9uLW5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHthbGFybS5jb25kaXRpb25zW2lkXS5lbGVtZW50fVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb25kaXRpb24tY29tcGVyYXRvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2FsYXJtLmNvbmRpdGlvbnNbaWRdLmNvbXBlcmF0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbmRpdGlvbi1wcmljZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2FsYXJtLmNvbmRpdGlvbnNbaWRdLnByaWNlfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZGVsZXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uOmNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yOiByZW1vdmVDb25kaXRpb24geW9rIGRpeW9yIGFtYSB2YXIuIFx1MDBGNm5lbXNpelxuICAgICAgICAgICAgICAgICAgICAgICAgICB1c2Vycy5yZW1vdmVDb25kaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGFybUlkOiBhbGFybS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25kaXRpb25JZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7L2VhY2h9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZC1jb25kaXRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b25BZGRDb25kaXRpb25cbiAgICAgICAgICAgICAgICAgICAgdGV4dD17e1xuICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBcIkFERCBDT05ESVRJT05cIixcbiAgICAgICAgICAgICAgICAgICAgICBjb25maXJtOiBcIlNBVkVcIixcbiAgICAgICAgICAgICAgICAgICAgICBjYW5jZWw6IFwiQ0FOQ0VMXCIsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzPXskbWV0YWxsZXIubWFwKChtZXRhbCkgPT4gbWV0YWwubmFtZSl9XG4gICAgICAgICAgICAgICAgICAgIGNvbXBlcmF0b3JzPXskY29tcGVyYXRvcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uOmNvbmZpcm1DbGlja2VkPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUuZGV0YWlsLmNvbmRpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogYWRkQ29uZGl0aW9uIHlvayBkaXlvciBhbWEgdmFyLiBcdTAwRjZuZW1zaXpcbiAgICAgICAgICAgICAgICAgICAgICB1c2Vycy5hZGRDb25kaXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxhcm1JZDogYWxhcm0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25kaXRpb246IGUuZGV0YWlsLmNvbmRpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgey9lYWNofVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFkZC1hbGFybVwiPlxuICAgICAgICAgIDxCdXR0b25BZGRJbnB1dFxuICAgICAgICAgICAgdGV4dD17e1xuICAgICAgICAgICAgICBiZWdpbjogXCJBREQgTkVXIEFMQVJNXCIsXG4gICAgICAgICAgICAgIGNvbmZpcm06IFwiU0FWRVwiLFxuICAgICAgICAgICAgICBjYW5jZWw6IFwiQ0FOQ0VMXCIsXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcIkFsYXJtIE5hbWVcIixcbiAgICAgICAgICAgICAgaWZFbXB0eVBsYWNlaG9sZGVyOiBcIkFsYXJtIE5hbWUgY2FuIG5vdCBiZSBlbXB0eSFcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbjpjb25maXJtQ2xpY2tlZD17KGUpID0+XG4gICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IGFkZEFsYXJtIHlvayBkaXlvciBhbWEgdmFyLiBcdTAwRjZuZW1zaXpcbiAgICAgICAgICAgICAgdXNlcnMuYWRkQWxhcm0oe1xuICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICBhbGFybU5hbWU6IGUuZGV0YWlsLnRleHQsXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIHsvZWFjaH1cbiAgPGRpdiBjbGFzcz1cImFkZC11c2VyXCI+XG4gICAgPEJ1dHRvbkFkZElucHV0XG4gICAgICB0ZXh0PXt7XG4gICAgICAgIGJlZ2luOiBcIkFERCBORVcgVVNFUlwiLFxuICAgICAgICBjb25maXJtOiBcIlNBVkVcIixcbiAgICAgICAgY2FuY2VsOiBcIkNBTkNFTFwiLFxuICAgICAgICBwbGFjZWhvbGRlcjogXCJVc2VyIE5hbWVcIixcbiAgICAgICAgaWZFbXB0eVBsYWNlaG9sZGVyOiBcIlVzZXIgTmFtZSBjYW4gbm90IGJlIGVtcHR5IVwiLFxuICAgICAgfX1cbiAgICAgIG9uOmNvbmZpcm1DbGlja2VkPXsoZSkgPT5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogYWRkVXNlciB5b2sgZGl5b3IgYW1hIHZhci4gXHUwMEY2bmVtc2l6XG4gICAgICAgIHVzZXJzLmFkZFVzZXIoZS5kZXRhaWwudGV4dCl9XG4gICAgLz5cbiAgPC9kaXY+XG48L2Rpdj5cblxuPHN0eWxlPlxuICAud3JhcHBlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIHBhZGRpbmc6IDEwcHggNHB4IDQwcHg7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbiBhdXRvO1xuICAgIG1heC1oZWlnaHQ6IDY1dmg7XG4gIH1cblxuICAuYWRkLXVzZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiAyMHB4IDEwcHggMDtcbiAgfVxuXG4gIGlucHV0W3R5cGU9XCJidXR0b25cIl0ge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBiYWNrZ3JvdW5kOiBjcmltc29uO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XG4gICAgcGFkZGluZzogNHB4IDEwcHg7XG4gICAgbWFyZ2luOiAwcHg7XG4gIH1cblxuICAudXNlciB7XG4gICAgcGFkZGluZzogNHB4O1xuICAgIGJhY2tncm91bmQ6IGxpbmVuO1xuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIGJvcmRlcjogMnB4IHNvbGlkIGNvcm5mbG93ZXJibHVlO1xuICB9XG5cbiAgLnRpdGxlIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgYmFja2dyb3VuZDogbGlnaHRzdGVlbGJsdWU7XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgIHBhZGRpbmc6IDRweDtcbiAgfVxuXG4gIC50ZXh0IHtcbiAgICBmbGV4OiAxO1xuICAgIHBhZGRpbmc6IDAgOHB4O1xuICB9XG5cbiAgLmdyZXktaWQge1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICBjb2xvcjogZ3JleTtcbiAgfVxuXG4gIC51c2VyLWlkLFxuICAuYWxhcm0taWQge1xuICAgIHBhZGRpbmctcmlnaHQ6IDIwcHg7XG4gIH1cblxuICAvKiBBTEFSTVMgKi9cbiAgLmFsYXJtcy13cmFwcGVyIHtcbiAgICBwYWRkaW5nOiAwIDIwcHg7XG4gIH1cblxuICAuYWRkLWFsYXJtIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgbWFyZ2luOiAyMHB4IDA7XG4gIH1cblxuICAuYWxhcm1zLXRpdGxlLFxuICAuY29uZGl0aW9ucy10aXRsZSB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgcGFkZGluZzogOHB4IDA7XG4gIH1cblxuICAuYWxhcm1zIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICAgIGdhcDogMTBweDtcbiAgfVxuXG4gIC5hbGFybSB7XG4gICAgbWluLWhlaWdodDogNjBweDtcbiAgICBiYWNrZ3JvdW5kOiBsYXZlbmRlcjtcbiAgfVxuXG4gIC5jb25kaXRpb25zLXdyYXBwZXIge1xuICAgIHBhZGRpbmc6IDAgMTBweDtcbiAgfVxuXG4gIC5hZGQtY29uZGl0aW9uIHtcbiAgICBtYXJnaW46IDEwcHggMDtcbiAgfVxuXG4gIC5jb25kaXRpb24ge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA0MHB4IHJlcGVhdCgzLCAxZnIpIDIwcHg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDhweDtcbiAgfVxuXG4gIC5jb25kaXRpb246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICB9XG5cbiAgLmNvbmRpdGlvbi1pZCxcbiAgLmNvbmRpdGlvbi1wcmljZSB7XG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcbiAgfVxuXG4gIC5jb25kaXRpb24tcHJpY2Uge1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgIHBhZGRpbmctcmlnaHQ6IDEwcHg7XG4gIH1cblxuICAuZGVsZXRlIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgcGFkZGluZzogMCAxcHggMnB4O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuXG4gIC5kZWxldGU6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IGNyaW1zb247XG4gICAgY29sb3I6IHdoaXRlO1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICB9XG5cbiAgLnNreSB7XG4gICAgYmFja2dyb3VuZDogc2t5Ymx1ZTtcbiAgfVxuPC9zdHlsZT5cbiIsICI8c2NyaXB0IGxhbmc9XCJ0c1wiPi8vIFNUT1JFXG5pbXBvcnQgeyBtZXRhbGxlciB9IGZyb20gXCIuL3N0b3JlXCI7XG4vLyBDT01QT05FTlRTXG5pbXBvcnQgQ2xpZW50cyBmcm9tIFwiLi9jb21wb25lbnRzL0NsaWVudHMuc3ZlbHRlXCI7XG48L3NjcmlwdD5cblxuPGRpdiBjbGFzcz1cIndyYXBwZXJcIj5cblx0PGRpdiBjbGFzcz1cInRpdGxlXCI+Sk9CIERJU1RSSUJVVE9SIEVOR0lORSBERU1PPC9kaXY+XG5cdDxkaXYgY2xhc3M9XCJwYXJpdGVcIj5cblx0XHQ8ZGl2IGNsYXNzPVwicGFydHMtdGl0bGVcIj5QQVJJVEU8L2Rpdj5cblx0XHQ8ZGl2IGNsYXNzPVwibWV0YWwtd3JhcHBlclwiPlxuXHRcdFx0eyNlYWNoICRtZXRhbGxlciBhcyBtZXRhbCAobWV0YWwubmFtZSl9XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJlbGVtZW50XCI+XG5cdFx0XHRcdFx0PGRpdj57bWV0YWwubmFtZX06PC9kaXY+XG5cdFx0XHRcdFx0PGRpdj57bWV0YWwucHJpY2V9PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0ey9lYWNofVxuXHRcdDwvZGl2PlxuXHQ8L2Rpdj5cblx0PGRpdiBjbGFzcz1cImNsaWVudHNcIj5cblx0XHQ8ZGl2IGNsYXNzPVwicGFydHMtdGl0bGVcIj5DTElFTlRTPC9kaXY+XG5cdFx0PENsaWVudHMgLz5cblx0PC9kaXY+XG5cdDxkaXYgY2xhc3M9XCJzZXJ2ZXJzXCI+XG5cdFx0PGRpdiBjbGFzcz1cInBhcnRzLXRpdGxlXCI+U0VSVkVSUzwvZGl2PlxuXHQ8L2Rpdj5cblx0PGRpdiBjbGFzcz1cIndvcmtlcnNcIj5cblx0XHQ8ZGl2IGNsYXNzPVwicGFydHMtdGl0bGVcIj5XT1JLRVJTPC9kaXY+XG5cdDwvZGl2PlxuPC9kaXY+XG5cbjxzdHlsZT5cblx0LndyYXBwZXIge1xuXHRcdGRpc3BsYXk6IGdyaWQ7XG5cdFx0Z3JpZC10ZW1wbGF0ZS1hcmVhczpcblx0XHRcdFwidGl0bGUgdGl0bGUgdGl0bGVcIlxuXHRcdFx0XCJwYXJpdGUgcGFyaXRlIHBhcml0ZVwiXG5cdFx0XHRcImNsaWVudHMgc2VydmVycyB3b3JrZXJzXCI7XG5cdFx0Z2FwOiAxMHB4O1xuXHRcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIG1pbm1heCgwLCAxZnIpKTtcblx0XHRwYWRkaW5nOiAwIDIwcHg7XG5cdH1cblxuXHQudGl0bGUge1xuXHRcdGdyaWQtYXJlYTogdGl0bGU7XG5cdFx0d2lkdGg6IDEwMCU7XG5cdFx0Zm9udC1zaXplOiAyMnB4O1xuXHRcdGZvbnQtd2VpZ2h0OiAzMDA7XG5cdFx0dGV4dC1hbGlnbjogY2VudGVyO1xuXHRcdGNvbG9yOiB3aGl0ZTtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiBjcmltc29uO1xuXHRcdHBhZGRpbmc6IDIwcHggMDtcblx0XHRib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiA4cHg7XG4gICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDhweDtcblx0fVxuXG5cdC5wYXJpdGUge1xuXHRcdGdyaWQtYXJlYTogcGFyaXRlO1xuXHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcblx0XHRmb250LWZhbWlseTogbW9ub3NwYWNlO1xuXHRcdGZvbnQtc2l6ZTogMTZweDtcblx0XHRwYWRkaW5nOiAxMHB4O1xuXHR9XG5cblx0Lm1ldGFsLXdyYXBwZXIge1xuXHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcblx0XHRwYWRkaW5nLWxlZnQ6IDEwcHg7XG5cdH1cblxuXHQuZWxlbWVudCB7XG5cdFx0ZGlzcGxheTogZ3JpZDtcblx0XHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciBhdXRvO1xuXHRcdGdhcDogMTBweDtcblx0XHRwYWRkaW5nOiAwIDEwcHg7XG5cdH1cblxuXHQucGFydHMtdGl0bGUge1xuXHRcdGZvbnQtc2l6ZTogMTJweDtcblx0XHRsZXR0ZXItc3BhY2luZzogMnB4O1xuXHRcdGNvbG9yOiB3aGl0ZTtcblx0XHRiYWNrZ3JvdW5kOiBjcmltc29uO1xuXHRcdGJvcmRlci1yYWRpdXM6IDJweDtcblx0XHRwYWRkaW5nOiA0cHggMTBweDtcblx0fVxuXG5cdC5jbGllbnRzIHtcblx0XHRncmlkLWFyZWE6IGNsaWVudHM7XG5cdFx0d2lkdGg6IDEwMCU7XG5cdH1cblxuXHQuc2VydmVycyB7XG5cdFx0Z3JpZC1hcmVhOiBzZXJ2ZXJzO1xuXHRcdHdpZHRoOiAxMDAlO1xuXHR9XG5cblx0LndvcmtlcnMge1xuXHRcdGdyaWQtYXJlYTogd29ya2Vycztcblx0XHR3aWR0aDogMTAwJTtcblx0fVxuPC9zdHlsZT5cbiIsICJpbXBvcnQgQXBwIGZyb20gJy4vQXBwLnN2ZWx0ZSc7XG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoe1xuXHR0YXJnZXQ6IGRvY3VtZW50LmJvZHksXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwOyJdLAog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UUFBQSxNQUFBOzs7OztBQWRKLGFBYU0sTUFBQTs7Ozs7O3FCQS9IQyxPQUFPLE9BQU8sS0FBTTs7Ozs7Ozs7O3FDQUF6QixRQUFJLEtBQUEsR0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0E2RXFDLFdBQVUsTUFBTTs7Ozs7Ozs7a0NBL0QvQyxNQUFNLFdBQVcsS0FBSzsyQ0FvQmQsTUFBTSxZQUFXLEVBQUcsUUFBUSxLQUFLLElBQUksU0FBUyxNQUFNOytDQXlCaEQsTUFBTSxnQkFBZTtJQUNuQixRQUFRLEtBQUs7SUFDYixTQUFTLE1BQU07SUFDZixhQUFhOzsrQ0FpQkQsTUFBQztBQUduQixVQUFNLGFBQVk7TUFDaEIsUUFBUSxLQUFLO01BQ2IsU0FBUyxNQUFNO01BQ2YsV0FBVyxFQUFFLE9BQU87OzswQ0FrQlosTUFFbEIsTUFBTSxTQUFRO0lBQ1osUUFBUSxLQUFLO0lBQ2IsV0FBVyxFQUFFLE9BQU87O21DQWdCVixPQUVsQixNQUFNLFFBQVEsRUFBRSxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7aUJDM0hwQixJQUFLLEdBQUMsT0FBSTs7Ozs7aUJBQ1YsSUFBSyxHQUFDLFFBQUs7Ozs7Ozs7Ozs7Z0JBREE7Ozs7Ozs7OztBQURsQixhQUdNLFFBQUEsTUFBQTtBQUZMLGFBQXdCLE1BQUE7Ozs7QUFDeEIsYUFBd0IsTUFBQTs7Ozs7O2dEQURsQixJQUFLLEdBQUMsT0FBSTtBQUFBLGlCQUFBLElBQUE7Z0RBQ1YsSUFBSyxHQUFDLFFBQUs7QUFBQSxpQkFBQSxJQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUhaLElBQVM7NEJBQVcsS0FBSyxHQUFDO2lDQUEvQixRQUFJLEtBQUEsR0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxULGFBdUJNLFFBQUEsT0FBQTtBQXRCTCxhQUFvRCxPQUFBOztBQUNwRCxhQVVNLE9BQUE7QUFUTCxhQUFxQyxNQUFBOztBQUNyQyxhQU9NLE1BQUE7Ozs7O0FBRVAsYUFHTSxPQUFBO0FBRkwsYUFBc0MsTUFBQTs7OztBQUd2QyxhQUVNLE9BQUE7O0FBQ04sYUFFTSxPQUFBOzs7OztxQkFqQkcsS0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNUbkIsSUFBTSxNQUFNLElBQUksWUFBSTtBQUFBLEVBQ25CLFFBQVEsU0FBUztBQUFBO0FBR2xCLElBQU8sZUFBUTsiLAogICJuYW1lcyI6IFtdCn0K
