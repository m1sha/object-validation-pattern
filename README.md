[![Build Status](https://travis-ci.com/m1sha/object-validation-pattern.svg?branch=master)](https://travis-ci.com/m1sha/object-validation-pattern)
[![Coverage Status](https://coveralls.io/repos/github/m1sha/object-validation-pattern/badge.svg?branch=master)](https://coveralls.io/github/m1sha/object-validation-pattern?branch=master)

# Object Validation Pattern

## Simplest Usage

Create a class for an entity, for example like that's that below
```typescript
interface SignUp {
    name: string
    email: string
    password: string
    confirmPassword: string
}
```

Create a class that'll contain validation scheme for the entity class

```typescript
class SignUpValidator extends ObjectValidator<SignUp> {
    setRules(rules: RulesBuilder<SignUp>): void { 
        rules
            .add("name")
            .isString()
            .notEmpty()
            .minLength(3)
            .maxLength(10)
            .checkAsync(async (_, __, value) => 
                !(await userService.userExists(value)),
                "$name: The user name $value is already exists")

        rules
            .add("email")
            .isString()
            .notEmpty()
            .isEmail()
        
        rules
            .add("password")
            .isString()
            .notEmpty()

        rules
            .add("confirmPassword")
            .isString()
            .notEmpty()
            .compareWithField("password", "equal", 
                "The password and the confirm password fields are not same")
    }
}
```


Create an instance is implemented by the SignUp interface and define the StateModel and the Validator instances
```typescript
const model = {
    name: "User name",
    email: "username@someexampleserver.com",
    password: "password",
    confirmPassword: "passw0rd"
}

const stateModel = new StateModel<SignUp>()
const validator = new SignUpValidator(stateModel)
```

Execute somewhere in a code
```typescript
async function validate() {
    // For validate the whole model: await validator.validate(model) 
    await validator.validateField(model, "confirmPassword")
    console.log(stateModel.isValid) 
    console.log(stateModel.getItem("confirmPassword")) 
}
```

Output:
```bash
false

{ 
    "valid": false, 
    "text": "The password and the confirm password fields are not same"
}
```

## Custom validation extension

1. use an import "object-validator-pattern/lib/extensions"
2. [How can I do custom validation extension](docs/CustomExtensions.md)