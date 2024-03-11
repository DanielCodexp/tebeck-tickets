import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandlerService implements ErrorHandler {

  constructor(private zone: NgZone) { }

  handleError(error: unknown) {
    // this.zone.run(() => {
    //   // this.snackbar.open(
    //   //   'Error was detected! We are already working on it!',
    //   //   'Close',
    //   //   {
    //   //     duration: 2000
    //   //   }
    //   // );
    // })
    console.warn(`Caught by Custom Error Handler: `, error);
  }
}
