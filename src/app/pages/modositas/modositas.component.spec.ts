import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModositasComponent } from './modositas.component';

describe('ModositasComponent', () => {
  let component: ModositasComponent;
  let fixture: ComponentFixture<ModositasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModositasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModositasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
