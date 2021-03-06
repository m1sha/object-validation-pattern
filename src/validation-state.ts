import { StateModel } from "./state-model";
import { ValidationQueue } from "./validation-queue";

export interface ValidationState<T> {
    target: T
    readonly queue: ValidationQueue
    readonly stateModel: StateModel<T>
}