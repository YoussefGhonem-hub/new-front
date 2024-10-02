
(function () {
    'use strict';


    angular.module('eServices').filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);


    angular.module('eServices').filter('localizeString', ['$rootScope', function ($rootScope) {
        return function (input) {
            if (input !== undefined && input !== null) {
                if ($rootScope.app.layout.isRTL) {
                    return input.nameAr;
                }
                else {
                    return input.nameEn;
                }
            }
        };
    }]);

    angular.module('eServices').filter('localizeDescString', ['$rootScope', function ($rootScope) {
        return function (input) {
            if (input !== undefined && input !== null) {
                if ($rootScope.app.layout.isRTL) {
                    return input.descAr;
                }
                else {
                    return input.descEn;
                }
            }
        };
    }]);

    angular.module('eServices').filter('filterByCategory', function () {
        return function (services, categories) {
            var filtered = [];
            if (categories && categories.length) {
                angular.forEach(services, function (service) {
                    angular.forEach(categories, function (category) {
                        if (service.serviceCategoryId == category.id) {
                            filtered.push(service);
                        }
                    })
                });
            }
            return filtered;
        };
    });

    angular.module('eServices').filter('filterByEmirate', function () {
        return function (regions, emirates) {
            var filtered = [];
            if (emirates && emirates.length) {
                angular.forEach(regions, function (region) {
                    angular.forEach(emirates, function (emirate) {
                        if (region.emirateId == emirate.id) {
                            filtered.push(region);
                        }
                    })
                });
            }
            return filtered;
        };
    });

    angular.module('eServices').filter('groupBy', ['$parse', '$filter', function ($parse, $filter) {
        return function (array, groupByField) {
            var result = [];
            var prev_item = null;
            var groupKey = false;
            var filteredData = $filter('orderBy')(array, groupByField);
            for (var i = 0; i < filteredData.length; i++) {
                groupKey = false;
                if (prev_item !== null) {
                    if (prev_item[groupByField] !== filteredData[i][groupByField]) {
                        groupKey = true;
                    }
                } else {
                    groupKey = true;
                }
                if (groupKey) {
                    filteredData[i]['group_by_key'] = true;
                } else {
                    filteredData[i]['group_by_key'] = false;
                }
                result.push(filteredData[i]);
                prev_item = filteredData[i];
            }
            return result;
        };
    }]);

})();