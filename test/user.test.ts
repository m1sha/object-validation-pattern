import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'

class SignIn {
    login: string
    password: string

    constructor(){
        this.login = ""
        this.password = ""
    }
}

class SignUp extends SignIn {
    email: string
    confirmPassword: string

    constructor(){
        super()
        this.email = ""
        this.confirmPassword = ""
    }
}

abstract class SignBaseValidator<T extends SignIn> extends ObjectValidator<T>{
    protected setRules(rules: RulesBuilder<T>): void {
        rules.add("login").isString().notEmpty()
    }
}

class SignInValidator extends SignBaseValidator<SignIn>{
}

class SignUpValidator extends SignBaseValidator<SignUp>{
}

test("user entities", ()=>{
    const signUp = new SignUp()
    signUp.login = "sa"

    const state = StateObject.create(SignUp)
    const signUpValidator = new SignUpValidator(state)
    signUpValidator.validate(signUp)
    expect(state.isValid).toBeTruthy()
})

test("user entities", ()=>{
    const signIn = new SignIn()
    signIn.login = "sa"

    const state = StateObject.create(SignIn)
    const signUpValidator = new SignInValidator(state)
    signUpValidator.validate(signIn)
    expect(state.isValid).toBeTruthy()
})