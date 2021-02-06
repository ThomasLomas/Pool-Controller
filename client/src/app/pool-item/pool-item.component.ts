import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ItemOutput, ItemOutputType, ItemState, PoolItem } from '../../../../server/src/interfaces/PoolConfig';

@Component({
  selector: 'app-pool-item',
  templateUrl: './pool-item.component.html',
  styleUrls: ['./pool-item.component.scss']
})
export class PoolItemComponent implements OnInit {
  @Input() item!: PoolItem;

  constructor(private httpClient: HttpClient) { }
  ngOnInit(): void { }

  onOutputToggle(output: ItemOutput, event: MatSlideToggleChange) {
    // If Single reset all
    if (this.item.outputType === ItemOutputType.SINGLE) {
      this.item.outputs.forEach(o => {
        o.state = ItemState.OFF;
        this.sendOutputUpdate(o);
      });
    }

    output.state = (event.checked) ? ItemState.ON : ItemState.OFF;
    this.sendOutputUpdate(output);
  }

  private sendOutputUpdate(output: ItemOutput) {
    this.httpClient.get(`/api/item/${this.item.id}/${output.id}/${output.state}`).subscribe();
  }
}
