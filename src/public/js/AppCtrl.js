(
  function() {
    appControllers.controller('AppCtrl', ['$scope', '$http', '$timeout',
      function ($scope, $http, $timeout) {
  
        var idolApikey;
        
        // Enable pusher logging - don't include this in production
        Pusher.log = function(message) {
          if (window.console && window.console.log) {
            window.console.log(message);
          }
        };

        //apikey for pusher in front is of no use without a backend which has non-public tokens
        var pusher = new Pusher('9cc5b9ff7aef4004fca0');
        pusher.connection.bind("state_change", function(change){
          //console.log(change.current);
          if(change.current) {
            document.getElementById("connection_status").innerHTML = change.current;
          } else {
            document.getElementById("connection_status").className = "label label-danger";
            document.getElementById("connection_status").innerHTML = "disconnected";
          }
          
        });
        
        //subscribe to the channel and bind to the event generated after API call from node server
        var channel = pusher.subscribe('test_channel');
        channel.bind('my_event', function(data) {
          console.log(data);
          
          //get data from pusher server and populate the chat section
          var node = document.createElement("div");
          node.className = "list-group-item";

          //set innerHTML color based on sentiment
          node.innerHTML = data.message;
          document.getElementById("message").appendChild(node);

          //draw the mood meter
          var sentiment = data.sentiment;
          var res = 0;
          var positivePts = 0;
          var negativePts = 0;

          //select containers
          var positive = d3.select(".positive");
          var negative = d3.select(".negative");

          if(sentiment > 0) {
            res = Math.round(sentiment * 10);
            console.log(res);
            positivePts = res * 5;

            //Draw the positive Rectangle
            positive.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", positivePts)
                .attr("height", 10)
                .attr("stroke", "green")
                .attr("fill", "green");

            //clear negative
            negative.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 50)
                .attr("height", 10)
                .attr("stroke", "red")
                .attr("fill", "white");

          } else if(sentiment < 0) {
            res = Math.abs(Math.round(sentiment * 10));
            console.log(res);
            negativePts = res * 5;

            //Draw the negative Rectangle
            negative.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", negativePts)
                .attr("height", 10)
                .attr("stroke", "red")
                .attr("fill", "red");

            //clear the positive Rectangle
            positive.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 50)
                .attr("height", 10)
                .attr("stroke", "green")
                .attr("fill", "white");

          } else {
            //clear negative
            negative.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 50)
                .attr("height", 10)
                .attr("stroke", "red")
                .attr("fill", "white");
                
            //clear the positive Rectangle
            positive.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 50)
                .attr("height", 10)
                .attr("stroke", "green")
                .attr("fill", "white");
          }
        });
        
        //handle the minimize chat button event
        $scope.minimize = function() {
          document.getElementById("placment").className = "row hide_chat";
        };
        
        //handle the maximize chat button event
        $scope.maximize = function() {
          
          //initialize the idol api key to be reused everywhere in the app
          $http.get('/getIdolApiKey').
            success(function(data, status, headers, config) {
              //console.log(data);
              idolApikey = data.apikey;
              console.log(idolApikey);
            }).
            error(function(data, status, headers, config) {
              //console.log(data);
          
              console.log(status);
            });
          document.getElementById("placment").className = "row";
        };
    
        $scope.getMessage = function () {
          console.log($scope.user_msg);

          //get sentiment
          //run sentiment analysis on transcript
          $http({
            url: "https://api.idolondemand.com/1/api/sync/analyzesentiment/v1",
            method: "GET",
            params: {
              apikey : idolApikey,
              text: $scope.user_msg
            }
          }).success(function (data,status) {
                console.log(data.aggregate.score);
                $scope.sentiment = data.aggregate.score;
              }
          );

          //clear out input field
          $("#user-message").val("");


          //timeout service is used to call the backend, enough time is given for score calculation which is passed to the pusher server through the node backend
          $timeout(function() {
            //console.log("before sending :" + $scope.sentiment);
            $http({
              url: "/message",
              method: "GET",
              params: {
                user_msg: $scope.user_msg,
                sentiment: $scope.sentiment
              }
            }).success(function (data,status) {
                  console.log(data);
                  //$scope.message = msg;
                }
            );
          }, 4000);
        };
      }
    ]);  
  }()
);