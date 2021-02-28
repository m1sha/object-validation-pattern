[![Build Status](https://travis-ci.com/m1sha/object-validation-pattern.svg?branch=master)](https://travis-ci.com/m1sha/object-validation-pattern)
[![Coverage Status](https://coveralls.io/repos/github/m1sha/object-validation-pattern/badge.svg?branch=master)](https://coveralls.io/github/m1sha/object-validation-pattern?branch=master)

# Object Validation Pattern

## Usage

```typescript
import { 
    ObjectValidator, 
    RulesBuilder, 
    StateObject 
} from 'object-validator-pattern'

interface SignUpModel {
    name: string
    email: string
    password: string
    confirmPassword: string
}

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

...

const model = {
    name: "User name",
    email: "username@someexampleserver.com",
    password: "password",
    confirmPassword: "passw0rd"
}

const modelState = new StateObject()
const validator = new SignUpValidator(modelState)

async function validate() {
    await validator.validate(model) 

    /*
    * or for the the field you can use 
    * await validator.validateField(model, "confirmPassword")
    */

    console.log(modelState.isValid) 
    console.log(modelState.items) 
}
/*
Output:

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

*/
```