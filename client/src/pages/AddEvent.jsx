import axios from 'axios';
import { useContext, useState } from 'react';
import { FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { UserContext } from '../UserContext';
import Sponsors from './Sponsors';

export default function AddEvent() {
	const { user } = useContext(UserContext);
	const [formData, setFormData] = useState({
		owner: user ? user.name : '',
		title: '',
		description: '',
		organizedBy: '',
		eventDate: '',
		eventTime: '',
		location: '',
		ticketPrice: 0,
		image: null,
		likes: 0,
	});

	const [budget, setBudget] = useState('');
	const [minEvents, setMinEvents] = useState('');
	const [eventTypes, setEventTypes] = useState('');
	const [minPopularity, setMinPopularity] = useState('');
	const [aiRecommendations, setAiRecommendations] = useState([]);
	const [aiResponseMeta, setAiResponseMeta] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (e) => {
		const { name, value, type, files } = e.target;
		if (type === 'file') {
			setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
		} else {
			setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const data = new FormData();
		Object.keys(formData).forEach((key) => {
			data.append(key, formData[key]);
		});
		if (!formData.owner && user?.name) {
			data.set('owner', user.name);
		}

		try {
			const response = await axios.post('/createEvent', data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			console.log('Event posted successfully:', response.data);
			alert('Event submitted successfully!');
		} catch (error) {
			console.error(
				'Error posting event:',
				error.response?.data || error.message
			);
			setError(
				`Error posting event: ${error.response?.data?.error || error.message}`
			);
		}
	};

	const fetchAiRecommendations = async () => {
		if (!budget || isNaN(budget) || Number(budget) <= 0) {
			setError('Please enter a valid positive budget.');
			return;
		}

		setLoading(true);
		setError('');
		setAiRecommendations([]);
		setAiResponseMeta(null);

		const requestBody = {
			budget: Number(budget),
		};

		if (minEvents) requestBody.min_events = Number(minEvents);
		if (eventTypes)
			requestBody.event_types = eventTypes
				.split(',')
				.map((type) => type.trim());
		if (minPopularity) requestBody.min_popularity = Number(minPopularity);

		try {
			const response = await axios.post(
				'http://localhost:4000/ml/recommend',
				requestBody
			);

			if (response.data && response.data.selected_events) {
				setAiRecommendations(response.data.selected_events);
				setAiResponseMeta({
					total_estimated_cost: response.data.total_estimated_cost,
					budget: response.data.budget,
					events_selected: response.data.events_selected,
				});
			} else if (response.data && response.data.message) {
				setError(response.data.message);
				setAiResponseMeta({
					budget: response.data.budget,
					events_selected: response.data.events_selected,
				});
			} else {
				setError('Received an unexpected response format from the server.');
			}
		} catch (error) {
			console.error(
				'Error fetching AI recommendations:',
				error.response?.data || error.message
			);
			const backendError =
				error.response?.data?.error ||
				error.response?.data?.message ||
				error.message;
			setError(`Error fetching recommendations: ${backendError}`);
			setAiRecommendations([]);
			setAiResponseMeta(null);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
			<div className="max-w-4xl mx-auto w-full">
				<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">
					Create a New Event
				</h1>

				{error && (
					<div
						className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center"
						role="alert">
						<FaExclamationCircle className="mr-2" />
						<span>{error}</span>
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10">
					<h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
						Event Details
					</h2>
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Title
							</label>
							<input
								type="text"
								name="title"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								value={formData.title}
								onChange={handleChange}
								required
								aria-required="true"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								name="description"
								rows="4"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								value={formData.description}
								onChange={handleChange}
								required
								aria-required="true"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Organized By
							</label>
							<input
								type="text"
								name="organizedBy"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								value={formData.organizedBy}
								onChange={handleChange}
								required
								aria-required="true"
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Event Date
								</label>
								<input
									type="date"
									name="eventDate"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									value={formData.eventDate}
									onChange={handleChange}
									required
									aria-required="true"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Event Time
								</label>
								<input
									type="time"
									name="eventTime"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									value={formData.eventTime}
									onChange={handleChange}
									required
									aria-required="true"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Location
							</label>
							<input
								type="text"
								name="location"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								value={formData.location}
								onChange={handleChange}
								required
								aria-required="true"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Ticket Price (Rs)
							</label>
							<input
								type="number"
								name="ticketPrice"
								min="0"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								value={formData.ticketPrice}
								onChange={handleChange}
								required
								aria-required="true"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Event Image
							</label>
							<input
								type="file"
								name="image"
								accept="image/*"
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition"
								onChange={handleChange}
							/>
							{formData.image && typeof formData.image === 'object' && (
								<span className="text-xs text-gray-600 mt-2 block">
									Selected: {formData.image.name}
								</span>
							)}
						</div>
						<button
							type="submit"
							className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-semibold">
							Submit Event
						</button>
					</div>
				</form>

				<div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 sm:p-8 rounded-xl shadow-lg">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
						AI Event Planning Assistant
					</h2>
					<p className="text-gray-600 mb-6">
						Enter your budget and optional parameters to receive AI-powered
						event recommendations tailored for maximum engagement.
					</p>
					<div className="flex flex-col gap-4 mb-6">
						<input
							type="number"
							placeholder="Enter total budget (e.g., 50000)"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
							value={budget}
							onChange={(e) => setBudget(e.target.value)}
							min="1"
							aria-label="Budget amount"
						/>
						<input
							type="number"
							placeholder="Minimum number of events (optional)"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
							value={minEvents}
							onChange={(e) => setMinEvents(e.target.value)}
							min="1"
							aria-label="Minimum events"
						/>
						<input
							type="text"
							placeholder="Event types (comma-separated, optional)"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
							value={eventTypes}
							onChange={(e) => setEventTypes(e.target.value)}
							aria-label="Event types"
						/>
						<input
							type="number"
							placeholder="Minimum popularity score (optional)"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
							value={minPopularity}
							onChange={(e) => setMinPopularity(e.target.value)}
							min="1"
							max="10"
							aria-label="Minimum popularity"
						/>
						<button
							onClick={fetchAiRecommendations}
							disabled={loading || !budget}
							className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200 flex items-center justify-center">
							{loading ? (
								<>
									<FaSpinner className="animate-spin mr-2" />
									Fetching...
								</>
							) : (
								'Get Recommendations'
							)}
						</button>
					</div>

					{!loading && aiRecommendations.length > 0 && aiResponseMeta && (
						<div className="mt-6">
							<h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
								AI Recommended Event Plan
							</h3>
							<div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
								<p className="text-sm text-gray-700 mb-2">
									Target Budget:{' '}
									<span className="font-semibold text-indigo-600">
										₹{aiResponseMeta.budget?.toLocaleString('en-IN')}
									</span>
								</p>
								<p className="text-sm text-gray-700 mb-2">
									Events Selected:{' '}
									<span className="font-semibold">
										{aiResponseMeta.events_selected}
									</span>
								</p>
								<p className="text-sm text-gray-700">
									Total Estimated Cost:{' '}
									<span className="font-semibold text-indigo-600">
										₹
										{aiResponseMeta.total_estimated_cost?.toLocaleString(
											'en-IN'
										)}
									</span>
								</p>
							</div>
							<ul className="space-y-4">
								{aiRecommendations.map((event, index) => (
									<li
										key={event.Event || index}
										className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
										<div className="flex justify-between items-start mb-3">
											<h4 className="text-lg sm:text-xl font-bold text-indigo-800">
												{event.Event || 'Unnamed Event'}
											</h4>
											<span className="text-xs font-medium text-gray-600 bg-indigo-100 px-2 py-1 rounded-full">
												{event.Type || 'N/A'}
											</span>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
											<div>
												<span className="text-gray-500 text-xs uppercase">
													Cost (Est.)
												</span>
												<p className="font-semibold text-gray-800">
													₹
													{event.Cost
														? event.Cost.toLocaleString('en-IN')
														: 'N/A'}
												</p>
											</div>
											<div>
												<span className="text-gray-500 text-xs uppercase">
													Engagement
												</span>
												<p className="font-semibold text-gray-800">
													{event.Engagement_Score
														? event.Engagement_Score.toFixed(3)
														: 'N/A'}{' '}
													/ 1.000
												</p>
											</div>
											<div>
												<span className="text-gray-500 text-xs uppercase">
													Popularity
												</span>
												<p className="font-semibold text-gray-800">
													{event.Popularity ?? 'N/A'}/10
												</p>
											</div>
											<div>
												<span className="text-gray-500 text-xs uppercase">
													Sentiment
												</span>
												<p className="font-semibold text-gray-800">
													{event.Avg_Sentiment
														? event.Avg_Sentiment.toFixed(2)
														: 'N/A'}{' '}
													/ 1.00
												</p>
											</div>
											<div>
												<span className="text-gray-500 text-xs uppercase">
													Reviews
												</span>
												<p className="font-semibold text-gray-800">
													{event.Review_Count ?? '0'}
												</p>
											</div>
										</div>
										{event.Explanation ? (
											event.Explanation.toLowerCase().includes('failed') ? (
												<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
													<p className="text-xs text-red-700 font-medium">
														AI Explanation Failed:
													</p>
													<p className="text-sm text-red-600">
														{event.Explanation}
													</p>
												</div>
											) : (
												<div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
													<p className="text-xs text-indigo-800 font-medium">
														AI Insight:
													</p>
													<p className="text-sm text-gray-700">
														{event.Explanation}
													</p>
												</div>
											)
										) : (
											<p className="text-sm text-gray-500 mt-4">
												No explanation available.
											</p>
										)}
									</li>
								))}
							</ul>
						</div>
					)}

					{!loading &&
						!aiRecommendations.length &&
						budget &&
						!error &&
						aiResponseMeta &&
						aiResponseMeta.events_selected === 0 && (
							<div className="text-center mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
								No suitable events could be selected within the budget of ₹
								{aiResponseMeta.budget?.toLocaleString('en-IN')}. Try increasing
								the budget or check event data.
							</div>
						)}
					{!loading &&
						!aiRecommendations.length &&
						!aiResponseMeta &&
						budget &&
						!error && (
							<p className="text-center mt-6 text-gray-600">
								Click Get Recommendations to see AI suggestions.
							</p>
						)}

					<div className="mt-10 border-t border-gray-200 pt-6">
						<h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
							Potential Sponsors
						</h3>
						<Sponsors />
					</div>
				</div>
			</div>

			<style jsx global>{`
				.transition {
					transition: all 0.2s ease-in-out;
				}
			`}</style>
		</div>
	);
}
