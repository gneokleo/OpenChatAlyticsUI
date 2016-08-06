import React, { Component } from 'react';
import TwoColumn from '../Layouts/TwoColumn';
import MainStore from '../../stores/MainStore';
import MainActions from '../../actions/MainActions';
import AwardsComponent from '../Layouts/Awards';
import AsyncComponent from './Async';
import AltContainer from 'alt-container';
import humanize from 'humanize';
import { Pie, Line } from 'react-chartjs';
import TwoColumnFixed from '../Layouts/TwoColumnFixed';
import DatePickerComponent from '../DatePicker';
import _ from 'lodash';

class MessagesComponent extends Component {

  render() {
    let lineOptions = {
      defaultFontFamily: 'PTMono',
      defaultFontSize: 12,
      responsive: true,
      legend: {
        display: false,
      },
      maintainAspectRatio: false,
      tooltips: {
        mode: 'single',
      },
      hover: {
        mode: 'dataset',
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      scales: {
        gridLines: {
          display: false,
        },
        xAxes: [{
          scaleLabel: {
            display: false,
            labelString: 'Month',
          },
        }],
        yAxes: [{
          display: false,
          stacked: false,
          scaleLabel: {
            display: false,
            labelString: 'Number of Messages',
          },
        }],
      },
    };
    return (
      <div className="chatalytics">
        <AltContainer store={MainStore}>
          <TwoColumn left={<h2>Messages</h2>}
            right={<div />}
          />
          <div style={{ textAlign: 'center', padding: '5em' }}>
            <h1>
              {this.props.totalMessages ?
                humanize.numberFormat(this.props.totalMessages, 0) :
                ''}
            </h1>
            <h2>Chat messages over the past year</h2>
          </div>
          <AsyncComponent isLoaded={() => this.props.messagesOverTime != null}
            loaded={this.props.messagesOverTime ?
              <Line data={this.props.messagesOverTime.clone()} options={lineOptions} height="150" />
              : <div />}
          />
          { false ? <TwoColumnFixed leftWidth="49%"
            left={<BotsVersusHumansComponent />}
            right={
              <div>
                <h3>Active Rooms & Users</h3>
                <TwoColumnFixed leftWidth="49%" left={
                    <AltContainer store={MainStore}>
                      <p>{this.props.rooms ? Object.keys(_.pickBy(this.props.rooms, (room) => !room.archived)).length : ''} Rooms</p>
                      <RoomsPieChart />
                    </AltContainer>
                  }
                  right={
                    <div>
                      <p>{this.props.users ? Object.keys(_.pickBy(this.props.users, (user) => !user.deleted)).length : ''} Users</p>
                    </div>
                  }
                />
              </div>
            }
          /> : <div /> }
          <h3>User</h3>
          <p>
            Out of the total {this.props.totalMessages ? humanize.numberFormat(this.props.totalMessages, 0) + " (in the past year)" : ""} chat messages,
            these users accounted for the largest percentage of messages sent.
          </p>
          <MessagesPerUserComponent />
          <h3>Room</h3>
          <p>These rooms sent the most messages overall (only counting messages sent by humans).</p>
          <MessagesPerRoomComponent />
        </AltContainer>
      </div>
    );
  }
}

class BotsVersusHumansComponent extends Component {

  isLoaded() {
    return this.props.totalMessages && this.props.totalHumanMessages;
  }

  render() {
    let options = {
      defaultFontFamily: 'PTMono',
      defaultFontSize: 12,
      responsive: true,
      legend: {
        position: 'bottom',
      },
      maintainAspectRatio: false,
    };

    let data = {};
    if (this.isLoaded()) {
      let botMessages = this.props.totalMessages - this.props.totalHumanMessages;
      data = {
        labels: ['Robots', 'Humans'],
        datasets: [{
          data: [botMessages, this.props.totalHumanMessages],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
          ],
        }],
      };
    }
    return (<div>
      <h3>Humans Versus Robots</h3>
      <p>Messages written by bots vs. messages written by humans.</p>
      <AsyncComponent isLoaded={this.isLoaded.bind(this)}
        loaded={this.isLoaded.bind(this) ?
          <Pie ref="chart" data={data} options={options} height="250" />
          : <div />}
      />
    </div>);
  }
}

class RoomsPieChart extends Component {

  isLoaded() {
    return this.props.rooms;
  }

  render() {
    let options = {
      defaultFontFamily: 'PTMono',
      defaultFontSize: 12,
      responsive: true,
      legend: {
        position: 'bottom',
      },
      maintainAspectRatio: false,
    };

    let data = {};
    if (this.isLoaded()) {
      const privateRooms = Object.keys(_.pickBy(this.props.rooms, (room) => room.private_room)).length;
      const publicRooms = Object.keys(_.pickBy(this.props.rooms, (room) => !room.private_room)).length;
      data = {
        labels: ['Public Rooms', 'Private Rooms'],
        datasets: [{
          data: [publicRooms, privateRooms],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
          ],
        }],
      };
    }
    return (<AsyncComponent
      isLoaded={this.isLoaded.bind(this)}
      loaded={this.isLoaded.bind(this) ?
        <Pie ref="chart" data={data} options={options} height="250" /> : <div />}
    />);
  }
}

class MessagesPerUserComponent extends Component {
  render() {
    return (
      <div>
        <DatePickerComponent onDateChanged={(starttime, endtime) =>
          MainActions.fetchActiveMessagesByUser({ starttime, endtime })} />
        <AsyncComponent isLoaded={() => this.props.activeMessagesByUser != null}
          loaded={this.props.activeMessagesByUser ?
            <AwardsComponent data={this.props.activeMessagesByUser} />
            : <div />}
        />
      </div>
    );
  }
}

class MessagesPerRoomComponent extends Component {
  render() {
    return (
      <div>
        <DatePickerComponent onDateChanged={(starttime, endtime) =>
          MainActions.fetchActiveMessagesByRoom({ starttime, endtime })} />
        <AsyncComponent isLoaded={() => this.props.activeMessagesByRoom != null}
          loaded={this.props.activeMessagesByRoom ?
            <AwardsComponent data={this.props.activeMessagesByRoom} />
            : <div />}
        />
      </div>
    );
  }
}

export default MessagesComponent;