"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metric = exports.MetricThemes = exports.MetricTypes = void 0;
var MetricTypes;
(function (MetricTypes) {
    MetricTypes["liveAuctions"] = "Live auctions";
    MetricTypes["pendingApproval"] = "Pending approval";
    MetricTypes["newMessage"] = "New message";
    MetricTypes["autionClosedToday"] = "Auction closed today";
    MetricTypes["userOnline"] = "User online";
    MetricTypes["newRegisteredUser"] = "New registered user";
    MetricTypes["todaySales"] = "Today's sales";
    MetricTypes["carsSoldToday"] = "Cars sold today";
})(MetricTypes = exports.MetricTypes || (exports.MetricTypes = {}));
var MetricThemes;
(function (MetricThemes) {
    MetricThemes["success"] = "success";
    MetricThemes["warning"] = "warning";
    MetricThemes["red"] = "red";
    MetricThemes["blue"] = "blue";
    MetricThemes["blueOne"] = "blue-1";
})(MetricThemes = exports.MetricThemes || (exports.MetricThemes = {}));
class Metric {
    constructor(id, title, value, chartData = [], theme = MetricThemes.success) {
        this.id = id;
        this.title = title;
        this.value = value;
        this.chartData = chartData;
        this.theme = theme;
    }
}
exports.Metric = Metric;
//# sourceMappingURL=index.js.map