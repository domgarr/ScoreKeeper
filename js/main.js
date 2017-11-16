
window.onload = function () {
	
	// TODO:: Do your initialization job
	var redScore = 0;
	var blueScore = 0;
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
	try {
	    tizen.application.getCurrentApplication().exit();
	} catch (ignore) {
	}
    });

    // Sample code
    var redScoreHalf = document.getElementById("red_half_court");
    var blueScoreHalf = document.getElementById("blue_half_court");
    var redScoreText = document.getElementById("red_score");
    var blueScoreText = document.getElementById("blue_score");
    var minusRedScoreButton = document.getElementById("minus_red_score_button");
    var minusBlueScoreButton = document.getElementById("minus_blue_score_button");
    var redScoreArray = [0];
    var blueScoreArray = [0];
    
    redScoreHalf.addEventListener("click", function(){
    	console.log("Check");
    	redScore++;
    	if(redScore < 0){
    		redScore = 0;
    	}
    	
    	if(!remoteDevice.isConnected){
  		  remoteDevice.connect(connectSuccess, connectFail);
    	}else{
    	redScoreArray[0] = redScore;
    	red_score_characteristic.writeValue( redScoreArray  ,writeSuccess, writeFail);
    	}
    	redScoreText.innerHTML = ""  + redScore;
    	
    	
    });
    
    
    blueScoreHalf.addEventListener("click", function(){
    	blueScore++;
    	if(blueScore < 0){
    		blueScore = 0;
    	}
    	
    	blueScoreArray[0] = blueScore;
    	
    	
    	blue_score_characteristic.writeValue( blueScoreArray  ,writeSuccess, writeFail);
    	blueScoreText.innerHTML = ""  + blueScore;
    });
    
    var resetButton = document.getElementById("new_game_button");
    
    resetButton.addEventListener("click", function(){
    	var isNewGame = confirm("Are you sure?");
    	
    	if(!isNewGame){
    		return;
    	}
    	
    	redScore = 0;
    	blueScore = 0;
    	
    	redScoreText.innerHTML = ""  + redScore;
    	blueScoreText.innerHTML = ""  + blueScore;
    });
    
    
    
   
    
    minusBlueScoreButton.addEventListener("click",function(){
    	blueScore--;
    	if(blueScore < 0){
    		blueScore = 0;
    	}
    	blueScoreText.innerHTML = ""  + blueScore;
    });
    
    minusRedScoreButton.addEventListener("click",function(){
    	redScore--;
    	if(redScore < 0){
    		redScore = 0;
    	}
    	redScoreText.innerHTML = ""  + redScore;
    });

   
    var adapter = tizen.bluetooth.getLEAdapter();
    //var serviceUUID = 0x0113233445566778899AABBCCDDEEFF1;
    /* Retrieve known devices */
   
    
    var red_score_characteristic;
    var blue_score_characteristic;
    
    var scoreLimitButton = document.getElementById("score_limit_button");
    scoreLimitButton.addEventListener("click",function(){
    	//prompt("Set new score limit.", 25);
    	
    	
    	
    	
    	if(remoteDevice == null){
    		adapter.startScan(onDeviceFound);
    	}else{
    		device.connect(connectSuccess, connectFail);    
    	}	
    });
    
    function connectFail(error) {
        console.log('Failed to connect to device: ' + error.message);
    }

    function connectSuccess() {
        console.log('Connected to device');
        console.log(remoteDevice);
		var serviceUUIDs = remoteDevice.uuids;
		console.log(serviceUUIDs);
		var gattService = remoteDevice.getService(serviceUUIDs[0]);
		
		 red_score_characteristic = gattService.characteristics[0];
		 blue_score_characteristic = gattService.characteristics[1];
		 
		 console.log(red_score_characteristic);
		 console.log(blue_score_characteristic);
		 
		 red_score_characteristic.readValue(readRedCharacteristicSuccess, readFail);
		 blue_score_characteristic.readValue(readBlueCharacteristicSuccess);
		 
        watchId = remoteDevice.addConnectStateChangeListener(connectionListener, readFail);
    }
    
    var remoteDevice = null;

    function onDeviceFound(device) {
        if (remoteDevice === null) {
            remoteDevice = device;
            console.log('Found device ' + device.name + '. Connecting...');
         
            device.connect(connectSuccess, connectFail);    
        }

        adapter.stopScan();
    }
  
    function readRedCharacteristicSuccess(value) {
      redScore = value[0];
    	
     
    }
    

    function readBlueCharacteristicSuccess(value) {
       blueScore = value[0];
    	
    }

    function readFail(error) {
        console.log('readValue() failed: ' + error);
    }
    
 
    
    function writeSuccess(value) {
        console.log('Written');
    }

    function writeFail(error) {
        console.log('writeValue() failed: ' + error);
    }
    
    var newValue;

    
    function unloadPage()
    {
     if(adapter != null){
    	 adapter.stopScan();
     }
     if(remoteDevice != null){
    	 	remoteDevice.removeConnectStateChangeListener(watchId);
	        remoteDevice.disconnect();
	        remoteDevice = null;
	    }
     }
     
    }
    
    window.onunload = unloadPage;
    
    var connectionListener = {
    	    onconnected: function(device) {
    	        console.log('Connected to the device: ' + device.name + ' [' + device.address + ']');
    	    },
    	    ondisconnected: function(device) {
    	        console.log('Disconnected from the device ' + device.name + ' [' + device.address + ']');
    	        remoteDevice.removeConnectStateChangeListener(watchId);
    	        remoteDevice.disconnect();
    	        remoteDevice = null;
    	    }
    	};
   
    
    //adapter.startScan(successcallback);
};



