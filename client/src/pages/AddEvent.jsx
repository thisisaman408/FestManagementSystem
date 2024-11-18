import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import Sponsors from "./Sponsors";

export default function AddEvent() {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    owner: user ? user.name : "",
    title: "",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    image: "",
    likes: 0,
  });

  const [budget, setBudget] = useState(""); // State for budget input
  const [aiRecommendations, setAiRecommendations] = useState([]); // State for AI results
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({ ...prevState, image: file }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/createEvent", formData)
      .then((response) => {
        console.log("Event posted successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error posting event:", error);
      });
  };

  // Handle AI Recommendation Fetch
  const fetchAiRecommendations = async () => {
    if (!budget || isNaN(budget)) {
      alert("Please enter a valid budget.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/ml/recommend", {
        budget,
      });
      setAiRecommendations(response.data.events);
    } catch (error) {
      console.error(
        "Error fetching AI recommendations:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col ml-20 mt-10">
      <div>
        <h1 className="font-bold text-[36px] mb-5">Post an Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-co">
        <div className="flex flex-col gap-5">
          {/* Existing Fields */}
          <label className="flex flex-col">
            Title:
            <input
              type="text"
              name="title"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              value={formData.title}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Description:
            <textarea
              name="description"
              className="rounded mt-2 pl-5 px-4 py-2 ring-sky-700 ring-2 border-none"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Organized By:
            <input
              type="text"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              name="organizedBy"
              value={formData.organizedBy}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Event Date:
            <input
              type="date"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Event Time:
            <input
              type="time"
              name="eventTime"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              value={formData.eventTime}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Location:
            <input
              type="text"
              name="location"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              value={formData.location}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Ticket Price:
            <input
              type="number"
              name="ticketPrice"
              className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
              value={formData.ticketPrice}
              onChange={handleChange}
            />
          </label>
          <label className="flex flex-col">
            Image:
            <input
              type="file"
              name="image"
              className="rounded mt-2 pl-5 px-4 py-10 ring-sky-700 ring-2 border-none"
              onChange={handleImageUpload}
            />
          </label>
          <button className="primary" type="submit">
            Submit
          </button>
        </div>
      </form>

      {/* AI Recommendations Section */}
      <div className="mt-10 p-5 bg-gray-100 rounded-lg shadow-md">
        <h2 className="font-bold text-[24px] mb-3">
          Need Help for Best Events from AI?
        </h2>
        <p>
          Just write your budget below, and AI will recommend the best events
          for you!
        </p>
        <div className="flex items-center gap-4 mt-4">
          <input
            type="number"
            placeholder="Enter your budget"
            className="rounded px-4 py-2 ring-sky-700 ring-2 border-none w-60"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={fetchAiRecommendations}
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Recommendations"}
          </button>
        </div>

        {/* Display AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mt-5">
            <h3 className="font-bold text-[20px]">Recommended Events:</h3>
            <ul className="list-disc pl-5">
              {aiRecommendations.map((event, index) => (
                <li key={index} className="mt-2">
                  <strong>{event.Event}</strong> - Rs {event.Cost} (Sentiment
                  Score: {event["Sentiment Score"]}, Trend:{" "}
                  {event["Social Media Trend Score"]})
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Sponsors Section */}
        <Sponsors />
      </div>
    </div>
  );
}
