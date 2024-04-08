import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent)
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
    ,{
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }

    //path erróneo que no existe
    ,{
        path: '**',
        loadComponent: () => import("./components/page404/page404.component").then(c => c.Page404Component)
    }
];
