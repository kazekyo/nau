"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteNode = exports.appendNode = exports.prependNode = void 0;

var _isMatch = _interopRequireDefault(require("lodash/isMatch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var insertNode = function insertNode(_ref) {
  var node = _ref.node,
      fragment = _ref.fragment,
      connectionInfo = _ref.connectionInfo,
      cache = _ref.cache,
      edgeTypename = _ref.edgeTypename,
      type = _ref.type;
  cache.modify({
    id: connectionInfo.object && cache.identify(connectionInfo.object),
    fields: _defineProperty({}, connectionInfo.field, function (existingConnection) {
      if (existingConnection.args && connectionInfo.keyArgs && !(0, _isMatch["default"])(existingConnection.args, connectionInfo.keyArgs)) {
        return _objectSpread({}, existingConnection);
      }

      var newNodeRef = cache.writeFragment({
        id: cache.identify(node),
        data: node,
        fragment: fragment
      });
      var newEdge = {
        __typename: edgeTypename,
        node: newNodeRef,
        cursor: ''
      };
      var edges = type === 'append' ? [].concat(_toConsumableArray(existingConnection.edges), [newEdge]) : [newEdge].concat(_toConsumableArray(existingConnection.edges));
      return _objectSpread(_objectSpread({}, existingConnection), {}, {
        edges: edges
      });
    })
  });
};

var prependNode = function prependNode(args) {
  return insertNode(_objectSpread(_objectSpread({}, args), {}, {
    type: 'prepend'
  }));
};

exports.prependNode = prependNode;

var appendNode = function appendNode(args) {
  return insertNode(_objectSpread(_objectSpread({}, args), {}, {
    type: 'append'
  }));
};

exports.appendNode = appendNode;

var deleteNode = function deleteNode(_ref2) {
  var node = _ref2.node,
      connectionInfo = _ref2.connectionInfo,
      cache = _ref2.cache;
  cache.modify({
    id: connectionInfo.object && cache.identify(connectionInfo.object),
    fields: _defineProperty({}, connectionInfo.field, function (existingConnection) {
      var cacheId = cache.identify(node);
      var edges = existingConnection.edges.filter(function (edge) {
        return cache.identify(edge.node) !== cacheId;
      });
      return _objectSpread(_objectSpread({}, existingConnection), {}, {
        edges: edges
      });
    })
  });
};

exports.deleteNode = deleteNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25uZWN0aW9uVXBkYXRlci50cyJdLCJuYW1lcyI6WyJpbnNlcnROb2RlIiwibm9kZSIsImZyYWdtZW50IiwiY29ubmVjdGlvbkluZm8iLCJjYWNoZSIsImVkZ2VUeXBlbmFtZSIsInR5cGUiLCJtb2RpZnkiLCJpZCIsIm9iamVjdCIsImlkZW50aWZ5IiwiZmllbGRzIiwiZmllbGQiLCJleGlzdGluZ0Nvbm5lY3Rpb24iLCJhcmdzIiwia2V5QXJncyIsIm5ld05vZGVSZWYiLCJ3cml0ZUZyYWdtZW50IiwiZGF0YSIsIm5ld0VkZ2UiLCJfX3R5cGVuYW1lIiwiY3Vyc29yIiwiZWRnZXMiLCJwcmVwZW5kTm9kZSIsImFwcGVuZE5vZGUiLCJkZWxldGVOb2RlIiwiY2FjaGVJZCIsImZpbHRlciIsImVkZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQSxJQUFNQSxVQUFVLEdBQUcsU0FBYkEsVUFBYSxPQUErRjtBQUFBLE1BQXpGQyxJQUF5RixRQUF6RkEsSUFBeUY7QUFBQSxNQUFuRkMsUUFBbUYsUUFBbkZBLFFBQW1GO0FBQUEsTUFBekVDLGNBQXlFLFFBQXpFQSxjQUF5RTtBQUFBLE1BQXpEQyxLQUF5RCxRQUF6REEsS0FBeUQ7QUFBQSxNQUFsREMsWUFBa0QsUUFBbERBLFlBQWtEO0FBQUEsTUFBcENDLElBQW9DLFFBQXBDQSxJQUFvQztBQUNoSEYsRUFBQUEsS0FBSyxDQUFDRyxNQUFOLENBQWE7QUFDWEMsSUFBQUEsRUFBRSxFQUFFTCxjQUFjLENBQUNNLE1BQWYsSUFBeUJMLEtBQUssQ0FBQ00sUUFBTixDQUFlUCxjQUFjLENBQUNNLE1BQTlCLENBRGxCO0FBRVhFLElBQUFBLE1BQU0sc0JBQ0hSLGNBQWMsQ0FBQ1MsS0FEWixFQUNvQixVQUN0QkMsa0JBRHNCLEVBS25CO0FBQ0gsVUFDRUEsa0JBQWtCLENBQUNDLElBQW5CLElBQ0FYLGNBQWMsQ0FBQ1ksT0FEZixJQUVBLENBQUMseUJBQVFGLGtCQUFrQixDQUFDQyxJQUEzQixFQUFpQ1gsY0FBYyxDQUFDWSxPQUFoRCxDQUhILEVBSUU7QUFDQSxpQ0FBWUYsa0JBQVo7QUFDRDs7QUFDRCxVQUFNRyxVQUFVLEdBQUdaLEtBQUssQ0FBQ2EsYUFBTixDQUFvQjtBQUNyQ1QsUUFBQUEsRUFBRSxFQUFFSixLQUFLLENBQUNNLFFBQU4sQ0FBZVQsSUFBZixDQURpQztBQUVyQ2lCLFFBQUFBLElBQUksRUFBRWpCLElBRitCO0FBR3JDQyxRQUFBQSxRQUFRLEVBQUVBO0FBSDJCLE9BQXBCLENBQW5CO0FBS0EsVUFBTWlCLE9BQU8sR0FBRztBQUFFQyxRQUFBQSxVQUFVLEVBQUVmLFlBQWQ7QUFBNEJKLFFBQUFBLElBQUksRUFBRWUsVUFBbEM7QUFBOENLLFFBQUFBLE1BQU0sRUFBRTtBQUF0RCxPQUFoQjtBQUNBLFVBQU1DLEtBQUssR0FDVGhCLElBQUksS0FBSyxRQUFULGdDQUF3Qk8sa0JBQWtCLENBQUNTLEtBQTNDLElBQWtESCxPQUFsRCxNQUE4REEsT0FBOUQsNEJBQTBFTixrQkFBa0IsQ0FBQ1MsS0FBN0YsRUFERjtBQUVBLDZDQUNLVCxrQkFETDtBQUVFUyxRQUFBQSxLQUFLLEVBQUxBO0FBRkY7QUFJRCxLQTFCRztBQUZLLEdBQWI7QUErQkQsQ0FoQ0Q7O0FBa0NPLElBQU1DLFdBQVcsR0FBRyxTQUFkQSxXQUFjLENBQUlULElBQUo7QUFBQSxTQUF1Q2QsVUFBVSxpQ0FBTWMsSUFBTjtBQUFZUixJQUFBQSxJQUFJLEVBQUU7QUFBbEIsS0FBakQ7QUFBQSxDQUFwQjs7OztBQUVBLElBQU1rQixVQUFVLEdBQUcsU0FBYkEsVUFBYSxDQUFJVixJQUFKO0FBQUEsU0FBc0NkLFVBQVUsaUNBQU1jLElBQU47QUFBWVIsSUFBQUEsSUFBSSxFQUFFO0FBQWxCLEtBQWhEO0FBQUEsQ0FBbkI7Ozs7QUFFQSxJQUFNbUIsVUFBVSxHQUFHLFNBQWJBLFVBQWEsUUFBaUU7QUFBQSxNQUEzRHhCLElBQTJELFNBQTNEQSxJQUEyRDtBQUFBLE1BQXJERSxjQUFxRCxTQUFyREEsY0FBcUQ7QUFBQSxNQUFyQ0MsS0FBcUMsU0FBckNBLEtBQXFDO0FBQ3pGQSxFQUFBQSxLQUFLLENBQUNHLE1BQU4sQ0FBYTtBQUNYQyxJQUFBQSxFQUFFLEVBQUVMLGNBQWMsQ0FBQ00sTUFBZixJQUF5QkwsS0FBSyxDQUFDTSxRQUFOLENBQWVQLGNBQWMsQ0FBQ00sTUFBOUIsQ0FEbEI7QUFFWEUsSUFBQUEsTUFBTSxzQkFDSFIsY0FBYyxDQUFDUyxLQURaLEVBQ29CLFVBQ3RCQyxrQkFEc0IsRUFLbkI7QUFDSCxVQUFNYSxPQUFPLEdBQUd0QixLQUFLLENBQUNNLFFBQU4sQ0FBZVQsSUFBZixDQUFoQjtBQUNBLFVBQU1xQixLQUFLLEdBQUdULGtCQUFrQixDQUFDUyxLQUFuQixDQUF5QkssTUFBekIsQ0FBZ0MsVUFBQ0MsSUFBRDtBQUFBLGVBQVV4QixLQUFLLENBQUNNLFFBQU4sQ0FBZWtCLElBQUksQ0FBQzNCLElBQXBCLE1BQThCeUIsT0FBeEM7QUFBQSxPQUFoQyxDQUFkO0FBQ0EsNkNBQ0tiLGtCQURMO0FBRUVTLFFBQUFBLEtBQUssRUFBTEE7QUFGRjtBQUlELEtBYkc7QUFGSyxHQUFiO0FBa0JELENBbkJNIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXRlbXBsYXRlLWV4cHJlc3Npb25zICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybiAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLW1lbWJlci1hY2Nlc3MgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXNzaWdubWVudCAqL1xuaW1wb3J0IHsgQXBvbGxvQ2FjaGUsIERvY3VtZW50Tm9kZSwgUmVmZXJlbmNlLCBTdG9yZU9iamVjdCB9IGZyb20gJ0BhcG9sbG8vY2xpZW50JztcbmltcG9ydCBpc01hdGNoIGZyb20gJ2xvZGFzaC9pc01hdGNoJztcblxudHlwZSBDb25uZWN0aW9uSW5mbyA9IHtcbiAgb2JqZWN0PzogUmVmZXJlbmNlIHwgU3RvcmVPYmplY3Q7XG4gIGZpZWxkOiBzdHJpbmc7XG4gIGtleUFyZ3M/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn07XG5cbnR5cGUgSW5zZXJ0Tm9kZUFyZ3M8VERhdGE+ID0ge1xuICBub2RlOiBSZWZlcmVuY2UgfCBTdG9yZU9iamVjdDtcbiAgZnJhZ21lbnQ6IERvY3VtZW50Tm9kZTtcbiAgZWRnZVR5cGVuYW1lPzogc3RyaW5nO1xuICBjb25uZWN0aW9uSW5mbzogQ29ubmVjdGlvbkluZm87XG4gIGNhY2hlOiBBcG9sbG9DYWNoZTxURGF0YT47XG4gIHR5cGU/OiAncHJlcGVuZCcgfCAnYXBwZW5kJztcbn07XG5cbmV4cG9ydCB0eXBlIERlbGV0ZU5vZGVBcmdzPFREYXRhPiA9IHtcbiAgbm9kZTogUmVmZXJlbmNlIHwgU3RvcmVPYmplY3Q7XG4gIGNvbm5lY3Rpb25JbmZvOiBDb25uZWN0aW9uSW5mbztcbiAgY2FjaGU6IEFwb2xsb0NhY2hlPFREYXRhPjtcbn07XG5cbmV4cG9ydCB0eXBlIFByZXBlbmROb2RlQXJnczxURGF0YT4gPSBPbWl0PEluc2VydE5vZGVBcmdzPFREYXRhPiwgJ3R5cGUnPjtcblxuZXhwb3J0IHR5cGUgQXBwZW5kTm9kZUFyZ3M8VERhdGE+ID0gT21pdDxJbnNlcnROb2RlQXJnczxURGF0YT4sICd0eXBlJz47XG5cbmNvbnN0IGluc2VydE5vZGUgPSA8VD4oeyBub2RlLCBmcmFnbWVudCwgY29ubmVjdGlvbkluZm8sIGNhY2hlLCBlZGdlVHlwZW5hbWUsIHR5cGUgfTogSW5zZXJ0Tm9kZUFyZ3M8VD4pOiB2b2lkID0+IHtcbiAgY2FjaGUubW9kaWZ5KHtcbiAgICBpZDogY29ubmVjdGlvbkluZm8ub2JqZWN0ICYmIGNhY2hlLmlkZW50aWZ5KGNvbm5lY3Rpb25JbmZvLm9iamVjdCksXG4gICAgZmllbGRzOiB7XG4gICAgICBbY29ubmVjdGlvbkluZm8uZmllbGRdOiAoXG4gICAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbjogU3RvcmVPYmplY3QgJiB7XG4gICAgICAgICAgZWRnZXM6IFN0b3JlT2JqZWN0W107XG4gICAgICAgICAgYXJncz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICB9LFxuICAgICAgKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBleGlzdGluZ0Nvbm5lY3Rpb24uYXJncyAmJlxuICAgICAgICAgIGNvbm5lY3Rpb25JbmZvLmtleUFyZ3MgJiZcbiAgICAgICAgICAhaXNNYXRjaChleGlzdGluZ0Nvbm5lY3Rpb24uYXJncywgY29ubmVjdGlvbkluZm8ua2V5QXJncylcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHsgLi4uZXhpc3RpbmdDb25uZWN0aW9uIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3Tm9kZVJlZiA9IGNhY2hlLndyaXRlRnJhZ21lbnQoe1xuICAgICAgICAgIGlkOiBjYWNoZS5pZGVudGlmeShub2RlKSxcbiAgICAgICAgICBkYXRhOiBub2RlLFxuICAgICAgICAgIGZyYWdtZW50OiBmcmFnbWVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB7IF9fdHlwZW5hbWU6IGVkZ2VUeXBlbmFtZSwgbm9kZTogbmV3Tm9kZVJlZiwgY3Vyc29yOiAnJyB9O1xuICAgICAgICBjb25zdCBlZGdlcyA9XG4gICAgICAgICAgdHlwZSA9PT0gJ2FwcGVuZCcgPyBbLi4uZXhpc3RpbmdDb25uZWN0aW9uLmVkZ2VzLCBuZXdFZGdlXSA6IFtuZXdFZGdlLCAuLi5leGlzdGluZ0Nvbm5lY3Rpb24uZWRnZXNdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmV4aXN0aW5nQ29ubmVjdGlvbixcbiAgICAgICAgICBlZGdlcyxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgcHJlcGVuZE5vZGUgPSA8VD4oYXJnczogUHJlcGVuZE5vZGVBcmdzPFQ+KTogdm9pZCA9PiBpbnNlcnROb2RlKHsgLi4uYXJncywgdHlwZTogJ3ByZXBlbmQnIH0pO1xuXG5leHBvcnQgY29uc3QgYXBwZW5kTm9kZSA9IDxUPihhcmdzOiBBcHBlbmROb2RlQXJnczxUPik6IHZvaWQgPT4gaW5zZXJ0Tm9kZSh7IC4uLmFyZ3MsIHR5cGU6ICdhcHBlbmQnIH0pO1xuXG5leHBvcnQgY29uc3QgZGVsZXRlTm9kZSA9IDxUPih7IG5vZGUsIGNvbm5lY3Rpb25JbmZvLCBjYWNoZSB9OiBEZWxldGVOb2RlQXJnczxUPik6IHZvaWQgPT4ge1xuICBjYWNoZS5tb2RpZnkoe1xuICAgIGlkOiBjb25uZWN0aW9uSW5mby5vYmplY3QgJiYgY2FjaGUuaWRlbnRpZnkoY29ubmVjdGlvbkluZm8ub2JqZWN0KSxcbiAgICBmaWVsZHM6IHtcbiAgICAgIFtjb25uZWN0aW9uSW5mby5maWVsZF06IChcbiAgICAgICAgZXhpc3RpbmdDb25uZWN0aW9uOiBTdG9yZU9iamVjdCAmIHtcbiAgICAgICAgICBlZGdlczogQXJyYXk8U3RvcmVPYmplY3QgJiB7IG5vZGU6IFJlZmVyZW5jZSB9PjtcbiAgICAgICAgICBhcmdzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIH0sXG4gICAgICApID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVJZCA9IGNhY2hlLmlkZW50aWZ5KG5vZGUpO1xuICAgICAgICBjb25zdCBlZGdlcyA9IGV4aXN0aW5nQ29ubmVjdGlvbi5lZGdlcy5maWx0ZXIoKGVkZ2UpID0+IGNhY2hlLmlkZW50aWZ5KGVkZ2Uubm9kZSkgIT09IGNhY2hlSWQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmV4aXN0aW5nQ29ubmVjdGlvbixcbiAgICAgICAgICBlZGdlcyxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59O1xuIl19