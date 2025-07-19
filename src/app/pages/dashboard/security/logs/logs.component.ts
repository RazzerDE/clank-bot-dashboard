import { Component } from '@angular/core';
import {AlertBoxComponent} from "../../../../structure/util/alert-box/alert-box.component";
import {DashboardLayoutComponent} from "../../../../structure/dashboard-layout/dashboard-layout.component";
import {PageThumbComponent} from "../../../../structure/util/page-thumb/page-thumb.component";
import {TranslatePipe} from "@ngx-translate/core";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {DragNDropComponent} from "../../../../structure/util/drag-n-drop/drag-n-drop.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faHashtag, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {initLogs, LogFeature, SecurityLogs} from "../../../../services/types/Security";
import {SelectComponent} from "../../../../structure/util/modal/templates/select/select.component";

@Component({
  selector: 'app-logs',
  imports: [
    AlertBoxComponent,
    DashboardLayoutComponent,
    PageThumbComponent,
    TranslatePipe,
    DragNDropComponent,
    FaIconComponent,
    SelectComponent
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent {
  protected readonly faHashtag: IconDefinition = faHashtag;
  // used to always have the same order of features

  protected security_logs: SecurityLogs = {channel_id: null, guild_thread_id: null, bot_thread_id: null, channel_roles_thread_id: null,
                                           message_thread_id: null, emoji_thread_id: null, join_leave_thread_id: null, unban_thread_id: null};

  // Angular - Drag and Drop feature lists
  protected log_list: LogFeature[] = initLogs;
  protected org_logs: LogFeature[] = JSON.parse(JSON.stringify(this.log_list));
  protected enabledFeatures: LogFeature[] = this.log_list.filter(f => f.enabled);
  protected disabledFeatures: LogFeature[] = this.log_list.filter(f => !f.enabled);

  constructor(protected dataService: DataHolderService) {
    document.title = 'Security Logs ~ Clank Discord-Bot';
    this.dataService.isLoading = false;
  }

}
