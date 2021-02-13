import { Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  loading = false;

  constructor(private loaderService: LoaderService) {
    loaderService.isLoading.subscribe((loading: boolean) => {
      this.loading = loading;
    });
  }

  ngOnInit(): void {
  }

}
