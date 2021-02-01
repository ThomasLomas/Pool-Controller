import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { ScheduleConfig } from '../../../../../server/src/interfaces/PoolConfig';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  constructor(private configService: ConfigService) { }

  public schedule!: ScheduleConfig;
  public schedulerActive: boolean = false;

  ngOnInit(): void {
    this.schedule = this.configService.getConfig().schedule;
    this.schedulerActive = this.schedule.active;
  }

}
