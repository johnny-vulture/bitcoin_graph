import React, { Component } from "react";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class App extends Component {
  constructor(props) {
    super(props);

    // Initialize component state
    this.state = {
      isAuthenticated: false,
      dps: [],
    };
  }

  componentDidMount() {
    // When component mounts, check session and fetch initial data
    this.getSession();
    // Set interval to update chart at regular intervals
    setInterval(this.updateChart, 1000);
  }

  getSession = () => {
    // Fetch session data or authentication status
    // You can implement this function according to your authentication logic
    // For demo purposes, setting isAuthenticated to true
    this.setState({ isAuthenticated: true });

    // Fetch initial price data
    this.fetchPrice();
  };

  fetchPrice = () => {
    // Fetch price data from API
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
        // Generate data points array based on fetched price data
        this.generateDpsArray(data.price);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  generateDpsArray = (price) => {
    // Generate data points array based on price
    const dps = [];
    for (let i = 0; i < 10; i++) {
      let yValue;
      if (i < 3) {
        yValue = price + 100 * (3 - i);
      } else if (i === 3) {
        yValue = price;
      } else {
        yValue = price - 100 * (i - 3);
      }
      dps.push({ x: i + 1, y: yValue });
    }
    // Update component state with new data points array
    this.setState({ dps });
  };

  updateChart = () => {
    // Update chart only if user is authenticated and dps is available
    if (this.state.isAuthenticated && this.state.dps.length > 0) {
      // Generate new random data point
      const newDataPoint = {
        x: this.state.dps.length + 1,
        y: this.state.dps[this.state.dps.length - 1].y + Math.round(5 + Math.random() * (-5 - 5)),
      };
      // Update data points array by removing first element and adding new data point
      const newDps = [...this.state.dps.slice(1), newDataPoint];
      // Update component state with updated data points array
      this.setState({ dps: newDps });
    }
  };

  render() {
    const { isAuthenticated, dps } = this.state;

    // Chart options with current data points
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

    return (
      <div className="container mt-3">
        <h1>React Cookie Auth</h1>
        {isAuthenticated ? (
          <div>
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
        ) : (
          <div>
            <h2>Login</h2>
            {/* Your login form goes here */}
          </div>
        )}
      </div>
    );
  }
}

export default App;
