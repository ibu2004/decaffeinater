import "babel-polyfill";                     // polyfill to use async/await.
/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from "electron";        // ipc communication to main process.
import React from "react";
import ReactDOM from "react-dom";
// Following imports for semantic-ui, awsm CSS framework :D
/* eslint-disable no-unused-vars */
import { Button, Input, Progress, Segment } from "semantic-ui-react";

// sleep function to wait for some time.
function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

// Our main React component (and only one)
class Index extends React.Component {
  /* eslint-enable no-unused-vars */
  constructor(props) {
    super(props);

    // Set up initial configuration for state.
    this.state = {
      time: 0,
      process: "",
      countdown: 0,
      hours: 0,
      abstime: 0,
    };

    // Bind functions here.
    this.onStart = this.onStart.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, typeOfChange) {
    switch (typeOfChange) {
    case "hours": {
      const currentState = JSON.parse(JSON.stringify(this.state));
      const currentStateTime = currentState.abstime;
      this.setState({ abstime: currentStateTime + e.target.value * 3600, hours: e.target.value });
      break;
    }
    case "minutes": {
      const currentState = JSON.parse(JSON.stringify(this.state));
      const currentStateTime = currentState.abstime;
      this.setState({ abstime: currentStateTime + e.target.value * 60, time: e.target.value });
      break;
    }
    default: {
      undefined("Did I do that? :o sorry if you complain D:");
    }
    }
  }

  // click handler to start the countdown till process terminates.
  async onStart() {
    // initial variables here.
    let i = 0;
    // following 2 lines prevents user from tampering state during countdown.
    const time = this.state.time * 60 + this.state.hours * 3600;
    const process = JSON.parse(JSON.stringify(this.state)).process;
    this.setState({ abstime: time });
    // wait 1 second, then add 1 to this.state.countdown for (time) times.
    for (i = 0; i < time * 60; i + 1) {
      await sleep(1);
      this.setState({ countdown: this.state.countdown + 1 });
    }
    ipcRenderer.send("iCanKill?", process);     // send ipc message to main proc to kill process.
    this.setState({ countdown: 0 });          // reset countdown :D
  }

  // This function is big, but it's 90% styling, nothing of interest here.
  render() {
    const absTimer = this.state.abstime;
    return (
      <Segment style={{ margin: "12px" }} raised>
        <Input
          label="Time (in hours)"
          type="number" fluid
          placeholder="Insert amount of time to play in hours."
          onChange={ e => this.setState({ hours: e.target.value })} />
        <Input
          label="Time (in minutes)"
          type="number" fluid
          placeholder="Insert amount of time to play in minutes."
          onChange={ e => this.setState({ time: e.target.value })} />
        <Input
          label="Process"
          type="text" fluid
          placeholder="Insert the process name of the app."
          onChange={event => this.setState({ process: event.target.value })} />
        <br />
        <Button onClick={this.onStart} content="Click to start" inverted fluid color="green" />
        <br />
        <div></div>
        <Progress value={this.state.countdown}
          total={this.state.time * 60 + this.state.hours * 3600}
          indicating autoSuccess
          color="teal">
          Time left: {absTimer - this.state.countdown} seconds left, out of {absTimer} seconds.
        </Progress>
      </Segment>
    );
  }
}

// Render final app to the screen :D
ReactDOM.render(<Index />, document.getElementById("app"));
