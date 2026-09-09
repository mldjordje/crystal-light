import test from 'node:test';import assert from 'node:assert/strict';
import {isAvailable,isOccupied,addDays,nightsBetween} from '../src/availability.mjs';
const bookings=[{id:'1',roomId:'deluxe',start:'2026-09-10',end:'2026-09-13',status:'Potvrđena'}];
test('only the reserved room is unavailable',()=>{assert.equal(isAvailable('deluxe','2026-09-11','2026-09-12',bookings),false);assert.equal(isAvailable('suite','2026-09-11','2026-09-12',bookings),true)});
test('checkout day allows new arrival',()=>{assert.equal(isAvailable('deluxe','2026-09-13','2026-09-15',bookings),true);assert.equal(isOccupied('deluxe','2026-09-13',bookings),false)});
test('arrival day allows previous guest checkout',()=>assert.equal(isAvailable('deluxe','2026-09-08','2026-09-10',bookings),true));
test('cancelled bookings release dates; own reservation can be excluded',()=>{assert.equal(isAvailable('deluxe','2026-09-11','2026-09-12',[{...bookings[0],status:'Otkazana'}]),true);assert.equal(isAvailable('deluxe','2026-09-11','2026-09-12',bookings,'1'),true)});
test('invalid or zero night ranges rejected',()=>{assert.equal(isAvailable('deluxe','2026-09-15','2026-09-15',bookings),false);assert.equal(isAvailable('deluxe','2026-09-17','2026-09-15',bookings),false)});
test('month/year changes and DST-independent nights',()=>{assert.equal(addDays('2026-12-31',1),'2027-01-01');assert.equal(nightsBetween('2026-10-24','2026-10-26'),2)});
