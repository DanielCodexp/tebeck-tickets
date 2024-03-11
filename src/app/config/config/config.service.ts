import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  public handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      return throwError(() => new CustomHttpError(error.error.data, "UnknownError", ErrorType.other));
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);

      if (error.error.message == "SW Api Error") {
        return throwError(() => new CustomHttpError(error.error.SWDetails, "SW Api Error", ErrorType.sw));
      }
    }
    return throwError(() => new CustomHttpError({}, "UnknownError", ErrorType.other));

  }


}

export class CustomHttpError extends Error {
  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey!: string;
  handled: boolean = false;
  data!: object;
  type: ErrorType;

  constructor(data: object, message?: string, errorType?: ErrorType) {
    super(message);
    this.data = data;
    this.type = errorType ?? ErrorType.other;
    this.name = CustomHttpError.name;
    Object.setPrototypeOf(this, CustomHttpError.prototype);
  }
}

export enum ErrorType {
  sw,
  other
}

interface HttpError {
  type: ErrorType,
  message: string,
  data: Object
  messageDetail: string | null
}