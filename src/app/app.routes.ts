import { Routes } from '@angular/router';
import { AuthenticationGuardComponent } from './components/authentication-guard/authentication-guard.component';

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
    loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/personal-details/personal-details.component').then(c => c.PersonalDetailsComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
  {
    path: 'verification',
    loadComponent: () => import('./components/verification/verification.component').then(c => c.VerificationComponent),
  },
  {
    path: 'notVerified',
    loadComponent: () => import('./components/not-verified/not-verified.component').then(c => c.NotVerifiedComponent)
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
    path: 'group/:id',
    loadComponent: () => import('./components/group/group.component').then(c => c.GroupComponent)
    ,canActivate:[AuthenticationGuardComponent]
  },
   {
    path: '404',
    loadComponent: () => import('./components/page404/page404.component').then(c => c.Page404Component)
  }
  // },
  // // {
  // //     path: 'header',
  // //     loadComponent: () => import('./components/header/header.component').then(c => c.HeaderComponent)
  // // },
  // {
  //     path: 'ngiffor16',
  //     loadComponent: () => import('./components/ng-if-for16/ng-if-for16.component').then(c => c.NgIfFor16Component)
  // },
  // {
  //     path: 'iffor17',
  //     loadComponent: () => import('./components/if-for17/if-for17.component').then(c => c.IfFor17Component)
  // },
  // {
  //     path: 'ngclass',
  //     loadComponent: () => import('./components/ngclass/ngclass.component').then(c => c.NgclassComponent)
  // },
  // {
  //     path: 'ngdatabinding',
  //     loadComponent: () => import('./components/ngdatabinding/ngdatabinding.component').then(c => c.NgdatabindingComponent)
  // },
  // {
  //     path: 'ngstyle',
  //     loadComponent: () => import('./components/ngstyle/ngstyle.component').then(c => c.NgstyleComponent)
  // },
  // {
  //     path: 'ngpipes',
  //     loadComponent: () => import('./components/ngpipes/ngpipes.component').then(c => c.NgpipesComponent)
  // },
  // {
  //     path: 'switch16',
  //     loadComponent: () => import('./components/switch16/switch16.component').then(c => c.Switch16Component)
  // },
  // {
  //     path: 'switch17',
  //     loadComponent: () => import('./components/switch17/switch17.component').then(c => c.Switch17Component)
  // },
  // {
  //     path: 'products',
  //     loadComponent: () => import('./components/products/products.component').then(c => c.ProductsComponent)
  // },
  // {
  //     path: 'servicios',
  //     loadComponent: () => import('./components/servicios-users/servicios-users.component').then(c => c.ServiciosUsersComponent)
  // },
  // {
  //     path: 'padre-hijo',
  //     loadComponent: () => import('./components/padre/padre.component').then(c => c.PadreComponent)
  // },
  // {
  //     path: 'formularioReactivo',
  //     loadComponent: () => import('./components/formulario-reactivo/formulario-reactivo.component').then(c => c.FormularioReactivoComponent)
  // },
  // {
  //     path: 'crud',
  //     loadComponent: () => import('./components/crud-cliente/crud/crud.component').then(c => c.CrudComponent)
  // },
  // {
  //     path: 'formcrud',
  //     loadComponent: () => import('./components/crud-cliente/formulario/formulario.component').then(c => c.FormularioComponent)
  // },
  // {
  //     path: 'formcrud/:id',
  //     loadComponent: () => import('./components/crud-cliente/formulario/formulario.component').then(c => c.FormularioComponent)
  // },,

  //http://localhost:4200
  , {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }

  //path erróneo que no existe
  , {
    path: '**',
    redirectTo: '/404'
  }
];
