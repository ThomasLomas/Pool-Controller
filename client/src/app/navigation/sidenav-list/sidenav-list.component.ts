import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NAV_ITEMS } from '../navigation-items';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output()
  public sidenavClose: EventEmitter<void> = new EventEmitter();

  navItems = NAV_ITEMS;

  constructor() { }

  ngOnInit(): void {
  }

  public onSidenavClose(): void {
    this.sidenavClose.emit();
  }
}
