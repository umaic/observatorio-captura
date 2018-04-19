window.ushahidi = window.ushahidi || {};
var apiUrl = window.ushahidi.apiUrl = 'http://apimonitor.kuery.com.co';

module.exports = [
    '$rootScope',
    '$http',
    '$q',
    'Util',
    'CONST',
    'Session',
    'RoleEndpoint',
    'UserEndpoint',
    'PostLockEndpoint',
    '_',
    'ModalService',
    'angularAuth0',
    '$state',
    '$location',
    '$timeout',
    'transformRequestAsFormPost',
function (
    $rootScope,
    $http,
    $q,
    Util,
    CONST,
    Session,
    RoleEndpoint,
    UserEndpoint,
    PostLockEndpoint,
    _,
    ModalService,
    angularAuth0,
    $state,
    $location,
    $timeout,
    transformRequestAsFormPost
) {

    // check whether we have initially an valid access_token and assume that, if yes, we are still loggedin
    let loginStatus = false;
    if (!!Session.getSessionDataEntry('accessToken') &&
        Session.getSessionDataEntry('grantType') === 'password' &&
        !!Session.getSessionDataEntry('userId')
    ) {
        // If the access token is expired
        if (Session.getSessionDataEntry('accessTokenExpires') <= Math.floor(Date.now() / 1000)) {
            // Clear any login state
            setToLogoutState();
        } else {
            // Otherwise mark as logged in
            loginStatus = true;
        }
    }

    function setToLoginState(userData) {
        Session.setSessionDataEntries({
            userId: userData.id,
            realname: userData.realname,
            email: userData.email,
            role: userData.role,
            permissions: userData.permissions,
            gravatar: userData.gravatar,
            language: userData.language
        });
        loginStatus = true;
    }

    function setToLogoutState() {
        Session.clearSessionData();
        UserEndpoint.invalidateCache();
        loginStatus = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
    }

    /*********** Auth0 ********/

    function handleAuthentication() {
      angularAuth0.parseHash(function(err, authResult) {
        console.log("Ayth1");
        if (authResult && authResult.accessToken && authResult.idToken) {
          setSession(authResult);
          //$state.go('/');
        } else if (err) {
          $location.path( "/views/map" );
        }
      });
    }

    function setSession(authResult) {
      // Set the time that the Access Token will expire at
      let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
      getProfile();
    }

    function isAuthenticated() {
      // Check whether the current time is past the 
      // Access Token's expiry time
      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    function getProfile() {
        var accessToken = localStorage.getItem('access_token');
        if (!accessToken)
            console.log('Access Token must exist to fetch profile');
        angularAuth0.client.userInfo(accessToken, function(err, profile) {
            if (profile)
              setUserProfile(profile);
        });
    }

    function setUserProfile(profile) {
        console.log(profile);
        var request = $http({
            method: "post",
            url: apiUrl + '/validate',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            transformRequest: transformRequestAsFormPost,
            data: {email: profile.email}
        }).then(function(response) {
            console.log(response);
            if(response.data == 0){
                var request = $http({
                    method: "post",
                    url: apiUrl + '/oauth/token',
                    data: {
                        grant_type: 'client_credentials',
                        client_id: CONST.OAUTH_CLIENT_ID,
                        client_secret: CONST.OAUTH_CLIENT_SECRET,
                        scope: CONST.CLAIMED_USER_SCOPES.join(' ')
                    }
                }).then(function(response) {
                    var accessToken = response.data.access_token;
                    var token_type = response.data.token_type;
                    var request = $http({
                        method: "post",
                        url: apiUrl + '/api/v3/register',
                        headers: {
                           'Authorization': token_type + ' ' + accessToken,
                        },
                        data: {
                            email: profile.email,
                            password: profile.sub,
                            realname: profile.name,
                        }
                    }).then(function(response) {
                        login(profile.email, profile.sub)
                    });
                });
            }else
                login(profile.email, profile.sub)
        });
      //userProfile = profile;
    }

    function getCachedProfile() {
      return userProfile;
    }
    
    /**************************/

    function login (username, password) {
        var payload = {
            username: username,
            password: password,
            grant_type: 'password',
            client_id: CONST.OAUTH_CLIENT_ID,
            client_secret: CONST.OAUTH_CLIENT_SECRET,
            scope: CONST.CLAIMED_USER_SCOPES.join(' ')
        },

        deferred = $q.defer(),

        handleRequestError = function () {
            deferred.reject();
            setToLogoutState();
            $rootScope.$broadcast('event:authentication:login:failed');
        },

        handleRequestSuccess = function (authResponse) {
            var accessToken = authResponse.data.access_token;
            Session.setSessionDataEntry('accessToken', accessToken);
            Session.setSessionDataEntry('accessTokenExpires', authResponse.data.expires);
            Session.setSessionDataEntry('grantType', 'password');

            $http.get(Util.apiUrl('/users/me')).then(
                function (userDataResponse) {
                    RoleEndpoint.query({name: userDataResponse.data.role}).$promise
                    .then(function (results) {
                        userDataResponse.data.permissions = !_.isEmpty(results) ? results[0].permissions : [];
                        return userDataResponse;
                    })
                    .catch(function (errors) {
                        userDataResponse.data.permissions = [];
                        return userDataResponse;
                    })
                    .finally(function () {
                        setToLoginState(userDataResponse.data);
                        $rootScope.$broadcast('event:authentication:login:succeeded');
                        $location.path( "/views/map" );
                        //deferred.resolve();
                    });
                }, handleRequestError);
        };

        $http.post(Util.url('/oauth/token'), payload).then(handleRequestSuccess, handleRequestError);

        return deferred.promise;
    }

    return {

        login: login,

        logout: function (silent) {
            //TODO: ASK THE BACKEND TO DESTROY SESSION

            // Release all locks owned by the user
            // TODO: At present releasing locks should not prevent users from logging out
            // in future this should be expanded to include an error state
            // Though ultinately unlocking should be handled solely API side
            PostLockEndpoint.unlock().$promise.finally(function () {
                setToLogoutState();
                if (!silent) {
                    $rootScope.$broadcast('event:authentication:logout:succeeded');
                }
            });
        },

        getLoginStatus: function () {
            return loginStatus;
        },

        openLogin: function () {
            angularAuth0.authorize({
                scope: 'openid email profile'
            });
           // ModalService.openTemplate('<login></login>', 'nav.login', false, false, false, false);
        },
        handleAuthentication: handleAuthentication,
        isAuthenticated: isAuthenticated
    };

}];
