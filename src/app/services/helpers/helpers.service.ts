import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  public minLengthArray(min: number) {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value.length >= min)
        return null;

      return { 'minLengthArray': { valid: false } };
    }
  }
}
