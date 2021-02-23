"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesBuilder = exports.CaseTypes = exports.StateObject = exports.StateItem = exports.ValidationState = exports.ObjectValidator = void 0;
var RuleStack = /** @class */ (function () {
    function RuleStack() {
        this.items = [];
    }
    RuleStack.prototype.push = function (item) {
        this.items.push(item);
    };
    return RuleStack;
}());
var RuleStackItem = /** @class */ (function () {
    function RuleStackItem(key, callback, message) {
        this.key = key;
        this.callback = callback;
        this.message = message;
    }
    Object.defineProperty(RuleStackItem.prototype, "result", {
        get: function () {
            if (this._result === undefined || typeof this._result === "undefined") {
                this._result = this.callback();
            }
            return this._result;
        },
        enumerable: false,
        configurable: true
    });
    return RuleStackItem;
}());
var BlockStackItem = /** @class */ (function () {
    function BlockStackItem(key, block) {
        this.key = key;
        this.isBlock = block;
    }
    return BlockStackItem;
}());
var ObjectValidator = /** @class */ (function () {
    function ObjectValidator() {
    }
    ObjectValidator.prototype.validate = function (item) {
        return this._validate(item);
    };
    ObjectValidator.prototype.validateField = function (item, fieldName) {
        return this._validate(item, function (p) { return p === fieldName; });
    };
    ObjectValidator.prototype._validate = function (item, callback) {
        var state = this.createState();
        var stack = new RuleStack();
        var builder = new RulesBuilder({ item: item, stack: stack });
        this.setRules(builder);
        var key = null;
        for (var index = 0; index < stack.items.length; index++) {
            var item_1 = stack.items[index];
            if (callback && !callback(item_1.key)) {
                continue;
            }
            if (key && item_1.key === key) {
                continue;
            }
            if (item_1 instanceof RuleStackItem) {
                var rule = item_1;
                var text = rule.result ? "" : rule.message;
                state[rule.key].setValue(!text, text || '');
            }
            if (item_1 instanceof BlockStackItem) {
                var block = item_1;
                var rule = stack.items[index - 1];
                if (rule && !rule.result && block.isBlock) {
                    break;
                }
                if (rule && !rule.result && !block.isBlock) {
                    key = rule.key;
                }
            }
        }
        return state;
    };
    return ObjectValidator;
}());
exports.ObjectValidator = ObjectValidator;
var ValidationState = /** @class */ (function () {
    function ValidationState() {
    }
    ValidationState.create = function (obj) {
        var result = new StateObject();
        for (var key in obj) {
            StateReflector.createProperty(result, key);
        }
        return result;
    };
    ValidationState.formType = function (type) {
        return this.create(new type());
    };
    return ValidationState;
}());
exports.ValidationState = ValidationState;
var StateReflector = /** @class */ (function () {
    function StateReflector() {
    }
    StateReflector.createProperty = function (state, key) {
        var value = new StateItem();
        Object.defineProperty(state, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
        });
    };
    return StateReflector;
}());
var StateItem = /** @class */ (function () {
    function StateItem() {
        this.valid = false;
        this.text = '';
    }
    StateItem.prototype.setValue = function (valid, text) {
        this.valid = valid;
        this.text = text;
    };
    return StateItem;
}());
exports.StateItem = StateItem;
var StateObject = /** @class */ (function () {
    function StateObject() {
    }
    StateObject.prototype.clear = function () {
        for (var key in this) {
            var item = this[key];
            if (!item.hasOwnProperty("valid"))
                continue;
            item["valid"] = undefined;
            item["text"] = '';
        }
    };
    Object.defineProperty(StateObject.prototype, "isValid", {
        get: function () {
            for (var key in this) {
                var item = this[key];
                if (!item.hasOwnProperty("valid"))
                    continue;
                if (item["valid"] === false)
                    return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    StateObject.create = function (type) {
        return ValidationState.formType(type);
    };
    return StateObject;
}());
exports.StateObject = StateObject;
var FieldValidationBuilder = /** @class */ (function () {
    function FieldValidationBuilder(field, validator) {
        this.field = field;
        this.validator = validator;
    }
    FieldValidationBuilder.prototype.check = function (action, message) {
        var _a = this.validator, item = _a.item, stack = _a.stack;
        stack.push(new RuleStackItem(this.field.toString(), function () { return action(item); }, message));
        return this;
    };
    FieldValidationBuilder.prototype.null = function (message) {
        return this;
    };
    FieldValidationBuilder.prototype.breakIf = function () {
        return this;
    };
    FieldValidationBuilder.prototype.break = function () {
        this.validator.stack.items.push(new BlockStackItem(this.field.toString(), true));
        return this;
    };
    FieldValidationBuilder.prototype.breakChain = function () {
        this.validator.stack.items.push(new BlockStackItem(this.field.toString(), false));
        return this;
    };
    return FieldValidationBuilder;
}());
var StringFieldValidationBuilder = /** @class */ (function (_super) {
    __extends(StringFieldValidationBuilder, _super);
    function StringFieldValidationBuilder(field, validator) {
        return _super.call(this, field, validator) || this;
    }
    StringFieldValidationBuilder.prototype.notEmpty = function (message) {
        var _a = this.validator, item = _a.item, stack = _a.stack;
        var value = item[this.field];
        stack.push(new RuleStackItem(this.field.toString(), function () { return !!value; }, message || this.field + ": is empty"));
        return this;
    };
    StringFieldValidationBuilder.prototype.maxLength = function (num, message) {
        var _a = this.validator, item = _a.item, stack = _a.stack;
        var value = item[this.field];
        stack.push(new RuleStackItem(this.field.toString(), function () { return value.length < num; }, message || this.field + ": max length is " + num));
        return this;
    };
    return StringFieldValidationBuilder;
}(FieldValidationBuilder));
var NumberFieldValidationBuilder = /** @class */ (function (_super) {
    __extends(NumberFieldValidationBuilder, _super);
    function NumberFieldValidationBuilder(field, validator) {
        return _super.call(this, field, validator) || this;
    }
    NumberFieldValidationBuilder.prototype.range = function (start, end, message) {
        var _a = this.validator, item = _a.item, stack = _a.stack;
        var value = item[this.field];
        stack.push(new RuleStackItem(this.field.toString(), function () { return value >= start && value <= end; }, message || this.field + ": out of range (" + start + ":" + end + ")"));
        return this;
    };
    return NumberFieldValidationBuilder;
}(FieldValidationBuilder));
var ArrayFieldValidationBuilder = /** @class */ (function (_super) {
    __extends(ArrayFieldValidationBuilder, _super);
    function ArrayFieldValidationBuilder(field, validator) {
        return _super.call(this, field, validator) || this;
    }
    ArrayFieldValidationBuilder.prototype.forElement = function (callback) {
        callback(new CaseTypes(this.field, this.validator));
    };
    return ArrayFieldValidationBuilder;
}(FieldValidationBuilder));
var EntityFieldValidationBuilder = /** @class */ (function (_super) {
    __extends(EntityFieldValidationBuilder, _super);
    function EntityFieldValidationBuilder(field, validator) {
        return _super.call(this, field, validator) || this;
    }
    EntityFieldValidationBuilder.prototype.use = function (type) {
        return this;
    };
    return EntityFieldValidationBuilder;
}(FieldValidationBuilder));
var CaseTypes = /** @class */ (function () {
    function CaseTypes(field, validator) {
        this.field = field;
        this.validator = validator;
    }
    CaseTypes.prototype.string = function () {
        return new StringFieldValidationBuilder(this.field, this.validator);
    };
    CaseTypes.prototype.number = function () {
        return new NumberFieldValidationBuilder(this.field, this.validator);
    };
    CaseTypes.prototype.array = function () {
        return new ArrayFieldValidationBuilder(this.field, this.validator);
    };
    CaseTypes.prototype.entity = function () {
        return new EntityFieldValidationBuilder(this.field, this.validator);
    };
    return CaseTypes;
}());
exports.CaseTypes = CaseTypes;
var RulesBuilder = /** @class */ (function () {
    function RulesBuilder(validator) {
        this.validator = validator;
    }
    RulesBuilder.prototype.add = function (fieldName) {
        return new CaseTypes(fieldName, this.validator);
    };
    return RulesBuilder;
}());
exports.RulesBuilder = RulesBuilder;
