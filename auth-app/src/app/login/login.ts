import { Component, View } from 'angular2/angular2';
import { Router, RouterLink } from 'angular2/router';
import { status, json } from '../utils/fetch';

let styles = require('./login.css');
let template = require('./login.html');

@Component({
    selector: 'login'
})
@View({
    directives: [ RouterLink ],
    template: template,
    styles: [ styles ]
})
export class Login {
    constructor(public router: Router){
    }

    login(event, username, password) {
        event.preventDefault();
        window.fetch('http://localhost:3001/sessions/create', {

        });
    }


}