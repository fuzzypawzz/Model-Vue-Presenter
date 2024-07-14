import {getCurrentScope, onScopeDispose} from "vue";

export function tryOnScopeDispose(fn: () => void) {
    if (getCurrentScope()) onScopeDispose(fn)
}