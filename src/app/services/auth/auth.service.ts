import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(
    private http: HttpClient,
      private router: Router
  ) { }

  register(data : any) {
    return this.http.post('https://api-us.cometchat.io/v3/users', data, {headers: {appId: '2044646989f96082', apiKey: 'ee5c46f58e42449d273722588351ae92af3df9c4' }});
  }
}
