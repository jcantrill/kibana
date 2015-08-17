define(function (require) {
  require(['text!plugins/openshift-kibana/partials/header.html'], function(header){
    var kibana = require('modules').get('kibana');
    kibana.directive("kibana", function($parse) {
      return {
        link: function(scope, element, attrs){
          element.prepend(header);
        }
      };
    });
  });

});
