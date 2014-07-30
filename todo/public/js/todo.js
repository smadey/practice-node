var todo = angular.module('todo', []);

todo.factory('BaseServices', function($rootScope) {
    $rootScope.isGuest = false;

   $rootScope.$watch('isGuest', function(newValue, oldValue) {
        if(newValue === oldValue) {
            return;
        }
        $('#loginModal').modal('toggle');
    });

    return {
        responseHandler: function(result, warningCallback, errorCallback) {
            if(result.status == 200) {
                if(typeof result.data._auth === 'boolean') {
                    $rootScope.isGuest = !result.data._auth;
                }
                else if(result.data._error) {
                    errorCallback = errorCallback || console.error;
                    errorCallback(result.data._error);
                }
                else if(result.data._warning) {
                    warningCallback = warningCallback || alert;
                    warningCallback(result.data._warning)
                }
                else if(result.data._info) {
                    warningCallback = warningCallback || alert;
                    warningCallback(result.data._warning)
                }
                else {
                    return result.data;
                }
            }
        }
    }
});

todo.factory('UserServices', function ($http, BaseServices) {

    return {
        login: function (user, callback) {
            return $http.post('./login', user).then(function(result) {
                return BaseServices.responseHandler(result, callback);
            });
        },

        register: function (user, callback) {
            return $http.post('./register', user).then(function(result) {
                return BaseServices.responseHandler(result, callback);
            });
        },

        logout: function (user) {
            return $http.get('./logout').then(function(result) {
                return BaseServices.responseHandler(result);
            });
        }
    };
});

todo.factory('TodoServices', function ($http, BaseServices) {

    return {
        get: function () {
            return $http.get('./todos/get').then(function(result) {
                return BaseServices.responseHandler(result);
            });
        },

        post: function (todo) {
            return $http.post('./todos/add', todo).then(function(result) {
                return BaseServices.responseHandler(result);
            });
        },

        put: function (todo) {
            return $http.post('./todos/update', todo).then(function(result) {
                return BaseServices.responseHandler(result);
            });
        },

        delete: function (id) {
            return $http.get('./todos/delete/' + id).then(function(result) {
                return BaseServices.responseHandler(result);
            });
        }
    };
});

todo.controller('UserCtrl', function UserCtrl($scope, $rootScope, UserServices) {

    $rootScope.$watch('isGuest', function(newValue, oldValue) {
        if(newValue === oldValue) {
            return;
        }
        $scope.isLoginStatus = true;
    });


    $scope.username = '';
    $scope.password = '';
    $scope.password2 = '';

    $scope.isLoginStatus = true;
    $scope.message = '';

    $scope.$watch('[username, password, password2, isLoginStatus]', function() {
        $scope.message = '';
    }, true);

    function setMessage(msg) {
        $scope.message = msg;
    }

    $scope.login = function(done) {
        if($scope.isLoginStatus) {
            var user = {
                username: $scope.username,
                password: $scope.password
            };

            UserServices.login(user, setMessage).then(function(user) {
                if(user) {
                    $rootScope.isGuest = false;
                }
            });
        }
        else {
            $scope.isLoginStatus = true;
        }
    }

    $scope.register = function() {
        if(!$scope.isLoginStatus) {
            var user = {
                username: $scope.username,
                password: $scope.password,
                password2: $scope.password2
            };

            UserServices.register(user, setMessage).then(function(user) {
                if(user) {
                    $rootScope.isGuest = false;
                }
            });
        }
        else {
            $scope.isLoginStatus = false;
        }
    }

    $scope.logout = function() {
        UserServices.logout(user).then(function(user) {
            $rootScope.isGuest = true;
        });
    }

});

todo.controller('TodoCtrl', function TodoCtrl($scope, $rootScope, $location, TodoServices) {

    $rootScope.$watch('isGuest', function(newValue, oldValue) {
        if(newValue === oldValue || !newValue) {
            TodoServices.get().then(function(todos) {
                if(angular.isArray(todos)) {
                    $scope.todos = todos;
                }
            });
        }
        else {
            $scope.todos = [];
        }
    });

    $scope.todos = [];
    $scope.$watch('todos', function (newValue, oldValue) {
        $scope.doneCount = newValue.filter(function(todo){ return todo.done; }).length;
        $scope.remainingCount = newValue.length - $scope.doneCount;
        $scope.allChecked = !$scope.remainingCount;
    }, true);

    $scope.newTodoText = '';
    $scope.originalTodo = null;
    $scope.editingTodo = null;

    $scope.statusFilter = null;

    if ($location.path() === '') {
        $location.path('/');
    }

    $scope.location = $location;

    $scope.$watch('location.path()', function (path) {
        $scope.statusFilter = (path === '/active') ? { done: false } : (path === '/completed') ? { done: true } : null;
    });

    $scope.addTodo = function() {
        var todo = {
            text: $scope.newTodoText.trim(),
            done: false
        };

        if(!todo.text) return;

        TodoServices.post(todo).then(function(todo) {
            if(todo) {
                $scope.todos.push(todo);
                $scope.newTodoText = '';
            }
        });
    };

    $scope.saveTodo = function(todo) {
        todo.text = todo.text.trim();
        if(!todo.text) {
            $scope.saveTodo(todo);
        }
        else {
            TodoServices.put(todo).then(function(todo) {
                $scope.originalTodo = null;
                $scope.editingTodo = null;
            });
        }
    };

    $scope.removeTodo = function(todo) {
        TodoServices.delete(todo._id).then(function() {
            $scope.todos.splice($scope.todos.indexOf(todo), 1);

            $scope.originalTodo = null;
            $scope.editingTodo = null;
        });
    };

    $scope.selectTodo = function(todo) {
        $scope.originalTodo = angular.extend({}, todo);
        $scope.editingTodo = todo;
    };

    $scope.editTodo = function(todo) {
        var ESCAPE_KEY = 27;
        if(event.keyCode == ESCAPE_KEY) {
            $scope.revertTodo(todo);
        }
    };

    $scope.revertTodo = function(todo) {
        $scope.todos[$scope.todos.indexOf(todo)] = $scope.originalTodo;

        $scope.originalTodo = null;
        $scope.editingTodo = null;
    }

    // @todo: need refine
    $scope.doneAll = function(done) {
        $scope.todos.forEach(function(todo) {
            todo.done = done;
            $scope.saveTodo(todo);
        });
    };

    // @todo: need refine
    $scope.clearDone = function(done) {
        $scope.todos.forEach(function(todo) {
            if(todo.done) {
                $scope.removeTodo(todo);
            }
        });
    };
});