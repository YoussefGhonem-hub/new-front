
angular.module('eServices').controller('certificateController', certificateController);
certificateController.$inject = ['$scope', '$modalInstance', '$uibModalInstance', 'certificateUrl'];

function certificateController($scope, $modalInstance, $uibModalInstance, certificateUrl) {

    $scope.pdfUrl = certificateUrl;

    $scope.closeModal = function () {
        $uibModalInstance.dismiss('cancel');
    };
};



