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
exports.RulesBuilder = exports.CaseTypes = exports.StateObject = exports.StateItem = exports.ValidationResult = exports.ObjectValidator = void 0;
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
            if (this.done === undefined || typeof this.done === 'undefined') {
                this.done = this.callback();
            }
            return this.done;
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
    function ObjectValidator(state) {
        this.state = state;
    }
    ObjectValidator.prototype.validate = function (item) {
        return this.internalValidate(item);
    };
    ObjectValidator.prototype.validateField = function (item, fieldName) {
        this.internalValidate(item, function (p) { return p === fieldName; });
    };
    ObjectValidator.prototype.internalValidate = function (item, callback) {
        var stack = new RuleStack();
        var builder = new RulesBuilder({ item: item, stack: stack, state: this.state });
        this.setRules(builder);
        var key = null;
        for (var index = 0; index < stack.items.length; index++) {
            var current = stack.items[index];
            if (callback && !callback(current.key)) {
                continue;
            }
            if (key && current.key === key) {
                continue;
            }
            if (current instanceof RuleStackItem) {
                var text = current.result ? '' : current.message;
                var si = this.state.getValue(current.key);
                if (si)
                    si.setValue(!text, text || '');
            }
            if (current instanceof BlockStackItem) {
                var rule = stack.items[index - 1];
                if (rule && !rule.result && current.isBlock) {
                    break;
                }
                if (rule && !rule.result && !current.isBlock) {
                    key = rule.key;
                }
            }
        }
    };
    return ObjectValidator;
}());
exports.ObjectValidator = ObjectValidator;
var ValidationResult = /** @class */ (function () {
    function ValidationResult() {
        this.items = {};
    }
    return ValidationResult;
}());
exports.ValidationResult = ValidationResult;
var StateItem = /** @class */ (function () {
    function StateItem() {
        this.valid = undefined;
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
        this.items = {};
    }
    StateObject.prototype.clear = function () {
        for (var key in this) {
            if ({}.hasOwnProperty.call(this, key)) {
                var item = this[key];
                if (item instanceof StateItem) {
                    item.valid = undefined;
                    item.text = '';
                }
            }
        }
    };
    Object.defineProperty(StateObject.prototype, "isValid", {
        get: function () {
            for (var _i = 0, _a = Object.entries(this.items); _i < _a.length; _i++) {
                var _b = _a[_i], value = _b[1];
                if (value instanceof StateItem && value.valid === false)
                    return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    StateObject.prototype.getValue = function (name) {
        return this.items[name];
    };
    StateObject.prototype.setValue = function (name, item) {
        var current = this.items[name];
        if (!current) {
            current = this.items[name] = new StateItem();
        }
        current.valid = item.valid;
        current.valid = item.valid;
    };
    return StateObject;
}());
exports.StateObject = StateObject;
var FieldValidationBuilder = /** @class */ (function () {
    function FieldValidationBuilder(field, validator) {
        this.fieldName = field;
        this.validatorState = validator;
    }
    Object.defineProperty(FieldValidationBuilder.prototype, "fieldNameString", {
        get: function () {
            if (typeof this.fieldName === 'string')
                return this.fieldName;
            throw new Error("" + typeof this.fieldName);
        },
        enumerable: false,
        configurable: true
    });
    FieldValidationBuilder.prototype.check = function (action, message) {
        var _a = this.validatorState, item = _a.item, stack = _a.stack;
        stack.push(new RuleStackItem(this.fieldNameString, function () { return action(item); }, message));
        return this;
    };
    // compareWithField<K extends keyof T>(fieldName: K, comparer: CompareType) {
    //   return this
    // }
    // null(message?: string): this {
    //   return this
    // }
    FieldValidationBuilder.prototype.breakIf = function () {
        return this;
    };
    FieldValidationBuilder.prototype.break = function () {
        this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString, true));
        return this;
    };
    FieldValidationBuilder.prototype.breakChain = function () {
        this.validatorState.stack.items.push(new BlockStackItem(this.fieldNameString, false));
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
        var _this = this;
        return this.check(function (obj) { return !!obj[_this.fieldNameString]; }, message || this.fieldNameString + ": is empty");
    };
    StringFieldValidationBuilder.prototype.maxLength = function (num, message) {
        var _a = this.validatorState, item = _a.item, stack = _a.stack;
        var value = item[this.fieldNameString];
        stack.push(new RuleStackItem(this.fieldNameString, function () { return value.length < num; }, message || this.fieldNameString + ": max length is " + num));
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
        var _a = this.validatorState, item = _a.item, stack = _a.stack;
        var value = item[this.fieldNameString];
        stack.push(new RuleStackItem(this.fieldNameString, function () { return value >= start && value <= end; }, message || this.fieldNameString + ": out of range (" + start + ":" + end + ")"));
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
        callback(new CaseTypes(this.fieldName, this.validatorState));
    };
    return ArrayFieldValidationBuilder;
}(FieldValidationBuilder));
var EntityFieldValidationBuilder = /** @class */ (function (_super) {
    __extends(EntityFieldValidationBuilder, _super);
    function EntityFieldValidationBuilder(field, validator) {
        return _super.call(this, field, validator) || this;
    }
    EntityFieldValidationBuilder.prototype.use = function (type) {
        new type().validate(this.validatorState.item);
        return this;
    };
    return EntityFieldValidationBuilder;
}(FieldValidationBuilder));
var CaseTypes = /** @class */ (function () {
    function CaseTypes(field, validator) {
        this.field = field;
        this.validatorState = validator;
        this.validatorState.state.setValue(field.toString(), new StateItem());
    }
    CaseTypes.prototype.isString = function () {
        return new StringFieldValidationBuilder(this.field, this.validatorState);
    };
    CaseTypes.prototype.isNumber = function () {
        return new NumberFieldValidationBuilder(this.field, this.validatorState);
    };
    CaseTypes.prototype.isArray = function () {
        return new ArrayFieldValidationBuilder(this.field, this.validatorState);
    };
    CaseTypes.prototype.isEntity = function () {
        return new EntityFieldValidationBuilder(this.field, this.validatorState);
    };
    return CaseTypes;
}());
exports.CaseTypes = CaseTypes;
var RulesBuilder = /** @class */ (function () {
    function RulesBuilder(validatorState) {
        this.validatorState = validatorState;
    }
    RulesBuilder.prototype.add = function (fieldName) {
        return new CaseTypes(fieldName, this.validatorState);
    };
    return RulesBuilder;
}());
exports.RulesBuilder = RulesBuilder;
// type CompareType = 'equal' | 'more' | 'less'
// function ddd(a: CompareType) {}
// ddd('equal')
