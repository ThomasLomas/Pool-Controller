import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FlexLayoutModule } from '@angular/flex-layout';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { HomeComponent } from './pages/home/home.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService, initConfig } from './config/config.service';
import { PoolItemComponent } from './pool-item/pool-item.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavListComponent,
    HomeComponent,
    ScheduleComponent,
    SettingsComponent,
    PoolItemComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    BrowserAnimationsModule,
    FlexLayoutModule
  ],
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      deps: [ ConfigService ],
      multi: true,
      useFactory: initConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
