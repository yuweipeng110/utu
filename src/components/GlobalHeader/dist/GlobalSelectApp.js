"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var umi_1 = require("umi");
var pro_form_1 = require("@ant-design/pro-form");
var antd_1 = require("antd");
var app_1 = require("@/services/app");
var const_1 = require("@/consts/const");
var pubsub_js_1 = require("pubsub-js");
var lodash_1 = require("lodash");
require("./index.less");
var GlobalSelectApp = function (props) {
    var dispatch = props.dispatch, currentApp = props.currentApp;
    var form = antd_1.Form.useForm()[0];
    var _a = react_1.useState([]), appOptions = _a[0], setAppOptions = _a[1];
    var _b = react_1.useState(false), appIsDisabled = _b[0], setAppIsDisabled = _b[1];
    var _c = umi_1.useRequest(app_1.queryAppList, {
        debounceInterval: 500,
        manual: true,
        formatResult: function (res) {
            var options = res.datas.map(function (item) {
                return {
                    value: item.id,
                    label: item.appCode + "\uFF08" + item.appName + "\uFF09",
                    current_app: item
                };
            });
            var conOptions = options;
            if (!lodash_1["default"].isEmpty(currentApp)) {
                var currentDataApp = {
                    value: currentApp === null || currentApp === void 0 ? void 0 : currentApp.id,
                    label: (currentApp === null || currentApp === void 0 ? void 0 : currentApp.appCode) + "\uFF08" + (currentApp === null || currentApp === void 0 ? void 0 : currentApp.appName) + "\uFF09",
                    current_app: currentApp
                };
                conOptions = lodash_1["default"].uniqWith(options.concat(currentDataApp), lodash_1["default"].isEqual);
            }
            setAppOptions(conOptions);
        }
    }), loading = _c.loading, run = _c.run;
    react_1.useEffect(function () {
        run({
            pageSize: 10
        });
        var addPubSub = pubsub_js_1["default"].subscribe(const_1.AddAppPubSubId, function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, run({
                            pageSize: 10
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        var statusPubSub = pubsub_js_1["default"].subscribe(const_1.StatusAppPubSubId, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setAppIsDisabled(data.disabled);
                return [2 /*return*/];
            });
        }); });
        return function () {
            pubsub_js_1["default"].unsubscribe(addPubSub);
            pubsub_js_1["default"].unsubscribe(statusPubSub);
        };
    }, []);
    react_1.useMemo(function () {
        var deletePubSub = pubsub_js_1["default"].subscribe(const_1.DeleteAppPubSubId, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data.appId === (currentApp === null || currentApp === void 0 ? void 0 : currentApp.id)) {
                            dispatch({
                                type: 'app/selectApp',
                                payload: null
                            });
                            form.resetFields();
                        }
                        return [4 /*yield*/, run({
                                pageSize: 10
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return function () {
            pubsub_js_1["default"].unsubscribe(deletePubSub);
        };
    }, [currentApp]);
    var handleSearchApp = function (value) {
        if (value.length === 0)
            return;
        setAppOptions([]);
        run({
            pageSize: 10,
            searchParam: value
        });
    };
    return (react_1["default"].createElement(pro_form_1["default"], { form: form, layout: 'horizontal', className: "form-revert", style: { float: 'left' } },
        react_1["default"].createElement(pro_form_1.ProFormSelect, { name: "appId", label: "\u5E94\u7528", width: 240, placeholder: "\u8BF7\u8F93\u5165\u5E94\u7528\u540D\u79F0\u6216code", showSearch: true, options: appOptions, fieldProps: {
                showArrow: true,
                filterOption: false,
                onSearch: function (value) { return handleSearchApp(value); },
                onChange: function (value, option) {
                    if (value) {
                        dispatch({
                            type: 'app/selectApp',
                            payload: option.current_app
                        });
                    }
                },
                onClear: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, run({
                                    pageSize: 10
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
                loading: loading,
                notFoundContent: loading ? react_1["default"].createElement(antd_1.Spin, { size: "small" }) : react_1["default"].createElement(antd_1.Empty, null)
            }, initialValue: !lodash_1["default"].isEmpty(currentApp) ? currentApp.id : null, disabled: appIsDisabled })));
};
exports["default"] = umi_1.connect(function (_a) {
    var app = _a.app;
    return ({
        currentApp: app.currentApp
    });
})(GlobalSelectApp);
