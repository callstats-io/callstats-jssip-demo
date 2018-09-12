//getting DOM elements
var btnLogin = document.getElementById('btnLogin')
var btnCall = document.getElementById('btnCall')
var localUser = document.getElementById('localUser')
var remoteUser = document.getElementById('remoteUser')
var localVideo = document.getElementById('localVideo')
var remoteVideo = document.getElementById('remoteVideo')

//some useful variables
var ua = null;
var session = null;
var interop = new SdpInterop.InteropChrome();
var isChrome = window.chrome;
var KITE = {};

function doHash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 6) - hash) + chr;
        hash |= 0;
    }
    return hash
};

// Get a custom conference ID based
function getConferenceID() {
    if( !(session &&
        session._remote_identity && session._remote_identity._uri && session._remote_identity._uri._user &&
        session._ua && session._ua._configuration && session._ua._configuration.authorization_user )){
        return null;
    }
    let tags = [session._remote_identity._uri._user, session._ua._configuration.authorization_user];
    tags.sort();
    const hashValue = 'jssip-'+Math.round(Math.random()*100)+":"+doHash(tags.join(''));
    return hashValue;
}

//change this ip to your asterisk server
const domain = ASTERISK_SERVER;

//button events

btnLogin.addEventListener('click', () => {
    // Create our JsSIP instance and run it:

    let userName = localUser.value.split(':')[0];
    let password = localUser.value.split(':')[1];

    var socket = new JsSIP.WebSocketInterface('wss://' + domain + ':8443/ws')
    var configuration = {
        sockets: [socket],
        uri: 'sip:'+ userName +'@' + domain,
        authorization_user: userName,
        password: password
    };

    ua = new JsSIP.UA(configuration)

    ua.start()

    ua.on('connected', function (e) {
        console.log('connected', e)
    })

    ua.on('disconnected', function (e) {
        console.log('disconnected', e)
    })

    ua.on('newRTCSession', function (e) {
        console.log('newRTCSession', e);
        session = e.session;
        const customConferenceID = getConferenceID();
        if(customConferenceID) {
            console.log('changing conference id to -> ', customConferenceID);
            session.data.conferenceID = customConferenceID;
        }

        if(e.originator === 'remote') {
            session.answer()
        }

        session.on('sdp', (data) => {
            if(isChrome) {
                console.log('doing dark magic in chrome...')
                let desc = new RTCSessionDescription({
                    type: data.type,
                    sdp: data.sdp
                })
                if (data.originator === 'local') {
                    converted = interop.toUnifiedPlan(desc)
                } else {
                    converted = interop.toPlanB(desc)
                }

                data.sdp = converted.sdp
            }
        })

        session.on('ended', data => {
            localVideo.src = ''
            remoteVideo.src = ''
            remoteUser.style.display = 'inline'
            btnCall.style.display = 'inline'
            btnHangup.style.display = 'none'
        })

        session.on('confirmed', () => {
            stream = session.connection.getLocalStreams()[0]
            localVideo.srcObject = stream
            remoteUser.style.display = 'none'
            btnCall.style.display = 'none'
            btnHangup.style.display = 'inline'
        })

        session.connection.ontrack = evt => {
            console.warn('on remote track received');
            remoteVideo.srcObject = evt.streams[0]
        }
    })

    ua.on('registered', function (e) {
        console.log('registered', e)

        localUser.style.display = 'none'
        btnLogin.style.display = 'none'
        showUser.innerText = 'Logged as: ' + localUser.value
        remoteUser.style.display = 'inline'
        btnCall.style.display = 'inline'
    })
    ua.on('unregistered', function (e) {
        console.log('unregistered', e)
    })
    ua.on('registrationFailed', function (e) {
        console.log('registrationFailed', e)
        showUser.innerText = 'Username is not valid'
    })
    const appID = CSIO_APP_ID
    const appSecret = CSIO_APP_SECRET
    const localUserID = null;
    const csInitCallback = function(csError, csErrMsg) {
        console.warn('->', 'Status: errCode= ' + csError + ' errMsg= ' + csErrMsg);
        // KITE binding for csio initialization result.
        KITE.csInitCallbackResult = {
            status: csError,
            msg: csErrMsg
        };
    };
    const csStatsCallback = function(err, msg) {
        console.warn('->', err, msg);
        // KITE binding for csio callstats result.
        KITE.csCallbackResult = {
            status: err,
            msg: msg
        };
    };
    const configParams = undefined;
    callstatsjssip(ua, appID, appSecret, localUserID, csInitCallback, csStatsCallback, configParams);
});

btnCall.addEventListener('click', () => {
    var options = {
        'mediaConstraints': {
            'audio': true,
            'video': true
        },
        'pcConfig': {
            'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
        }
    }

    session = ua.call('sip:' + remoteUser.value + '@' + domain, options)
})

btnHangup.addEventListener('click', () => {
    session.terminate()
    session = null
});
