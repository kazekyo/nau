"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setIdAsCacheKey = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var setIdAsCacheKey = function setIdAsCacheKey(typePolicies, options) {
  return Object.fromEntries(Object.entries(typePolicies).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        typeName = _ref2[0],
        object = _ref2[1];

    var excludes = (options === null || options === void 0 ? void 0 : options.excludes) || [];
    var newObject = excludes.includes(typeName) ? object : _objectSpread(_objectSpread({}, object), {}, {
      keyFields: function keyFields(obj) {
        if (options !== null && options !== void 0 && options.idFieldName) {
          return obj[options.idFieldName];
        } else {
          return obj.id;
        }
      }
    });
    return [typeName, newObject];
  }));
};

exports.setIdAsCacheKey = setIdAsCacheKey;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9rZXlGaWVsZHMudHMiXSwibmFtZXMiOlsic2V0SWRBc0NhY2hlS2V5IiwidHlwZVBvbGljaWVzIiwib3B0aW9ucyIsIk9iamVjdCIsImZyb21FbnRyaWVzIiwiZW50cmllcyIsIm1hcCIsInR5cGVOYW1lIiwib2JqZWN0IiwiZXhjbHVkZXMiLCJuZXdPYmplY3QiLCJpbmNsdWRlcyIsImtleUZpZWxkcyIsIm9iaiIsImlkRmllbGROYW1lIiwiaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHTyxJQUFNQSxlQUFlLEdBQUcsU0FBbEJBLGVBQWtCLENBQzdCQyxZQUQ2QixFQUU3QkMsT0FGNkI7QUFBQSxTQUk3QkMsTUFBTSxDQUFDQyxXQUFQLENBQ0VELE1BQU0sQ0FBQ0UsT0FBUCxDQUFlSixZQUFmLEVBQTZCSyxHQUE3QixDQUFpQyxnQkFBd0I7QUFBQTtBQUFBLFFBQXRCQyxRQUFzQjtBQUFBLFFBQVpDLE1BQVk7O0FBQ3ZELFFBQU1DLFFBQVEsR0FBRyxDQUFBUCxPQUFPLFNBQVAsSUFBQUEsT0FBTyxXQUFQLFlBQUFBLE9BQU8sQ0FBRU8sUUFBVCxLQUFxQixFQUF0QztBQUNBLFFBQU1DLFNBQVMsR0FBR0QsUUFBUSxDQUFDRSxRQUFULENBQWtCSixRQUFsQixJQUNkQyxNQURjLG1DQUdUQSxNQUhTO0FBSVpJLE1BQUFBLFNBQVMsRUFBRSxtQkFBQ0MsR0FBRCxFQUF3QztBQUNqRCxZQUFJWCxPQUFKLGFBQUlBLE9BQUosZUFBSUEsT0FBTyxDQUFFWSxXQUFiLEVBQTBCO0FBQ3hCLGlCQUFPRCxHQUFHLENBQUNYLE9BQU8sQ0FBQ1ksV0FBVCxDQUFWO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQU9ELEdBQUcsQ0FBQ0UsRUFBWDtBQUNEO0FBQ0Y7QUFWVyxNQUFsQjtBQVlBLFdBQU8sQ0FBQ1IsUUFBRCxFQUFXRyxTQUFYLENBQVA7QUFDRCxHQWZELENBREYsQ0FKNkI7QUFBQSxDQUF4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0b3JlT2JqZWN0IH0gZnJvbSAnQGFwb2xsby9jbGllbnQnO1xuXG5leHBvcnQgdHlwZSBUeXBlUG9saWNpZXMgPSB7IFtrZXk6IHN0cmluZ106IHsgW2tleTogc3RyaW5nXTogdW5rbm93biB9IH07XG5leHBvcnQgY29uc3Qgc2V0SWRBc0NhY2hlS2V5ID0gKFxuICB0eXBlUG9saWNpZXM6IFR5cGVQb2xpY2llcyxcbiAgb3B0aW9ucz86IHsgaWRGaWVsZE5hbWU/OiBzdHJpbmc7IGV4Y2x1ZGVzPzogc3RyaW5nW10gfSxcbik6IFR5cGVQb2xpY2llcyA9PlxuICBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXModHlwZVBvbGljaWVzKS5tYXAoKFt0eXBlTmFtZSwgb2JqZWN0XSkgPT4ge1xuICAgICAgY29uc3QgZXhjbHVkZXMgPSBvcHRpb25zPy5leGNsdWRlcyB8fCBbXTtcbiAgICAgIGNvbnN0IG5ld09iamVjdCA9IGV4Y2x1ZGVzLmluY2x1ZGVzKHR5cGVOYW1lKVxuICAgICAgICA/IG9iamVjdFxuICAgICAgICA6IHtcbiAgICAgICAgICAgIC4uLm9iamVjdCxcbiAgICAgICAgICAgIGtleUZpZWxkczogKG9iajogUmVhZG9ubHk8U3RvcmVPYmplY3Q+KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgaWYgKG9wdGlvbnM/LmlkRmllbGROYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ialtvcHRpb25zLmlkRmllbGROYW1lXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgIHJldHVybiBbdHlwZU5hbWUsIG5ld09iamVjdF07XG4gICAgfSksXG4gICk7XG4iXX0=