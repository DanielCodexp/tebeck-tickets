export interface Admin {
    _id?: string;
    uid?: string;
    name: string;
    photoURL: string;
    phone: string;
    email: string;
    password?: string;
    userType: string;
    creationDate: Date;
}