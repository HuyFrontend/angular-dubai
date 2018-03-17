import { AuthGuard } from './auth.guard';

const GLOBAL_GUARDS_PROVIDERS = [
    AuthGuard
]
export {
    AuthGuard,
    GLOBAL_GUARDS_PROVIDERS
}