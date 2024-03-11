import { TestBed } from '@angular/core/testing';

import { InvoiceCalculationsService } from './invoice-calculations.service';

describe('InvoiceCalculationsService', () => {
  let service: InvoiceCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
