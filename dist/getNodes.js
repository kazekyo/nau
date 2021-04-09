"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNodesFromConnection = void 0;

var getNodesFromConnection = function getNodesFromConnection(_ref) {
  var _connection$edges;

  var connection = _ref.connection;
  return (connection === null || connection === void 0 ? void 0 : (_connection$edges = connection.edges) === null || _connection$edges === void 0 ? void 0 : _connection$edges.map(function (edge) {
    return edge === null || edge === void 0 ? void 0 : edge.node;
  }).filter(function (item) {
    return !!item;
  })) || [];
};

exports.getNodesFromConnection = getNodesFromConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZXROb2Rlcy50cyJdLCJuYW1lcyI6WyJnZXROb2Rlc0Zyb21Db25uZWN0aW9uIiwiY29ubmVjdGlvbiIsImVkZ2VzIiwibWFwIiwiZWRnZSIsIm5vZGUiLCJmaWx0ZXIiLCJpdGVtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQU8sSUFBTUEsc0JBQXNCLEdBQUcsU0FBekJBLHNCQUF5QixPQVNnQztBQUFBOztBQUFBLE1BSHBFQyxVQUdvRSxRQUhwRUEsVUFHb0U7QUFDcEUsU0FBTyxDQUFBQSxVQUFVLFNBQVYsSUFBQUEsVUFBVSxXQUFWLGlDQUFBQSxVQUFVLENBQUVDLEtBQVosd0VBQW1CQyxHQUFuQixDQUF1QixVQUFDQyxJQUFEO0FBQUEsV0FBVUEsSUFBVixhQUFVQSxJQUFWLHVCQUFVQSxJQUFJLENBQUVDLElBQWhCO0FBQUEsR0FBdkIsRUFBNkNDLE1BQTdDLENBQW9ELFVBQUNDLElBQUQ7QUFBQSxXQUE0QyxDQUFDLENBQUNBLElBQTlDO0FBQUEsR0FBcEQsTUFBMkcsRUFBbEg7QUFDRCxDQVhNIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdldE5vZGVzRnJvbUNvbm5lY3Rpb24gPSA8XG4gIFQgZXh0ZW5kcyB7XG4gICAgZWRnZXM/OiBBcnJheTx7IG5vZGU/OiBVIHwgbnVsbCB9IHwgdW5kZWZpbmVkIHwgbnVsbD4gfCBudWxsO1xuICB9LFxuICBVIGV4dGVuZHMgdW5rbm93blxuPih7XG4gIGNvbm5lY3Rpb24sXG59OiB7XG4gIGNvbm5lY3Rpb246IFQgfCB1bmRlZmluZWQgfCBudWxsO1xufSk6IE5vbk51bGxhYmxlPE5vbk51bGxhYmxlPE5vbk51bGxhYmxlPFRbJ2VkZ2VzJ10+WzBdPlsnbm9kZSddPltdID0+IHtcbiAgcmV0dXJuIGNvbm5lY3Rpb24/LmVkZ2VzPy5tYXAoKGVkZ2UpID0+IGVkZ2U/Lm5vZGUpLmZpbHRlcigoaXRlbSk6IGl0ZW0gaXMgTm9uTnVsbGFibGU8dHlwZW9mIGl0ZW0+ID0+ICEhaXRlbSkgfHwgW107XG59O1xuIl19