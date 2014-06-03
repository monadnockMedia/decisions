/*
fraction.js
A Javascript fraction library.

Copyright (c) 2009  Erik Garrison <erik@hypervolu.me>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*//* Fractions *//* 
 *
 * Fraction objects are comprised of a numerator and a denomenator.  These
 * values can be accessed at fraction.numerator and fraction.denomenator.
 *
 * Fractions are always returned and stored in lowest-form normalized format.
 * This is accomplished via Fraction.normalize.
 *
 * The following mathematical operations on fractions are supported:
 *
 * Fraction.equals
 * Fraction.add
 * Fraction.subtract
 * Fraction.multiply
 * Fraction.divide
 *
 * These operations accept both numbers and fraction objects.  (Best results
 * are guaranteed when the input is a fraction object.)  They all return a new
 * Fraction object.
 *
 * Usage:
 *
 * TODO
 *
 *//*
 * The Fraction constructor takes one of:
 *   an explicit numerator (integer) and denominator (integer),
 *   a string representation of the fraction (string),
 *   or a floating-point number (float)
 *
 * These initialization methods are provided for convenience.  Because of
 * rounding issues the best results will be given when the fraction is
 * constructed from an explicit integer numerator and denomenator, and not a
 * decimal number.
 *
 *
 * e.g. new Fraction(1, 2) --> 1/2
 *      new Fraction('1/2') --> 1/2
 *      new Fraction('2 3/4') --> 11/4  (prints as 2 3/4)
 *
 */Fraction=function(e,t){if(e&&t){if(typeof e=="number"&&typeof t=="number"){this.numerator=e;this.denominator=t}else if(typeof e=="string"&&typeof t=="string"){this.numerator=parseInt(e);this.denominator=parseInt(t)}}else if(!t){num=e;if(typeof num=="number"){this.numerator=num;this.denominator=1}else if(typeof num=="string"){var n,r,i=num.split(" ");n=i[0],r=i[1];if(n%1===0&&r&&r.match("/"))return(new Fraction(n)).add(new Fraction(r));if(!n||!!r)return undefined;if(typeof n=="string"&&n.match("/")){var s=n.split("/");this.numerator=s[0];this.denominator=s[1]}else{if(typeof n=="string"&&n.match("."))return new Fraction(parseFloat(n));this.numerator=parseInt(n);this.denominator=1}}}this.normalize()};Fraction.prototype.clone=function(){return new Fraction(this.numerator,this.denominator)};Fraction.prototype.toString=function(){var e=Math.floor(this.numerator/this.denominator),t=this.numerator%this.denominator,n=this.denominator,r=[];e!=0&&r.push(e);t!=0&&r.push(t+"/"+n);return r.length>0?r.join(" "):0};Fraction.prototype.rescale=function(e){this.numerator*=e;this.denominator*=e;return this};Fraction.prototype.add=function(e){var t=this.clone();e instanceof Fraction?e=e.clone():e=new Fraction(e);td=t.denominator;t.rescale(e.denominator);e.rescale(td);t.numerator+=e.numerator;return t.normalize()};Fraction.prototype.subtract=function(e){var t=this.clone();e instanceof Fraction?e=e.clone():e=new Fraction(e);td=t.denominator;t.rescale(e.denominator);e.rescale(td);t.numerator-=e.numerator;return t.normalize()};Fraction.prototype.multiply=function(e){var t=this.clone();if(e instanceof Fraction){t.numerator*=e.numerator;t.denominator*=e.denominator}else{if(typeof e!="number")return t.multiply(new Fraction(e));t.numerator*=e}return t.normalize()};Fraction.prototype.divide=function(e){var t=this.clone();if(e instanceof Fraction){t.numerator*=e.denominator;t.denominator*=e.numerator}else{if(typeof e!="number")return t.divide(new Fraction(e));t.denominator*=e}return t.normalize()};Fraction.prototype.equals=function(e){e instanceof Fraction||(e=new Fraction(e));var t=this.clone().normalize(),e=e.clone().normalize();return t.numerator===e.numerator&&t.denominator===e.denominator};Fraction.prototype.normalize=function(){var e=function(e){return typeof e=="number"&&(e>0&&e%1>0&&e%1<1||e<0&&e%-1<0&&e%-1>-1)},t=function(e,t){if(!t)return Math.round(e);var n=Math.pow(10,t);return Math.round(e*n)/n};return function(){if(e(this.denominator)){var n=t(this.denominator,9),r=Math.pow(10,n.toString().split(".")[1].length);this.denominator=Math.round(this.denominator*r);this.numerator*=r}if(e(this.numerator)){var n=t(this.numerator,9),r=Math.pow(10,n.toString().split(".")[1].length);this.numerator=Math.round(this.numerator*r);this.denominator*=r}var i=Fraction.gcf(this.numerator,this.denominator);this.numerator/=i;this.denominator/=i;if(this.numerator<0&&this.denominator<0||this.numerator>0&&this.denominator<0){this.numerator*=-1;this.denominator*=-1}return this}}();Fraction.gcf=function(e,t){var n=[],r=Fraction.primeFactors(e),i=Fraction.primeFactors(t);r.forEach(function(e){var t=i.indexOf(e);if(t>=0){n.push(e);i.splice(t,1)}});if(n.length===0)return 1;var s=function(){var e=n[0],t;for(t=1;t<n.length;t++)e*=n[t];return e}();return s};Fraction.primeFactors=function(e){var t=Math.abs(e),n=[],r=2;while(r*r<=t)if(t%r===0){n.push(r);t/=r}else r++;t!=1&&n.push(t);return n};