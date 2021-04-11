"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.idAsCacheId = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var idAsCacheId = function idAsCacheId(typePolicies, options) {
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

exports.idAsCacheId = idAsCacheId;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pZEFzQ2FjaGVJZC50cyJdLCJuYW1lcyI6WyJpZEFzQ2FjaGVJZCIsInR5cGVQb2xpY2llcyIsIm9wdGlvbnMiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsImVudHJpZXMiLCJtYXAiLCJ0eXBlTmFtZSIsIm9iamVjdCIsImV4Y2x1ZGVzIiwibmV3T2JqZWN0IiwiaW5jbHVkZXMiLCJrZXlGaWVsZHMiLCJvYmoiLCJpZEZpZWxkTmFtZSIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR08sSUFBTUEsV0FBVyxHQUFHLFNBQWRBLFdBQWMsQ0FDekJDLFlBRHlCLEVBRXpCQyxPQUZ5QjtBQUFBLFNBSXpCQyxNQUFNLENBQUNDLFdBQVAsQ0FDRUQsTUFBTSxDQUFDRSxPQUFQLENBQWVKLFlBQWYsRUFBNkJLLEdBQTdCLENBQWlDLGdCQUF3QjtBQUFBO0FBQUEsUUFBdEJDLFFBQXNCO0FBQUEsUUFBWkMsTUFBWTs7QUFDdkQsUUFBTUMsUUFBUSxHQUFHLENBQUFQLE9BQU8sU0FBUCxJQUFBQSxPQUFPLFdBQVAsWUFBQUEsT0FBTyxDQUFFTyxRQUFULEtBQXFCLEVBQXRDO0FBQ0EsUUFBTUMsU0FBUyxHQUFHRCxRQUFRLENBQUNFLFFBQVQsQ0FBa0JKLFFBQWxCLElBQ2RDLE1BRGMsbUNBR1RBLE1BSFM7QUFJWkksTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxHQUFELEVBQXdDO0FBQ2pELFlBQUlYLE9BQUosYUFBSUEsT0FBSixlQUFJQSxPQUFPLENBQUVZLFdBQWIsRUFBMEI7QUFDeEIsaUJBQU9ELEdBQUcsQ0FBQ1gsT0FBTyxDQUFDWSxXQUFULENBQVY7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBT0QsR0FBRyxDQUFDRSxFQUFYO0FBQ0Q7QUFDRjtBQVZXLE1BQWxCO0FBWUEsV0FBTyxDQUFDUixRQUFELEVBQVdHLFNBQVgsQ0FBUDtBQUNELEdBZkQsQ0FERixDQUp5QjtBQUFBLENBQXBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RvcmVPYmplY3QgfSBmcm9tICdAYXBvbGxvL2NsaWVudCc7XG5cbmV4cG9ydCB0eXBlIFR5cGVQb2xpY2llcyA9IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0gfTtcbmV4cG9ydCBjb25zdCBpZEFzQ2FjaGVJZCA9IChcbiAgdHlwZVBvbGljaWVzOiBUeXBlUG9saWNpZXMsXG4gIG9wdGlvbnM/OiB7IGlkRmllbGROYW1lPzogc3RyaW5nOyBleGNsdWRlcz86IHN0cmluZ1tdIH0sXG4pOiBUeXBlUG9saWNpZXMgPT5cbiAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHR5cGVQb2xpY2llcykubWFwKChbdHlwZU5hbWUsIG9iamVjdF0pID0+IHtcbiAgICAgIGNvbnN0IGV4Y2x1ZGVzID0gb3B0aW9ucz8uZXhjbHVkZXMgfHwgW107XG4gICAgICBjb25zdCBuZXdPYmplY3QgPSBleGNsdWRlcy5pbmNsdWRlcyh0eXBlTmFtZSlcbiAgICAgICAgPyBvYmplY3RcbiAgICAgICAgOiB7XG4gICAgICAgICAgICAuLi5vYmplY3QsXG4gICAgICAgICAgICBrZXlGaWVsZHM6IChvYmo6IFJlYWRvbmx5PFN0b3JlT2JqZWN0Pik6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAgIGlmIChvcHRpb25zPy5pZEZpZWxkTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmpbb3B0aW9ucy5pZEZpZWxkTmFtZV0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouaWQgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICByZXR1cm4gW3R5cGVOYW1lLCBuZXdPYmplY3RdO1xuICAgIH0pLFxuICApOyJdfQ==