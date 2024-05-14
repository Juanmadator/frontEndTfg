import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export const interceptor : HttpInterceptorFn= (req,next)=> {
const localData=localStorage.getItem("token");

let loggedUserData:any;

if(localData!=null){
loggedUserData=JSON.parse(localData);
}

const cloneRequest= req.clone(
  {
    setHeaders:{
      Authorization:`Bearer ${loggedUserData.token}`
    }
  }
);

return next(req);
  }







