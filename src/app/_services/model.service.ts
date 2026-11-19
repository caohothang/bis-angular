import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
// import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}`;

@Injectable({ providedIn: 'root' })
export class ModelService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) {

    }

    get() {
        return this.http.get(`${baseUrl}/api/TestFlow`);
    }

    createTestPlan(params) {
        return this.http.post(`${baseUrl}/api/TestPlan`, params);
    }

    deleteTestPlan(id) {
        return this.http.delete(`${baseUrl}/api/TestPlan/${id}`)
            .pipe(finalize(() => {

            }));
    }
}
