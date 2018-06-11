var redScore = 0;
var blueScore = 0;
//References to Bluetooth LE adapter and the connected Scoreboard.
var adapter;
var remoteDevice = null;
//References to the Scoreboard manager service and included characteristics.
var serviceUUIDs;
var gattService;
var red_score_characteristic;
var blue_score_characteristic;
//Gets written to characteristic.
var redScoreArray = [0];
var blueScoreArray = [0];
    
window.onload = function () {	
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName === "back")
	        {
			try {
			    tizen.application.getCurrentApplication().hide();
			} catch (ignore) {
				
			}
        }
     });
    
   
    adapter = tizen.bluetooth.getLEAdapter();
 
    var court = document.getElementById("court");
    var redScoreHalf = document.getElementById("red_half_court");
    var blueScoreHalf = document.getElementById("blue_half_court");
    var redScoreText = document.getElementById("red_score");
    var blueScoreText = document.getElementById("blue_score");
    
    var minusRedScoreButton = document.getElementById("minus_red_score_button");
    var minusBlueScoreButton = document.getElementById("minus_blue_score_button");
    var resetButton = document.getElementById("new_game_button");
    var swapButton = document.getElementById("swap_button"); 
   
    redScoreHalf.addEventListener("click", function(){
    	redScore++;
    	if(redScore < 0){
    		redScore = 0;
    	}
    	
    	render();
    	redScoreArray[0] = redScore;
    	
    	if(remoteDevice !== null && remoteDevice.isConnected){
    	red_score_characteristic.writeValue( redScoreArray, writeSuccess, writeFail);
    	}else{
        	connect();
    	}
    	
    });
    
    
    blueScoreHalf.addEventListener("click", function(){
    	blueScore++;
    	if(blueScore < 0){
    		blueScore = 0;
    	}
    	render();
    	blueScoreArray[0] = blueScore;
    	
    	if(remoteDevice !== null && remoteDevice.isConnected){
    	blue_score_characteristic.writeValue( blueScoreArray, writeSuccess, writeFail);
    	}else{
        	connect();
    	}
    	
    
    });
    
  
    
    resetButton.addEventListener("click", function(){
    	var isNewGame = confirm("Are you sure?");
    	
    	if(!isNewGame){
    		return;
    	}
    	
    	redScore = 0;
    	blueScore = 0;
    	
    	render();
    	
    	blueScoreArray[0] = blueScore;
    	redScoreArray[0] = redScore;
    	
    	if(remoteDevice !== null && remoteDevice.isConnected){
    		red_score_characteristic.writeValue( redScoreArray, writeSuccess, writeFail);
    		
    		setTimeout(function(){ 		
        		blue_score_characteristic.writeValue( blueScoreArray, writeSuccess, writeFail);
    		}, 500);
    	}else{
    		connect();
    	}
    	
    	render();
    });
    
    minusBlueScoreButton.addEventListener("click",function(){
    	blueScore--;
    	if(blueScore < 0){
    		blueScore = 0;
    	}
    	
    	render();
    	
    	blueScoreArray[0] = blueScore;
    	
    	if(remoteDevice !== null && remoteDevice.isConnected){
        	blue_score_characteristic.writeValue( blueScoreArray, writeSuccess, writeFail);
        	}else{
        	connect();
        	}
    	
    	
    	
    });
    
    minusRedScoreButton.addEventListener("click",function(){
    	redScore--;
    	if(redScore < 0){
    		redScore = 0;
    	}
    	render();
    	
    	redScoreArray[0] = redScore;
    	
      	if(remoteDevice !== null && remoteDevice.isConnected){
        	red_score_characteristic.writeValue( redScoreArray, writeSuccess, writeFail);
        }else{
        	connect();
    	}
      	
  
    });

    swapButton.addEventListener("click",function(){
    	court.insertBefore(court.children[1], court.children[0]);
    });
    
    function connect(){
    	console.log("Attempting to connect...");
    	if(remoteDevice === null){
    		adapter.startScan(onDeviceFound);
    		
    	}else{
    		remoteDevice.connect(connectSuccess, connectFail);    
    	}	
    }
    
    function connectFail(error) {
        console.log('Failed to connect to device: ' + error.message);
    }

    function connectSuccess() {
    	
        if(serviceUUIDs == null){
    	console.log(adapter);
    	console.log('Connected to device');
        console.log(remoteDevice);
		serviceUUIDs = remoteDevice.uuids;
		console.log(serviceUUIDs);
		gattService = remoteDevice.getService(serviceUUIDs[0]);
		
		red_score_characteristic = gattService.characteristics[0];
		blue_score_characteristic = gattService.characteristics[1];
		
		resetButton.classList.add("green");
		
		console.log(red_score_characteristic);
		console.log(blue_score_characteristic);
		 
		red_score_characteristic.readValue(readRedCharacteristicSuccess, readFail);
		setTimeout(function(){ 				
			blue_score_characteristic.readValue(readBlueCharacteristicSuccess, readFail);
		}, 500);
        }
		
		     
    }
    
    var watchId;
  
    var connectionListener = {
    	    onconnected: function(device) {
    	    	resetButton.classList.add("green");
    	    },
    	    ondisconnected: function(device) {
    	    	resetButton.classList.remove("green");
    	    }
    	};

    function onDeviceFound(device) {
        if (remoteDevice === null) {
            remoteDevice = device;
            console.log('Found device ' + device.name + '. Connecting...');
         
            watchId = remoteDevice.addConnectStateChangeListener(connectionListener);
            
            device.connect(connectSuccess, connectFail);    
        }

        adapter.stopScan();
    }
  
    function readRedCharacteristicSuccess(value) {
      redScore = value[0];
      render();
    }
    
    function readBlueCharacteristicSuccess(value) {
       blueScore = value[0];	
       render();
    }

    function readFail(error) {
        console.log('readValue() failed: ' + error);
    }
    
    function writeSuccess() {
        console.log('written');
    }

    function writeFail(error) {
        console.log('writeValue() failed: ' + error);
    }
    
    function render(){
    	redScoreText.innerHTML = ""  + redScore;
    	blueScoreText.innerHTML = ""  + blueScore;
    }
    
  //Handle page visibility change events
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        remoteDevice.disconnect();
      } else {
    	  remoteDevice.connect(connectSuccess, connectFail);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    setTimeout(function(){ 				
    	connect();
	}, 2000);
};

window.onerror = function() {
    
	if(adapter !== null){
    	 adapter.stopScan();
     }
     if(remoteDevice !== null){
    	console.log("remoteDevice cleanup..."); 
	    remoteDevice.disconnect();
	    remoteDevice = null;
	 }
};

window.onunload = function() {
    console.log("unload function called.") ;
	if(adapter !== null){
    	 adapter.stopScan();
     }
     if(remoteDevice !== null){
    	console.log("remoteDevice cleanup..."); 
	    remoteDevice.disconnect();
	    remoteDevice = null;
	 }
};



