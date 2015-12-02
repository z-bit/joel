import { ChangeDetection, JitChangeDetection } from 'angular2/src/core/change_detection/change_detection';
import {bind} from 'angular2/di';

export var jitInjectables = [
    bind(ChangeDetection).toClass(JitChangeDetection)
];

//das not exist and not work