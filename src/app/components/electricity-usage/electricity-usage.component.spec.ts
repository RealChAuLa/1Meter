import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityUsageComponent } from './electricity-usage.component';

describe('ElectricityUsageComponent', () => {
  let component: ElectricityUsageComponent;
  let fixture: ComponentFixture<ElectricityUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectricityUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectricityUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
