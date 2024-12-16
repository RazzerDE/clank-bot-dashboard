import { ComponentFixture, TestBed } from '@angular/core/testing';
import {LandingSectionFeaturesComponent} from "./features.component";
import {TranslateModule} from "@ngx-translate/core";

describe('FeaturesComponent', () => {
  let component: LandingSectionFeaturesComponent;
  let fixture: ComponentFixture<LandingSectionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSectionFeaturesComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingSectionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle fullscreen mode for a video element', () => {
    const mockVideoElement: HTMLVideoElement = document.getElementById('discord-bot-ticket-tool') as HTMLVideoElement;
    (mockVideoElement as any).requestFullscreen = jest.fn().mockResolvedValue(undefined);
    component.toggleFullscreen('discord-bot-ticket-tool', new Event('click'));

    expect(mockVideoElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should toggle cursor-pointer class if event is not provided', () => {
    document.body.innerHTML = '<video id="video-id"></video>';
    const mockVideoElement: HTMLVideoElement = document.getElementById('video-id') as HTMLVideoElement;

    jest.spyOn(document, 'getElementById').mockReturnValue(mockVideoElement);

    component.toggleFullscreen('video-id');
    expect(mockVideoElement.classList.contains('cursor-pointer')).toBe(true);

    (document.getElementById as jest.Mock).mockRestore();
  });
});
