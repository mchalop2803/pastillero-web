import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, Auth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),

    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    provideAuth(() => getAuth()),

    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ]
};