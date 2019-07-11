import React, { useState, useEffect } from "react";
import Axios from "axios";
import normalize from "json-api-normalize";
import { Bar } from "react-chartjs";

function App() {
  const [polls, setPolls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(0);

  useEffect(() => {
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

  return (
    <div className='App'>
      <h1>Polls</h1>
      <ul>
        {polls.map(p => (
          <li key={p.id}>
            <h4>{p.title}</h4>
            {p.field_options &&
              p.field_options.dataset.data.map(o => (
                <div key={o.id}>
                  <p>
                    {o.attributes.title}{" "}
                    <button
                      onClick={() => vote(o.id, o.attributes.field_votes)}
                      disabled={loading}
                    >
                      {o.attributes.field_votes}
                    </button>
                  </p>
                </div>
              ))}

            <hr />

            <Bar
              data={{
                labels: getLabels(p.field_options.dataset.data),
                datasets: [{ data: getVotes(p.field_options.dataset.data) }]
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
