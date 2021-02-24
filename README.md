# Object Validation pattern

```typescript

interface SignUpModel {
    name: string
    email: string
    password: string
    confirmPassword: string
}

class SignUpValidator extends ObjectValidator<SignUpModel> {
    constructor(state: ObjectState){
        super(state)
    }

    setRules(rules: RulesBuilder<TestDTO>): void{ 
        rules
            .add("name")
            .isString()
            .notEmpty()
            .breakChain()
            .minLength(3)
            .maxLength(10)
            .breakChain()
            .check(async (_, name) => await !userService.userExists(name), "user already exists")

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
            .compareWithField("password", "equal", "The password and the confirm password fields are not same")
           
    }
}

...

const model = {
    name: "User name",
    email: "username@someexampleserver.com",
    password: "password",
    confirmPassword: "passw0rd"
}

const modelState = StateObject.create(SignUpModel)
const validator = new SignUpValidator(modelState)
validator.validate(model)

console.log(modelState.isValid) 
console.log(modelState.state) 

/*
Output:

false

[
    "confirmPassword": [
        { 
            "valid": false, 
            "text": "The password and the confirm password fields are not same"
        }
    ]
]

*/
...

```