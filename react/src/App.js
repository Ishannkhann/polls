import React, { useState, useEffect } from "react";
import Axios from "axios";
import normalize from "json-api-normalize";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  const [polls, setPolls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(0);
  const [orientation, setOrientation] = useState("vertical");

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOrientation("horizontal");
    }
    const getPolls = async () => {
      const { data: response } = await Axios.get(
        "https://dev-polls.pantheonsite.io/jsonapi/node/poll?include=field_options&fields[node--options]=field_votes,title"
      );
      const normalizedPolls = normalize(response).get([
        "id",
        "title",
        "field_options"
      ]);
      setPolls(normalizedPolls);
    };

    getPolls();
  }, [success]);

  if (!polls) {
    return <div>Loading...</div>;
  }

  const vote = async (id, currentVotes) => {
    setLoading(true);
    await Axios.patch(
      `https://dev-polls.pantheonsite.io/jsonapi/node/option/${id}`,
      {
        data: {
          type: "node--option",
          id: id,
          attributes: {
            field_votes: Number(currentVotes) + 1
          }
        }
      },
      {
        headers: {
          Authorization: "Basic aXNoYW5raGFuOm5haGtuYWhzaQ==",
          Accept: `application/vnd.api+json`,
          "Content-Type": "application/vnd.api+json"
        }
      }
    );
    setLoading(false);
    setSuccess(success + 1);
  };

  const getLabels = data => {
    return data.map(i => i.attributes.title);
  };

  const getVotes = data => {
    return data.map(i => i.attributes.field_votes);
  };

  const getData = data => {
    return data.map(o => ({
      name: o.attributes.title,
      votes: o.attributes.field_votes[0]
    }));
  };

  return (
    <div className='App'>
      <h1>Polls</h1>
      <ul className='polls-container'>
        {polls.map(p => (
          <li className='polls-item' key={p.id}>
            <div>
              <h4>{p.title}</h4>
              {p.field_options &&
                p.field_options.dataset.data.map(o => (
                  <div key={o.id} className='poll-option'>
                    <p>
                      <button
                        className='buttons'
                        onClick={() => vote(o.id, o.attributes.field_votes)}
                        disabled={loading}
                      >
                        {o.attributes.title}
                      </button>
                    </p>
                  </div>
                ))}
            </div>

            <div style={{ width: "90%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={getData(p.field_options.dataset.data)}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='votes' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
