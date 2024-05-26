import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var dps = [
  { x: 1, y: 10 },
  { x: 2, y: 13 },
  { x: 3, y: 18 },
  { x: 4, y: 20 },
  { x: 5, y: 17 },
  { x: 6, y: 10 },
  { x: 7, y: 13 },
  { x: 8, y: 18 },
  { x: 9, y: 20 },
  { x: 10, y: 17 },
];

var xVal = dps.length + 1;
var yVal = 15;
var updateInterval = 1000;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.updateChart = this.updateChart.bind(this);

    this.state = {
      csrf: "",
      username: "",
      password: "",
      error: "",
      isAuthenticated: false,
    };
  }

  componentDidMount = () => {
    this.getSession();
    setInterval(this.updateChart, updateInterval);
  };

  getCSRF = () => {
    fetch("http://localhost:8000/api/csrf/", {
      credentials: "include",
    })
      .then((res) => {
        let csrfToken = res.headers.get("X-CSRFToken");
        this.setState({ csrf: csrfToken });
        console.log(csrfToken);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getSession = () => {
    fetch("http://localhost:8000/api/session/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.isAuthenticated) {
          this.setState({ isAuthenticated: true });
        } else {
          this.setState({ isAuthenticated: false });
          this.getCSRF();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  whoami = () => {
    fetch("http://localhost:8000/api/whoami/", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("You are logged in as: " + data.username);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  price = () => {
    fetch("http://localhost:8000/api/price/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data.price);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  updateChart() {
    yVal = yVal + Math.round(5 + Math.random() * (-5 - 5));
    dps.push({ x: xVal, y: yVal });
    xVal++;
    if (dps.length > 10) {
      dps.shift();
    }
    this.chart.render();
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleUserNameChange = (event) => {
    this.setState({ username: event.target.value });
  };

  isResponseOk(response) {
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  login = (event) => {
    event.preventDefault();
    fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.state.csrf,
      },
      credentials: "include",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    })
      .then(this.isResponseOk)
      .then((data) => {
        console.log(data);
        this.setState({
          isAuthenticated: true,
          username: "",
          password: "",
          error: "",
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ error: "Wrong username or password." });
      });
  };

  logout = () => {
    fetch("http://localhost:8000/api/logout", {
      credentials: "include",
    })
      .then(this.isResponseOk)
      .then((data) => {
        console.log(data);
        this.setState({ isAuthenticated: false });
        this.getCSRF();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const options = {
      title: {
        text: "Dynamic Line Chart",
      },
      data: [
        {
          type: "line",
          dataPoints: dps,
        },
      ],
    };
    if (!this.state.isAuthenticated) {
      return (
        <div className="container mt-3">
          <h1>React Cookie Auth</h1>
          <br />
          <h2>Login</h2>
          <form onSubmit={this.login}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={this.state.username}
                onChange={this.handleUserNameChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={this.state.password}
                onChange={this.handlePasswordChange}
              />
              <div>
                {this.state.error && (
                  <small className="text-danger">{this.state.error}</small>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
        </div>
      );
    }
    return (
      <div className="container mt-3">
        <h1>React Cookie Auth</h1>
        <p>You are logged in!</p>
        <button className="btn btn-primary mr-2" onClick={this.whoami}>
          WhoAmI
        </button>
        <button className="btn btn-primary mr-2" onClick={this.price}>
          Price
        </button>
        <button className="btn btn-danger" onClick={this.logout}>
          Log out
        </button>
        <div>
          <CanvasJSChart
            options={options}
            onRef={(ref) => (this.chart = ref)}
          />
        </div>
      </div>
    );
  }
}

export default App;
