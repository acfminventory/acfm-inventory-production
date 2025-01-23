import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

function Teams() {
  const { user } = useContext(UserContext);
  const [teams, setTeams] = useState([]);
  const [creationLogs, setCreationLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [containerCounts, setContainerCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setTeams(user.teams);
    }
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = januaryFirst.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  }, []);

  useEffect(() => {
    const fetchCreationLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/creation-logs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCreationLogs(data);
        } else {
          console.error("Expected an array but got:", data);
          setCreationLogs([]);
        }
      } catch (error) {
        console.error("Error fetching creation logs:", error);
        setCreationLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreationLogs();
  }, []);

  useEffect(() => {
    if (selectedDate && teams.length > 0) {
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setUTCHours(0, 0, 0, 0);

      const counts = {};
      creationLogs.forEach((log) => {
        const logDateObj = new Date(log.created_at);
        logDateObj.setUTCHours(0, 0, 0, 0);

        if (logDateObj >= selectedDateObj) {
          const teamId = log.team.id;
          if (!counts[teamId]) {
            counts[teamId] = 0;
          }
          counts[teamId]++;
        }
      });

      setContainerCounts(counts);
    } else {
      setContainerCounts({});
    }
  }, [selectedDate, creationLogs, teams]);

  return (
    <div className="teams-list__container">
      <h2>Teams</h2>

      <label htmlFor="date-picker" className="date-picker__label">
        Select a Date to View Premix Returned Since
      </label>
      <input
        id="date-picker"
        className="date-picker"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <table className="teams-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Since {selectedDate}</th>
            <th>Current Inventory</th>
          </tr>
        </thead>
        <tbody>
          {teams
            .filter((team) => team.name !== "Facilities")
            .map((team) => (
              <tr key={team.id}>
                <td>
                  <Link to={`/teams/${team.id}`}>{team.name}</Link>
                </td>
                <td>
                  {isLoading ? (
                    <div
                      className="loading-spinner"
                      style={{
                        width: "20px",
                        height: "20px",
                        margin: "0 auto",
                      }}
                    ></div>
                  ) : (
                    containerCounts[team.id] || 0
                  )}
                </td>
                <td>{team.containers.length || 0}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Teams;
