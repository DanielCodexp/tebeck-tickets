export interface Authenticated {
    res?: boolean;
    user?: string;
}
export interface User {
    name: string;
    lastName: string;
    email: string;
    userType: string;
    uid: string;
    password: string;
}