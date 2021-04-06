"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateConnectionId = exports.mutationUpdater = exports.createMutationUpdaterLink = void 0;

var _client = require("@apollo/client");

var _language = require("graphql/language");

var _lodash = _interopRequireDefault(require("lodash.ismatch"));

var _jsBase = require("js-base64");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _wrapRegExp(re, groups) { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, undefined, groups); }; var _RegExp = _wrapNativeSuper(RegExp); var _super = RegExp.prototype; var _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = _RegExp.call(this, re, flags); _groups.set(_this, groups || _groups.get(re)); return _this; } _inherits(BabelRegExp, _RegExp); BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) result.groups = buildGroups(result, this); return result; }; BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if (typeof substitution === "string") { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { return "$" + groups[name]; })); } else if (typeof substitution === "function") { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = []; args.push.apply(args, arguments); if (_typeof(args[args.length - 1]) !== "object") { args.push(buildGroups(args, _this)); } return substitution.apply(this, args); }); } else { return _super[Symbol.replace].call(this, str, substitution); } }; function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { groups[name] = result[g[name]]; return groups; }, Object.create(null)); } return _wrapRegExp.apply(this, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var INSERT_NODE_DIRECTIVES = ['appendNode', 'prependNode'];

var transform = function transform(input) {
  // TODO : Run only for mutation
  return (0, _language.visit)(input, {
    VariableDefinition: {
      enter: function enter(node) {
        if (node.variable.name.value === 'connections') {
          return null;
        }
      }
    },
    Directive: {
      enter: function enter(node) {
        if (INSERT_NODE_DIRECTIVES.includes(node.name.value)) {
          return null;
        }
      }
    }
  });
};

var createMutationUpdaterLink = function createMutationUpdaterLink() {
  return new _client.ApolloLink(function (operation, forward) {
    operation.query = transform(operation.query); // TODO : Consider subscriptions
    // https://github.com/cult-of-coders/apollo-client-transformers/blob/master/src/index.ts

    return forward(operation).map(function (_ref) {
      var data = _ref.data,
          response = _objectWithoutProperties(_ref, ["data"]);

      return _objectSpread(_objectSpread({}, response), {}, {
        data: data
      });
    });
  });
};

exports.createMutationUpdaterLink = createMutationUpdaterLink;

var insertNode = function insertNode(_ref2) {
  var cache = _ref2.cache,
      nodeRef = _ref2.nodeRef,
      connectionId = _ref2.connectionId,
      edgeTypeName = _ref2.edgeTypeName,
      type = _ref2.type;
  var connectionInfo = JSON.parse((0, _jsBase.decode)(connectionId));
  cache.modify({
    id: connectionInfo.object && cache.identify(connectionInfo.object),
    fields: _defineProperty({}, connectionInfo.field, function (existingConnection) {
      if (existingConnection.args && connectionInfo.keyArgs && !(0, _lodash["default"])(existingConnection.args, connectionInfo.keyArgs)) {
        return _objectSpread({}, existingConnection);
      }

      var newEdge = {
        __typename: edgeTypeName,
        node: nodeRef,
        cursor: ''
      };
      var edges = type === 'appendNode' ? [].concat(_toConsumableArray(existingConnection.edges), [newEdge]) : [newEdge].concat(_toConsumableArray(existingConnection.edges));
      return _objectSpread(_objectSpread({}, existingConnection), {}, {
        edges: edges
      });
    })
  });
};

var mutationUpdater = function mutationUpdater() {
  return {
    merge: function merge(existing, incoming, _ref3) {
      var _field$directives, _field$directives$fin, _$exec, _$exec$groups, _$exec2, _$exec2$groups;

      var cache = _ref3.cache,
          field = _ref3.field,
          storeFieldName = _ref3.storeFieldName;

      var result = _objectSpread(_objectSpread({}, existing), incoming);

      var directiveName = field === null || field === void 0 ? void 0 : (_field$directives = field.directives) === null || _field$directives === void 0 ? void 0 : (_field$directives$fin = _field$directives.find(function (directive) {
        return INSERT_NODE_DIRECTIVES.includes(directive.name.value);
      })) === null || _field$directives$fin === void 0 ? void 0 : _field$directives$fin.name.value;
      if (!directiveName) return result;
      var connectionsStr = (_$exec = /*#__PURE__*/_wrapRegExp(/"connections":(\[(?:(?![\.\]])[\s\S])+\])/, {
        connections: 1
      }).exec(storeFieldName)) === null || _$exec === void 0 ? void 0 : (_$exec$groups = _$exec.groups) === null || _$exec$groups === void 0 ? void 0 : _$exec$groups.connections;
      var connections = connectionsStr && JSON.parse(connectionsStr);
      var edgeTypeName = (_$exec2 = /*#__PURE__*/_wrapRegExp(/"edgeTypeName":(?:(?!")[\s\S])*"(.+)"/, {
        edgeTypeName: 1
      }).exec(storeFieldName)) === null || _$exec2 === void 0 ? void 0 : (_$exec2$groups = _$exec2.groups) === null || _$exec2$groups === void 0 ? void 0 : _$exec2$groups.edgeTypeName;
      if (!connections || !edgeTypeName) return result;
      connections.forEach(function (connectionId) {
        return insertNode({
          cache: cache,
          nodeRef: incoming,
          connectionId: connectionId,
          edgeTypeName: edgeTypeName,
          type: directiveName
        });
      });
      return result;
    }
  };
};

exports.mutationUpdater = mutationUpdater;

var generateConnectionId = function generateConnectionId(connectionInfo) {
  return (0, _jsBase.encode)(JSON.stringify(connectionInfo));
};

exports.generateConnectionId = generateConnectionId;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tdXRhdGlvblVwZGF0ZXIudHMiXSwibmFtZXMiOlsiSU5TRVJUX05PREVfRElSRUNUSVZFUyIsInRyYW5zZm9ybSIsImlucHV0IiwiVmFyaWFibGVEZWZpbml0aW9uIiwiZW50ZXIiLCJub2RlIiwidmFyaWFibGUiLCJuYW1lIiwidmFsdWUiLCJEaXJlY3RpdmUiLCJpbmNsdWRlcyIsImNyZWF0ZU11dGF0aW9uVXBkYXRlckxpbmsiLCJBcG9sbG9MaW5rIiwib3BlcmF0aW9uIiwiZm9yd2FyZCIsInF1ZXJ5IiwibWFwIiwiZGF0YSIsInJlc3BvbnNlIiwiaW5zZXJ0Tm9kZSIsImNhY2hlIiwibm9kZVJlZiIsImNvbm5lY3Rpb25JZCIsImVkZ2VUeXBlTmFtZSIsInR5cGUiLCJjb25uZWN0aW9uSW5mbyIsIkpTT04iLCJwYXJzZSIsIm1vZGlmeSIsImlkIiwib2JqZWN0IiwiaWRlbnRpZnkiLCJmaWVsZHMiLCJmaWVsZCIsImV4aXN0aW5nQ29ubmVjdGlvbiIsImFyZ3MiLCJrZXlBcmdzIiwibmV3RWRnZSIsIl9fdHlwZW5hbWUiLCJjdXJzb3IiLCJlZGdlcyIsIm11dGF0aW9uVXBkYXRlciIsIm1lcmdlIiwiZXhpc3RpbmciLCJpbmNvbWluZyIsInN0b3JlRmllbGROYW1lIiwicmVzdWx0IiwiZGlyZWN0aXZlTmFtZSIsImRpcmVjdGl2ZXMiLCJmaW5kIiwiZGlyZWN0aXZlIiwiY29ubmVjdGlvbnNTdHIiLCJleGVjIiwiZ3JvdXBzIiwiY29ubmVjdGlvbnMiLCJmb3JFYWNoIiwiZ2VuZXJhdGVDb25uZWN0aW9uSWQiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUlBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsSUFBTUEsc0JBQXNCLEdBQUcsQ0FBQyxZQUFELEVBQWUsYUFBZixDQUEvQjs7QUFFQSxJQUFNQyxTQUFTLEdBQUcsU0FBWkEsU0FB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LFlBQVksRUFBWkEsWUFBMUM7QUFBd0RDLFVBQUFBLElBQUksRUFBRXVCO0FBQTlELFNBQUQsQ0FEUTtBQUFBLE9BQXBCO0FBSUEsYUFBT0QsTUFBUDtBQUNEO0FBakJJLEdBQVA7QUFtQkQsQ0FwQk07Ozs7QUFzQkEsSUFBTVUsb0JBQW9CLEdBQUcsU0FBdkJBLG9CQUF1QixDQUFDL0IsY0FBRDtBQUFBLFNBQTRDLG9CQUFPQyxJQUFJLENBQUMrQixTQUFMLENBQWVoQyxjQUFmLENBQVAsQ0FBNUM7QUFBQSxDQUE3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtbWVtYmVyLWFjY2VzcyAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuICovXG5pbXBvcnQgeyBBcG9sbG9DYWNoZSwgQXBvbGxvTGluaywgUmVmZXJlbmNlLCBTdG9yZU9iamVjdCwgVHlwZVBvbGljeSB9IGZyb20gJ0BhcG9sbG8vY2xpZW50JztcbmltcG9ydCB7IERvY3VtZW50Tm9kZSwgdmlzaXQgfSBmcm9tICdncmFwaHFsL2xhbmd1YWdlJztcbmltcG9ydCBpc01hdGNoIGZyb20gJ2xvZGFzaC5pc21hdGNoJztcbmltcG9ydCB7IGVuY29kZSwgZGVjb2RlIH0gZnJvbSAnanMtYmFzZTY0JztcblxudHlwZSBDb25uZWN0aW9uSW5mbyA9IHtcbiAgb2JqZWN0OiB7IGlkOiBzdHJpbmc7IF9fdHlwZW5hbWU6IHN0cmluZyB9O1xuICBmaWVsZDogc3RyaW5nO1xuICBrZXlBcmdzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59O1xuXG5jb25zdCBJTlNFUlRfTk9ERV9ESVJFQ1RJVkVTID0gWydhcHBlbmROb2RlJywgJ3ByZXBlbmROb2RlJ107XG5cbmNvbnN0IHRyYW5zZm9ybSA9IChpbnB1dDogRG9jdW1lbnROb2RlKSA9PiB7XG4gIC8vIFRPRE8gOiBSdW4gb25seSBmb3IgbXV0YXRpb25cbiAgcmV0dXJuIHZpc2l0KGlucHV0LCB7XG4gICAgVmFyaWFibGVEZWZpbml0aW9uOiB7XG4gICAgICBlbnRlcihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnZhcmlhYmxlLm5hbWUudmFsdWUgPT09ICdjb25uZWN0aW9ucycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIERpcmVjdGl2ZToge1xuICAgICAgZW50ZXIobm9kZSkge1xuICAgICAgICBpZiAoSU5TRVJUX05PREVfRElSRUNUSVZFUy5pbmNsdWRlcyhub2RlLm5hbWUudmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRlTXV0YXRpb25VcGRhdGVyTGluayA9ICgpOiBBcG9sbG9MaW5rID0+IHtcbiAgcmV0dXJuIG5ldyBBcG9sbG9MaW5rKChvcGVyYXRpb24sIGZvcndhcmQpID0+IHtcbiAgICBvcGVyYXRpb24ucXVlcnkgPSB0cmFuc2Zvcm0ob3BlcmF0aW9uLnF1ZXJ5KTtcbiAgICAvLyBUT0RPIDogQ29uc2lkZXIgc3Vic2NyaXB0aW9uc1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWx0LW9mLWNvZGVycy9hcG9sbG8tY2xpZW50LXRyYW5zZm9ybWVycy9ibG9iL21hc3Rlci9zcmMvaW5kZXgudHNcbiAgICByZXR1cm4gZm9yd2FyZChvcGVyYXRpb24pLm1hcCgoeyBkYXRhLCAuLi5yZXNwb25zZSB9KSA9PiB7XG4gICAgICByZXR1cm4geyAuLi5yZXNwb25zZSwgZGF0YSB9O1xuICAgIH0pO1xuICB9KTtcbn07XG5cbmNvbnN0IGluc2VydE5vZGUgPSA8VD4oe1xuICBjYWNoZSxcbiAgbm9kZVJlZixcbiAgY29ubmVjdGlvbklkLFxuICBlZGdlVHlwZU5hbWUsXG4gIHR5cGUsXG59OiB7XG4gIGNhY2hlOiBBcG9sbG9DYWNoZTxUPjtcbiAgbm9kZVJlZjogUmVmZXJlbmNlO1xuICBjb25uZWN0aW9uSWQ6IHN0cmluZztcbiAgZWRnZVR5cGVOYW1lOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcbn0pID0+IHtcbiAgY29uc3QgY29ubmVjdGlvbkluZm8gPSBKU09OLnBhcnNlKGRlY29kZShjb25uZWN0aW9uSWQpKSBhcyBDb25uZWN0aW9uSW5mbztcbiAgY2FjaGUubW9kaWZ5KHtcbiAgICBpZDogY29ubmVjdGlvbkluZm8ub2JqZWN0ICYmIGNhY2hlLmlkZW50aWZ5KGNvbm5lY3Rpb25JbmZvLm9iamVjdCksXG4gICAgZmllbGRzOiB7XG4gICAgICBbY29ubmVjdGlvbkluZm8uZmllbGRdOiAoXG4gICAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbjogU3RvcmVPYmplY3QgJiB7XG4gICAgICAgICAgZWRnZXM6IFN0b3JlT2JqZWN0W107XG4gICAgICAgICAgYXJncz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICB9LFxuICAgICAgKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBleGlzdGluZ0Nvbm5lY3Rpb24uYXJncyAmJlxuICAgICAgICAgIGNvbm5lY3Rpb25JbmZvLmtleUFyZ3MgJiZcbiAgICAgICAgICAhaXNNYXRjaChleGlzdGluZ0Nvbm5lY3Rpb24uYXJncywgY29ubmVjdGlvbkluZm8ua2V5QXJncylcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgLi4uZXhpc3RpbmdDb25uZWN0aW9uIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3RWRnZSA9IHsgX190eXBlbmFtZTogZWRnZVR5cGVOYW1lLCBub2RlOiBub2RlUmVmLCBjdXJzb3I6ICcnIH07XG4gICAgICAgIGNvbnN0IGVkZ2VzID1cbiAgICAgICAgICB0eXBlID09PSAnYXBwZW5kTm9kZScgPyBbLi4uZXhpc3RpbmdDb25uZWN0aW9uLmVkZ2VzLCBuZXdFZGdlXSA6IFtuZXdFZGdlLCAuLi5leGlzdGluZ0Nvbm5lY3Rpb24uZWRnZXNdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmV4aXN0aW5nQ29ubmVjdGlvbixcbiAgICAgICAgICBlZGdlcyxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbXV0YXRpb25VcGRhdGVyID0gKCk6IFR5cGVQb2xpY3kgPT4ge1xuICByZXR1cm4ge1xuICAgIG1lcmdlKGV4aXN0aW5nOiBSZWZlcmVuY2UsIGluY29taW5nOiBSZWZlcmVuY2UsIHsgY2FjaGUsIGZpZWxkLCBzdG9yZUZpZWxkTmFtZSB9KSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7IC4uLmV4aXN0aW5nLCAuLi5pbmNvbWluZyB9O1xuICAgICAgY29uc3QgZGlyZWN0aXZlTmFtZSA9IGZpZWxkPy5kaXJlY3RpdmVzPy5maW5kKChkaXJlY3RpdmUpID0+XG4gICAgICAgIElOU0VSVF9OT0RFX0RJUkVDVElWRVMuaW5jbHVkZXMoZGlyZWN0aXZlLm5hbWUudmFsdWUpLFxuICAgICAgKT8ubmFtZS52YWx1ZTtcbiAgICAgIGlmICghZGlyZWN0aXZlTmFtZSkgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgY29uc3QgY29ubmVjdGlvbnNTdHIgPSAvXCJjb25uZWN0aW9uc1wiOig/PGNvbm5lY3Rpb25zPlxcW1teXFxdLl0rXFxdKS8uZXhlYyhzdG9yZUZpZWxkTmFtZSk/Lmdyb3Vwcz8uY29ubmVjdGlvbnM7XG4gICAgICBjb25zdCBjb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zU3RyICYmIChKU09OLnBhcnNlKGNvbm5lY3Rpb25zU3RyKSBhcyBzdHJpbmdbXSk7XG4gICAgICBjb25zdCBlZGdlVHlwZU5hbWUgPSAvXCJlZGdlVHlwZU5hbWVcIjpbXlwiXSpcIig/PGVkZ2VUeXBlTmFtZT4uKylcIi8uZXhlYyhzdG9yZUZpZWxkTmFtZSk/Lmdyb3Vwcz8uZWRnZVR5cGVOYW1lO1xuICAgICAgaWYgKCFjb25uZWN0aW9ucyB8fCAhZWRnZVR5cGVOYW1lKSByZXR1cm4gcmVzdWx0O1xuICAgICAgY29ubmVjdGlvbnMuZm9yRWFjaCgoY29ubmVjdGlvbklkKSA9PlxuICAgICAgICBpbnNlcnROb2RlKHsgY2FjaGUsIG5vZGVSZWY6IGluY29taW5nLCBjb25uZWN0aW9uSWQsIGVkZ2VUeXBlTmFtZSwgdHlwZTogZGlyZWN0aXZlTmFtZSB9KSxcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZUNvbm5lY3Rpb25JZCA9IChjb25uZWN0aW9uSW5mbzogQ29ubmVjdGlvbkluZm8pOiBzdHJpbmcgPT4gZW5jb2RlKEpTT04uc3RyaW5naWZ5KGNvbm5lY3Rpb25JbmZvKSk7XG4iXX0=