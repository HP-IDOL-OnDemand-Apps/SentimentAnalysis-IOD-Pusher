(function(){
  appControllers.controller('SentimentCtrl', ['$scope', '$rootScope', '$http', '$interval', '$timeout',
    function($scope, $rootScope, $http, $interval, $timeout) {
      //console.log("Inside SentimentCtrl");
      console.log(fileURL);
      console.log("rootscope :" + $rootScope.test);
      var jobID = "";
      var sentiment, score, msg;
      var idolApikey;
      
      $http.get('/getIdolApiKey').
        success(function(data, status, headers, config) {
          //console.log(data);
          idolApikey = data.apikey;
          console.log(idolApikey);
          
          //get jobID for the async request made to the speech recognition api
          $http({
            url: "https://api.idolondemand.com/1/api/async/recognizespeech/v1",
              method: "GET",
              params: {
                url : fileURL,
                apikey : idolApikey
              }
          }).success(function (res) {
              jobID = res.jobID;
              console.log(jobID);
            }).
            error(function(data, status, headers, config) {
              console.log(status);
            });

      
  
          //check status of the job and get data on success, implemeting interval service to make repeated calls till the data is available
          var promise = $interval(function() {
            $http({
                url: "https://api.idolondemand.com/1/job/status/"+jobID,
                method: "GET",
                params: {
                  apikey : idolApikey
                }
            }).success(function (resp) {
                var status = resp.status;
                console.log(status);
                if(status === "finished") {
                  console.log(resp.actions[0].result.document[0].content);
                  var transcript = resp.actions[0].result.document[0].content;
                  
                  //show result
                  document.getElementById("transcript").innerHTML = transcript;
            
                  //hide spinner
                  document.getElementById("hideSpinner").className = "fa-ul hideSpinner";
                  
                  //remove spinner area
                  document.getElementById("transcriptWrapper").className = "";
                  
                  //bring result area
                  document.getElementById("transcript").className = "";
                  document.getElementById("buttonArea").className = "submitArea";
                  $interval.cancel(promise);
                }
            }).error(function(error) {
                console.log(error);
            });
          }, 20000);
  
      }).error(function(err) {
          console.log(err);
      });
      
      $scope.getSentiment = function() {
        var transcript = document.getElementById("transcript").innerHTML;
        //console.log(transcript);
        
        //run sentiment analysis on transcript returned
        $http({
          url: "https://api.idolondemand.com/1/api/sync/analyzesentiment/v1", 
          method: "GET",
          params: {
            apikey : idolApikey,
            text: transcript
          }
        }).success(function (data,status) {
            console.log(data);
            sentiment = JSON.stringify(data.aggregate.sentiment);
            score = JSON.stringify(data.aggregate.score);
            document.getElementById("aggregateSentiment").innerHTML = "The aggregate sentiment of your media is " + sentiment + " with score " + Math.round(Math.abs(score) * 100) + "%";
            //console.log(sentiment);

            //setting percentage for the charting functionality
            var percent = Math.abs(score);
                                      
            //Radial chart
            var colors = {
                'pink': '#E1499A',
                'yellow': '#f0ff08',
                'green': '#47e495'
            };
  
            var color = colors.pink;
            
            var radius = 100;
            var border = 5;
            var padding = 30;
            var startPercent = 0;
            var endPercent = percent;
            
            
            var twoPi = Math.PI * 2;
            var formatPercent = d3.format('.0%');
            var boxSize = (radius + padding) * 2;
            
            
            var count = Math.abs((endPercent - startPercent) / 0.01);
            var step = endPercent < startPercent ? -0.01 : 0.01;
  
            var arc = d3.svg.arc()
                .startAngle(0)
                .innerRadius(radius)
                .outerRadius(radius - border);
            
            var parent = d3.select('div#content');
            
            parent.select("svg").remove();
            
            var svg = parent.append('svg')
                .attr('width', boxSize)
                .attr('height', boxSize);
            
            var defs = svg.append('defs');
            
            var filter = defs.append('filter')
                .attr('id', 'blur');
            
            filter.append('feGaussianBlur')
                .attr('in', 'SourceGraphic')
                .attr('stdDeviation', '7');
            
            var g = svg.append('g')
                .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');
  
            var meter = g.append('g')
                .attr('class', 'progress-meter');
            
            meter.append('path')
                .attr('class', 'background')
                .attr('fill', '#ccc')
                .attr('fill-opacity', 0.5)
                .attr('d', arc.endAngle(twoPi));
            
            var foreground = meter.append('path')
                .attr('class', 'foreground')
                .attr('fill', color)
                .attr('fill-opacity', 1)
                .attr('stroke', color)
                .attr('stroke-width', 5)
                .attr('stroke-opacity', 1)
                .attr('filter', 'url(#blur)');
  
            var front = meter.append('path')
                .attr('class', 'foreground')
                .attr('fill', color)
                .attr('fill-opacity', 1);
            
            var numberText = meter.append('text')
                .attr('fill', '#fff')
                .attr('text-anchor', 'middle')
                .attr('dy', '.35em');
            
            function updateProgress(progress) {
                foreground.attr('d', arc.endAngle(twoPi * progress));
                front.attr('d', arc.endAngle(twoPi * progress));
                numberText.text(formatPercent(progress));
            }
            
            var progress = startPercent;
            
            (function loops() {
                updateProgress(progress);
            
                if (count > 0) {
                    count--;
                    progress += step;
                    setTimeout(loops, 10);
                }
            })();
            
            //make send mail btn visible
            document.getElementById("sendMailBtn").className = "btn btn-primary pull-left";
            document.getElementById("mailInputField").className = "form-control pull-left";
          }
        );
      };

        $scope.sendMail = function() {
          
            $http.get('/getCloudElementsToken').
              success(function(data, status, headers, config) {
                cloud_elements_key = data.Authorization;
                console.log(cloud_elements_key);
                  
                console.log("Requesting API to send mail");
                msg = "sentiment of your media is " + String(sentiment).replace(/["']/g, "") + " and score is " + String(Math.round(Math.abs(score) * 100)) + "%";
                console.log($scope.email_id);
  
                //reqesting the cloud-elements api to send email notification once the message is prepared
                $timeout(function(){
                  $http({
                    url: "https://console.cloud-elements.com/elements/api-v2/hubs/messaging/messages",
                    method: "POST",
                    headers: {
                    Authorization : cloud_elements_key
                    },
                    data : {
                      "subject": "Sentiment Analysis of your submitted media",
                      "message": msg,
                      "from": "no-reply@gmail.com",
                      "to": $scope.email_id
                    }
                  }).success(function (data) {
                          console.log(data);
                          document.getElementById("hideShowMailSentMsg").className = "row pull-left";
                          document.getElementById("hideSentMailArea").className = "row pull-left hideSentMailArea";      
                          document.getElementById("mailInputField").className ="";              
                      }
                  ).error(function(err) {
                          console.log(err);
                      });
                }, 5000);
            
              }).
              error(function(data, status, headers, config) {
                console.log(status);
              });
  

        };
    }
  ]);
}());