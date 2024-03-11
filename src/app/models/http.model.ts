import { Observable } from "rxjs";

export interface DefaultResponse<T= any> {
    status: number;
    message: string;
    data: T,
    callStatus?: string;
}
