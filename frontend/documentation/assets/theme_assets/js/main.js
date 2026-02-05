(function ($) {
    "use strict";

        const sidebarBtn = document.querySelector('.sidebar-trigger');
        const dashboardSidebar = document.querySelector('.left-sidebar');
        const sidebarClose = document.querySelector('.sidebar-close');

        function sidbarActivation(){
            dashboardSidebar.classList.add('show');
        }

        function sidebarRemove(e){
            e.preventDefault();
            dashboardSidebar.classList.remove('show');
        }

        if(sidebarBtn){
            sidebarBtn.addEventListener('click' , sidbarActivation);
        }

        if(sidebarClose){
            sidebarClose.addEventListener('click' , sidebarRemove);
        }

})($);