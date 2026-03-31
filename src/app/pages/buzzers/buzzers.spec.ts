import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buzzers } from './buzzers';

describe('Buzzers', () => {
  let component: Buzzers;
  let fixture: ComponentFixture<Buzzers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buzzers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buzzers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
