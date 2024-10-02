/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EstablishmentPartnerController', EstablishmentPartnerController);
    /* @ngInject */
    function EstablishmentPartnerController($rootScope, $scope, $uibModalInstance, $filter, establishmentPartner)
    {
        $scope.partnertypes = [{ id: 1, nameEn: 'Individual (Normal Person)', nameAr: 'فرد (شخص طبيعي)' }, { id: 2, nameEn: 'Company (Legal Entity)', nameAr:'شركة (شخص إعتباري)' }];
        $scope.selectedpartnertype = $scope.partnertypes[0];

        if (establishmentPartner == null)
        {
            $scope.establishmentPartner = {};
            $scope.establishmentPartner.id = 0;
            $scope.establishmentPartner.person = {};
            $scope.establishmentPartner.partnerEstablishment = {};
        }
        else if (establishmentPartner == 'new') {
            $scope.establishmentPartner = {};
            $scope.establishmentPartner.requireAcquintanceForm = true;
            $scope.establishmentPartner.id = 0;
            $scope.establishmentPartner.person = {};
            $scope.establishmentPartner.partnerEstablishment = {};
        }
        else
        {        
            if (establishmentPartner.person == undefined)
            {
                $scope.selectedpartnertype = $scope.partnertypes[1];
            }

            if (establishmentPartner.partnerEstablishment == undefined) {
                $scope.selectedpartnertype = $scope.partnertypes[0];
            }

            $scope.establishmentPartner = establishmentPartner;
        }

        $scope.ok = function ()
        {
            if ($scope.selectedpartnertype.id == 1)
            {
                $scope.establishmentPartner.partnerEstablishment = null;
            }
            else if ($scope.selectedpartnertype.id == 2)
            {
                $scope.establishmentPartner.person = null;
            }

            $uibModalInstance.close($scope.establishmentPartner);
        };

        $scope.closeModal = function ()
        {
            $uibModalInstance.dismiss('cancel');
        };
    }

    EstablishmentPartnerController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter',  'establishmentPartner'];
})();