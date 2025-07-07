import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordMarkdownComponent } from './discord-markdown.component';
import {TranslateModule} from "@ngx-translate/core";
import {Giveaway} from "../../../../../services/types/Events";

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

  it('should return "diamond_pink.gif" if giveaway is null', () => {
    component.giveaway = null;
    expect(component['getPrizeEmoji']('classic')).toBe('diamond_pink.gif');
  });

  it('should return correct emoji for prize keywords', () => {
    component.giveaway = {} as Giveaway;
    expect(component['getPrizeEmoji']('classic')).toBe('ad1.gif');
    expect(component['getPrizeEmoji']('basic')).toBe('ad1.gif');
    expect(component['getPrizeEmoji']('nitro')).toBe('nitro_boost.gif');
    expect(component['getPrizeEmoji']('server')).toBe('dsh.png');
    expect(component['getPrizeEmoji']('casino')).toBe('chip.png');
    expect(component['getPrizeEmoji']('banner')).toBe('banner.gif');
    expect(component['getPrizeEmoji']('profile avatar')).toBe('banner.gif');
    expect(component['getPrizeEmoji']('paypal')).toBe('money.gif');
    expect(component['getPrizeEmoji']('giftcard')).toBe('money.gif');
    expect(component['getPrizeEmoji']('amazon')).toBe('money.gif');
    expect(component['getPrizeEmoji']('gutschein')).toBe('money.gif');
    expect(component['getPrizeEmoji']('paysafecard')).toBe('money.gif');
    expect(component['getPrizeEmoji']('psc')).toBe('money.gif');
    expect(component['getPrizeEmoji']('euro')).toBe('money.gif');
    expect(component['getPrizeEmoji']('dollar')).toBe('money.gif');
    expect(component['getPrizeEmoji']('guthaben')).toBe('money.gif');
  });

  it('should return "diamond_pink.gif" if no keyword matches', () => {
    component.giveaway = {} as Giveaway;
    expect(component['getPrizeEmoji']('unknown prize')).toBe('diamond_pink.gif');
  });

  it('should be case-insensitive when matching keywords', () => {
    component.giveaway = {} as Giveaway;
    expect(component['getPrizeEmoji']('NiTrO')).toBe('nitro_boost.gif');
    expect(component['getPrizeEmoji']('PAYPAL')).toBe('money.gif');
  });

  it('should return default color if color_code is null', () => {
    expect(component.getEventEmbedColor(null)).toBe('#706fd3');
  });

  it('should return default color if color_code is undefined', () => {
    expect(component.getEventEmbedColor(undefined as unknown as number | string | null)).toBe('#706fd3');
  });

  it('should convert number color_code to hex string with # and uppercase', () => {
    expect(component.getEventEmbedColor(123456)).toBe('#01E240');
    expect(component.getEventEmbedColor(16777215)).toBe('#FFFFFF');
  });

  it('should pad hex string to 6 digits if necessary', () => {
    expect(component.getEventEmbedColor(255)).toBe('#0000FF');
    expect(component.getEventEmbedColor(4095)).toBe('#000FFF');
  });

  it('should return string color_code as is', () => {
    expect(component.getEventEmbedColor('#abcdef')).toBe('#abcdef');
    expect(component.getEventEmbedColor('red')).toBe('red');
  });
});
