import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { Routes } from '@angular/router';


const routes: Routes = [
    {
        path:"",
        pathMatch:"full",
        loadComponent: () => {
            return import("./pages/home/home.component")
                .then( c => c.HomeComponent)
        }
    },
    {
        path:"login",
        pathMatch:"full",
        loadComponent: () => {
            return import("./pages/login/login.component")
                .then( c => c.LoginComponent)
        }
    },
    {
        path:"dashboard",
        pathMatch:"full",
        loadComponent: () => {
            return import("./pages/dashboard/dashboard.component")
                .then( c => c.DashboardComponent)
        }
    },
]
 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration()
  ]
};