import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLoaderComponent } from './page-loader.component';
import {TranslateModule} from "@ngx-translate/core";

describe('PageLoaderComponent', () => {
  let component: PageLoaderComponent;
  let fixture: ComponentFixture<PageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLoaderComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
