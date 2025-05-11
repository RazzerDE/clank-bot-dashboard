import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordMarkdownComponent } from './discord-markdown.component';
import {TranslateModule} from "@ngx-translate/core";

describe('DiscordMarkdownComponent', () => {
  let component: DiscordMarkdownComponent;
  let fixture: ComponentFixture<DiscordMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordMarkdownComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
