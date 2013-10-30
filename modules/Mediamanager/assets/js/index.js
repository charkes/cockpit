(function($){

    App.module.controller("mediamanager", function($scope, $rootScope, $http){

            var currentpath = location.hash ? location.hash.replace("#", ''):"/",
                apiurl      = App.route('/mediamanager/api');

            $scope.dir;
            $scope.breadcrumbs = [];

            $scope.viewfilter = 'all';
            $scope.namefilter = '';

            $scope.updatepath = function(path) {
                loadPath(path);
            };

            $scope.action = function(cmd, item) {

                switch(cmd) {

                    case "remove":

                        if(confirm("Are you sure?")) {

                            requestapi({"cmd":"removefiles", "paths": [item.path]});

                            var index = $scope.dir[item.is_file ? "files":"folders"].indexOf(item);
                            $scope.dir[item.is_file ? "files":"folders"].splice(index, 1);
                        }
                        break;

                    case "rename":

                        var name = prompt("Please enter new name:", item.name);

                        if(name!=item.name && $.trim(name)) {
                            requestapi({"cmd":"rename", "path": item.path, "name":name});
                            item.path = item.path.replace(item.name, name);
                            item.name = name;
                        }

                        break;

                    case "createfolder":

                        var name = prompt("Please enter a name:", "");

                        if($.trim(name)) {
                            requestapi({"cmd":"createfolder", "path": currentpath, "name":name}, function(){
                                loadPath(currentpath);
                            });
                        }

                        break;

                    case "download":
                        location.href = apiurl+"?cmd=download&path="+encodeURI(item.path);
                        break;
                }

            };

            $scope.open = function(file) {

                var media = false;

                if(file.name.match(/\.(jpg|jpeg|png|gif)/i)) {
                    media = "image";
                }

                if(file.name.match(/\.(txt|md|php|js|css|scss|sass|less|htm|html|json|xml|svg)/i)) {
                    media = "text";
                }

                switch(media){
                    case "image":
                    case "text":
                    default:
                        alert("Sorry, this file type is not supported.");
                }
            };

            $scope.matchName = function(name) {

                if(!name || !$scope.namefilter) {
                    return true;
                }

                return (name.indexOf($scope.namefilter) !== -1);
            };

            function requestapi(data, fn, type) {

                data = $.extend({"cmd":""}, data);

                $.post(apiurl, data, fn, type || "json");
            }

            function loadPath(path) {

                requestapi({"cmd":"ls", "path": path}, function(data){

                    currentpath = path;

                    $scope.breadcrumbs = [];

                    if(currentpath!='/'){
                        var parts   = currentpath.split('/'),
                            tmppath = [],
                            crumbs  = [];

                        for(var i=0;i<parts.length;i++){
                            tmppath.push(parts[i]);
                            crumbs.push({'name':parts[i],'path':tmppath.join("/")});
                        }

                        $scope.breadcrumbs = crumbs;
                    }

                    $scope.$apply(function(){
                        $scope.dir = data;
                    });

                }, "json");
            }

            loadPath(currentpath);

            var progessbar     = null,
                uploadsettings = {
                    "action": apiurl,
                    "single": true,
                    "params": {"cmd":"upload"},
                    "before": function(o) {
                        o.params["path"] = currentpath;
                    },
                    "loadstart": function(){

                    },
                    "progress": function(percent){

                    },
                    "allcomplete": function(){
                        loadPath(currentpath);
                    },
                    "complete": function(res){

                    }
                };

            $("body").uploadOnDrag(uploadsettings);

    });

})(jQuery);