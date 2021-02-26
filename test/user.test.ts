import { ObjectValidator, RulesBuilder, StateObject } from '../src/index'

interface SignIn {
    login: string
    password: string
}

interface SignUp extends SignIn {
    email: string
    confirmPassword: string
}

abstract class SignBaseValidator<T extends SignIn> extends ObjectValidator<T>{
    protected setRules(rules: RulesBuilder<T>): void {
        rules.add("login").isString().notEmpty()
    }
}

class SignInValidator extends SignBaseValidator<SignIn>{
}

class SignUpValidator extends SignBaseValidator<SignUp>{
    protected setRules(rules: RulesBuilder<SignUp>): void {
        super.setRules(rules)
        rules.add("confirmPassword").isString().notEmpty().breakChain().compareWithField("password", "equal", "passwords aren't equal")
    }
}

test("user entities", async () => {
    const signUp = {
        login : "sa",
        password: "password",
        confirmPassword: "password",
        email: ""
    }

    const state = new StateObject()
    const signUpValidator = new SignUpValidator(state)
    await signUpValidator.validate(signUp)
    expect(state.isValid()).toBeTruthy()
})

test("user entities", async () => {
    const signIn = {
        login : "",
        password: "",
    }

    const state = new StateObject()
    const signUpValidator = new SignInValidator(state)
    await signUpValidator.validate(signIn)
    expect(state.isValid()).toBeFalsy()
})