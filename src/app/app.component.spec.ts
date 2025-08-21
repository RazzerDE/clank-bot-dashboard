import { ComponentFixture, TestBed } from '@angular/core/testing';
import {AppComponent} from "./app.component";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {PLATFORM_ID} from "@angular/core";
import {Location} from "@angular/common";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [{ provide: ActivatedRoute, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should update seo if SSR and lang is not de", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [Location, { provide: PLATFORM_ID, useValue: 'server' }]
    }).compileComponents();

    const updateSEOSpy = jest.spyOn(AppComponent.prototype as any, 'updateSEO');
    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    expect(updateSEOSpy).toHaveBeenCalled();
  })

  it('should set correct meta tags and title for English SEO', () => {
    const setTitleSpy = jest.spyOn(component['title'], 'setTitle');
    const updateTagSpy = jest.spyOn(component['meta'], 'updateTag');
    let link = document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));

    component['updateSEO']();

    expect(setTitleSpy).toHaveBeenCalledWith('This is Clank ~ Clank Discord-Bot');
    expect(updateTagSpy).toHaveBeenCalledWith({name: 'twitter:title', content: 'This is Clank ~ Clank Discord-Bot'});
    expect(updateTagSpy).toHaveBeenCalledWith({
      name: 'description',
      content: expect.stringContaining('Clank is the heart of your Discord server')
    });
    expect(updateTagSpy).toHaveBeenCalledWith({
      property: 'og:description',
      content: expect.stringContaining('Clank is the heart of your Discord server')
    });
    expect(updateTagSpy).toHaveBeenCalledWith({
      name: 'twitter:description',
      content: expect.stringContaining('Clank is the heart of your Discord server')
    });
    expect(updateTagSpy).toHaveBeenCalledWith({property: 'og:locale', content: 'en_US'});
    expect(link.href).toBe('https://clank.dev/');

    link.remove();
  });

  it('should set canonical link to /de if isGerman is true', () => {
    let link = document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));

    component['updateSEO'](true);

    expect(link.href).toBe('https://clank.dev/de');

    link.remove();
  });
});
