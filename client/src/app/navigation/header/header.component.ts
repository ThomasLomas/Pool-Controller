import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NAV_ITEMS } from '../navigation-items';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output()
  public sidenavToggle: EventEmitter<void> = new EventEmitter();

  navItems = NAV_ITEMS;

  constructor() { }

  ngOnInit(): void {
  }

  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }
}
