import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {TranslatePipe} from "@ngx-translate/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";
import {NgClass} from "@angular/common";
import {faCircleExclamation, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {SecurityFeature} from "../../../services/types/Security";
import {DataHolderService} from "../../../services/data/data-holder.service";

@Component({
  selector: 'app-drag-n-drop',
  imports: [
    TranslatePipe,
    FaIconComponent,
    NgClass,
    CdkDropList,
    CdkDrag
  ],
  templateUrl: './drag-n-drop.component.html',
  styleUrl: './drag-n-drop.component.scss'
})
export class DragNDropComponent {
  @Input() security_features: SecurityFeature[] = [];
  @Input() enabledFeatures: SecurityFeature[] = [];
  @Input() disabledFeatures: SecurityFeature[] = [];
  @Input() org_features: SecurityFeature[] = [];
  @Input() disabledSendBtn: boolean = false;
  @Input() refresh_data_function: (no_cache?: boolean) => void = (): void => {};

  @Output() openConfirmModal = new EventEmitter<{ type: number, btn: any }>();
  @Output() saveAction: EventEmitter<SecurityFeature[]> = new EventEmitter<SecurityFeature[]>();

  protected isDragging: boolean = false;
  protected disabledCacheBtn: boolean = false;
  protected dragOrigin: 'enabled' | 'disabled' | null = null;

  protected readonly faSave: IconDefinition = faSave;
  protected readonly faRefresh: IconDefinition = faRefresh;
  protected readonly faCircleExclamation: IconDefinition = faCircleExclamation;

  constructor(protected dataService: DataHolderService) {}

  /**
   * Handles drag-and-drop events for security features.
   *
   * Moves items within the same list or between enabled/disabled lists,
   * updates the enabled state of the moved item, and refreshes the filtered lists.
   *
   * @param event - Drag-and-drop event containing source and destination containers and indices.
   */
  protected drop(event: CdkDragDrop<SecurityFeature[]>): void {
    if (event.previousContainer === event.container) { // move in the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else { // move between lists
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      // change the enabled state of the moved item
      const movedItem: SecurityFeature = event.container.data[event.currentIndex];
      movedItem.enabled = event.container.data === this.enabledFeatures;
    }

    // sort arrays after moving items again
    this.enabledFeatures = this.security_features.filter(f => f.enabled);
    this.disabledFeatures = this.security_features.filter(f => !f.enabled);
  }

  /**
   * Refreshes the cache by disabling the cache button, setting the loading state,
   * and fetching the snippet data with the cache ignored. The cache button is re-enabled
   * after 30 seconds.
   */
  protected refreshCache(): void {
    this.disabledCacheBtn = true;
    this.dataService.isLoading = true;
    this.refresh_data_function(true);

    setTimeout((): void => { this.disabledCacheBtn = false; }, 30000);
  }

  /**
   * Checks if the current security features differ from the original features.
   * Uses JSON.stringify for deep comparison.
   * @returns true if there are differences, false otherwise.
   */
  protected hasSecurityFeatureChanges(): boolean {
    return JSON.stringify(this.security_features) !== JSON.stringify(this.org_features);
  }
}
