import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendeleslistazComponent } from './rendeleslistaz.component';

describe('RendeleslistazComponent', () => {
  let component: RendeleslistazComponent;
  let fixture: ComponentFixture<RendeleslistazComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendeleslistazComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendeleslistazComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
