define(function (require) {
  var plugin = require('modules').get('plugins/openshift-kibana');

  plugin.provider('AuthService', function () {
    this.$get = function ($location) {
      var AUTH_TYPE = 0;
      var TOKEN_INDEX = 1;
      var _token = '';
      return {
        stashToken: function (config) {
          var value = $location.search().openshift_auth_token || false;
          if (value !== false) {
            _token = value;
          } else if (config.headers.Authorization) {
            var auth = config.headers.Authorization.split(' ');
            if (auth.length >= 2 && auth[AUTH_TYPE] === 'Bearer') {
              _token = auth[TOKEN_INDEX];
            }
          }
        },
        setAuthorization: function (config) {
          config.headers.Authorization = 'Bearer ' + _token;
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
        AuthService.stashToken(config);
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