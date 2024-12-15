import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLoaderComponent } from './page-loader.component';

describe('PageLoaderComponent', () => {
  let component: PageLoaderComponent;
  let fixture: ComponentFixture<PageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading to false when window load event is fired', () => {
    expect((component as any).isLoading).toBe(true);

    window.dispatchEvent(new Event('load'));

    expect((component as any).isLoading).toBe(false);
  });
});
