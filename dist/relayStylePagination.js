"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relayStylePagination = relayStylePagination;

var _utilities = require("@apollo/client/utilities");

var _tslib = require("tslib");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// This function is a bit different from the one provided by Apollo.
// 1. it removes duplicate edges.
//  As a result of the misaligned cursor,
//  if a client gets data from a server with duplicate nodes,
//  it will remove duplicate edges from a list.
// 2. it sets a args to a connection.
//  The args is needed to identify the connection to be updated.
function relayStylePagination() {
  var keyArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return {
    keyArgs: keyArgs,
    read: function read(existing, _ref) {
      var canRead = _ref.canRead,
          readField = _ref.readField;
      if (!existing) return;
      var edges = []; // We prioritize cursors that are in the existing.pageInfo.

      var startCursor = existing.pageInfo.startCursor;
      var endCursor = existing.pageInfo.endCursor;
      existing.edges.forEach(function (edge) {
        // Edges themselves could be Reference objects, so it's important
        // to use readField to access the edge.edge.node property.
        if (canRead(readField('node', edge))) {
          edges.push(edge);

          if (edge.cursor) {
            startCursor = startCursor || edge.cursor;
            endCursor = endCursor || edge.cursor;
          }
        }
      });
      return _objectSpread(_objectSpread({}, getExtras(existing)), {}, {
        edges: edges,
        pageInfo: _objectSpread(_objectSpread({}, existing.pageInfo), {}, {
          startCursor: startCursor,
          endCursor: endCursor
        })
      });
    },
    merge: function merge() {
      var existing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : makeEmptyData();
      var incoming = arguments.length > 1 ? arguments[1] : undefined;

      var _ref2 = arguments.length > 2 ? arguments[2] : undefined,
          args = _ref2.args,
          isReference = _ref2.isReference,
          readField = _ref2.readField;

      var incomingEdges = incoming.edges ? incoming.edges.map(function (edge) {
        if (isReference(edge = _objectSpread({}, edge))) {
          // In case edge is a Reference, we read out its cursor field and
          // store it as an extra property of the Reference object.
          edge.cursor = readField('cursor', edge);
        }

        return edge;
      }) : [];

      if (incoming.pageInfo) {
        var _incoming = incoming,
            _pageInfo = _incoming.pageInfo;
        var startCursor = _pageInfo.startCursor,
            endCursor = _pageInfo.endCursor;
        var firstEdge = incomingEdges[0];
        var lastEdge = incomingEdges[incomingEdges.length - 1]; // In case we did not request the cursor field for edges in this
        // query, we can still infer cursors from pageInfo.

        if (firstEdge && startCursor) {
          firstEdge.cursor = startCursor;
        }

        if (lastEdge && endCursor) {
          lastEdge.cursor = endCursor;
        } // Cursors can also come from edges, so we default
        // pageInfo.{start,end}Cursor to {first,last}Edge.cursor.


        var firstCursor = firstEdge && firstEdge.cursor;

        if (firstCursor && !startCursor) {
          incoming = (0, _utilities.mergeDeep)(incoming, {
            pageInfo: {
              startCursor: firstCursor
            }
          });
        }

        var lastCursor = lastEdge && lastEdge.cursor;

        if (lastCursor && !endCursor) {
          incoming = (0, _utilities.mergeDeep)(incoming, {
            pageInfo: {
              endCursor: lastCursor
            }
          });
        }
      }

      var prefix = existing.edges;
      var suffix = [];

      if (args && args.after) {
        // This comparison does not need to use readField("cursor", edge),
        // because we stored the cursor field of any Reference edges as an
        // extra property of the Reference object.
        var index = prefix.findIndex(function (edge) {
          return edge.cursor === args.after;
        });

        if (index >= 0) {
          prefix = prefix.slice(0, index + 1); // suffix = []; // already true
        }
      } else if (args && args.before) {
        var _index = prefix.findIndex(function (edge) {
          return edge.cursor === args.before;
        });

        suffix = _index < 0 ? prefix : prefix.slice(_index);
        prefix = [];
      } else if (incoming.edges) {
        // If we have neither args.after nor args.before, the incoming
        // edges cannot be spliced into the existing edges, so they must
        // replace the existing edges. See #6592 for a motivating example.
        prefix = [];
      } // We will remove duplidate edges if we have.


      var edges = [].concat(_toConsumableArray(prefix), _toConsumableArray(removeDuplidateEdgeFromIncoming({
        existingEdges: [].concat(_toConsumableArray(prefix), _toConsumableArray(suffix)),
        incomingEdges: incomingEdges
      })), _toConsumableArray(suffix));

      var pageInfo = _objectSpread(_objectSpread({}, incoming.pageInfo), existing.pageInfo);

      if (incoming.pageInfo) {
        var _incoming$pageInfo = incoming.pageInfo,
            hasPreviousPage = _incoming$pageInfo.hasPreviousPage,
            hasNextPage = _incoming$pageInfo.hasNextPage,
            _startCursor = _incoming$pageInfo.startCursor,
            _endCursor = _incoming$pageInfo.endCursor,
            extras = _objectWithoutProperties(_incoming$pageInfo, ["hasPreviousPage", "hasNextPage", "startCursor", "endCursor"]); // If incoming.pageInfo had any extra non-standard properties,
        // assume they should take precedence over any existing properties
        // of the same name, regardless of where this page falls with
        // respect to the existing data.


        Object.assign(pageInfo, extras); // Keep existing.pageInfo.has{Previous,Next}Page unless the
        // placement of the incoming edges means incoming.hasPreviousPage
        // or incoming.hasNextPage should become the new values for those
        // properties in existing.pageInfo. Note that these updates are
        // only permitted when the beginning or end of the incoming page
        // coincides with the beginning or end of the existing data, as
        // determined using prefix.length and suffix.length.

        if (!prefix.length) {
          if (void 0 !== hasPreviousPage) pageInfo.hasPreviousPage = hasPreviousPage;
          if (void 0 !== _startCursor) pageInfo.startCursor = _startCursor;
        }

        if (!suffix.length) {
          if (void 0 !== hasNextPage) pageInfo.hasNextPage = hasNextPage;
          if (void 0 !== _endCursor) pageInfo.endCursor = _endCursor;
        }
      }

      return _objectSpread(_objectSpread(_objectSpread({}, getExtras(existing)), getExtras(incoming)), {}, {
        edges: edges,
        pageInfo: pageInfo,
        args: args // The args is needed to identify the different pagination of the args

      });
    }
  };
}

var removeDuplidateEdgeFromIncoming = function removeDuplidateEdgeFromIncoming(_ref3) {
  var existingEdges = _ref3.existingEdges,
      incomingEdges = _ref3.incomingEdges;
  if (existingEdges.length === 0) return incomingEdges;
  return incomingEdges.filter(function (incomingEdge) {
    if (!('node' in incomingEdge)) return false;
    var duplicateEdge = existingEdges.find(function (existingEdge) {
      if (!('node' in existingEdge)) return false;
      return existingEdge.node.__ref === incomingEdge.node.__ref;
    });
    return !duplicateEdge;
  });
}; // Returns any unrecognized properties of the given object.


var getExtras = function getExtras(obj) {
  return (0, _tslib.__rest)(obj, notExtras);
};

var notExtras = ['edges', 'pageInfo'];

function makeEmptyData() {
  return {
    edges: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: '',
      endCursor: ''
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWxheVN0eWxlUGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6WyJyZWxheVN0eWxlUGFnaW5hdGlvbiIsImtleUFyZ3MiLCJyZWFkIiwiZXhpc3RpbmciLCJjYW5SZWFkIiwicmVhZEZpZWxkIiwiZWRnZXMiLCJzdGFydEN1cnNvciIsInBhZ2VJbmZvIiwiZW5kQ3Vyc29yIiwiZm9yRWFjaCIsImVkZ2UiLCJwdXNoIiwiY3Vyc29yIiwiZ2V0RXh0cmFzIiwibWVyZ2UiLCJtYWtlRW1wdHlEYXRhIiwiaW5jb21pbmciLCJhcmdzIiwiaXNSZWZlcmVuY2UiLCJpbmNvbWluZ0VkZ2VzIiwibWFwIiwiZmlyc3RFZGdlIiwibGFzdEVkZ2UiLCJsZW5ndGgiLCJmaXJzdEN1cnNvciIsImxhc3RDdXJzb3IiLCJwcmVmaXgiLCJzdWZmaXgiLCJhZnRlciIsImluZGV4IiwiZmluZEluZGV4Iiwic2xpY2UiLCJiZWZvcmUiLCJyZW1vdmVEdXBsaWRhdGVFZGdlRnJvbUluY29taW5nIiwiZXhpc3RpbmdFZGdlcyIsImhhc1ByZXZpb3VzUGFnZSIsImhhc05leHRQYWdlIiwiZXh0cmFzIiwiT2JqZWN0IiwiYXNzaWduIiwiZmlsdGVyIiwiaW5jb21pbmdFZGdlIiwiZHVwbGljYXRlRWRnZSIsImZpbmQiLCJleGlzdGluZ0VkZ2UiLCJub2RlIiwiX19yZWYiLCJvYmoiLCJub3RFeHRyYXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0Esb0JBQVQsR0FBMEc7QUFBQSxNQUFuREMsT0FBbUQsdUVBQWhDLEtBQWdDO0FBQy9HLFNBQU87QUFDTEEsSUFBQUEsT0FBTyxFQUFQQSxPQURLO0FBR0xDLElBQUFBLElBSEssZ0JBR0FDLFFBSEEsUUFHa0M7QUFBQSxVQUF0QkMsT0FBc0IsUUFBdEJBLE9BQXNCO0FBQUEsVUFBYkMsU0FBYSxR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QkFBT0EsR0FBUCxFQUFZQyxTQUFaLENBQTlCO0FBQUEsQ0FBbEI7O0FBQ0EsSUFBTUEsU0FBUyxHQUFHLENBQUMsT0FBRCxFQUFVLFVBQVYsQ0FBbEI7O0FBRUEsU0FBU2pDLGFBQVQsR0FBOEM7QUFDNUMsU0FBTztBQUNMVixJQUFBQSxLQUFLLEVBQUUsRUFERjtBQUVMRSxJQUFBQSxRQUFRLEVBQUU7QUFDUjRCLE1BQUFBLGVBQWUsRUFBRSxLQURUO0FBRVJDLE1BQUFBLFdBQVcsRUFBRSxJQUZMO0FBR1I5QixNQUFBQSxXQUFXLEVBQUUsRUFITDtBQUlSRSxNQUFBQSxTQUFTLEVBQUU7QUFKSDtBQUZMLEdBQVA7QUFTRCIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtbWVtYmVyLWFjY2VzcyAqL1xuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnQgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuICovXG5pbXBvcnQgeyBGaWVsZFBvbGljeSwgUmVmZXJlbmNlIH0gZnJvbSAnQGFwb2xsby9jbGllbnQvY2FjaGUnO1xuaW1wb3J0IHsgbWVyZ2VEZWVwIH0gZnJvbSAnQGFwb2xsby9jbGllbnQvdXRpbGl0aWVzJztcbmltcG9ydCB7IF9fcmVzdCB9IGZyb20gJ3RzbGliJztcblxudHlwZSBLZXlBcmdzID0gRmllbGRQb2xpY3k8YW55Plsna2V5QXJncyddO1xuXG5leHBvcnQgdHlwZSBUUmVsYXlFZGdlPFROb2RlPiA9XG4gIHwge1xuICAgICAgY3Vyc29yPzogc3RyaW5nO1xuICAgICAgbm9kZTogVE5vZGU7XG4gICAgfVxuICB8IChSZWZlcmVuY2UgJiB7IGN1cnNvcj86IHN0cmluZyB9KTtcblxuZXhwb3J0IHR5cGUgVFJlbGF5UGFnZUluZm8gPSB7XG4gIGhhc1ByZXZpb3VzUGFnZTogYm9vbGVhbjtcbiAgaGFzTmV4dFBhZ2U6IGJvb2xlYW47XG4gIHN0YXJ0Q3Vyc29yOiBzdHJpbmc7XG4gIGVuZEN1cnNvcjogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVEV4aXN0aW5nUmVsYXk8VE5vZGU+ID0gUmVhZG9ubHk8e1xuICBlZGdlczogVFJlbGF5RWRnZTxUTm9kZT5bXTtcbiAgcGFnZUluZm86IFRSZWxheVBhZ2VJbmZvO1xufT47XG5cbmV4cG9ydCB0eXBlIFRJbmNvbWluZ1JlbGF5PFROb2RlPiA9IHtcbiAgZWRnZXM/OiBUUmVsYXlFZGdlPFROb2RlPltdO1xuICBwYWdlSW5mbz86IFRSZWxheVBhZ2VJbmZvO1xufTtcblxuZXhwb3J0IHR5cGUgUmVsYXlGaWVsZFBvbGljeTxUTm9kZT4gPSBGaWVsZFBvbGljeTxURXhpc3RpbmdSZWxheTxUTm9kZT4sIFRJbmNvbWluZ1JlbGF5PFROb2RlPiwgVEluY29taW5nUmVsYXk8VE5vZGU+PjtcblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBhIGJpdCBkaWZmZXJlbnQgZnJvbSB0aGUgb25lIHByb3ZpZGVkIGJ5IEFwb2xsby5cbi8vIDEuIGl0IHJlbW92ZXMgZHVwbGljYXRlIGVkZ2VzLlxuLy8gIEFzIGEgcmVzdWx0IG9mIHRoZSBtaXNhbGlnbmVkIGN1cnNvcixcbi8vICBpZiBhIGNsaWVudCBnZXRzIGRhdGEgZnJvbSBhIHNlcnZlciB3aXRoIGR1cGxpY2F0ZSBub2Rlcyxcbi8vICBpdCB3aWxsIHJlbW92ZSBkdXBsaWNhdGUgZWRnZXMgZnJvbSBhIGxpc3QuXG4vLyAyLiBpdCBzZXRzIGEgYXJncyB0byBhIGNvbm5lY3Rpb24uXG4vLyAgVGhlIGFyZ3MgaXMgbmVlZGVkIHRvIGlkZW50aWZ5IHRoZSBjb25uZWN0aW9uIHRvIGJlIHVwZGF0ZWQuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXlTdHlsZVBhZ2luYXRpb248VE5vZGUgZXh0ZW5kcyBSZWZlcmVuY2U+KGtleUFyZ3M6IEtleUFyZ3MgPSBmYWxzZSk6IFJlbGF5RmllbGRQb2xpY3k8VE5vZGU+IHtcbiAgcmV0dXJuIHtcbiAgICBrZXlBcmdzLFxuXG4gICAgcmVhZChleGlzdGluZywgeyBjYW5SZWFkLCByZWFkRmllbGQgfSkge1xuICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlZGdlczogVFJlbGF5RWRnZTxUTm9kZT5bXSA9IFtdO1xuICAgICAgLy8gV2UgcHJpb3JpdGl6ZSBjdXJzb3JzIHRoYXQgYXJlIGluIHRoZSBleGlzdGluZy5wYWdlSW5mby5cbiAgICAgIGxldCBzdGFydEN1cnNvciA9IGV4aXN0aW5nLnBhZ2VJbmZvLnN0YXJ0Q3Vyc29yO1xuICAgICAgbGV0IGVuZEN1cnNvciA9IGV4aXN0aW5nLnBhZ2VJbmZvLmVuZEN1cnNvcjtcbiAgICAgIGV4aXN0aW5nLmVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcbiAgICAgICAgLy8gRWRnZXMgdGhlbXNlbHZlcyBjb3VsZCBiZSBSZWZlcmVuY2Ugb2JqZWN0cywgc28gaXQncyBpbXBvcnRhbnRcbiAgICAgICAgLy8gdG8gdXNlIHJlYWRGaWVsZCB0byBhY2Nlc3MgdGhlIGVkZ2UuZWRnZS5ub2RlIHByb3BlcnR5LlxuICAgICAgICBpZiAoY2FuUmVhZChyZWFkRmllbGQoJ25vZGUnLCBlZGdlKSkpIHtcbiAgICAgICAgICBlZGdlcy5wdXNoKGVkZ2UpO1xuICAgICAgICAgIGlmIChlZGdlLmN1cnNvcikge1xuICAgICAgICAgICAgc3RhcnRDdXJzb3IgPSBzdGFydEN1cnNvciB8fCBlZGdlLmN1cnNvcjtcbiAgICAgICAgICAgIGVuZEN1cnNvciA9IGVuZEN1cnNvciB8fCBlZGdlLmN1cnNvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBTb21lIGltcGxlbWVudGF0aW9ucyByZXR1cm4gYWRkaXRpb25hbCBDb25uZWN0aW9uIGZpZWxkcywgc3VjaFxuICAgICAgICAvLyBhcyBleGlzdGluZy50b3RhbENvdW50LiBUaGVzZSBmaWVsZHMgYXJlIHNhdmVkIGJ5IHRoZSBtZXJnZVxuICAgICAgICAvLyBmdW5jdGlvbiwgc28gdGhlIHJlYWQgZnVuY3Rpb24gc2hvdWxkIGFsc28gcHJlc2VydmUgdGhlbS5cbiAgICAgICAgLi4uZ2V0RXh0cmFzKGV4aXN0aW5nKSxcbiAgICAgICAgZWRnZXMsXG4gICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgLi4uZXhpc3RpbmcucGFnZUluZm8sXG4gICAgICAgICAgc3RhcnRDdXJzb3IsXG4gICAgICAgICAgZW5kQ3Vyc29yLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgbWVyZ2UoZXhpc3RpbmcgPSBtYWtlRW1wdHlEYXRhKCksIGluY29taW5nLCB7IGFyZ3MsIGlzUmVmZXJlbmNlLCByZWFkRmllbGQgfSkge1xuICAgICAgY29uc3QgaW5jb21pbmdFZGdlcyA9IGluY29taW5nLmVkZ2VzXG4gICAgICAgID8gaW5jb21pbmcuZWRnZXMubWFwKChlZGdlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNSZWZlcmVuY2UoKGVkZ2UgPSB7IC4uLmVkZ2UgfSkpKSB7XG4gICAgICAgICAgICAgIC8vIEluIGNhc2UgZWRnZSBpcyBhIFJlZmVyZW5jZSwgd2UgcmVhZCBvdXQgaXRzIGN1cnNvciBmaWVsZCBhbmRcbiAgICAgICAgICAgICAgLy8gc3RvcmUgaXQgYXMgYW4gZXh0cmEgcHJvcGVydHkgb2YgdGhlIFJlZmVyZW5jZSBvYmplY3QuXG4gICAgICAgICAgICAgIGVkZ2UuY3Vyc29yID0gcmVhZEZpZWxkPHN0cmluZz4oJ2N1cnNvcicsIGVkZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVkZ2U7XG4gICAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcblxuICAgICAgaWYgKGluY29taW5nLnBhZ2VJbmZvKSB7XG4gICAgICAgIGNvbnN0IHsgcGFnZUluZm8gfSA9IGluY29taW5nO1xuICAgICAgICBjb25zdCB7IHN0YXJ0Q3Vyc29yLCBlbmRDdXJzb3IgfSA9IHBhZ2VJbmZvO1xuICAgICAgICBjb25zdCBmaXJzdEVkZ2UgPSBpbmNvbWluZ0VkZ2VzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWRnZSA9IGluY29taW5nRWRnZXNbaW5jb21pbmdFZGdlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gSW4gY2FzZSB3ZSBkaWQgbm90IHJlcXVlc3QgdGhlIGN1cnNvciBmaWVsZCBmb3IgZWRnZXMgaW4gdGhpc1xuICAgICAgICAvLyBxdWVyeSwgd2UgY2FuIHN0aWxsIGluZmVyIGN1cnNvcnMgZnJvbSBwYWdlSW5mby5cbiAgICAgICAgaWYgKGZpcnN0RWRnZSAmJiBzdGFydEN1cnNvcikge1xuICAgICAgICAgIGZpcnN0RWRnZS5jdXJzb3IgPSBzdGFydEN1cnNvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdEVkZ2UgJiYgZW5kQ3Vyc29yKSB7XG4gICAgICAgICAgbGFzdEVkZ2UuY3Vyc29yID0gZW5kQ3Vyc29yO1xuICAgICAgICB9XG4gICAgICAgIC8vIEN1cnNvcnMgY2FuIGFsc28gY29tZSBmcm9tIGVkZ2VzLCBzbyB3ZSBkZWZhdWx0XG4gICAgICAgIC8vIHBhZ2VJbmZvLntzdGFydCxlbmR9Q3Vyc29yIHRvIHtmaXJzdCxsYXN0fUVkZ2UuY3Vyc29yLlxuICAgICAgICBjb25zdCBmaXJzdEN1cnNvciA9IGZpcnN0RWRnZSAmJiBmaXJzdEVkZ2UuY3Vyc29yO1xuICAgICAgICBpZiAoZmlyc3RDdXJzb3IgJiYgIXN0YXJ0Q3Vyc29yKSB7XG4gICAgICAgICAgaW5jb21pbmcgPSBtZXJnZURlZXAoaW5jb21pbmcsIHtcbiAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgIHN0YXJ0Q3Vyc29yOiBmaXJzdEN1cnNvcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdEN1cnNvciA9IGxhc3RFZGdlICYmIGxhc3RFZGdlLmN1cnNvcjtcbiAgICAgICAgaWYgKGxhc3RDdXJzb3IgJiYgIWVuZEN1cnNvcikge1xuICAgICAgICAgIGluY29taW5nID0gbWVyZ2VEZWVwKGluY29taW5nLCB7XG4gICAgICAgICAgICBwYWdlSW5mbzoge1xuICAgICAgICAgICAgICBlbmRDdXJzb3I6IGxhc3RDdXJzb3IsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBwcmVmaXggPSBleGlzdGluZy5lZGdlcztcbiAgICAgIGxldCBzdWZmaXg6IHR5cGVvZiBwcmVmaXggPSBbXTtcblxuICAgICAgaWYgKGFyZ3MgJiYgYXJncy5hZnRlcikge1xuICAgICAgICAvLyBUaGlzIGNvbXBhcmlzb24gZG9lcyBub3QgbmVlZCB0byB1c2UgcmVhZEZpZWxkKFwiY3Vyc29yXCIsIGVkZ2UpLFxuICAgICAgICAvLyBiZWNhdXNlIHdlIHN0b3JlZCB0aGUgY3Vyc29yIGZpZWxkIG9mIGFueSBSZWZlcmVuY2UgZWRnZXMgYXMgYW5cbiAgICAgICAgLy8gZXh0cmEgcHJvcGVydHkgb2YgdGhlIFJlZmVyZW5jZSBvYmplY3QuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gcHJlZml4LmZpbmRJbmRleCgoZWRnZSkgPT4gZWRnZS5jdXJzb3IgPT09IGFyZ3MuYWZ0ZXIpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIHByZWZpeCA9IHByZWZpeC5zbGljZSgwLCBpbmRleCArIDEpO1xuICAgICAgICAgIC8vIHN1ZmZpeCA9IFtdOyAvLyBhbHJlYWR5IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhcmdzICYmIGFyZ3MuYmVmb3JlKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gcHJlZml4LmZpbmRJbmRleCgoZWRnZSkgPT4gZWRnZS5jdXJzb3IgPT09IGFyZ3MuYmVmb3JlKTtcbiAgICAgICAgc3VmZml4ID0gaW5kZXggPCAwID8gcHJlZml4IDogcHJlZml4LnNsaWNlKGluZGV4KTtcbiAgICAgICAgcHJlZml4ID0gW107XG4gICAgICB9IGVsc2UgaWYgKGluY29taW5nLmVkZ2VzKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbmVpdGhlciBhcmdzLmFmdGVyIG5vciBhcmdzLmJlZm9yZSwgdGhlIGluY29taW5nXG4gICAgICAgIC8vIGVkZ2VzIGNhbm5vdCBiZSBzcGxpY2VkIGludG8gdGhlIGV4aXN0aW5nIGVkZ2VzLCBzbyB0aGV5IG11c3RcbiAgICAgICAgLy8gcmVwbGFjZSB0aGUgZXhpc3RpbmcgZWRnZXMuIFNlZSAjNjU5MiBmb3IgYSBtb3RpdmF0aW5nIGV4YW1wbGUuXG4gICAgICAgIHByZWZpeCA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSB3aWxsIHJlbW92ZSBkdXBsaWRhdGUgZWRnZXMgaWYgd2UgaGF2ZS5cbiAgICAgIGNvbnN0IGVkZ2VzID0gW1xuICAgICAgICAuLi5wcmVmaXgsXG4gICAgICAgIC4uLnJlbW92ZUR1cGxpZGF0ZUVkZ2VGcm9tSW5jb21pbmcoeyBleGlzdGluZ0VkZ2VzOiBbLi4ucHJlZml4LCAuLi5zdWZmaXhdLCBpbmNvbWluZ0VkZ2VzIH0pLFxuICAgICAgICAuLi5zdWZmaXgsXG4gICAgICBdO1xuXG4gICAgICBjb25zdCBwYWdlSW5mbzogVFJlbGF5UGFnZUluZm8gPSB7XG4gICAgICAgIC8vIFRoZSBvcmRlcmluZyBvZiB0aGVzZSB0d28gLi4uc3ByZWFkcyBtYXkgYmUgc3VycHJpc2luZywgYnV0IGl0XG4gICAgICAgIC8vIG1ha2VzIHNlbnNlIGJlY2F1c2Ugd2Ugd2FudCB0byBjb21iaW5lIFBhZ2VJbmZvIHByb3BlcnRpZXMgd2l0aCBhXG4gICAgICAgIC8vIHByZWZlcmVuY2UgZm9yIGV4aXN0aW5nIHZhbHVlcywgKnVubGVzcyogdGhlIGV4aXN0aW5nIHZhbHVlcyBhcmVcbiAgICAgICAgLy8gb3ZlcnJpZGRlbiBieSB0aGUgbG9naWMgYmVsb3csIHdoaWNoIGlzIHBlcm1pdHRlZCBvbmx5IHdoZW4gdGhlXG4gICAgICAgIC8vIGluY29taW5nIHBhZ2UgZmFsbHMgYXQgdGhlIGJlZ2lubmluZyBvciBlbmQgb2YgdGhlIGRhdGEuXG4gICAgICAgIC4uLmluY29taW5nLnBhZ2VJbmZvLFxuICAgICAgICAuLi5leGlzdGluZy5wYWdlSW5mbyxcbiAgICAgIH07XG5cbiAgICAgIGlmIChpbmNvbWluZy5wYWdlSW5mbykge1xuICAgICAgICBjb25zdCB7IGhhc1ByZXZpb3VzUGFnZSwgaGFzTmV4dFBhZ2UsIHN0YXJ0Q3Vyc29yLCBlbmRDdXJzb3IsIC4uLmV4dHJhcyB9ID0gaW5jb21pbmcucGFnZUluZm87XG5cbiAgICAgICAgLy8gSWYgaW5jb21pbmcucGFnZUluZm8gaGFkIGFueSBleHRyYSBub24tc3RhbmRhcmQgcHJvcGVydGllcyxcbiAgICAgICAgLy8gYXNzdW1lIHRoZXkgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFueSBleGlzdGluZyBwcm9wZXJ0aWVzXG4gICAgICAgIC8vIG9mIHRoZSBzYW1lIG5hbWUsIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgdGhpcyBwYWdlIGZhbGxzIHdpdGhcbiAgICAgICAgLy8gcmVzcGVjdCB0byB0aGUgZXhpc3RpbmcgZGF0YS5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihwYWdlSW5mbywgZXh0cmFzKTtcblxuICAgICAgICAvLyBLZWVwIGV4aXN0aW5nLnBhZ2VJbmZvLmhhc3tQcmV2aW91cyxOZXh0fVBhZ2UgdW5sZXNzIHRoZVxuICAgICAgICAvLyBwbGFjZW1lbnQgb2YgdGhlIGluY29taW5nIGVkZ2VzIG1lYW5zIGluY29taW5nLmhhc1ByZXZpb3VzUGFnZVxuICAgICAgICAvLyBvciBpbmNvbWluZy5oYXNOZXh0UGFnZSBzaG91bGQgYmVjb21lIHRoZSBuZXcgdmFsdWVzIGZvciB0aG9zZVxuICAgICAgICAvLyBwcm9wZXJ0aWVzIGluIGV4aXN0aW5nLnBhZ2VJbmZvLiBOb3RlIHRoYXQgdGhlc2UgdXBkYXRlcyBhcmVcbiAgICAgICAgLy8gb25seSBwZXJtaXR0ZWQgd2hlbiB0aGUgYmVnaW5uaW5nIG9yIGVuZCBvZiB0aGUgaW5jb21pbmcgcGFnZVxuICAgICAgICAvLyBjb2luY2lkZXMgd2l0aCB0aGUgYmVnaW5uaW5nIG9yIGVuZCBvZiB0aGUgZXhpc3RpbmcgZGF0YSwgYXNcbiAgICAgICAgLy8gZGV0ZXJtaW5lZCB1c2luZyBwcmVmaXgubGVuZ3RoIGFuZCBzdWZmaXgubGVuZ3RoLlxuICAgICAgICBpZiAoIXByZWZpeC5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodm9pZCAwICE9PSBoYXNQcmV2aW91c1BhZ2UpIHBhZ2VJbmZvLmhhc1ByZXZpb3VzUGFnZSA9IGhhc1ByZXZpb3VzUGFnZTtcbiAgICAgICAgICBpZiAodm9pZCAwICE9PSBzdGFydEN1cnNvcikgcGFnZUluZm8uc3RhcnRDdXJzb3IgPSBzdGFydEN1cnNvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN1ZmZpeC5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodm9pZCAwICE9PSBoYXNOZXh0UGFnZSkgcGFnZUluZm8uaGFzTmV4dFBhZ2UgPSBoYXNOZXh0UGFnZTtcbiAgICAgICAgICBpZiAodm9pZCAwICE9PSBlbmRDdXJzb3IpIHBhZ2VJbmZvLmVuZEN1cnNvciA9IGVuZEN1cnNvcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5nZXRFeHRyYXMoZXhpc3RpbmcpLFxuICAgICAgICAuLi5nZXRFeHRyYXMoaW5jb21pbmcpLFxuICAgICAgICBlZGdlcyxcbiAgICAgICAgcGFnZUluZm8sXG4gICAgICAgIGFyZ3MsIC8vIFRoZSBhcmdzIGlzIG5lZWRlZCB0byBpZGVudGlmeSB0aGUgZGlmZmVyZW50IHBhZ2luYXRpb24gb2YgdGhlIGFyZ3NcbiAgICAgIH07XG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgcmVtb3ZlRHVwbGlkYXRlRWRnZUZyb21JbmNvbWluZyA9IDxUTm9kZSBleHRlbmRzIFJlZmVyZW5jZT4oe1xuICBleGlzdGluZ0VkZ2VzLFxuICBpbmNvbWluZ0VkZ2VzLFxufToge1xuICBleGlzdGluZ0VkZ2VzOiBUUmVsYXlFZGdlPFROb2RlPltdO1xuICBpbmNvbWluZ0VkZ2VzOiBUUmVsYXlFZGdlPFROb2RlPltdO1xufSk6IFRSZWxheUVkZ2U8VE5vZGU+W10gPT4ge1xuICBpZiAoZXhpc3RpbmdFZGdlcy5sZW5ndGggPT09IDApIHJldHVybiBpbmNvbWluZ0VkZ2VzO1xuICByZXR1cm4gaW5jb21pbmdFZGdlcy5maWx0ZXIoKGluY29taW5nRWRnZSkgPT4ge1xuICAgIGlmICghKCdub2RlJyBpbiBpbmNvbWluZ0VkZ2UpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgZHVwbGljYXRlRWRnZSA9IGV4aXN0aW5nRWRnZXMuZmluZCgoZXhpc3RpbmdFZGdlKSA9PiB7XG4gICAgICBpZiAoISgnbm9kZScgaW4gZXhpc3RpbmdFZGdlKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIGV4aXN0aW5nRWRnZS5ub2RlLl9fcmVmID09PSBpbmNvbWluZ0VkZ2Uubm9kZS5fX3JlZjtcbiAgICB9KTtcbiAgICByZXR1cm4gIWR1cGxpY2F0ZUVkZ2U7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBhbnkgdW5yZWNvZ25pemVkIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdC5cbmNvbnN0IGdldEV4dHJhcyA9IChvYmo6IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IF9fcmVzdChvYmosIG5vdEV4dHJhcyk7XG5jb25zdCBub3RFeHRyYXMgPSBbJ2VkZ2VzJywgJ3BhZ2VJbmZvJ107XG5cbmZ1bmN0aW9uIG1ha2VFbXB0eURhdGEoKTogVEV4aXN0aW5nUmVsYXk8YW55PiB7XG4gIHJldHVybiB7XG4gICAgZWRnZXM6IFtdLFxuICAgIHBhZ2VJbmZvOiB7XG4gICAgICBoYXNQcmV2aW91c1BhZ2U6IGZhbHNlLFxuICAgICAgaGFzTmV4dFBhZ2U6IHRydWUsXG4gICAgICBzdGFydEN1cnNvcjogJycsXG4gICAgICBlbmRDdXJzb3I6ICcnLFxuICAgIH0sXG4gIH07XG59XG4iXX0=