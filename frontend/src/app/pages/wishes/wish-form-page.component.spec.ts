import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WishesApiService } from '../../core/wishes/wishes-api.service';
import { WishFormPageComponent } from './wish-form-page.component';

describe('WishFormPageComponent', () => {
  let fixture: ComponentFixture<WishFormPageComponent>;
  let component: WishFormPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishFormPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: WishesApiService,
          useValue: {
            get: () => of({}),
            create: () => of({ id: 'w1' }),
            update: () => of({ id: 'w1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires titulo', () => {
    component.form.patchValue({ titulo: '' });
    expect(component.formInvalid).toBeTrue();
    component.form.patchValue({ titulo: 'Hitchcock' });
    expect(component.formInvalid).toBeFalse();
  });

  it('renders add title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Añadir deseado');
  });
});
