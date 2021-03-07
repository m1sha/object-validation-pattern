[![Build Status](https://travis-ci.com/m1sha/object-validation-pattern.svg?branch=master)](https://travis-ci.com/m1sha/object-validation-pattern)
[![Coverage Status](https://coveralls.io/repos/github/m1sha/object-validation-pattern/badge.svg?branch=master)](https://coveralls.io/github/m1sha/object-validation-pattern?branch=master)

# Object Validation Pattern

## Simplest Usage

```typescript
interface SignUp {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const stateModel = new StateModel<SignUp>()

const validator = validatorFactory (stateModel, rules => {
  rules.add("name").isString().notEmpty()
    .checkAsync(async (_, __, value) => 
    !(await userService.userExists(value)),
      "$name: The user name $value is already exists")  
  
  rules.add("email").isString().notEmpty().isEmail()
      
  rules.add("password").isString().notEmpty()  
  
  rules.add("confirmPassword").isString().notEmpty()
         .compareWithField("password", "equal", 
          "The password and the confirm password fields are not same")
})

async function validate(signUp: SignUp) {
  // For validate the whole data: await validator.validate(signUp) 
  await validator.validateField(signUp, "confirmPassword")
  console.log(stateModel.isValid) 
  console.log(stateModel.getItem("confirmPassword")) 
}

validate({
  name: "User name",
  email: "username@someexampleserver.com",
  password: "password",
  confirmPassword: "passw0rd"
})
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