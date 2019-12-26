import React, { useState, useEffect, SyntheticEvent } from "react";

import * as VoxImplant from "voximplant-websdk";
import { EventHandlers } from "voximplant-websdk/EventHandlers";
import { Call } from "voximplant-websdk/Call/Call";

const appName = process.env.REACT_APP_APP_NAME;
const appUsername = process.env.REACT_APP_USER_NAME;

const Video: React.FC = () => {
  const sdk = VoxImplant.getInstance();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [caller, setCaller] = useState("");
  const [option, setOption] = useState("call");
  const [currentCall, setCurrentCall] = useState<Call | null>(null);

  const onChangeUsername = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setUsername(target.value);
  };

  const onChangePassword = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setPassword(target.value);
  };

  const onChangeCaller = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setCaller(target.value);
  };

  const onSelect = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setOption(target.value);
  };

  // SDK関連

  const connect = () => {
    console.log("Establishing connection...");
    sdk
      .connect()
      .then((res: Object) => console.log(res))
      .catch((err: ErrorEvent) => console.error(err));
  };

  const onSdkReady = () => {
    console.log(`onSDKReady version ${VoxImplant.version}`);
    console.log(`WebRTC supported: ${sdk.isRTCsupported()}`);
    connect();
  };

  const login = (appUser: string, password: string) => {
    const URI = `${appUser}@${appName}.${appUsername}.voximplant.com`;
    return sdk.login(URI, password);
  };

  const onConnectionEstablished = () => {
    console.log(`Connection established: ${sdk.connected()}`);
  };

  const onConnectionFailed = () => {
    console.log("Connection failed");
    setTimeout(() => {
      sdk.connect();
    }, 1000);
  };

  const onConnectionClosed = () => {
    console.log("Connection closed");
    setTimeout(() => {
      sdk.connect();
    }, 1000);
  };

  const showLocalVideo = (flag: boolean) => {
    sdk.showLocalVideo(flag);
  };

  const showRemoteVideo = (flag: boolean) => {
    currentCall?.showRemoteVideo(flag);
  };

  const sendVideo = (flag: boolean) => {
    currentCall?.sendVideo(flag);
  };

  const onAuthResult = (e: EventHandlers.AuthResult) => {
    console.log(`AuthResult: ${e.result}`);

    if (e.result) {
      const panelTitle = document.getElementsByClassName("panel-title")[1];
      const title = `${panelTitle.innerHTML}: Logged in as ${e.displayName}`;
      panelTitle.innerHTML = title;
      showLocalVideo(true);
    } else {
      console.warn(`Code: ${e.code}`);
    }
  };

  const onMediaElement = (e: EventHandlers.MediaElementCreated) => {
    const container = document.getElementById("voximplant_container");
    const video = e.element as HTMLVideoElement;
    video.width = 320;
    video.height = 240;
    container?.appendChild(video);
  };

  const onCallConnected = () => {
    const callButton = document.getElementById("callButton");
    const answerButton = document.getElementById("answerButton");
    const cancelButton = document.getElementById("cancelButton");

    console.log("Call is connected.");

    sendVideo(true);
    showRemoteVideo(true);

    callButton?.classList.add("hidden");
    answerButton?.classList.add("hidden");
    cancelButton?.classList.remove("hidden");
  };

  const onCallDisconnected = () => {
    const callButton = document.getElementById("callButton");
    const answerButton = document.getElementById("answerButton");
    const cancelButton = document.getElementById("cancelButton");

    setCurrentCall(null);

    console.log("Call is disconnected.");

    if (option === "call") {
      callButton?.classList.remove("hidden");
      callButton?.removeAttribute("disabled");
    } else if (option === "answer") {
      answerButton?.classList.remove("hidden");
      answerButton?.removeAttribute("disabled");
    }
    cancelButton?.classList.add("hidden");
  };

  const onCallFailed = (e: EventHandlers.Failed) => {
    console.error(`Call failed! code: ${e.code} reason: ${e.reason}`);
  };

  const onIncomingCall = (e: EventHandlers.IncomingCall) => {
    e.call.on(VoxImplant.CallEvents.Connected, onCallConnected);
    e.call.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
    e.call.on(VoxImplant.CallEvents.Failed, onCallFailed);
    e.call.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);

    console.log(`Incoming call from: ${e.call.number()}`);

    e.call.answer(undefined, {}, { receiveVideo: true, sendVideo: true });
    setCurrentCall(e.call);
  };

  // 各ボタンのonClick

  const onClickCall = () => {
    const callButton = document.getElementById("callButton");
    const userInput = document.getElementById(
      "usernameForVideo"
    ) as HTMLInputElement;
    const passInput = document.getElementById(
      "passwordForVideo"
    ) as HTMLInputElement;
    const selectPicker = document.getElementsByClassName("selectpicker")[0];

    login(username, password)
      .then(() => {
        console.log("Login successful");

        userInput.value = "";
        passInput.value = "";

        console.log("Calling...");
      })
      .then(() => {
        callButton?.setAttribute("disabled", "true");
        selectPicker.classList.add("hidden");
      })
      .catch((err: ErrorEvent) => console.error(err));
  };

  const onClickAnswer = () => {
    const userInput = document.getElementById(
      "usernameForVideo"
    ) as HTMLInputElement;
    const passInput = document.getElementById(
      "passwordForVideo"
    ) as HTMLInputElement;
    const callerInput = document.getElementById(
      "callerName"
    ) as HTMLInputElement;

    login(username, password)
      .then(async () => {
        console.log("Login successful");

        userInput.value = "";
        passInput.value = "";
        callerInput.value = "";

        const call = await sdk.call(caller, {
          sendVideo: true,
          receiveVideo: true
        });

        call.on(VoxImplant.CallEvents.Connected, onCallConnected);
        call.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
        call.on(VoxImplant.CallEvents.Failed, onCallFailed);
        call.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);

        setCurrentCall(call);

        console.log("Answering...");
      })
      .catch((err: string) => console.error(err));
  };

  const onClickDisconnect = () => {
    currentCall?.hangup();
  };

  // SDKの初期化

  const [once, setOnce] = useState(false);

  if (!once) {
    const initialize = () => {
      try {
        sdk
          .init({
            micRequired: true,
            videoSupport: true,
            progressTone: true,
            localVideoContainerId: "voximplant_container",
            remoteVideoContainerId: "voximplant_container"
          })
          .then(() => {
            console.log("SDK initialized");
          });
      } catch (e) {
        console.error(e);
      }
    };

    initialize();

    sdk.on(VoxImplant.Events.SDKReady, onSdkReady);
    sdk.on(VoxImplant.Events.ConnectionEstablished, onConnectionEstablished);
    sdk.on(VoxImplant.Events.ConnectionFailed, onConnectionFailed);
    sdk.on(VoxImplant.Events.ConnectionClosed, onConnectionClosed);
    sdk.on(VoxImplant.Events.AuthResult, onAuthResult);
    sdk.on(VoxImplant.Events.IncomingCall, onIncomingCall);

    setOnce(true);
  }

  // ボタン表示の初期化

  useEffect(() => {
    const callButton = document.getElementById("callButton");
    const answerButton = document.getElementById("answerButton");
    const callerInput = document.getElementById("callerName");

    if (option === "call") {
      callButton?.classList.remove("hidden");
      answerButton?.classList.add("hidden");
      callerInput?.classList.add("hidden");
    } else if (option === "answer") {
      callButton?.classList.add("hidden");
      answerButton?.classList.remove("hidden");
      callerInput?.classList.remove("hidden");
    }
  }, [option]);

  return (
    <div className="jumbotron vertical-center">
      <div className="container">
        <section id="container" className="panel panel-default">
          <header className="panel-heading">
            <h3 className="panel-title">Video Component</h3>
            <select className="selectpicker" value={option} onChange={onSelect}>
              <option value="call">Call</option>
              <option value="answer">Answer</option>
            </select>
          </header>
          <main id="content" className="panel-body">
            <div id="voximplant_container"></div>
            <div id="controls">
              <div className="input-wrapper">
                <div className="input-group">
                  <span className="input-group-addon">@</span>
                  <input
                    id="usernameForVideo"
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    onChange={onChangeUsername}
                  />
                </div>
                <div className="input-group">
                  <input
                    id="passwordForVideo"
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    onChange={onChangePassword}
                  />
                </div>
                <div className="input-group">
                  <input
                    id="callerName"
                    type="text"
                    className="form-control"
                    placeholder="Answer to"
                    onChange={onChangeCaller}
                  />
                </div>
              </div>
              <div className="btn-group btn-group-justified">
                <div className="btn-group">
                  <button
                    className="btn btn-success"
                    id="callButton"
                    onClick={onClickCall}
                  >
                    Call
                  </button>
                  <button
                    onClick={onClickAnswer}
                    className="btn btn-success hidden"
                    id="answerButton"
                  >
                    Answer
                  </button>
                  <button
                    onClick={onClickDisconnect}
                    className="btn btn-danger hidden"
                    id="cancelButton"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
};
export default Video;
