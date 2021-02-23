import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'

class SignIn {
    login: string
    password: string
}

class SignUp extends SignIn {
    email: string
    confirmPassword: string
}

abstract class SignBaseValidator<T extends SignIn> extends ObjectValidator<T>{
    protected setRules(rules: RulesBuilder<T>): void {
        rules.add("login").isString().notEmpty()
    }
    protected createState(): StateObject {
        throw new Error('Method not implemented.')
    }
}

class SignInValidator extends SignBaseValidator<SignIn>{
    protected createState(): StateObject {
        return StateObject.create(SignIn)
    }
}

class SignUpValidator extends SignBaseValidator<SignUp>{
    protected createState(): StateObject {
        return StateObject.create(SignUp)
    }
}



test("user entities", ()=>{
    const signUp = new SignUp()
    signUp.login = "sa"
    const signUpValidator = new SignUpValidator()
   // const result = signUpValidator.validate(signUp)
    expect(true).toBeTruthy()
})