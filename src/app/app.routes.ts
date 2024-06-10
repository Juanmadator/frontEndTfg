import { Routes } from '@angular/router';
import { AuthenticationGuardComponent } from './components/authentication-guard/authentication-guard.component';
import { RegisterGuardComponent } from './components/authentication-guard/register-guard.component';

export const routes: Routes = [

  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent)
  }, {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent) ,canActivate:[RegisterGuardComponent]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/personal-details/personal-details.component').then(c => c.PersonalDetailsComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'verification',
    loadComponent: () => import('./components/verification/verification.component').then(c => c.VerificationComponent),canActivate:[RegisterGuardComponent]
  },
  {
    path: 'notVerified',
    loadComponent: () => import('./components/not-verified/not-verified.component').then(c => c.NotVerifiedComponent),canActivate:[RegisterGuardComponent]
  },
  {
    path: 'groups',
    loadComponent: () => import('./components/rutine/rutine.component').then(c => c.RutineComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'fav',
    loadComponent: () => import('./components/favoritos/favoritos.component').then(c => c.FavoritosComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'explorar',
    loadComponent: () => import('./components/explorar/explorar.component').then(c => c.ExplorarComponent)
  },
  {
    path: 'create/group',
    loadComponent: () => import('./components/create-group/create-group.component').then(c => c.CreateGroupComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'create/rutine',
    loadComponent: () => import('./components/create-rutine/create-rutine.component').then(c => c.CreateRutineComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'group/:id',
    loadComponent: () => import('./components/group/group.component').then(c => c.GroupComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
   {
    path: '404',
    loadComponent: () => import('./components/page404/page404.component').then(c => c.Page404Component)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(c => c.AboutComponent)
  }
  ,
  {
    path: 'admin',
    loadComponent: () => import('./components/panel-admin/panel-admin.component').then(c => c.PanelAdminComponent)
  }

  , {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }

  , {
    path: '**',
    redirectTo: '/404'
  }
];
