import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { EmbedDesignComponent } from './embed-design.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {defer} from "rxjs";
import {EmbedConfig} from "../../../../services/types/Config";

describe('EmbedDesignComponent', () => {
  let component: EmbedDesignComponent;
  let fixture: ComponentFixture<EmbedDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedDesignComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmbedDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component['dataService'].allowDataFetch.next(true);
    expect(component).toBeTruthy();
  });

  it('should call getEventConfig with correct parameters when refreshing cache', () => {
    const getEventConfigSpy = jest.spyOn(component['dataService'], 'getEventConfig');
    component['refreshCache']();

    expect(getEventConfigSpy).toHaveBeenCalledWith(component['apiService'], component['comService'], true);
    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
  });

  it('should re-enable cache button after timeout when refreshing cache', () => {
    jest.useFakeTimers();
    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);

    jest.advanceTimersByTime(15000);

    expect(component['disabledCacheBtn']).toBe(false);
    jest.useRealTimers();
  });

  it('should return early if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const spy = jest.spyOn(component['apiService'], 'saveEmbedConfig');
    (component as any).saveGiftConfig({} as any);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show error and return if embed_config has invalid images', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1', name: 'Guild' } as any;
    const embed_config = { thumbnail_invalid: true, banner_invalid: false } as any;
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).saveGiftConfig(embed_config);

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(true);
    tick(3000);
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should call saveEmbedConfig, update embed_config, show success alert and store config on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1', name: 'Guild' } as any;
    const embed_config = { color_code: '#ff0000', thumbnail_invalid: false, banner_invalid: false } as any;
    const changed_config = { ...embed_config, color_code: 16711680 };
    jest.spyOn(component['apiService'], 'saveEmbedConfig').mockReturnValue(defer(() => Promise.resolve(changed_config)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    localStorage.removeItem('gift_config');

    (component as any).saveGiftConfig(embed_config);
    tick(3002);

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_GIVEAWAY_EMBED_SAVED_TITLE'),
      expect.any(String)
    );
    expect(component['dataService'].embed_config.color_code).toMatch(/^#\w{6}$/);
    expect(localStorage.getItem('gift_config')).toBe(JSON.stringify(changed_config));
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should prepend # if value does not start with # and remove extra #', () => {
    const event = { target: { value: 'ff00ff' } } as unknown as Event;
    component.verifyEmbedColor(event);
    expect((event.target as HTMLInputElement).value).toBe('#ff00ff');
  });

  it('should allow only alphanumeric characters and #', () => {
    const event = { target: { value: '#ff00ff!!@@' } } as unknown as Event;
    component.verifyEmbedColor(event);
    expect((event.target as HTMLInputElement).value).toBe('#ff00ff');
  });

  it('should not add extra # if already present', () => {
    const event = { target: { value: '##ff00ff' } } as unknown as Event;
    component.verifyEmbedColor(event);
    expect((event.target as HTMLInputElement).value).toBe('#ff00ff');
  });

  it('should keep value unchanged if already valid', () => {
    const event = { target: { value: '#abcdef' } } as unknown as Event;
    component.verifyEmbedColor(event);
    expect((event.target as HTMLInputElement).value).toBe('#abcdef');
  });

  it('should handle empty input gracefully', () => {
    const event = { target: { value: '' } } as unknown as Event;
    component.verifyEmbedColor(event);
    expect((event.target as HTMLInputElement).value).toBe('#');
  });

  it('should show invalid emoji alert on error 404 or 400', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1', name: 'Guild' } as any;
    const embed_config = { thumbnail_invalid: false, banner_invalid: false } as any;
    jest.spyOn(component['apiService'], 'saveEmbedConfig').mockReturnValue(defer(() => Promise.reject({ status: 404 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    (component as any).saveGiftConfig(embed_config);
    tick();
    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_GIVEAWAY_EMBED_INVALID_EMOJI_TITLE'),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should call redirectLoginError on error 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1', name: 'Guild' } as any;
    const embed_config = { thumbnail_invalid: false, banner_invalid: false } as any;
    jest.spyOn(component['apiService'], 'saveEmbedConfig').mockReturnValue(defer(() => Promise.reject({ status: 429 })));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).saveGiftConfig(embed_config);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should show unknown error alert on other errors', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1', name: 'Guild' } as any;
    const embed_config = { thumbnail_invalid: false, banner_invalid: false } as any;
    jest.spyOn(component['apiService'], 'saveEmbedConfig').mockReturnValue(defer(() => Promise.reject({ status: 500 })));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).saveGiftConfig(embed_config);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_UNKNOWN_TITLE'),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should set thumbnail_url or banner_url to null if input is empty', () => {
    component['dataService'].embed_config = { thumbnail_url: 'test', banner_url: 'test' } as any;

    const thumbEvent = { target: { value: '' } } as unknown as Event;
    component.verifyEmbedImage(thumbEvent, false);
    expect(component['dataService'].embed_config.thumbnail_url).toBeNull();

    const bannerEvent = { target: { value: '' } } as unknown as Event;
    component.verifyEmbedImage(bannerEvent, true);
    expect(component['dataService'].embed_config.banner_url).toBeNull();
  });

  it('should set thumbnail_invalid or banner_invalid to true if url is invalid', () => {
    component['dataService'].embed_config = {} as any;

    const thumbEvent = { target: { value: 'invalid-url' } } as unknown as Event;
    component.verifyEmbedImage(thumbEvent, false);
    expect(component['dataService'].embed_config.thumbnail_invalid).toBe(true);

    const bannerEvent = { target: { value: 'ftp://image.bmp' } } as unknown as Event;
    component.verifyEmbedImage(bannerEvent, true);
    expect(component['dataService'].embed_config.banner_invalid).toBe(true);
  });

  it('should set thumbnail_invalid or banner_invalid to false on successful image load', () => {
    component['dataService'].embed_config = {} as any;
    const url = 'https://example.com/image.png';
    const event = { target: { value: url } } as unknown as Event;

    // Mock Image
    const mockImage = {
      set src(value: string) {
        setTimeout(() => { this.onload(); }, 0);
      },
      onload: jest.fn(),
      onerror: jest.fn()
    };
    jest.spyOn(window as any, 'Image').mockImplementation(() => mockImage);

    component.verifyEmbedImage(event, false);
    mockImage.onload();
    expect(component['dataService'].embed_config.thumbnail_invalid).toBe(false);

    component.verifyEmbedImage(event, true);
    mockImage.onload();
    expect(component['dataService'].embed_config.banner_invalid).toBe(false);

    (window as any).Image.mockRestore();
  });

  it('should set thumbnail_invalid or banner_invalid to true on image load error', () => {
    component['dataService'].embed_config = {} as any;
    const url = 'https://example.com/image.png';
    const event = { target: { value: url } } as unknown as Event;

    // Mock Image
    const mockImage = {
      set src(value: string) {
        setTimeout(() => { this.onerror(); }, 0);
      },
      onload: jest.fn(),
      onerror: jest.fn()
    };
    jest.spyOn(window as any, 'Image').mockImplementation(() => mockImage);

    component.verifyEmbedImage(event, false);
    mockImage.onerror();
    expect(component['dataService'].embed_config.thumbnail_invalid).toBe(true);

    component.verifyEmbedImage(event, true);
    mockImage.onerror();
    expect(component['dataService'].embed_config.banner_invalid).toBe(true);

    (window as any).Image.mockRestore();
  });

  it('should set emoji_reaction to string if emoji is a string', () => {
    component['dataService'].embed_config = {} as any;
    (component as any).verifyEmbedEmoji('😀');
    expect(component['dataService'].embed_config.emoji_reaction).toBe('😀');
  });

  it('should set emoji_reaction to custom emoji format if emoji is an Emoji object (animated)', () => {
    component['dataService'].embed_config = {} as any;
    const emoji = { name: 'party', id: '12345', animated: true } as any;
    (component as any).verifyEmbedEmoji(emoji);
    expect(component['dataService'].embed_config.emoji_reaction).toBe('<a:party:12345>');
  });

  it('should set emoji_reaction to custom emoji format if emoji is an Emoji object (not animated)', () => {
    component['dataService'].embed_config = {} as any;
    const emoji = { name: 'smile', id: '67890', animated: false } as any;
    (component as any).verifyEmbedEmoji(emoji);
    expect(component['dataService'].embed_config.emoji_reaction).toBe('<:smile:67890>');
  });


  //
  //    TESTING THE RANDOM ALGORITHM IS VERY TRICKY, SO WE NEED TO TEST IT MULTIPLE TIMES TO ENSURE IT WORKS AS EXPECTED
  //


  it('should set embed_config to a configuration from shuffle_configs', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    let found = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (component['dataService'].embed_config) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
    spy.mockRestore();
  });

  it('should set a valid hex color code', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    let valid = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (/^#[0-9a-f]{6}$/.test(<string>component['dataService'].embed_config.color_code!)) {
        valid = true;
        break;
      }
    }
    expect(valid).toBe(true);
  });

  it('should set emoji_reaction to null with 10% probability', () => {
    component['dataService'].guild_emojis = Array(20).fill({ name: 'test', id: '123', animated: false });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.05); // < 0.1 for emoji null chance
    let found = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (component['dataService'].embed_config.emoji_reaction === null) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
    randomSpy.mockRestore();
  });

  it('should set random emoji_reaction with 90% probability', () => {
    component['dataService'].guild_emojis = Array(20).fill({ name: 'test', id: '123', animated: false });
    const verifyEmoji = jest.spyOn(component as any, 'verifyEmbedEmoji');
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    let called = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (verifyEmoji.mock.calls.length > 0) {
        called = true;
        break;
      }
    }
    expect(called).toBe(true);
  });

  it('should not set emoji_reaction if guild_emojis is empty', () => {
    component['dataService'].guild_emojis = [];
    const verifyEmoji = jest.spyOn(component as any, 'verifyEmbedEmoji');
    let called = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (verifyEmoji.mock.calls.length > 0) {
        called = true;
        break;
      }
    }
    expect(called).toBe(false);
  });

  it('should not set emoji_reaction if guild_emojis has less than 20 emojis', () => {
    component['dataService'].guild_emojis = Array(19).fill({ name: 'test', id: '123', animated: false });
    const verifyEmoji = jest.spyOn(component as any, 'verifyEmbedEmoji');
    let called = false;
    for (let i = 0; i < 10; i++) {
      component.shuffleConfigs();
      if (verifyEmoji.mock.calls.length > 0) {
        called = true;
        break;
      }
    }
    expect(called).toBe(false);
  });

  it('should return false when embed_config is null', () => {
    component['dataService'].embed_config = null as any;
    expect(component.isConfigChanged()).toBe(false);
  });

  it('should return true when configs are different', () => {
    component['dataService'].embed_config = { color_code: '#ff0000', banner_invalid: true, thumbnail_invalid: true } as EmbedConfig;
    component['dataService'].org_config = { color_code: '#00ff00', banner_invalid: false, thumbnail_invalid: false } as EmbedConfig;
    expect(component.isConfigChanged()).toBe(true);
  });

  it('should return false when configs are the same ignoring invalid flags', () => {
    component['dataService'].embed_config = { color_code: '#ff0000', banner_invalid: true, thumbnail_invalid: true } as EmbedConfig;
    component['dataService'].org_config = { color_code: '#ff0000', banner_invalid: false, thumbnail_invalid: false } as EmbedConfig;
    expect(component.isConfigChanged()).toBe(false);
  });

  it('should return true when org_config is undefined', () => {
    component['dataService'].embed_config = { color_code: '#ff0000', banner_invalid: false, thumbnail_invalid: false } as EmbedConfig;
    component['dataService'].org_config = undefined as any;
    expect(component.isConfigChanged()).toBe(true);
  });

  it('should properly compare complex configurations', () => {
    component['dataService'].embed_config = {
      color_code: '#ff0000',
      banner_invalid: true,
      thumbnail_invalid: true,
      emoji_reaction: '😀',
      banner_url: 'https://example.com/banner.png'
    } as EmbedConfig;
    component['dataService'].org_config = {
      color_code: '#ff0000',
      banner_invalid: false,
      thumbnail_invalid: false,
      emoji_reaction: '😀',
      banner_url: 'https://example.com/banner.png'
    } as EmbedConfig;
    expect(component.isConfigChanged()).toBe(false);

    component['dataService'].embed_config.emoji_reaction = '🎉';
    expect(component.isConfigChanged()).toBe(true);
  });


});
