import {Component, OnInit} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.scss',
})
export class PageLoaderComponent implements OnInit {
  protected isLoading: boolean = true;

  ngOnInit(): void {
    window.addEventListener('load', (): void => { this.isLoading = false; });
  }
}
