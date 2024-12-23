import {Component} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {DataHolderService} from "../../services/data/data-holder.service";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  navigation = [
    {
      category: "Analytics",
      pages: [
        { title: "Dashboard", icon: "" },
        { title: "Statistics", icon: "" }
      ]
    },
    {
      category: "Dashboard",
      pages: [
        { title: "Dashboard", icon: "" },
        { title: "Statistics", icon: "" }
      ]
    }
  ];

  constructor(protected authService: AuthService, private dataService: DataHolderService) {
    this.dataService.isLoading = false;

    this.authService.discordLogin();
  }

}
