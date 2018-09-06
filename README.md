# callstats-jssip-demo
Yet another example of how WebRTC application using callstats-jssip library, and asterisk SIP as a signalling layer.


## Running the example
To run the app, we will need NodeJS and a SIP server. In this example we use Asterisk. 

- 1 Clone the repo
    
    ``` git clone https://github.com/callstats-io/callstats-jssip.git ```
- 2 Install npm and bower dependencies
    
    ```
    cd  callstats-jssip-demo
    npm install
    bower install    
    ```
- 3 Run the demo
    
    Fill .env file with right credentials
        
    ```
        npm run dev 
    ```
    or to run without any debug log
    ```
        npm start 
    ```    

The demo application is depends on csio JsSIP, and JsSIP library. You can change the library version from codebase before running the application.

### Credit
The app is a cloned from [https://github.com/agilityfeat/webrtc-sip-example](https://github.com/agilityfeat/webrtc-sip-example)
