export class User {
    constructor(
        private id: String,
        private displayName: String,
        private familyName: String,
        private givenName: String,
        private locale: String,
        private accessToken: String,
        private email: String,
        private picture: String
    ) { }
}