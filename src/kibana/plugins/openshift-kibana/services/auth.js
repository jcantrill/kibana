define(function (require) {
  var plugin = require('modules').get('plugins/openshift-kibana');
  var qs = require('utils/query_string');
  
  plugin.provider('AuthService', function () {
    this.$get = function ($location, UserStore) {
      return {
        stashToken: function () {
          var hash = qs.decode($location.hash());
          var value = hash.openshift_auth_token || false;
          if (value !== false) {
            UserStore.setToken(value);
            delete hash['openshift_auth_token'];
            delete hash['openshift_back_url'];
            $location.hash(qs.encode(hash));
            $location.replace();
          }
        },
        setAuthorization: function (config) {
          config.headers.Authorization = 'Bearer ' + UserStore.getToken();
        },
        hasAuthorization: function (config) {
          return config.headers.Authorization || false;
        }
      };
    };
  });

  plugin.factory('AuthInterceptor', ['AuthService', function (AuthService) {
    return {
      request: function (config) {
        AuthService.stashToken();
        if (!AuthService.hasAuthorization(config)) {
          AuthService.setAuthorization(config);
        }
        return config;
      }
    };
  }]);
  plugin.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
});