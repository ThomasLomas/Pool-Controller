import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PentairStatus } from '../../../../server/src/pump/pentair.enum';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  // public status!: PentairStatus;

  ngOnInit(): void {
    // this.httpClient.get<PentairStatus>('/api/pump/status').subscribe(status => {
    //   this.status = status;
    // });
  }
}
