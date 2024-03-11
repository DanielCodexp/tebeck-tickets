import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  private titleSectionPrivate: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private subtitleSectionPrivate: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private locationBackPrivate: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {}

  get titleSection() {
    return this.titleSectionPrivate.asObservable();
  }

  set titleSectionData(titleSection: string) {
    this.titleSectionPrivate.next(titleSection);
  }

  get locationBack() {
    return this.locationBackPrivate.asObservable();
  }

  set locationBackRoute(route: string) {
    this.locationBackPrivate.next(route);
  }

  get subtitleSection() {
    return this.subtitleSectionPrivate.asObservable();
  }

  set subtitleSectionData(titleSection: string) {
    this.subtitleSectionPrivate.next(titleSection);
  }
}
