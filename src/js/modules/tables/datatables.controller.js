/**=========================================================
 * Module: DataTablesController.js
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('eServices')
        .controller('DataTablesController', DataTablesController);

    function DataTablesController($resource) {

      var vm = this;
      $resource('server/datatables.json').query().$promise.then(function(persons) {
          vm.persons = persons;
      });

    }

    DataTablesController.$inject = ['$resource'];

})();
