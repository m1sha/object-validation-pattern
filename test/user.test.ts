import { ObjectValidator } from '../src/object-validator'
import { RulesBuilder } from '../src/rules-builder'
import { StateModel } from "../src/state-model"
import "../src/extensions"

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
        rules.add("login").isString().notEmpty().breakChain()
    }
}

class SignInValidator extends SignBaseValidator<SignIn>{
}

class SignUpValidator extends SignBaseValidator<SignUp>{
    protected setRules(rules: RulesBuilder<SignUp>): void {
        super.setRules(rules)
        rules.add("login").isString().checkAsync(async (_,__, v)=> !(await UserService.nameExits(v)), "user name already exist")
        rules.add("email").isString().notEmpty().breakChain().isEmail()
        rules.add("confirmPassword").isString().notEmpty().breakChain().compareWithField("password", "equals", "passwords aren't equal")
    }
}

class UserService {
    static nameExits(name: string): Promise<boolean>{
        return new Promise<boolean>((resolve, reject)=>{
            setTimeout(() => {
                try {
                    resolve(name!==name)
                }
                catch(e){
                    reject(e)
                }
            }, 300);
        })
    }
}

test("user entities", async () => {
    const signUp = {
        login : "sa",
        password: "password",
        confirmPassword: "password",
        email: "ss@dd.ru"
    }

    const state = new StateModel<SignUp>()
    const signUpValidator = new SignUpValidator(state)
    await signUpValidator.validate(signUp)
    expect(state.isValid()).toBeTruthy()
})

test("user entities", async () => {
    const signIn = {
        login : "",
        password: "",
    }

    const state = new StateModel<SignIn>()
    const signUpValidator = new SignInValidator(state)
    await signUpValidator.validate(signIn)
    expect(state.isValid()).toBeFalsy()
})