(function(){
  appControllers.controller('LearnMoreCtrl', ['$scope', '$http', '$location', '$window', '$rootScope',
    function($scope, $rootScope, $location, $window, $http) {
      //console.log("Inside LearnMoreCtrl");

      //https://www.idolondemand.com/sample-content/videos/hpnext.mp4

      $scope.getTranscript = function() {
        $rootScope.test = "hello";
        console.log($rootScope.test);

        fileURL = $scope.fileURL;
        
        //file extension validations, covering simple scenarios for file extensions only
        if(fileURL !== undefined) {
          if(fileURL.search("mp4") !== -1 || fileURL.search("mp3") !== -1) {
            document.getElementById("errorMsg").className = "alert alert-danger errorMsg";
            $location.url("/sentiment");
          } else {
          //console.log("input missing");
          document.getElementById("errorMsg").className = "alert alert-danger";
          document.getElementById("fileInputArea").value = "";
          }
        } else {
          //console.log("input missing");
          document.getElementById("errorMsg").className = "alert alert-danger";
          document.getElementById("fileInputArea").value = "";
        }
      };

      $scope.clearError = function() {
        document.getElementById("errorMsg").className = "alert alert-danger errorMsg";
      };
    }
  ]);
}());