import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { PoolItem } from '../../../../../server/src/interfaces/PoolConfig';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private configService: ConfigService) { }

  public items: PoolItem[] = [];

  ngOnInit(): void {
    this.items = this.configService.getConfig().items.filter(item => item.active);
  }
}
