define(function () {
    return ['$scope', '$http', function($scope, $http) {
     

function resetItem(){
   $scope.entity = {
      name : '',
      email : '',
      phone : '',
      id : ''
   };              
   $scope.displayForm = '';
  
}
resetItem();

 $scope.addItem = function () {
   resetItem();
   $scope.displayForm = true;
 }


$scope.saveItem = function () {
  var entity = $scope.entity;
      if (entity.id.length == 0){
            $http.get('/entity/create?name=' + entity.name + '&email=' +  entity.email + '&phone=' +  entity.phone).success(function(data) {
              $scope.items.push(data);
              $scope.displayForm = '';
              removeModal();
            }).
  error(function(data, status, headers, config) {
    alert(data.summary);
  });
          }
          else{
            $http.get('/entity/update/'+ entity.id +'?name=' + entity.name + '&email=' +  entity.email + '&phone=' +  entity.phone).success(function(data) {
              $scope.displayForm = '';
              removeModal();
            }).
  error(function(data, status, headers, config) {
    alert(data.summary);
  });
          }
        };

$scope.editItem = function (data) {       
        $scope.entity = data;
        $scope.displayForm = true;
}

        $scope.removeItem = function (data) {
          if (confirm('Do you really want to delete?')){
            $http['delete']('/entity/' + data.id).success(function() {
              $scope.items.splice($scope.items.indexOf(data), 1);
            });
          }
        };

        $http.get('/entity/find').success(function(data) {
          for (var i = 0; i < data.length; i++) {
            data[i].index = i;
          }
          $scope.items = data;
        });

        function removeModal(){
          $('.modal').modal('hide');          
      }

    }];
});