import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FomenuComponent } from './fomenu.component';

describe('FomenuComponent', () => {
  let component: FomenuComponent;
  let fixture: ComponentFixture<FomenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FomenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FomenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
