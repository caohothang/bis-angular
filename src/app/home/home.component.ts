import {Component, OnInit} from '@angular/core';
import { AccountService } from '@app/_services';
import { FetchService } from '@app/_services/fetch.service';
declare var jQuery;

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit{
    // account = this.accountService.accountValue;
    items: any = [];
    constructor(private _fetchService: FetchService) {}

    ngOnInit() {
        // this._fetchService.getBanner().subscribe(res => {
        //     this.items = res;

        // });
        (($) => {
            $('[data-toggle="offcanvas"]').on('click', () => {
                $('.navbar-collapse').toggleClass('show');
            });
            /* ================ Revolution Slider. ================ */
            if ( $('.tp-banner').length > 0 ){
                $('.tp-banner').show().revolution({
                    delay: 6000,
                    startheight: 700,
                    startwidth: 1170,
                    hideThumbs: 1000,
                    navigationType: 'none',
                    touchenabled: 'on',
                    onHoverStop: 'on',
                    navOffsetHorizontal: 0,
                    navOffsetVertical: 0,
                    dottedOverlay: 'none',
                    fullWidth: 'on'
                });
            }
            if ($('.tp-banner-full').length > 0){
                $('.tp-banner-full').show().revolution({
                    delay: 6000,
                    hideThumbs: 1000,
                    navigationType: 'none',
                    touchenabled: 'on',
                    onHoverStop: 'on',
                    navOffsetHorizontal: 0,
                    navOffsetVertical: 0,
                    dottedOverlay: 'none',
                    fullScreen: 'on'
                });
            }

            /* ================ testimonials ================ */
            $(document).ready(() => {
                $('.testimonials_list').owlCarousel({
                    loop: true,
                    rewind: true,
                    margin: 30,
                    nav: false,
                    responsiveClass: true,
                    responsive: {
                        0: {
                            items: 1,
                            nav: true
                        },
                        700: {
                            items: 1,
                            nav: false
                        },
                        900: {
                            items: 2,
                            nav: false
                        },
                        1170: {
                            items: 2,
                            nav: true
                        }
                    }
                });
            });

            /* ================ testimonials ================ */
            $(document).ready(() => {
                $('.owl-carousel').owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: false,
                    responsiveClass: true,
                    responsive: {
                        0: {
                            items: 1,
                            nav: true
                        },
                        700: {
                            items: 1,
                            nav: false
                        },
                        900: {
                            items: 2,
                            nav: false
                        },
                        1170: {
                            items: 3,
                            nav: true,
                            loop: true
                        }
                    }
                });
            });

            /*==== Nav ====*/
            $('.navbar-collapse a').on('click', () => {
                $('.navbar-collapse').collapse('hide');
            });

            /* ================ Nav ================ */
            $('.fa-caret-down').on('click', function(e) {
                e.preventDefault();
                $(this).next().slideToggle('');
            });
        })(jQuery); 
    }
}
