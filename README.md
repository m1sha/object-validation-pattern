[![Build Status](https://travis-ci.com/m1sha/object-validation-pattern.svg?branch=master)](https://travis-ci.com/m1sha/object-validation-pattern)
[![Coverage Status](https://coveralls.io/repos/github/m1sha/object-validation-pattern/badge.svg?branch=master)](https://coveralls.io/github/m1sha/object-validation-pattern?branch=master)

# Object Validation Pattern

⚠️ Waring!!! ⚠️

The library is in active development and has a lot of bugs. Use it for informational purposes only.

## Usage

Create a DTO class
```typescript
interface SignUpDTO {
    name: string
    email: string
    password: string
    confirmPassword: string
}
```

Create a validator for the DTO class

```typescript
class SignUpValidator extends ObjectValidator<SignUpModel> {
    constructor(state: ObjectState) {
        super(state)
    }

    setRules(rules: RulesBuilder<TestDTO>): void { 
        rules
            .add("name")
            .isString()
            .notEmpty()
            .breakChain()
            .minLength(3)
            .maxLength(10)
            .breakChain()
            .checkAsync(async (_, __, name) => 
                !(await userService.userExists(name)),
                "$name: The user $value already exists")

        rules
            .add("email")
            .isString()
            .notEmpty()
            .breakChain()
            .isEmail()
        
        rules
            .add("password")
            .isString()
            .notEmpty()

        rules
            .add("confirmPassword")
            .isString()
            .notEmpty()
            .breakChain()
            .compareWithField("password", "equal", 
                "The password and the confirm password fields are not same")
           
    }
}
```


Create an instance is implemented by the SignUpDTO interface and define the StateObject and the Validator instances
```typescript
const model = {
    name: "User name",
    email: "username@someexampleserver.com",
    password: "password",
    confirmPassword: "passw0rd"
}

const modelState = new StateObject()
const validator = new SignUpValidator(modelState)
```

Execute somewhere in a code
```typescript
async function validate() {
    await validator.validate(model) 

    /*
    * or for the the field you can use 
    * await validator.validateField(model, "confirmPassword")
    */

    console.log(modelState.isValid) 
    console.log(modelState.items) 
}
```

Output:
```bash
false
[
    "confirmPassword": [
        ...
        { 
            "valid": false, 
            "text": "The password and the confirm password fields are not same"
        }
    ]
]
```

## Custom validation extension

1. use an import "object-validator-pattern/lib/extensions"
2. [How can I do custom validation extension](docs/CustomExtensions.md)